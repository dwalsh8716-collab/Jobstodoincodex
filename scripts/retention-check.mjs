import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const databaseUrl = process.env.DATABASE_URL;
const engineEnabled = process.env.RETENTION_ENGINE_ENABLED === "true";
const dryRunDefault = process.env.RETENTION_DRY_RUN !== "false";
const outputMode =
  process.env.RETENTION_OUTPUT_MODE ||
  (process.env.GITHUB_ACTIONS === "true" ? "summary" : "detailed");
const includeDetailedRecords = outputMode === "detailed";
const args = new Set(process.argv.slice(2));
const applyMode = args.has("--apply");
const dryRun = args.has("--dry-run") || (!applyMode && dryRunDefault);

function toBase64Json(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

async function runPsqlJson(sql, payload) {
  if (!databaseUrl) throw new Error("DATABASE_URL is missing.");

  const psqlArgs = [
    "--dbname",
    databaseUrl,
    "--set",
    "ON_ERROR_STOP=1",
    "--tuples-only",
    "--no-align",
    "--quiet",
  ];

  if (payload !== undefined) {
    psqlArgs.push("--set", `payload=${toBase64Json(payload)}`);
  }

  psqlArgs.push("--command", sql);

  const { stdout } = await execFileAsync("psql", psqlArgs, {
    timeout: 60_000,
    maxBuffer: 1024 * 1024 * 4,
  });

  const trimmed = stdout.trim();
  if (!trimmed) throw new Error("Retention query returned no data.");
  return JSON.parse(trimmed);
}

if (!databaseUrl) {
  console.log("DATABASE_URL is not set. Retention check skipped.");
  process.exit(0);
}

if (applyMode && !engineEnabled) {
  console.error(
    "RETENTION_ENGINE_ENABLED must be true before retention apply mode can create review tasks.",
  );
  process.exit(1);
}

const dryRunSql = `
  select json_build_object(
    'mode', 'dry-run',
    'engineEnabled', ${engineEnabled ? "true" : "false"},
    'outputMode', '${includeDetailedRecords ? "detailed" : "summary"}',
    'dueCount', (
      select count(*)::int
      from retention_review_queue
      where recommended_action in (
        'review_deletion_request',
        'review_expired_retention',
        'review_due',
        'expiring_soon'
      )
    ),
    'summaryByAction', coalesce((
      select json_object_agg(recommended_action, record_count)
      from (
        select recommended_action, count(*)::int as record_count
        from retention_review_queue
        where recommended_action in (
          'review_deletion_request',
          'review_expired_retention',
          'review_due',
          'expiring_soon'
        )
        group by recommended_action
      ) action_counts
    ), '{}'::json),
    'records', ${
      includeDetailedRecords
        ? `coalesce((
      select json_agg(row_to_json(queue))
      from (
        select
          entity_type as "entityType",
          entity_id::text as "entityId",
          entity_label as "entityLabel",
          retention_category as "retentionCategory",
          retention_status as "retentionStatus",
          data_retention_until as "dataRetentionUntil",
          retention_review_at as "retentionReviewAt",
          recommended_action as "recommendedAction"
        from retention_review_queue
        where recommended_action in (
          'review_deletion_request',
          'review_expired_retention',
          'review_due',
          'expiring_soon'
        )
        order by
          case recommended_action
            when 'review_deletion_request' then 1
            when 'review_expired_retention' then 2
            when 'review_due' then 3
            else 4
          end,
          data_retention_until asc nulls last,
          retention_review_at asc nulls last
        limit 50
      ) queue
    ), '[]'::json)`
        : "'[]'::json"
    }
  )::text;
`;

const applySql = `
  with due as (
    select *
    from retention_review_queue
    where recommended_action in (
      'review_deletion_request',
      'review_expired_retention',
      'review_due',
      'expiring_soon'
    )
  ),
  created_tasks as (
    insert into tasks (
      entity_type,
      entity_id,
      title,
      description,
      status,
      priority,
      due_at
    )
    select
      due.entity_type,
      due.entity_id,
      'Review data retention',
      concat(
        'Retention action: ',
        due.recommended_action,
        '. Category: ',
        due.retention_category,
        '. Review before deleting or anonymising anything.'
      ),
      'open',
      case
        when due.recommended_action in ('review_deletion_request', 'review_expired_retention') then 'urgent'
        else 'high'
      end,
      now()
    from due
    where not exists (
      select 1
      from tasks existing
      where existing.entity_type = due.entity_type
        and existing.entity_id = due.entity_id
        and existing.title = 'Review data retention'
        and existing.status in ('open', 'in_progress', 'waiting')
    )
    returning id, entity_type, entity_id
  ),
  audit as (
    insert into audit_logs (
      action,
      entity_type,
      entity_id,
      entity_label,
      metadata
    )
    select
      'task_created',
      'task',
      id,
      'Retention review task',
      jsonb_build_object(
        'source', 'retention:check',
        'relatedEntityType', entity_type,
        'relatedEntityId', entity_id
      )
    from created_tasks
    returning id
  ),
  candidates_update as (
    update candidates
    set retention_status = case
        when retention_status = 'active' then 'pending_review'
        else retention_status
      end,
      retention_last_checked_at = now()
    where id in (select entity_id from due where entity_type = 'candidate')
    returning id
  ),
  applications_update as (
    update applications
    set retention_status = case
        when retention_status = 'active' then 'pending_review'
        else retention_status
      end,
      retention_last_checked_at = now()
    where id in (select entity_id from due where entity_type = 'application')
    returning id
  ),
  enquiries_update as (
    update enquiries
    set retention_status = case
        when retention_status = 'active' then 'pending_review'
        else retention_status
      end,
      retention_last_checked_at = now()
    where id in (select entity_id from due where entity_type = 'enquiry')
    returning id
  ),
  files_update as (
    update files
    set retention_status = case
        when retention_status = 'active' then 'pending_review'
        else retention_status
      end,
      retention_last_checked_at = now()
    where id in (select entity_id from due where entity_type = 'cv_file')
    returning id
  ),
  data_subject_requests_update as (
    update data_subject_requests
    set retention_status = case
        when retention_status = 'active' then 'pending_review'
        else retention_status
      end,
      retention_last_checked_at = now()
    where id in (select entity_id from due where entity_type = 'data_subject_request')
    returning id
  )
  select json_build_object(
    'mode', 'apply-review-queue',
    'engineEnabled', true,
    'createdTaskCount', (select count(*)::int from created_tasks),
    'updatedRecordCount',
      (select count(*)::int from candidates_update)
      + (select count(*)::int from applications_update)
      + (select count(*)::int from enquiries_update)
      + (select count(*)::int from files_update)
      + (select count(*)::int from data_subject_requests_update),
    'deletedRecordCount', 0,
    'message', 'Review tasks created. No records or files were deleted.'
  )::text;
`;

try {
  const result = await runPsqlJson(dryRun ? dryRunSql : applySql);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error("Retention check failed. Have migrations been run?");
  if (error instanceof Error) console.error(error.message);
  process.exit(1);
}
