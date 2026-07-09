from __future__ import annotations

import pytest

from app.config import get_settings
from app.db.repository import SqlRepository
from app.main import create_app
from app.memory_repository import InMemoryRepository


def test_builds_memory_repository_from_environment(monkeypatch):
    monkeypatch.setenv("BACKEND_REPOSITORY", "memory")
    get_settings.cache_clear()
    try:
        app = create_app()
        assert isinstance(app.state.repository, InMemoryRepository)
    finally:
        get_settings.cache_clear()


def test_builds_sqlite_repository_from_environment(monkeypatch, tmp_path):
    monkeypatch.setenv("BACKEND_REPOSITORY", "sqlite")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'configured.db'}")
    get_settings.cache_clear()
    try:
        app = create_app()
        assert isinstance(app.state.repository, SqlRepository)
        assert app.state.repository.loaded is True
    finally:
        get_settings.cache_clear()


def test_invalid_repository_environment_fails_clearly(monkeypatch):
    monkeypatch.setenv("BACKEND_REPOSITORY", "postgres")
    get_settings.cache_clear()
    try:
        with pytest.raises(ValueError, match="BACKEND_REPOSITORY"):
            create_app()
    finally:
        get_settings.cache_clear()
