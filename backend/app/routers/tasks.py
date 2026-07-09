from fastapi import APIRouter, Depends, status

from ..dependencies import get_repository
from ..repository import Repository
from ..schemas import CreateTaskRequestDto, MoveTaskRequestDto, TaskDto, UpdateTaskRequestDto

router = APIRouter(prefix="/api/tasks", tags=["tasks"])



@router.get("", response_model=list[TaskDto], response_model_exclude_none=True)
def list_tasks(repo: Repository = Depends(get_repository)):
    return repo.list_tasks()


@router.post("", response_model=TaskDto, status_code=status.HTTP_201_CREATED, response_model_exclude_none=True)
def create_task(request: CreateTaskRequestDto, repo: Repository = Depends(get_repository)):
    return repo.create_task(request)


@router.patch("/{task_id}", response_model=TaskDto, response_model_exclude_none=True)
def update_task(task_id: str, request: UpdateTaskRequestDto, repo: Repository = Depends(get_repository)):
    return repo.update_task(task_id, request)


@router.post("/{task_id}/move", response_model=TaskDto, response_model_exclude_none=True)
def move_task(task_id: str, request: MoveTaskRequestDto, repo: Repository = Depends(get_repository)):
    return repo.move_task(task_id, request)
