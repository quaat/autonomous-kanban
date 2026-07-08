import { WorkflowNode, WorkflowEdge, WorkflowNodeConfig } from "../types/workflow";
import { WORKFLOW_NODES, WORKFLOW_EDGES } from "../data/mockWorkflow";

let mockNodes = [...WORKFLOW_NODES];
let mockEdges = [...WORKFLOW_EDGES];

export async function getWorkflowNodes(): Promise<WorkflowNode[]> {
  return [...mockNodes];
}

export async function getWorkflowEdges(): Promise<WorkflowEdge[]> {
  return [...mockEdges];
}

export async function updateWorkflowNode(id: string, updates: Partial<WorkflowNode>): Promise<WorkflowNode> {
  const nodeIndex = mockNodes.findIndex((n) => n.id === id);
  if (nodeIndex === -1) {
    throw new Error(`Node with ID ${id} not found`);
  }
  const updatedNode = { ...mockNodes[nodeIndex], ...updates };
  mockNodes = mockNodes.map((n) => (n.id === id ? updatedNode : n));
  return updatedNode;
}

export async function updateWorkflowNodeConfig(id: string, config: WorkflowNodeConfig): Promise<WorkflowNode> {
  const nodeIndex = mockNodes.findIndex((n) => n.id === id);
  if (nodeIndex === -1) {
    throw new Error(`Node with ID ${id} not found`);
  }
  const updatedNode = {
    ...mockNodes[nodeIndex],
    config: {
      ...mockNodes[nodeIndex].config,
      ...config,
    },
  };
  mockNodes = mockNodes.map((n) => (n.id === id ? updatedNode : n));
  return updatedNode;
}

export async function addWorkflowNode(node: WorkflowNode): Promise<WorkflowNode> {
  mockNodes.push(node);
  return node;
}

export async function addWorkflowEdge(edge: WorkflowEdge): Promise<WorkflowEdge> {
  mockEdges.push(edge);
  return edge;
}

export async function deleteWorkflowNode(id: string): Promise<void> {
  mockNodes = mockNodes.filter((n) => n.id !== id);
  mockEdges = mockEdges.filter((e) => e.source !== id && e.target !== id);
}

export async function validateWorkflow(): Promise<{ success: boolean; errors: string[] }> {
  // Simple check
  const errors: string[] = [];
  const startNode = mockNodes.find((n) => n.type === "start");
  const endNode = mockNodes.find((n) => n.type === "end");

  if (!startNode) {
    errors.push("Missing a Start node in the workflow.");
  }
  if (!endNode) {
    errors.push("Missing an End node in the workflow.");
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

export async function simulateWorkflow(): Promise<{ success: boolean; log: string[] }> {
  return {
    success: true,
    log: [
      "Starting simulation...",
      "Activated [Start] node.",
      "Successfully ran [Analyze Idea] with Gemini 1.5 Pro.",
      "Evaluated decision gate [Need clarification?]: False.",
      "Triggered [Create Implementation Plan] and generated DAG.",
      "Simulation completed successfully with no blocks.",
    ],
  };
}

export async function publishWorkflow(): Promise<{ success: boolean; version: string }> {
  return {
    success: true,
    version: `v1.${Math.floor(Math.random() * 10) + 1}.0`,
  };
}
