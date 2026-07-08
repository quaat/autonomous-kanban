import type { ActivityEventDto, TaskDto, WorkflowEdgeDto, WorkflowNodeDto } from "./dto";
import type { ActivityLog, TaskCard } from "../types/board";
import type { WorkflowEdge, WorkflowNode } from "../types/workflow";

export function taskDtoToDomain(dto: TaskDto): TaskCard {
  return { ...dto };
}

export function taskDomainToDto(task: TaskCard): TaskDto {
  return { ...task };
}

export function activityEventDtoToDomain(dto: ActivityEventDto): ActivityLog {
  return { ...dto };
}

export function activityEventDomainToDto(event: ActivityLog): ActivityEventDto {
  return { ...event };
}

export function workflowNodeDtoToDomain(dto: WorkflowNodeDto): WorkflowNode {
  return { ...dto } as WorkflowNode;
}

export function workflowNodeDomainToDto(node: WorkflowNode): WorkflowNodeDto {
  return { ...node } as WorkflowNodeDto;
}

export function workflowEdgeDtoToDomain(dto: WorkflowEdgeDto): WorkflowEdge {
  return { ...dto };
}

export function workflowEdgeDomainToDto(edge: WorkflowEdge): WorkflowEdgeDto {
  return { ...edge };
}
