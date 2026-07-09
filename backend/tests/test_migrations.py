from __future__ import annotations

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.config import get_settings


def test_alembic_upgrade_head_creates_sqlite_schema(monkeypatch, tmp_path):
    database_path = tmp_path / "migration-test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")
    get_settings.cache_clear()

    config = Config("alembic.ini")
    command.upgrade(config, "head")

    engine = create_engine(f"sqlite:///{database_path}")
    try:
        tables = set(inspect(engine).get_table_names())
    finally:
        engine.dispose()

    get_settings.cache_clear()

    assert {
        "tasks",
        "activity_events",
        "workflow_nodes",
        "workflow_edges",
        "publish_state",
        "alembic_version",
    }.issubset(tables)
