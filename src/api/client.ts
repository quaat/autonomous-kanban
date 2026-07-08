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
import { ApiError } from "./errors";
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

export function createApiClientForMode(apiMode: string | undefined): AutonomousDevelopmentApiClient {
  const resolvedApiMode = apiMode ?? "mock";

  if (resolvedApiMode === "http") {
    throw new ApiError(
      "UNSUPPORTED_API_MODE",
      "HTTP API client is not implemented yet. Use VITE_API_MODE=mock."
    );
  }

  if (resolvedApiMode !== "mock") {
    throw new ApiError(
      "UNSUPPORTED_API_MODE",
      `Unsupported API mode '${resolvedApiMode}'. Use VITE_API_MODE=mock.`
    );
  }

  return new MockAutonomousDevelopmentApiClient();
}

export function getApiClient(): AutonomousDevelopmentApiClient {
  apiClient ??= createApiClientForMode(import.meta.env.VITE_API_MODE);
  return apiClient;
}

export function setApiClientForTesting(client: AutonomousDevelopmentApiClient | null): void {
  apiClient = client;
}

export function resetApiClientForTesting(): void {
  apiClient = null;
}
