import type { Server } from "node:http";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFixtureServer } from "../../scripts/fixture-server.mjs";
import { ApiError } from "./errors";
import { HttpAutonomousDevelopmentApiClient } from "./httpApiClient";

let server: Server;
let client: HttpAutonomousDevelopmentApiClient;

async function listen(testServer: Server): Promise<string> {
  await new Promise<void>((resolve) => testServer.listen(0, "127.0.0.1", resolve));
  const { port } = testServer.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

async function close(testServer: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => testServer.close((error) => (error ? reject(error) : resolve())));
}

function jsonServer(payload: unknown, status = 200): Server {
  return createServer((_req, res) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  });
}

beforeEach(async () => {
  server = await createFixtureServer();
  const baseUrl = await listen(server);
  client = new HttpAutonomousDevelopmentApiClient({ baseUrl });
});

afterEach(async () => {
  await close(server);
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

  it("server returns task with invalid status -> HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = jsonServer([{ id: "task-x", title: "Bad", status: "bogus", priority: "medium", labels: [] }]);
    try {
      const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(invalidServer) });
      await expect(invalidClient.listTasks()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    } finally {
      await close(invalidServer);
    }
  });

  it("server returns task with invalid priority -> HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = jsonServer([{ id: "task-x", title: "Bad", status: "idea", priority: "urgent", labels: [] }]);
    try {
      const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(invalidServer) });
      await expect(invalidClient.listTasks()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    } finally {
      await close(invalidServer);
    }
  });

  it("server returns activity event with invalid type -> HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = jsonServer([{ id: "evt-x", time: "now", type: "bogus", message: "Bad" }]);
    try {
      const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(invalidServer) });
      await expect(invalidClient.listActivityEvents()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    } finally {
      await close(invalidServer);
    }
  });

  it("server returns workflow node with invalid type -> HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = jsonServer([{ id: "node-x", type: "bogus", label: "Bad", position: { x: 0, y: 0 } }]);
    try {
      const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(invalidServer) });
      await expect(invalidClient.listWorkflowNodes()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    } finally {
      await close(invalidServer);
    }
  });

  it("server returns workflow edge with invalid variant -> HTTP_RESPONSE_INVALID", async () => {
    const invalidServer = jsonServer([{ id: "edge-x", source: "a", target: "b", variant: "bogus" }]);
    try {
      const invalidClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(invalidServer) });
      await expect(invalidClient.listWorkflowEdges()).rejects.toMatchObject({ code: "HTTP_RESPONSE_INVALID" });
    } finally {
      await close(invalidServer);
    }
  });

  it("timeout causes HTTP_TIMEOUT", async () => {
    const slowServer = createServer((_req, res) => {
      globalThis.setTimeout(() => res.end(JSON.stringify([])), 50);
    });
    try {
      const slowClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: await listen(slowServer), timeoutMs: 1 });
      await expect(slowClient.listTasks()).rejects.toMatchObject({ code: "HTTP_TIMEOUT" });
    } finally {
      await close(slowServer);
    }
  });



  it("times out if response headers arrive but JSON body stalls", async () => {
    const slowBodyServer = createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      globalThis.setTimeout(() => {
        res.end(JSON.stringify([]));
      }, 50);
    });

    try {
      const slowClient = new HttpAutonomousDevelopmentApiClient({
        baseUrl: await listen(slowBodyServer),
        timeoutMs: 1,
      });

      await expect(slowClient.listTasks()).rejects.toMatchObject({ code: "HTTP_TIMEOUT" });
    } finally {
      await close(slowBodyServer);
    }
  });

  it("non-timeout network failure still causes HTTP_REQUEST_FAILED", async () => {
    const failingClient = new HttpAutonomousDevelopmentApiClient({ baseUrl: "http://127.0.0.1:1", timeoutMs: 5_000 });
    await expect(failingClient.listTasks()).rejects.toBeInstanceOf(ApiError);
    await expect(failingClient.listTasks()).rejects.toMatchObject({ code: "HTTP_REQUEST_FAILED" });
  });
});

describe("fixture server validation", () => {
  async function post(path: string, body: unknown, method = "POST"): Promise<Response> {
    return fetch(`${client.baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("GET /api/tasks returns JSON", async () => {
    const response = await fetch(`${client.baseUrl}/api/tasks`);
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual(expect.any(Array));
  });

  it("POST /api/tasks with missing title returns 400", async () => {
    await expect(post("/api/tasks", { status: "idea" }).then((response) => response.status)).resolves.toBe(400);
  });

  it("POST /api/tasks with invalid status returns 400", async () => {
    await expect(post("/api/tasks", { title: "Bad", status: "bogus" }).then((response) => response.status)).resolves.toBe(400);
  });

  it("POST /api/tasks/{id}/move with invalid status returns 400", async () => {
    await expect(post("/api/tasks/task-1/move", { status: "bogus" }).then((response) => response.status)).resolves.toBe(400);
  });

  it("POST /api/activity-events with missing message returns 400", async () => {
    await expect(post("/api/activity-events", { time: "now", type: "info" }).then((response) => response.status)).resolves.toBe(400);
  });

  it("PATCH /api/tasks/{id} with id in body does not change task ID", async () => {
    const response = await post("/api/tasks/task-1", { id: "changed", title: "Still task-1" }, "PATCH");
    await expect(response.json()).resolves.toEqual(expect.objectContaining({ id: "task-1", title: "Still task-1" }));
  });

  it("PATCH /api/workflow/nodes/{id} with invalid position returns 400", async () => {
    await expect(post("/api/workflow/nodes/start-node", { position: { x: "nope", y: 0 } }, "PATCH").then((response) => response.status)).resolves.toBe(400);
  });

  it("malformed JSON returns 400", async () => {
    await expect(post("/api/tasks", "{not-json").then((response) => response.status)).resolves.toBe(400);
  });

  it("unexpected routes still return 404", async () => {
    await expect(fetch(`${client.baseUrl}/api/unknown`).then((response) => response.status)).resolves.toBe(404);
  });

  it("unsupported methods still return 405", async () => {
    await expect(fetch(`${client.baseUrl}/api/tasks`, { method: "PATCH" }).then((response) => response.status)).resolves.toBe(405);
  });

  it("CORS preflight still works", async () => {
    const response = await fetch(`${client.baseUrl}/api/tasks`, { method: "OPTIONS" });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });
});
