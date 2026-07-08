import { INITIAL_EVENTS, INITIAL_TASKS } from "../data/mockBoard";
import { WORKFLOW_EDGES, WORKFLOW_NODES } from "../data/mockWorkflow";
import type { AutonomousDevelopmentApiClient } from "./client";
import type {
  ActivityEventDto,
  CreateActivityEventRequestDto,
  CreateTaskRequestDto,
  MoveTaskRequestDto,
  PublishWorkflowResultDto,
  TaskDto,
  UpdateTaskRequestDto,
  UpdateWorkflowNodeRequestDto,
  WorkflowEdgeDto,
  WorkflowNodeDto,
  WorkflowSimulationResultDto,
  WorkflowValidationResultDto,
} from "./dto";
import { ApiError } from "./errors";
import {
  activityEventDomainToDto,
  taskDomainToDto,
  workflowEdgeDomainToDto,
  workflowNodeDomainToDto,
} from "./mappers";

const delay = () =>
  new Promise((resolve) => globalThis.setTimeout(resolve, 50 + Math.floor(Math.random() * 101)));
const clone = <T>(value: T): T => structuredClone(value);

export class MockAutonomousDevelopmentApiClient implements AutonomousDevelopmentApiClient {
  private tasks: TaskDto[] = INITIAL_TASKS.map(taskDomainToDto);
  private events: ActivityEventDto[] = INITIAL_EVENTS.map(activityEventDomainToDto);
  private nodes: WorkflowNodeDto[] = WORKFLOW_NODES.map(workflowNodeDomainToDto);
  private edges: WorkflowEdgeDto[] = WORKFLOW_EDGES.map(workflowEdgeDomainToDto);

  async listTasks(): Promise<TaskDto[]> {
    await delay();
    return clone(this.tasks);
  }

  async createTask(input: CreateTaskRequestDto): Promise<TaskDto> {
    await delay();
    const task: TaskDto = {
      id: input.id ?? `task-${Date.now()}`,
      title: input.title,
      status: input.status,
      description: input.description ?? "",
      priority: input.priority ?? "medium",
      labels: input.labels ?? [],
      dependencies: input.dependencies,
      blockedBy: input.blockedBy,
      agent: input.agent,
      branch: input.branch,
      progress: input.progress,
      reviewIteration: input.reviewIteration,
      dueDate: input.dueDate,
      comments: input.comments,
      assigneeAvatar: input.assigneeAvatar,
      elapsed: input.elapsed,
    };
    this.tasks.push(task);
    return clone(task);
  }

  async updateTask(input: UpdateTaskRequestDto): Promise<TaskDto> {
    await delay();
    const index = this.tasks.findIndex((task) => task.id === input.id);
    if (index === -1) {
      throw new ApiError("TASK_NOT_FOUND", `Task with ID ${input.id} not found`);
    }
    const updatedTask = { ...this.tasks[index], ...input };
    this.tasks[index] = updatedTask;
    return clone(updatedTask);
  }

  async moveTask(input: MoveTaskRequestDto): Promise<TaskDto> {
    await delay();
    const index = this.tasks.findIndex((task) => task.id === input.id);
    if (index === -1) {
      throw new ApiError("TASK_NOT_FOUND", `Task with ID ${input.id} not found`);
    }
    const updatedTask = { ...this.tasks[index], status: input.status };
    this.tasks[index] = updatedTask;
    return clone(updatedTask);
  }

  async listActivityEvents(): Promise<ActivityEventDto[]> {
    await delay();
    return clone(this.events);
  }

  async createActivityEvent(input: CreateActivityEventRequestDto): Promise<ActivityEventDto> {
    await delay();
    const event = { id: input.id ?? `evt-${Date.now()}`, ...input };
    this.events.unshift(event);
    return clone(event);
  }

  async listWorkflowNodes(): Promise<WorkflowNodeDto[]> {
    await delay();
    return clone(this.nodes);
  }

  async listWorkflowEdges(): Promise<WorkflowEdgeDto[]> {
    await delay();
    return clone(this.edges);
  }

  async updateWorkflowNode(input: UpdateWorkflowNodeRequestDto): Promise<WorkflowNodeDto> {
    await delay();
    const index = this.nodes.findIndex((node) => node.id === input.id);
    if (index === -1) {
      throw new ApiError("WORKFLOW_NODE_NOT_FOUND", `Node with ID ${input.id} not found`);
    }
    const updatedNode = {
      ...this.nodes[index],
      ...input,
      config: input.config
        ? { ...this.nodes[index].config, ...input.config }
        : this.nodes[index].config,
    };
    this.nodes[index] = updatedNode;
    return clone(updatedNode);
  }

  async validateWorkflow(): Promise<WorkflowValidationResultDto> {
    await delay();
    const errors: string[] = [];
    if (!this.nodes.some((node) => node.type === "start"))
      errors.push("Missing a Start node in the workflow.");
    if (!this.nodes.some((node) => node.type === "end"))
      errors.push("Missing an End node in the workflow.");
    return { success: errors.length === 0, errors };
  }

  async simulateWorkflow(): Promise<WorkflowSimulationResultDto> {
    await delay();
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

  async publishWorkflow(): Promise<PublishWorkflowResultDto> {
    await delay();
    return { success: true, version: `v1.${Math.floor(Math.random() * 10) + 1}.0` };
  }
}
