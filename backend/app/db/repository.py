from __future__ import annotations

import re
from copy import deepcopy
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from ..errors import ApiError
from ..schemas import CreateActivityEventRequestDto, CreateTaskRequestDto, MoveTaskRequestDto, UpdateTaskRequestDto, UpdateWorkflowNodeRequestDto
from .models import ActivityEventRecord, PublishStateRecord, TaskRecord, WorkflowEdgeRecord, WorkflowNodeRecord
from .seed import seed_empty_database


def _clone(data: dict[str, Any]) -> dict[str, Any]:
    return deepcopy(data)


def _next_id(session: Session, model: type, prefix: str) -> str:
    max_value = 1000
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)$")
    for row_id in session.scalars(select(model.id)):
        match = pattern.match(row_id)
        if match:
            max_value = max(max_value, int(match.group(1)))
    return f"{prefix}-{max_value + 1}"


class SqlRepository:
    def __init__(self, session_factory: sessionmaker[Session], seed: bool = True) -> None:
        self.session_factory = session_factory
        self.loaded = False
        if seed:
            with self.session_factory() as session:
                seed_empty_database(session)
        self.loaded = True

    def list_tasks(self) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            return [_clone(record.data) for record in session.scalars(select(TaskRecord).order_by(TaskRecord.order_index, TaskRecord.id))]

    def create_task(self, request: CreateTaskRequestDto) -> dict[str, Any]:
        with self.session_factory() as session:
            data = request.model_dump(exclude_none=True, mode="json")
            data["id"] = data.get("id") or _next_id(session, TaskRecord, "task")
            data.setdefault("description", "")
            data.setdefault("priority", "medium")
            data.setdefault("labels", [])
            order_index = (session.scalar(select(func.max(TaskRecord.order_index))) or 0) + 1
            record = TaskRecord(id=data["id"], title=data["title"], status=data["status"], priority=data["priority"], order_index=order_index, data=data)
            session.add(record)
            session.commit()
            return _clone(data)

    def update_task(self, task_id: str, request: UpdateTaskRequestDto) -> dict[str, Any]:
        with self.session_factory() as session:
            record = session.get(TaskRecord, task_id)
            if record is None:
                raise ApiError(404, "TASK_NOT_FOUND", "Task not found")
            patch = request.model_dump(exclude_unset=True, exclude_none=True, mode="json")
            patch.pop("id", None)
            merged = {**record.data, **patch, "id": task_id}
            record.data = merged
            record.title = merged["title"]
            record.status = merged["status"]
            record.priority = merged["priority"]
            session.commit()
            return _clone(merged)

    def move_task(self, task_id: str, request: MoveTaskRequestDto) -> dict[str, Any]:
        with self.session_factory() as session:
            record = session.get(TaskRecord, task_id)
            if record is None:
                raise ApiError(404, "TASK_NOT_FOUND", "Task not found")
            moved = {**record.data, "status": request.status.value}
            record.data = moved
            record.status = request.status.value
            session.commit()
            return _clone(moved)

    def list_activity_events(self) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            return [_clone(record.data) for record in session.scalars(select(ActivityEventRecord).order_by(ActivityEventRecord.order_index, ActivityEventRecord.id))]

    def create_activity_event(self, request: CreateActivityEventRequestDto) -> dict[str, Any]:
        with self.session_factory() as session:
            data = request.model_dump(exclude_none=True, mode="json")
            data["id"] = data.get("id") or _next_id(session, ActivityEventRecord, "evt")
            order_index = (session.scalar(select(func.min(ActivityEventRecord.order_index))) or 0) - 1
            session.add(ActivityEventRecord(id=data["id"], time=data["time"], type=data["type"], message=data["message"], order_index=order_index, data=data))
            session.commit()
            return _clone(data)

    def list_workflow_nodes(self) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            return [_clone(record.data) for record in session.scalars(select(WorkflowNodeRecord).order_by(WorkflowNodeRecord.order_index, WorkflowNodeRecord.id))]

    def list_workflow_edges(self) -> list[dict[str, Any]]:
        with self.session_factory() as session:
            return [_clone(record.data) for record in session.scalars(select(WorkflowEdgeRecord).order_by(WorkflowEdgeRecord.order_index, WorkflowEdgeRecord.id))]

    def update_workflow_node(self, node_id: str, request: UpdateWorkflowNodeRequestDto) -> dict[str, Any]:
        with self.session_factory() as session:
            record = session.get(WorkflowNodeRecord, node_id)
            if record is None:
                raise ApiError(404, "WORKFLOW_NODE_NOT_FOUND", "Workflow node not found")
            patch = request.model_dump(exclude_unset=True, exclude_none=True, mode="json")
            patch.pop("id", None)
            config = patch.pop("config", None)
            merged = {**record.data, **patch, "id": node_id}
            if config is not None:
                merged["config"] = {**record.data.get("config", {}), **config}
            record.data = merged
            record.type = merged["type"]
            record.label = merged["label"]
            session.commit()
            return _clone(merged)

    def validate_workflow(self) -> dict[str, Any]:
        nodes = self.list_workflow_nodes()
        errors: list[str] = []
        if not any(node.get("type") == "start" for node in nodes):
            errors.append("Missing a Start node in the workflow.")
        if not any(node.get("type") == "end" for node in nodes):
            errors.append("Missing an End node in the workflow.")
        return {"success": len(errors) == 0, "errors": errors}

    def simulate_workflow(self) -> dict[str, Any]:
        return {"success": True, "log": ["Starting simulation...", "Activated [Start] node.", "Successfully ran [Analyze Idea] with Gemini 1.5 Pro.", "Simulation completed successfully with no blocks."]}

    def publish_workflow(self) -> dict[str, Any]:
        with self.session_factory() as session:
            state = session.get(PublishStateRecord, 1)
            if state is None:
                state = PublishStateRecord(id=1, sequence=1, current_version=None)
                session.add(state)
            version = f"v1.{state.sequence}.0"
            state.sequence += 1
            state.current_version = version
            session.commit()
            return {"success": True, "version": version}
