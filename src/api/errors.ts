export type ApiErrorCode =
  | "TASK_NOT_FOUND"
  | "WORKFLOW_NODE_NOT_FOUND"
  | "UNSUPPORTED_API_MODE"
  | "HTTP_REQUEST_FAILED"
  | "HTTP_RESPONSE_INVALID"
  | "HTTP_NOT_FOUND"
  | "HTTP_SERVER_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function apiErrorCodeFromStatus(status: number): ApiErrorCode {
  if (status === 404) return "HTTP_NOT_FOUND";
  if (status >= 500) return "HTTP_SERVER_ERROR";
  return "HTTP_REQUEST_FAILED";
}

export function apiErrorFromHttpResponse(response: Response, message?: string): ApiError {
  const fallback = `HTTP request failed with status ${response.status} ${response.statusText}`.trim();
  return new ApiError(apiErrorCodeFromStatus(response.status), message ?? fallback);
}
