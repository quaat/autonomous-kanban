import type {
  ActivityEventDto,
  AgentDto,
  PublishWorkflowResultDto,
  TaskDto,
  TaskPriorityDto,
  TaskStatusDto,
  WorkflowEdgeDto,
  WorkflowNodeDto,
  WorkflowNodeTypeDto,
  WorkflowSimulationResultDto,
  WorkflowValidationResultDto,
} from "./dto";

const taskStatuses = [
  "idea",
  "ready_for_implementation",
  "to_do",
  "in_progress",
  "feedback_required",
  "in_review",
  "done",
] as const satisfies readonly TaskStatusDto[];
const taskPriorities = ["low", "medium", "high"] as const satisfies readonly TaskPriorityDto[];
const agents = ["Claude", "Codex", "GPT-4.1", "Gemini 1.5 Pro"] as const satisfies readonly AgentDto[];
const activityEventTypes = ["info", "success", "warning", "error", "agent"] as const satisfies readonly ActivityEventDto["type"][];
const workflowNodeTypes = [
  "start",
  "end",
  "llm_task",
  "human_task",
  "service_task",
  "kanban_state",
  "decision",
  "review_task",
  "blocked",
] as const satisfies readonly WorkflowNodeTypeDto[];
const workflowEdgeVariants = ["default", "success", "warning", "error", "dashed"] as const satisfies readonly NonNullable<WorkflowEdgeDto["variant"]>[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const isOptional = <T>(value: unknown, guard: (candidate: unknown) => candidate is T): value is T | undefined =>
  value === undefined || guard(value);
const oneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  isString(value) && values.includes(value as T);
const hasPosition = (value: unknown): value is { x: number; y: number } =>
  isRecord(value) && isNumber(value.x) && isNumber(value.y);
const hasReviewIteration = (value: unknown): value is { current: number; max: number } =>
  isRecord(value) && isNumber(value.current) && isNumber(value.max);

export const isTaskStatusDto = (value: unknown): value is TaskStatusDto => oneOf(taskStatuses, value);
export const isTaskPriorityDto = (value: unknown): value is TaskPriorityDto => oneOf(taskPriorities, value);
export const isAgentDto = (value: unknown): value is AgentDto => oneOf(agents, value);
export const isActivityEventTypeDto = (value: unknown): value is ActivityEventDto["type"] =>
  oneOf(activityEventTypes, value);
export const isWorkflowNodeTypeDto = (value: unknown): value is WorkflowNodeTypeDto =>
  oneOf(workflowNodeTypes, value);
export const isWorkflowEdgeVariantDto = (value: unknown): value is WorkflowEdgeDto["variant"] =>
  value === undefined || oneOf(workflowEdgeVariants, value);

export function isTaskDto(value: unknown): value is TaskDto {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isTaskStatusDto(value.status) &&
    isTaskPriorityDto(value.priority) &&
    isStringArray(value.labels) &&
    isOptional(value.description, isString) &&
    isOptional(value.dependencies, isStringArray) &&
    isOptional(value.blockedBy, isStringArray) &&
    isOptional(value.agent, isAgentDto) &&
    isOptional(value.branch, isString) &&
    isOptional(value.progress, isNumber) &&
    isOptional(value.reviewIteration, hasReviewIteration) &&
    isOptional(value.dueDate, isString) &&
    isOptional(value.comments, isNumber) &&
    isOptional(value.assigneeAvatar, isString) &&
    isOptional(value.elapsed, isString)
  );
}
export const isTaskDtoArray = (value: unknown): value is TaskDto[] =>
  Array.isArray(value) && value.every(isTaskDto);

export function isActivityEventDto(value: unknown): value is ActivityEventDto {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.time) &&
    isActivityEventTypeDto(value.type) &&
    isString(value.message) &&
    isOptional(value.detail, isString) &&
    isOptional(value.agent, isString)
  );
}
export const isActivityEventDtoArray = (value: unknown): value is ActivityEventDto[] =>
  Array.isArray(value) && value.every(isActivityEventDto);

export function isWorkflowNodeDto(value: unknown): value is WorkflowNodeDto {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isWorkflowNodeTypeDto(value.type) &&
    isString(value.label) &&
    isOptional(value.subtitle, isString) &&
    hasPosition(value.position) &&
    isOptional(value.config, isRecord)
  );
}
export const isWorkflowNodeDtoArray = (value: unknown): value is WorkflowNodeDto[] =>
  Array.isArray(value) && value.every(isWorkflowNodeDto);

export function isWorkflowEdgeDto(value: unknown): value is WorkflowEdgeDto {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.source) &&
    isString(value.target) &&
    isOptional(value.label, isString) &&
    isWorkflowEdgeVariantDto(value.variant)
  );
}
export const isWorkflowEdgeDtoArray = (value: unknown): value is WorkflowEdgeDto[] =>
  Array.isArray(value) && value.every(isWorkflowEdgeDto);

export function isWorkflowValidationResultDto(value: unknown): value is WorkflowValidationResultDto {
  return isRecord(value) && isBoolean(value.success) && isStringArray(value.errors);
}
export function isWorkflowSimulationResultDto(value: unknown): value is WorkflowSimulationResultDto {
  return isRecord(value) && isBoolean(value.success) && isStringArray(value.log);
}
export function isPublishWorkflowResultDto(value: unknown): value is PublishWorkflowResultDto {
  return isRecord(value) && isBoolean(value.success) && isString(value.version);
}
