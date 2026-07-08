export type TaskStatus =
  | "idea"
  | "ready_for_implementation"
  | "to_do"
  | "in_progress"
  | "feedback_required"
  | "in_review"
  | "done";

export interface TaskCard {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  labels: string[];
  dependencies?: string[];
  blockedBy?: string[];
  agent?: "Claude" | "Codex" | "GPT-4.1" | "Gemini 1.5 Pro";
  branch?: string;
  progress?: number;
  reviewIteration?: {
    current: number;
    max: number;
  };
  dueDate?: string;
  comments?: number;
  assigneeAvatar?: string;
  elapsed?: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  type: "info" | "success" | "warning" | "error" | "agent";
  message: string;
  detail?: string;
  agent?: string;
}

export type ActivityFilter = "all" | "info" | "success" | "warning" | "error" | "agent";
