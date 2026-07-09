from fastapi import Request

from .repository import InMemoryRepository


def get_repository(request: Request) -> InMemoryRepository:
    return request.app.state.repository
