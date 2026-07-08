import { describe, expect, it } from "vitest";
import { createApiClientForMode } from "./client";
import { ApiError } from "./errors";
import { MockAutonomousDevelopmentApiClient } from "./mockApiClient";

describe("API client factory", () => {
  it("default mode returns a mock client", () => {
    expect(createApiClientForMode(undefined)).toBeInstanceOf(MockAutonomousDevelopmentApiClient);
  });

  it("VITE_API_MODE=mock returns a mock client", () => {
    expect(createApiClientForMode("mock")).toBeInstanceOf(MockAutonomousDevelopmentApiClient);
  });

  it("VITE_API_MODE=http throws a typed unsupported-mode API error", () => {
    expect(() => createApiClientForMode("http")).toThrow(ApiError);
    expect(() => createApiClientForMode("http")).toThrow(
      expect.objectContaining({ code: "UNSUPPORTED_API_MODE" })
    );
  });

  it("unknown mode throws a typed unsupported-mode API error", () => {
    expect(() => createApiClientForMode("bogus")).toThrow(ApiError);
    expect(() => createApiClientForMode("bogus")).toThrow(
      expect.objectContaining({ code: "UNSUPPORTED_API_MODE" })
    );
  });
});
