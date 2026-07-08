import type {
  ActivityEventDto,
  PublishWorkflowResultDto,
  TaskDto,
  WorkflowEdgeDto,
  WorkflowNodeDto,
  WorkflowSimulationResultDto,
  WorkflowValidationResultDto,
} from "./dto";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === "string";
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString);
const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";
const hasPosition = (value: unknown): value is { x: number; y: number } =>
  isRecord(value) && isNumber(value.x) && isNumber(value.y);

export function isTaskDto(value: unknown): value is TaskDto {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.status) &&
    isString(value.priority) &&
    Array.isArray(value.labels) &&
    value.labels.every(isString)
  );
}
export const isTaskDtoArray = (value: unknown): value is TaskDto[] =>
  Array.isArray(value) && value.every(isTaskDto);

export function isActivityEventDto(value: unknown): value is ActivityEventDto {
  return isRecord(value) && isString(value.id) && isString(value.time) && isString(value.type) && isString(value.message);
}
export const isActivityEventDtoArray = (value: unknown): value is ActivityEventDto[] =>
  Array.isArray(value) && value.every(isActivityEventDto);

export function isWorkflowNodeDto(value: unknown): value is WorkflowNodeDto {
  return isRecord(value) && isString(value.id) && isString(value.type) && isString(value.label) && hasPosition(value.position);
}
export const isWorkflowNodeDtoArray = (value: unknown): value is WorkflowNodeDto[] =>
  Array.isArray(value) && value.every(isWorkflowNodeDto);

export function isWorkflowEdgeDto(value: unknown): value is WorkflowEdgeDto {
  return isRecord(value) && isString(value.id) && isString(value.source) && isString(value.target);
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
