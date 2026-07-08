import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resetApiClientForTesting, setApiClientForTesting } from "../api/client";
import { MockAutonomousDevelopmentApiClient } from "../api/mockApiClient";
import {
  getWorkflowEdges,
  getWorkflowNodes,
  publishWorkflow,
  simulateWorkflow,
  updateWorkflowNode,
  validateWorkflow,
} from "./workflowService";

describe("workflowService", () => {
  beforeEach(() => {
    setApiClientForTesting(new MockAutonomousDevelopmentApiClient());
  });

  afterEach(() => {
    resetApiClientForTesting();
  });

  it("maps workflow DTOs to domain nodes and edges", async () => {
    const [nodes, edges] = await Promise.all([getWorkflowNodes(), getWorkflowEdges()]);
    expect(nodes.some((node) => node.id === "review-node")).toBe(true);
    expect(edges.some((edge) => edge.source === "start-node")).toBe(true);
  });

  it("updates workflow nodes through the API boundary", async () => {
    const node = await updateWorkflowNode("review-node", { position: { x: 321, y: 654 } });
    expect(node.position).toEqual({ x: 321, y: 654 });
  });

  it("updateWorkflowNode preserves existing config while merging updates", async () => {
    const node = await updateWorkflowNode("review-node", {
      config: { reviewer: "Claude" },
    });

    expect(node.config).toMatchObject({
      reviewer: "Claude",
      maxIterations: 3,
      requireTests: true,
    });
  });

  it("returns validation success from the API boundary", async () => {
    await expect(validateWorkflow()).resolves.toEqual({ success: true, errors: [] });
  });

  it("simulateWorkflow returns the expected mock result", async () => {
    const result = await simulateWorkflow();
    expect(result.success).toBe(true);
    expect(result.log).toContain("Starting simulation...");
  });

  it("publishWorkflow returns the expected mock result", async () => {
    const result = await publishWorkflow();
    expect(result.success).toBe(true);
    expect(result.version).toMatch(/^v\d+\.\d+\.\d+$/);
  });
});
