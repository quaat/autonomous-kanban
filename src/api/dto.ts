export type TaskStatusDto =
  | "idea"
  | "ready_for_implementation"
  | "to_do"
  | "in_progress"
  | "feedback_required"
  | "in_review"
  | "done";

export type TaskPriorityDto = "low" | "medium" | "high";
export type AgentDto = "Claude" | "Codex" | "GPT-4.1" | "Gemini 1.5 Pro";

export type BoardColumnDto = {
  id: TaskStatusDto;
  label: string;
  taskIds: string[];
};

export type TaskDependencyDto = {
  taskId: string;
  dependsOnTaskId: string;
  type?: "blocks" | "relates_to";
};

export type TaskDto = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatusDto;
  priority: TaskPriorityDto;
  labels: string[];
  dependencies?: string[];
  blockedBy?: string[];
  agent?: AgentDto;
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
};

export type ActivityEventDto = {
  id: string;
  time: string;
  type: "info" | "success" | "warning" | "error" | "agent";
  message: string;
  detail?: string;
  agent?: string;
};

export type WorkflowNodeTypeDto =
  | "start"
  | "end"
  | "llm_task"
  | "human_task"
  | "service_task"
  | "kanban_state"
  | "decision"
  | "review_task"
  | "blocked";

export type WorkflowNodeDto = {
  id: string;
  type: WorkflowNodeTypeDto;
  label: string;
  subtitle?: string;
  position: { x: number; y: number };
  config?: Record<string, unknown>;
};

export type WorkflowEdgeDto = {
  id: string;
  source: string;
  target: string;
  label?: string;
  variant?: "default" | "success" | "warning" | "error" | "dashed";
};

export type WorkflowValidationResultDto = {
  success: boolean;
  errors: string[];
};

export type WorkflowSimulationResultDto = {
  success: boolean;
  log: string[];
};

export type PublishWorkflowResultDto = {
  success: boolean;
  version: string;
};

export type CreateTaskRequestDto = Omit<TaskDto, "id"> & { id?: string };
export type UpdateTaskRequestDto = Partial<Omit<TaskDto, "id">> & { id: string };
export type MoveTaskRequestDto = { id: string; status: TaskStatusDto };
export type CreateActivityEventRequestDto = Omit<ActivityEventDto, "id"> & { id?: string };
export type UpdateWorkflowNodeRequestDto = Partial<Omit<WorkflowNodeDto, "id">> & { id: string };
