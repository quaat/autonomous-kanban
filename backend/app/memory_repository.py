from __future__ import annotations

from copy import deepcopy
from typing import Any

from .errors import ApiError
from .schemas import CreateActivityEventRequestDto, CreateTaskRequestDto, MoveTaskRequestDto, UpdateTaskRequestDto, UpdateWorkflowNodeRequestDto
from .seed import load_seed_data


class InMemoryRepository:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        seed = load_seed_data()
        self.tasks = seed["tasks"]
        self.activity_events = seed["activity_events"]
        self.workflow_nodes = seed["workflow_nodes"]
        self.workflow_edges = seed["workflow_edges"]
        self.task_sequence = 1000
        self.event_sequence = 1000
        self.publish_sequence = 1
        self.loaded = True

    def _clone(self, value: Any) -> Any:
        return deepcopy(value)

    def list_tasks(self) -> list[dict[str, Any]]:
        return self._clone(self.tasks)

    def create_task(self, request: CreateTaskRequestDto) -> dict[str, Any]:
        data = request.model_dump(exclude_none=True, mode="json")
        if not data.get("id"):
            self.task_sequence += 1
            data["id"] = f"task-{self.task_sequence}"
        data.setdefault("description", "")
        data.setdefault("priority", "medium")
        data.setdefault("labels", [])
        self.tasks.append(data)
        return self._clone(data)

    def update_task(self, task_id: str, request: UpdateTaskRequestDto) -> dict[str, Any]:
        for index, task in enumerate(self.tasks):
            if task["id"] == task_id:
                patch = request.model_dump(exclude_unset=True, exclude_none=True, mode="json")
                patch.pop("id", None)
                merged = {**task, **patch, "id": task_id}
                self.tasks[index] = merged
                return self._clone(merged)
        raise ApiError(404, "TASK_NOT_FOUND", "Task not found")

    def move_task(self, task_id: str, request: MoveTaskRequestDto) -> dict[str, Any]:
        for index, task in enumerate(self.tasks):
            if task["id"] == task_id:
                moved = {**task, "status": request.status.value}
                self.tasks[index] = moved
                return self._clone(moved)
        raise ApiError(404, "TASK_NOT_FOUND", "Task not found")

    def list_activity_events(self) -> list[dict[str, Any]]:
        return self._clone(self.activity_events)

    def create_activity_event(self, request: CreateActivityEventRequestDto) -> dict[str, Any]:
        data = request.model_dump(exclude_none=True, mode="json")
        if not data.get("id"):
            self.event_sequence += 1
            data["id"] = f"evt-{self.event_sequence}"
        self.activity_events.insert(0, data)
        return self._clone(data)

    def list_workflow_nodes(self) -> list[dict[str, Any]]:
        return self._clone(self.workflow_nodes)

    def list_workflow_edges(self) -> list[dict[str, Any]]:
        return self._clone(self.workflow_edges)

    def update_workflow_node(self, node_id: str, request: UpdateWorkflowNodeRequestDto) -> dict[str, Any]:
        for index, node in enumerate(self.workflow_nodes):
            if node["id"] == node_id:
                patch = request.model_dump(exclude_unset=True, exclude_none=True, mode="json")
                patch.pop("id", None)
                config = patch.pop("config", None)
                merged = {**node, **patch, "id": node_id}
                if config is not None:
                    merged["config"] = {**node.get("config", {}), **config}
                self.workflow_nodes[index] = merged
                return self._clone(merged)
        raise ApiError(404, "WORKFLOW_NODE_NOT_FOUND", "Workflow node not found")

    def validate_workflow(self) -> dict[str, Any]:
        errors: list[str] = []
        if not any(node.get("type") == "start" for node in self.workflow_nodes):
            errors.append("Missing a Start node in the workflow.")
        if not any(node.get("type") == "end" for node in self.workflow_nodes):
            errors.append("Missing an End node in the workflow.")
        return {"success": len(errors) == 0, "errors": errors}

    def simulate_workflow(self) -> dict[str, Any]:
        return {"success": True, "log": ["Starting simulation...", "Activated [Start] node.", "Successfully ran [Analyze Idea] with Gemini 1.5 Pro.", "Simulation completed successfully with no blocks."]}

    def publish_workflow(self) -> dict[str, Any]:
        version = f"v1.{self.publish_sequence}.0"
        self.publish_sequence += 1
        return {"success": True, "version": version}
