import { describe, expect, it } from "vitest";
import {
  getWorkflowEdges,
  getWorkflowNodes,
  updateWorkflowNode,
  validateWorkflow,
} from "./workflowService";

describe("workflowService", () => {
  it("maps workflow DTOs to domain nodes and edges", async () => {
    const [nodes, edges] = await Promise.all([getWorkflowNodes(), getWorkflowEdges()]);
    expect(nodes.some((node) => node.id === "review-node")).toBe(true);
    expect(edges.some((edge) => edge.source === "start-node")).toBe(true);
  });

  it("updates workflow nodes through the API boundary", async () => {
    const node = await updateWorkflowNode("review-node", { position: { x: 321, y: 654 } });
    expect(node.position).toEqual({ x: 321, y: 654 });
  });

  it("returns validation success from the API boundary", async () => {
    await expect(validateWorkflow()).resolves.toEqual({ success: true, errors: [] });
  });
});
