from fastapi import APIRouter, Depends, status

from ..dependencies import get_repository
from ..repository import Repository
from ..schemas import ActivityEventDto, CreateActivityEventRequestDto

router = APIRouter(prefix="/api/activity-events", tags=["activity"])



@router.get("", response_model=list[ActivityEventDto], response_model_exclude_none=True)
def list_activity_events(repo: Repository = Depends(get_repository)):
    return repo.list_activity_events()


@router.post("", response_model=ActivityEventDto, status_code=status.HTTP_201_CREATED, response_model_exclude_none=True)
def create_activity_event(request: CreateActivityEventRequestDto, repo: Repository = Depends(get_repository)):
    return repo.create_activity_event(request)
