import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.repository import InMemoryRepository


@pytest.fixture
def client():
    app = create_app(repository=InMemoryRepository())
    with TestClient(app) as test_client:
        yield test_client
