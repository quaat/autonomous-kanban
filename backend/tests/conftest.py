from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.db.repository import SqlRepository
from app.db.session import create_schema, make_engine, make_session_factory
from app.main import create_app
from app.memory_repository import InMemoryRepository


@pytest.fixture(params=["memory", "sqlite"])
def repository(request, tmp_path):
    if request.param == "sqlite":
        engine = make_engine(f"sqlite:///{tmp_path / 'test.db'}")
        create_schema(engine)
        return SqlRepository(make_session_factory(engine))
    return InMemoryRepository()


@pytest.fixture
def client(repository):
    app = create_app(repository=repository)
    with TestClient(app) as test_client:
        yield test_client
