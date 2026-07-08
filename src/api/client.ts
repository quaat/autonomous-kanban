import type {
  ActivityEventDto,
  CreateActivityEventRequestDto,
  CreateTaskRequestDto,
  MoveTaskRequestDto,
  PublishWorkflowResultDto,
  TaskDto,
  UpdateTaskRequestDto,
  UpdateWorkflowNodeRequestDto,
  WorkflowEdgeDto,
  WorkflowNodeDto,
  WorkflowSimulationResultDto,
  WorkflowValidationResultDto,
} from "./dto";
import { MockAutonomousDevelopmentApiClient } from "./mockApiClient";

export interface AutonomousDevelopmentApiClient {
  listTasks(): Promise<TaskDto[]>;
  createTask(input: CreateTaskRequestDto): Promise<TaskDto>;
  updateTask(input: UpdateTaskRequestDto): Promise<TaskDto>;
  moveTask(input: MoveTaskRequestDto): Promise<TaskDto>;

  listActivityEvents(): Promise<ActivityEventDto[]>;
  createActivityEvent(input: CreateActivityEventRequestDto): Promise<ActivityEventDto>;

  listWorkflowNodes(): Promise<WorkflowNodeDto[]>;
  listWorkflowEdges(): Promise<WorkflowEdgeDto[]>;
  updateWorkflowNode(input: UpdateWorkflowNodeRequestDto): Promise<WorkflowNodeDto>;

  validateWorkflow(): Promise<WorkflowValidationResultDto>;
  simulateWorkflow(): Promise<WorkflowSimulationResultDto>;
  publishWorkflow(): Promise<PublishWorkflowResultDto>;
}

let apiClient: AutonomousDevelopmentApiClient | null = null;

export function getApiClient(): AutonomousDevelopmentApiClient {
  const apiMode = import.meta.env.VITE_API_MODE ?? "mock";

  if (apiMode === "http") {
    throw new Error("HTTP API client is not implemented yet. Use VITE_API_MODE=mock.");
  }

  if (apiMode !== "mock") {
    throw new Error(`Unsupported API mode '${apiMode}'. Use VITE_API_MODE=mock.`);
  }

  apiClient ??= new MockAutonomousDevelopmentApiClient();
  return apiClient;
}
