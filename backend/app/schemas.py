from __future__ import annotations

import math
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskStatus(StrEnum):
    idea = "idea"
    ready_for_implementation = "ready_for_implementation"
    to_do = "to_do"
    in_progress = "in_progress"
    feedback_required = "feedback_required"
    in_review = "in_review"
    done = "done"


class TaskPriority(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"


class Agent(StrEnum):
    Claude = "Claude"
    Codex = "Codex"
    GPT_4_1 = "GPT-4.1"
    Gemini_1_5_Pro = "Gemini 1.5 Pro"


class ActivityEventType(StrEnum):
    info = "info"
    success = "success"
    warning = "warning"
    error = "error"
    agent = "agent"


class WorkflowNodeType(StrEnum):
    start = "start"
    end = "end"
    llm_task = "llm_task"
    human_task = "human_task"
    service_task = "service_task"
    kanban_state = "kanban_state"
    decision = "decision"
    review_task = "review_task"
    blocked = "blocked"


class WorkflowEdgeVariant(StrEnum):
    default = "default"
    success = "success"
    warning = "warning"
    error = "error"
    dashed = "dashed"


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ReviewIterationDto(ContractModel):
    current: float
    max: float

    @field_validator("current", "max")
    @classmethod
    def finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("must be finite")
        return value


class PositionDto(ContractModel):
    x: float
    y: float

    @field_validator("x", "y")
    @classmethod
    def finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("must be finite")
        return value


class TaskBase(ContractModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    labels: list[str] | None = None
    dependencies: list[str] | None = None
    blockedBy: list[str] | None = None
    agent: Agent | None = None
    branch: str | None = None
    progress: float | None = None
    reviewIteration: ReviewIterationDto | None = None
    dueDate: str | None = None
    comments: float | None = None
    assigneeAvatar: str | None = None
    elapsed: str | None = None

    @field_validator("title")
    @classmethod
    def non_empty_title(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("title must not be empty")
        return value

    @field_validator("progress", "comments")
    @classmethod
    def finite_optional(cls, value: float | None) -> float | None:
        if value is not None and not math.isfinite(value):
            raise ValueError("must be finite")
        return value


class TaskDto(TaskBase):
    id: str
    title: str
    status: TaskStatus
    priority: TaskPriority
    labels: list[str]


class CreateTaskRequestDto(TaskBase):
    id: str | None = None
    title: str
    status: TaskStatus
    priority: TaskPriority = TaskPriority.medium
    labels: list[str] = Field(default_factory=list)


class UpdateTaskRequestDto(TaskBase):
    id: str | None = None


class MoveTaskRequestDto(ContractModel):
    id: str | None = None
    status: TaskStatus


class ActivityEventDto(ContractModel):
    id: str
    time: str
    type: ActivityEventType
    message: str
    detail: str | None = None
    agent: str | None = None

    @field_validator("message")
    @classmethod
    def non_empty_message(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("message must not be empty")
        return value


class CreateActivityEventRequestDto(ContractModel):
    id: str | None = None
    time: str
    type: ActivityEventType
    message: str
    detail: str | None = None
    agent: str | None = None

    @field_validator("message")
    @classmethod
    def non_empty_message(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("message must not be empty")
        return value


class WorkflowNodeDto(ContractModel):
    id: str
    type: WorkflowNodeType
    label: str
    subtitle: str | None = None
    position: PositionDto
    config: dict[str, Any] | None = None


class WorkflowEdgeDto(ContractModel):
    id: str
    source: str
    target: str
    label: str | None = None
    variant: WorkflowEdgeVariant | None = None


class UpdateWorkflowNodeRequestDto(ContractModel):
    id: str | None = None
    label: str | None = None
    subtitle: str | None = None
    position: PositionDto | None = None
    config: dict[str, Any] | None = None


class WorkflowValidationResultDto(ContractModel):
    success: bool
    errors: list[str]


class WorkflowSimulationResultDto(ContractModel):
    success: bool
    log: list[str]


class PublishWorkflowResultDto(ContractModel):
    success: bool
    version: str
