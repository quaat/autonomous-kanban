from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .db.repository import SqlRepository
from .db.session import create_schema, make_engine, make_session_factory
from .errors import install_error_handlers
from .memory_repository import InMemoryRepository
from .repository import Repository
from .routers import activity, tasks, workflow


def build_repository() -> Repository:
    settings = get_settings()
    if settings.backend_repository == "sqlite":
        engine = make_engine(settings.database_url)
        create_schema(engine)
        return SqlRepository(make_session_factory(engine))
    return InMemoryRepository()


def create_app(repository: Repository | None = None) -> FastAPI:
    app = FastAPI(
        title="Autonomous Kanban Contract Backend",
        version="0.1.0",
        description="FastAPI backend matching the frontend DTO contract.",
    )
    app.state.repository = repository or build_repository()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
        allow_headers=["Content-Type", "Accept"],
    )

    install_error_handlers(app)
    app.include_router(tasks.router)
    app.include_router(activity.router)
    app.include_router(workflow.router)

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/readyz")
    def readyz(request: Request) -> dict[str, object]:
        return {"status": "ok", "repositoryLoaded": request.app.state.repository.loaded}

    return app


app = create_app()
