import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { createFixtureServer } from "../../scripts/fixture-server.mjs";
import { ApiError } from "./errors";
import { HttpAutonomousDevelopmentApiClient } from "./httpApiClient";

let server: Awaited<ReturnType<typeof createFixtureServer>>;
let client: HttpAutonomousDevelopmentApiClient;

beforeAll(async () => {
  server = await createFixtureServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  client = new HttpAutonomousDevelopmentApiClient({ baseUrl: `http://127.0.0.1:${port}` });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

describe("HttpAutonomousDevelopmentApiClient", () => {
  it("listTasks() fetches tasks from HTTP backend", async () => {
    await expect(client.listTasks()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "task-1" })]));
  });

  it("createTask() sends a task and receives a created task", async () => {
    const task = await client.createTask({ title: "HTTP task", status: "idea", priority: "medium", labels: ["http"] });
    expect(task).toEqual(expect.objectContaining({ id: expect.any(String), title: "HTTP task" }));
  });

  it("updateTask() updates metadata", async () => {
    await expect(client.updateTask({ id: "task-1", title: "Updated over HTTP" })).resolves.toEqual(
      expect.objectContaining({ id: "task-1", title: "Updated over HTTP" })
    );
  });

  it("moveTask() updates status", async () => {
    await expect(client.moveTask({ id: "task-1", status: "done" })).resolves.toEqual(
      expect.objectContaining({ id: "task-1", status: "done" })
    );
  });

  it("invalid task ID throws typed ApiError", async () => {
    await expect(client.updateTask({ id: "missing", title: "Nope" })).rejects.toMatchObject({ code: "HTTP_NOT_FOUND" });
  });

  it("listActivityEvents() fetches events", async () => {
    await expect(client.listActivityEvents()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "evt-1" })]));
  });

  it("createActivityEvent() creates an event", async () => {
    await expect(client.createActivityEvent({ time: "now", type: "info", message: "Created" })).resolves.toEqual(
      expect.objectContaining({ id: expect.any(String), message: "Created" })
    );
  });

  it("listWorkflowNodes() and listWorkflowEdges() fetch workflow data", async () => {
    await expect(client.listWorkflowNodes()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "start-node" })]));
    await expect(client.listWorkflowEdges()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: "e1" })]));
  });

  it("updateWorkflowNode() merges node config and position", async () => {
    const node = await client.updateWorkflowNode({ id: "analyze-node", position: { x: 222, y: 111 }, config: { timeout: "10 m" } });
    expect(node.position).toEqual({ x: 222, y: 111 });
    expect(node.config).toEqual(expect.objectContaining({ reviewer: "Gemini 1.5 Pro", timeout: "10 m" }));
  });

  it("invalid workflow node ID throws typed ApiError", async () => {
    await expect(client.updateWorkflowNode({ id: "missing-node", label: "Nope" })).rejects.toMatchObject({ code: "HTTP_NOT_FOUND" });
  });

  it("validateWorkflow() returns success", async () => {
    await expect(client.validateWorkflow()).resolves.toEqual({ success: true, errors: [] });
  });

  it("simulateWorkflow() returns non-empty log", async () => {
    const result = await client.simulateWorkflow();
    expect(result.success).toBe(true);
    expect(result.log.length).toBeGreaterThan(0);
  });

  it("publishWorkflow() returns a version string", async () => {
    await expect(client.publishWorkflow()).resolves.toEqual(expect.objectContaining({ success: true, version: expect.stringMatching(/^v/) }));
  });

  it("invalid response shape throws HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ not: "tasks" }));
    });
    await new Promise<void>((resolve) => invalidServer.listen(0, "127.0.0.1", resolve));
    const { port } = invalidServer.address() as AddressInfo;
    const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: `http://127.0.0.1:${port}` });
    await expect(invalidClient.listTasks()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    await new Promise<void>((resolve, reject) => invalidServer.close((error) => (error ? reject(error) : resolve())));
  });

  it("fixture server returns JSON for GET /api/tasks", async () => {
    const response = await fetch(`${client.baseUrl}/api/tasks`);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual(expect.any(Array));
  });

  it("fixture server returns 404 for unknown routes", async () => {
    await expect(fetch(`${client.baseUrl}/api/unknown`).then((response) => response.status)).resolves.toBe(404);
  });

  it("fixture server returns 405 for unsupported methods", async () => {
    await expect(fetch(`${client.baseUrl}/api/tasks`, { method: "PATCH" }).then((response) => response.status)).resolves.toBe(405);
  });

  it("fixture server responds to CORS preflight", async () => {
    const response = await fetch(`${client.baseUrl}/api/tasks`, { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("request failures throw typed ApiError", async () => {
    const failingClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: "http://127.0.0.1:1" });
    await expect(failingClient.listTasks()).rejects.toBeInstanceOf(ApiError);
    await expect(failingClient.listTasks()).rejects.toMatchObject({ code: "HTTP_REQUEST_FAILED" });
  });
});
