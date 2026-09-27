from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from .config import get_settings


settings = get_settings()
engine_kwargs = {}
if settings.database_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, future=True, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def init_db() -> None:
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_incremental_columns()


def _ensure_incremental_columns() -> None:
    inspector = inspect(engine)
    if "messages" not in inspector.get_table_names():
        return
    message_columns = {column["name"] for column in inspector.get_columns("messages")}
    if "provider_error" not in message_columns:
        with engine.begin() as connection:
            connection.execute(text("alter table messages add column provider_error text"))
    if "availability_windows" in inspector.get_table_names():
        availability_columns = {column["name"] for column in inspector.get_columns("availability_windows")}
        if "superseded_at" not in availability_columns:
            with engine.begin() as connection:
                connection.execute(text("alter table availability_windows add column superseded_at datetime"))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
