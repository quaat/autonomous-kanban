from __future__ import annotations

from fastapi.testclient import TestClient

from app.db.repository import SqlRepository
from app.db.session import create_schema, make_engine, make_session_factory
from app.main import create_app


def test_sqlite_persists_across_repository_restarts(tmp_path):
    database_url = f"sqlite:///{tmp_path / 'persistent.db'}"
    engine = make_engine(database_url)
    create_schema(engine)
    session_factory = make_session_factory(engine)

    first_repo = SqlRepository(session_factory)
    first_client = TestClient(create_app(repository=first_repo))
    created = first_client.post("/api/tasks", json={"title": "Persistent task", "status": "to_do"})
    assert created.status_code == 201
    task_id = created.json()["id"]
    assert first_client.post("/api/workflow/publish").json()["version"] == "v1.1.0"

    second_repo = SqlRepository(session_factory)
    second_client = TestClient(create_app(repository=second_repo))
    tasks = second_client.get("/api/tasks").json()
    assert any(task["id"] == task_id and task["title"] == "Persistent task" for task in tasks)
    assert second_client.post("/api/workflow/publish").json()["version"] == "v1.2.0"
