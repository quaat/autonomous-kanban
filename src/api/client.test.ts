import { describe, expect, it } from "vitest";
import { createApiClientForMode } from "./client";
import { ApiError } from "./errors";
import { DEFAULT_HTTP_TIMEOUT_MS, HttpAutonomousDevelopmentApiClient } from "./httpApiClient";
import { MockAutonomousDevelopmentApiClient } from "./mockApiClient";

describe("API client factory", () => {
  it("default mode returns a mock client", () => {
    expect(createApiClientForMode(undefined)).toBeInstanceOf(MockAutonomousDevelopmentApiClient);
  });

  it("VITE_API_MODE=mock returns a mock client", () => {
    expect(createApiClientForMode("mock")).toBeInstanceOf(MockAutonomousDevelopmentApiClient);
  });

  it("VITE_API_MODE=http returns an HTTP client", () => {
    expect(createApiClientForMode("http")).toBeInstanceOf(HttpAutonomousDevelopmentApiClient);
  });

  it("passes and normalizes an explicit base URL to the HTTP client", () => {
    const client = createApiClientForMode("http", { baseUrl: "http://example.test/" });
    expect(client).toBeInstanceOf(HttpAutonomousDevelopmentApiClient);
    expect((client as HttpAutonomousDevelopmentApiClient).baseUrl).toBe("http://example.test");
  });

  it("passes an explicit timeout to the HTTP client", () => {
    const client = createApiClientForMode("http", { baseUrl: "http://example.test", timeoutMs: 1234 });
    expect(client).toBeInstanceOf(HttpAutonomousDevelopmentApiClient);
    expect((client as HttpAutonomousDevelopmentApiClient).timeoutMs).toBe(1234);
  });

  it("falls back safely for invalid explicit timeouts", () => {
    const client = createApiClientForMode("http", { baseUrl: "http://example.test", timeoutMs: Number.NaN });
    expect(client).toBeInstanceOf(HttpAutonomousDevelopmentApiClient);
    expect((client as HttpAutonomousDevelopmentApiClient).timeoutMs).toBe(DEFAULT_HTTP_TIMEOUT_MS);
  });

  it("unknown mode throws a typed unsupported-mode API error", () => {
    expect(() => createApiClientForMode("bogus")).toThrow(ApiError);
    expect(() => createApiClientForMode("bogus")).toThrow(
      expect.objectContaining({ code: "UNSUPPORTED_API_MODE" })
    );
  });
});
