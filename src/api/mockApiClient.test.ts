import { describe, expect, it } from "vitest";
import { MockAutonomousDevelopmentApiClient } from "./mockApiClient";
import { ApiError } from "./errors";

describe("MockAutonomousDevelopmentApiClient", () => {
  it("listTasks returns mock tasks", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const tasks = await client.listTasks();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.some((task) => task.id === "task-8")).toBe(true);
  });

  it("listTasks returns defensive clones", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const firstResult = await client.listTasks();
    firstResult[0].title = "Mutated outside the client";
    firstResult.push({
      id: "external-task",
      title: "External mutation",
      status: "done",
      priority: "low",
      labels: [],
    });

    const secondResult = await client.listTasks();
    expect(secondResult[0].title).not.toBe("Mutated outside the client");
    expect(secondResult.some((task) => task.id === "external-task")).toBe(false);
  });

  it("createTask creates a task", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const task = await client.createTask({
      title: "New contract task",
      status: "idea",
      priority: "medium",
      labels: [],
    });
    expect(task.id).toMatch(/^task-/);
    expect(task.title).toBe("New contract task");
    await expect(client.listTasks()).resolves.toContainEqual(task);
  });

  it("updateTask updates metadata", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const task = await client.updateTask({
      id: "task-1",
      title: "Updated task title",
      priority: "high",
      labels: ["updated", "metadata"],
      comments: 7,
    });

    expect(task).toMatchObject({
      id: "task-1",
      title: "Updated task title",
      priority: "high",
      labels: ["updated", "metadata"],
      comments: 7,
    });
  });

  it("moveTask updates task status", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const movedTask = await client.moveTask({ id: "task-1", status: "done" });
    expect(movedTask.status).toBe("done");
  });

  it("invalid task ID throws a typed API error", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    await expect(client.moveTask({ id: "missing", status: "done" })).rejects.toMatchObject({
      code: "TASK_NOT_FOUND",
      name: "ApiError",
    } satisfies Partial<ApiError>);
  });

  it("listWorkflowNodes returns workflow nodes", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const nodes = await client.listWorkflowNodes();
    expect(nodes.some((node) => node.id === "review-node")).toBe(true);
  });

  it("updateWorkflowNode updates node config and position", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const node = await client.updateWorkflowNode({
      id: "review-node",
      position: { x: 123, y: 456 },
      config: { reviewer: "Claude", maxIterations: 2 },
    });
    expect(node.position).toEqual({ x: 123, y: 456 });
    expect(node.config).toMatchObject({ reviewer: "Claude", maxIterations: 2 });
  });

  it("invalid workflow node ID throws a typed API error", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    await expect(client.updateWorkflowNode({ id: "missing-node" })).rejects.toMatchObject({
      code: "WORKFLOW_NODE_NOT_FOUND",
      name: "ApiError",
    } satisfies Partial<ApiError>);
  });

  it("validateWorkflow returns success", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    await expect(client.validateWorkflow()).resolves.toEqual({ success: true, errors: [] });
  });

  it("simulateWorkflow returns success and a non-empty log", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const result = await client.simulateWorkflow();
    expect(result.success).toBe(true);
    expect(result.log.length).toBeGreaterThan(0);
  });

  it("publishWorkflow returns success and a version string", async () => {
    const client = new MockAutonomousDevelopmentApiClient();
    const result = await client.publishWorkflow();
    expect(result.success).toBe(true);
    expect(result.version).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});
