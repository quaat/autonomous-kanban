import { getApiClient } from "../api/client";
import { workflowEdgeDtoToDomain, workflowNodeDtoToDomain } from "../api/mappers";
import { WorkflowNode, WorkflowEdge, WorkflowNodeConfig } from "../types/workflow";

export async function getWorkflowNodes(): Promise<WorkflowNode[]> {
  const nodes = await getApiClient().listWorkflowNodes();
  return nodes.map(workflowNodeDtoToDomain);
}

export async function getWorkflowEdges(): Promise<WorkflowEdge[]> {
  const edges = await getApiClient().listWorkflowEdges();
  return edges.map(workflowEdgeDtoToDomain);
}

export async function updateWorkflowNode(
  id: string,
  updates: Partial<WorkflowNode>
): Promise<WorkflowNode> {
  const node = await getApiClient().updateWorkflowNode({
    ...updates,
    id,
    config: updates.config as Record<string, unknown> | undefined,
  });
  return workflowNodeDtoToDomain(node);
}

export async function updateWorkflowNodeConfig(
  id: string,
  config: WorkflowNodeConfig
): Promise<WorkflowNode> {
  const node = await getApiClient().updateWorkflowNode({
    id,
    config: config as Record<string, unknown>,
  });
  return workflowNodeDtoToDomain(node);
}

export async function validateWorkflow(): Promise<{ success: boolean; errors: string[] }> {
  return getApiClient().validateWorkflow();
}

export async function simulateWorkflow(): Promise<{ success: boolean; log: string[] }> {
  return getApiClient().simulateWorkflow();
}

export async function publishWorkflow(): Promise<{ success: boolean; version: string }> {
  return getApiClient().publishWorkflow();
}
