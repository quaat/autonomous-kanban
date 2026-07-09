from fastapi import APIRouter, Depends

from ..dependencies import get_repository
from ..repository import InMemoryRepository
from ..schemas import PublishWorkflowResultDto, UpdateWorkflowNodeRequestDto, WorkflowEdgeDto, WorkflowNodeDto, WorkflowSimulationResultDto, WorkflowValidationResultDto

router = APIRouter(prefix="/api/workflow", tags=["workflow"])



@router.get("/nodes", response_model=list[WorkflowNodeDto], response_model_exclude_none=True)
def list_workflow_nodes(repo: InMemoryRepository = Depends(get_repository)):
    return repo.list_workflow_nodes()


@router.get("/edges", response_model=list[WorkflowEdgeDto], response_model_exclude_none=True)
def list_workflow_edges(repo: InMemoryRepository = Depends(get_repository)):
    return repo.list_workflow_edges()


@router.patch("/nodes/{node_id}", response_model=WorkflowNodeDto, response_model_exclude_none=True)
def update_workflow_node(node_id: str, request: UpdateWorkflowNodeRequestDto, repo: InMemoryRepository = Depends(get_repository)):
    return repo.update_workflow_node(node_id, request)


@router.post("/validate", response_model=WorkflowValidationResultDto)
def validate_workflow(repo: InMemoryRepository = Depends(get_repository)):
    return repo.validate_workflow()


@router.post("/simulate", response_model=WorkflowSimulationResultDto)
def simulate_workflow(repo: InMemoryRepository = Depends(get_repository)):
    return repo.simulate_workflow()


@router.post("/publish", response_model=PublishWorkflowResultDto)
def publish_workflow(repo: InMemoryRepository = Depends(get_repository)):
    return repo.publish_workflow()
