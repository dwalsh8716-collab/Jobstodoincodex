import asyncio
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from app.config import Settings
from app.database import session_scope
from app.models import AuditLog
from app.services.gmail_sync import sync_gmail_replies
from app.services.workflow import WorkflowService


@dataclass
class AutomationWorker:
    settings: Settings
    due_task: Optional[asyncio.Task] = None
    gmail_task: Optional[asyncio.Task] = None

    def start(self) -> None:
        if not self.settings.enable_automation_worker:
            return
        if self.due_task is None:
            self.due_task = asyncio.create_task(self._due_work_loop())
        if self.gmail_task is None and self.settings.email_provider == "gmail" and self.settings.enable_gmail_reply_sync:
            self.gmail_task = asyncio.create_task(self._gmail_sync_loop())

    async def stop(self) -> None:
        tasks = [task for task in [self.due_task, self.gmail_task] if task is not None]
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _due_work_loop(self) -> None:
        while True:
            await asyncio.sleep(max(self.settings.worker_due_work_interval_seconds, 30))
            await asyncio.to_thread(run_due_work_cycle, self.settings)

    async def _gmail_sync_loop(self) -> None:
        while True:
            await asyncio.sleep(max(self.settings.worker_gmail_sync_interval_seconds, 60))
            await asyncio.to_thread(run_gmail_sync_cycle, self.settings)


def run_due_work_cycle(settings: Settings) -> dict:
    with session_scope() as db:
        result = WorkflowService(settings=settings).process_due_work(db, "automation")
        if result["reminders_sent"] or result["chases_sent"] or result["failures"]:
            db.add(
                AuditLog(
                    actor_type="system",
                    actor_id="automation",
                    action="automation_due_work_completed",
                    entity_type="system",
                    entity_id="automation",
                    summary=(
                        f"Due work complete. Reminders: {result['reminders_sent']}. "
                        f"Chases: {result['chases_sent']}. Failures: {len(result['failures'])}."
                    ),
                    metadata_json=result,
                ),
            )
        return result


def run_gmail_sync_cycle(settings: Settings) -> dict:
    try:
        with session_scope() as db:
            result = sync_gmail_replies(db, settings, "automation")
            if result.get("synced") or result.get("skipped_unmatched"):
                db.add(
                    AuditLog(
                        actor_type="system",
                        actor_id="automation",
                        action="automation_gmail_sync_completed",
                        entity_type="system",
                        entity_id="automation",
                        summary=(
                            f"Gmail sync complete. Synced: {result.get('synced', 0)}. "
                            f"Unmatched: {result.get('skipped_unmatched', 0)}."
                        ),
                        metadata_json=result,
                    ),
                )
            return result
    except Exception as exc:
        with session_scope() as db:
            db.add(
                AuditLog(
                    actor_type="system",
                    actor_id="automation",
                    action="automation_gmail_sync_failed",
                    entity_type="system",
                    entity_id="automation",
                    summary="Automatic Gmail sync failed.",
                    metadata_json={"error": str(exc), "failed_at": datetime.now(timezone.utc).isoformat()},
                ),
            )
        return {"synced": 0, "error": str(exc)}
