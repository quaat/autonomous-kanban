from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Literal

RepositoryMode = Literal["memory", "sqlite"]


@dataclass(frozen=True)
class Settings:
    database_url: str = "sqlite:///./dev.db"
    backend_repository: RepositoryMode = "memory"


def _repository_mode(value: str) -> RepositoryMode:
    if value in {"memory", "sqlite"}:
        return value  # type: ignore[return-value]
    raise ValueError("BACKEND_REPOSITORY must be 'memory' or 'sqlite'")


@lru_cache
def get_settings() -> Settings:
    return Settings(
        database_url=os.environ.get("DATABASE_URL", "sqlite:///./dev.db"),
        backend_repository=_repository_mode(os.environ.get("BACKEND_REPOSITORY", "memory")),
    )
