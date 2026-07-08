import type { AutonomousDevelopmentApiClient } from "./client";
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
import { ApiError, apiErrorFromHttpResponse } from "./errors";
import {
  isActivityEventDto,
  isActivityEventDtoArray,
  isPublishWorkflowResultDto,
  isTaskDto,
  isTaskDtoArray,
  isWorkflowEdgeDtoArray,
  isWorkflowNodeDto,
  isWorkflowNodeDtoArray,
  isWorkflowSimulationResultDto,
  isWorkflowValidationResultDto,
} from "./validation";

export const DEFAULT_HTTP_TIMEOUT_MS = 10_000;

export type HttpApiClientOptions = { baseUrl: string; timeoutMs?: number };
type Guard<T> = (value: unknown) => value is T;

export class HttpAutonomousDevelopmentApiClient implements AutonomousDevelopmentApiClient {
  public readonly baseUrl: string;
  public readonly timeoutMs: number;

  constructor(options: HttpApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeoutMs = normalizeTimeoutMs(options.timeoutMs);
  }

  listTasks(): Promise<TaskDto[]> {
    return this.request("/api/tasks", { method: "GET" }, isTaskDtoArray);
  }
  createTask(input: CreateTaskRequestDto): Promise<TaskDto> {
    return this.request("/api/tasks", this.jsonRequest("POST", input), isTaskDto);
  }
  updateTask(input: UpdateTaskRequestDto): Promise<TaskDto> {
    const { id, ...body } = input;
    return this.request(`/api/tasks/${encodeURIComponent(id)}`, this.jsonRequest("PATCH", body), isTaskDto);
  }
  moveTask(input: MoveTaskRequestDto): Promise<TaskDto> {
    return this.request(
      `/api/tasks/${encodeURIComponent(input.id)}/move`,
      this.jsonRequest("POST", { status: input.status }),
      isTaskDto
    );
  }
  listActivityEvents(): Promise<ActivityEventDto[]> {
    return this.request("/api/activity-events", { method: "GET" }, isActivityEventDtoArray);
  }
  createActivityEvent(input: CreateActivityEventRequestDto): Promise<ActivityEventDto> {
    return this.request("/api/activity-events", this.jsonRequest("POST", input), isActivityEventDto);
  }
  listWorkflowNodes(): Promise<WorkflowNodeDto[]> {
    return this.request("/api/workflow/nodes", { method: "GET" }, isWorkflowNodeDtoArray);
  }
  listWorkflowEdges(): Promise<WorkflowEdgeDto[]> {
    return this.request("/api/workflow/edges", { method: "GET" }, isWorkflowEdgeDtoArray);
  }
  updateWorkflowNode(input: UpdateWorkflowNodeRequestDto): Promise<WorkflowNodeDto> {
    const { id, ...body } = input;
    return this.request(`/api/workflow/nodes/${encodeURIComponent(id)}`, this.jsonRequest("PATCH", body), isWorkflowNodeDto);
  }
  validateWorkflow(): Promise<WorkflowValidationResultDto> {
    return this.request("/api/workflow/validate", { method: "POST" }, isWorkflowValidationResultDto);
  }
  simulateWorkflow(): Promise<WorkflowSimulationResultDto> {
    return this.request("/api/workflow/simulate", { method: "POST" }, isWorkflowSimulationResultDto);
  }
  publishWorkflow(): Promise<PublishWorkflowResultDto> {
    return this.request("/api/workflow/publish", { method: "POST" }, isPublishWorkflowResultDto);
  }

  private jsonRequest(method: string, body: unknown): RequestInit {
    return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  }

  private async request<T>(path: string, init: RequestInit, guard: Guard<T>): Promise<T> {
    const endpoint = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        ...init,
        headers: { Accept: "application/json", ...init.headers },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new ApiError(
          "HTTP_TIMEOUT",
          `HTTP request to ${path} timed out after ${this.timeoutMs}ms`,
          error
        );
      }
      throw new ApiError("HTTP_REQUEST_FAILED", `HTTP request to ${path} failed`, error);
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
    if (!response.ok) {
      throw apiErrorFromHttpResponse(response, await this.errorMessage(response, path));
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new ApiError("HTTP_RESPONSE_INVALID", `HTTP response from ${path} was not valid JSON`, error);
    }
    if (!guard(payload)) {
      throw new ApiError("HTTP_RESPONSE_INVALID", `HTTP response from ${path} did not match the expected shape`);
    }
    return payload;
  }

  private async errorMessage(response: Response, path: string): Promise<string> {
    const prefix = `HTTP request to ${path} failed with status ${response.status}`;
    try {
      const payload: unknown = await response.json();
      if (typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string") {
        return `${prefix}: ${payload.message}`;
      }
    } catch {
      // Ignore invalid error bodies and use the status-only message.
    }
    return prefix;
  }
}

export function normalizeTimeoutMs(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_HTTP_TIMEOUT_MS;
  }
  return value;
}
