export type WorkflowNodeType =
  | "start"
  | "end"
  | "llm_task"
  | "human_task"
  | "service_task"
  | "kanban_state"
  | "decision"
  | "review_task"
  | "blocked";

export interface ReviewTaskConfig {
  nodeName?: string;
  type?: string;
  reviewer: "GPT-4.1" | "Claude" | "Codex" | "Gemini" | "Gemini 1.5 Pro";
  maxIterations: number;
  onPass?: string;
  onFail?: string;
  severityThreshold: "Low" | "Medium" | "High";
  requireTests: boolean;
  estimatedDuration: string;
  timeout: string;
}

export type WorkflowNodeConfig = ReviewTaskConfig | Record<string, unknown>;

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  subtitle?: string;
  position: { x: number; y: number };
  config?: WorkflowNodeConfig;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  variant?: "default" | "success" | "warning" | "error" | "dashed";
}
