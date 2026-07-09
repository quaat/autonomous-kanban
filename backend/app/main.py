from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .errors import install_error_handlers
from .repository import InMemoryRepository
from .routers import activity, tasks, workflow

repository = InMemoryRepository()

app = FastAPI(
    title="Autonomous Kanban Contract Backend",
    version="0.1.0",
    description="Minimal in-memory FastAPI backend matching the frontend DTO contract. No production side effects.",
)

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
def readyz() -> dict[str, object]:
    return {"status": "ok", "repositoryLoaded": repository.loaded}
