import { WorkflowNode, WorkflowEdge } from "../types/workflow";

export const WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: "start-node",
    type: "start",
    label: "Start",
    subtitle: "Idea Submitted",
    position: { x: 50, y: 100 },
  },
  {
    id: "analyze-node",
    type: "llm_task",
    label: "Analyze Idea",
    subtitle: "LLM task",
    position: { x: 200, y: 85 },
    config: {
      reviewer: "Gemini 1.5 Pro",
      estimatedDuration: "1 min",
      maxIterations: 1,
      severityThreshold: "Low",
      requireTests: false,
      timeout: "5 m",
    },
  },
  {
    id: "clarify-node",
    type: "decision",
    label: "Need clarification?",
    position: { x: 380, y: 75 },
  },
  {
    id: "feedback-node-1",
    type: "human_task",
    label: "Feedback Required",
    subtitle: "Human input",
    position: { x: 520, y: 85 },
  },
  {
    id: "plan-node",
    type: "llm_task",
    label: "Create Implementation Plan",
    subtitle: "LLM planner",
    position: { x: 720, y: 85 },
  },
  {
    id: "graph-node",
    type: "llm_task",
    label: "Generate Task Graph",
    subtitle: "LLM task",
    position: { x: 920, y: 85 },
  },
  {
    id: "ready-node",
    type: "kanban_state",
    label: "Ready for Implementation",
    subtitle: "Kanban state",
    position: { x: 50, y: 300 },
  },
  {
    id: "todo-node",
    type: "kanban_state",
    label: "To Do",
    subtitle: "Kanban state",
    position: { x: 230, y: 300 },
  },
  {
    id: "claim-node",
    type: "service_task",
    label: "Worker Claim Task",
    subtitle: "System task",
    position: { x: 400, y: 300 },
  },
  {
    id: "progress-node",
    type: "kanban_state",
    label: "In Progress",
    subtitle: "Kanban state",
    position: { x: 570, y: 300 },
  },
  {
    id: "needs-feedback-node",
    type: "decision",
    label: "Needs human feedback?",
    position: { x: 740, y: 290 },
  },
  {
    id: "feedback-node-2",
    type: "human_task",
    label: "Feedback Required",
    subtitle: "Human input",
    position: { x: 920, y: 300 },
  },
  {
    id: "verification-node",
    type: "service_task",
    label: "Verification",
    subtitle: "Automated checks",
    position: { x: 230, y: 500 },
  },
  {
    id: "review-node",
    type: "review_task",
    label: "In Review",
    subtitle: "LLM review",
    position: { x: 420, y: 500 },
    config: {
      nodeName: "In Review",
      type: "Review Task",
      reviewer: "GPT-4.1",
      maxIterations: 3,
      onPass: "Move to Done",
      onFail: "Append instructions and move to To Do",
      severityThreshold: "High",
      requireTests: true,
      estimatedDuration: "15 min",
      timeout: "2 h",
    },
  },
  {
    id: "passed-node",
    type: "decision",
    label: "Review passed?",
    position: { x: 600, y: 490 },
  },
  {
    id: "done-node",
    type: "end",
    label: "Done",
    subtitle: "Completed",
    position: { x: 780, y: 500 },
  },
  {
    id: "retry-node",
    type: "kanban_state",
    label: "Add review findings / retry",
    subtitle: "Return to To Do",
    position: { x: 570, y: 650 },
  },
  {
    id: "blocked-node",
    type: "blocked",
    label: "Blocked / Escalate",
    subtitle: "Manual intervention",
    position: { x: 780, y: 650 },
  },
];

export const WORKFLOW_EDGES: WorkflowEdge[] = [
  // Row 1 transitions
  { id: "e1", source: "start-node", target: "analyze-node" },
  { id: "e2", source: "analyze-node", target: "clarify-node" },
  { id: "e3", source: "clarify-node", target: "feedback-node-1", label: "Yes", variant: "warning" },
  { id: "e4", source: "clarify-node", target: "plan-node", label: "No", variant: "success" },
  { id: "e5", source: "plan-node", target: "graph-node" },

  // Connect row 1 to row 2
  {
    id: "e6",
    source: "graph-node",
    target: "ready-node",
    label: "Task graph generated",
    variant: "dashed",
  },
  { id: "e6-alt", source: "feedback-node-1", target: "plan-node", label: "Resolved", variant: "dashed" },

  // Row 2 transitions
  { id: "e7", source: "ready-node", target: "todo-node" },
  { id: "e8", source: "todo-node", target: "claim-node" },
  { id: "e9", source: "claim-node", target: "progress-node" },
  { id: "e10", source: "progress-node", target: "needs-feedback-node" },
  { id: "e11", source: "needs-feedback-node", target: "feedback-node-2", label: "Yes", variant: "warning" },
  { id: "e12", source: "needs-feedback-node", target: "verification-node", label: "No", variant: "success" },

  // Row 2 feedback loop
  { id: "e13", source: "feedback-node-2", target: "progress-node", label: "Resume", variant: "dashed" },

  // Row 3 transitions (Verification and Review)
  { id: "e14", source: "verification-node", target: "review-node" },
  { id: "e15", source: "review-node", target: "passed-node" },
  { id: "e16", source: "passed-node", target: "done-node", label: "Yes", variant: "success" },
  { id: "e17", source: "passed-node", target: "retry-node", label: "No", variant: "error" },

  // Review retry and escalate
  { id: "e18", source: "retry-node", target: "todo-node", label: "Iterate", variant: "dashed" },
  { id: "e19", source: "retry-node", target: "blocked-node", label: "Max iterations reached", variant: "error" },
];
