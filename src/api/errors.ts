export type ApiErrorCode = "TASK_NOT_FOUND" | "WORKFLOW_NODE_NOT_FOUND" | "UNSUPPORTED_API_MODE";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
