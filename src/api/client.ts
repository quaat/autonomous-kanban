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
import { HttpAutonomousDevelopmentApiClient } from "./httpApiClient";
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

export function createApiClientForMode(
  apiMode: string | undefined,
  options?: { baseUrl?: string }
): AutonomousDevelopmentApiClient {
  const resolvedApiMode = apiMode ?? "mock";

  if (resolvedApiMode === "mock") {
    return new MockAutonomousDevelopmentApiClient();
  }

  if (resolvedApiMode === "http") {
    return new HttpAutonomousDevelopmentApiClient({
      baseUrl: options?.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5174",
    });
  }

  throw new ApiError(
    "UNSUPPORTED_API_MODE",
    `Unsupported API mode '${resolvedApiMode}'. Use VITE_API_MODE=mock or VITE_API_MODE=http.`
  );
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
