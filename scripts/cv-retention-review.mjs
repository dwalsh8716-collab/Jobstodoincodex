import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const env = process.env;
const apply = process.argv.includes("--apply");
const approved = env.CV_RETENTION_DELETION_APPROVED === "true";
const includeObjects = env.CV_RETENTION_OUTPUT_MODE !== "summary";
const prefix = "candidate-cvs/";
const config = {
  bucket: env.CANDIDATE_CV_STORAGE_BUCKET,
  endpoint: env.CANDIDATE_CV_STORAGE_ENDPOINT,
  region: env.CANDIDATE_CV_STORAGE_REGION || "auto",
  accessKeyId: env.CANDIDATE_CV_STORAGE_ACCESS_KEY_ID,
  secretAccessKey: env.CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY,
  forcePathStyle: env.CANDIDATE_CV_STORAGE_FORCE_PATH_STYLE === "true",
};

if (
  !config.bucket ||
  !config.endpoint ||
  !config.accessKeyId ||
  !config.secretAccessKey
) {
  console.log(
    "CV storage credentials are not configured. Retention review skipped.",
  );
  process.exit(0);
}
if (apply && !approved) {
  throw new Error(
    "Set CV_RETENTION_DELETION_APPROVED=true for an explicitly approved deletion run.",
  );
}

const client = new S3Client({
  endpoint: config.endpoint,
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  forcePathStyle: config.forcePathStyle,
});

let continuationToken;
const due = [];
do {
  const page = await client.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    }),
  );
  for (const object of page.Contents || []) {
    if (!object.Key) continue;
    const head = await client.send(
      new HeadObjectCommand({ Bucket: config.bucket, Key: object.Key }),
    );
    const retentionUntil = head.Metadata?.["retention-until"];
    if (retentionUntil && Date.parse(retentionUntil) <= Date.now()) {
      due.push({ key: object.Key, retentionUntil });
    }
  }
  continuationToken = page.NextContinuationToken;
} while (continuationToken);

if (apply) {
  for (const object of due) {
    await client.send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: object.key }),
    );
  }
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "approved-delete" : "dry-run",
      dueCount: due.length,
      deletedCount: apply ? due.length : 0,
      objects: includeObjects
        ? due.map(({ key, retentionUntil }) => ({ key, retentionUntil }))
        : [],
    },
    null,
    2,
  ),
);
