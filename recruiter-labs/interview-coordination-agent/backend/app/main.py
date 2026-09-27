from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, dashboard, integrations, interviews, public_availability
from app.config import get_settings, validate_runtime_settings
from app.database import init_db
from app.services.automation import AutomationWorker


settings = get_settings()
validate_runtime_settings(settings)


@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    init_db()
    worker = AutomationWorker(settings)
    worker.start()
    app_instance.state.automation_worker = worker
    try:
        yield
    finally:
        await worker.stop()


app = FastAPI(
    title="Essential Resourcing Interview Coordination Agent",
    version="0.1.0",
    description="Private Recruiter Labs interview scheduling and coordination API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.app_base_url,
        "http://localhost:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {
        "ok": True,
        "service": "interview-coordination-agent",
        "email_provider": settings.email_provider,
        "calendar_provider": settings.calendar_provider,
        "crm_connector": settings.crm_connector,
        "automation_worker": settings.enable_automation_worker,
    }


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(integrations.router)
app.include_router(interviews.router)
app.include_router(public_availability.router)
