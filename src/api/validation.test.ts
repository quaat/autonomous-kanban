import { describe, expect, it } from "vitest";
import {
  isActivityEventDto,
  isTaskDto,
  isWorkflowEdgeDto,
  isWorkflowNodeDto,
} from "./validation";

const validTask = {
  id: "task-1",
  title: "Valid task",
  status: "idea",
  priority: "medium",
  labels: ["fixture"],
};

const validActivityEvent = {
  id: "evt-1",
  time: "now",
  type: "info",
  message: "Valid event",
};

const validWorkflowNode = {
  id: "node-1",
  type: "start",
  label: "Start",
  position: { x: 0, y: 0 },
};

const validWorkflowEdge = {
  id: "edge-1",
  source: "node-1",
  target: "node-2",
};

describe("API DTO runtime validation", () => {
  it("rejects a task with an invalid status union value", () => {
    expect(isTaskDto({ ...validTask, status: "bogus" })).toBe(false);
  });

  it("rejects a task with an invalid priority union value", () => {
    expect(isTaskDto({ ...validTask, priority: "urgent" })).toBe(false);
  });

  it("rejects a task with an invalid optional agent union value", () => {
    expect(isTaskDto({ ...validTask, agent: "Unknown" })).toBe(false);
  });

  it("rejects a task with invalid optional review iteration shape", () => {
    expect(isTaskDto({ ...validTask, reviewIteration: { current: 1, max: "3" } })).toBe(false);
  });

  it("rejects an activity event with an invalid type union value", () => {
    expect(isActivityEventDto({ ...validActivityEvent, type: "bogus" })).toBe(false);
  });

  it("rejects a workflow node with an invalid type union value", () => {
    expect(isWorkflowNodeDto({ ...validWorkflowNode, type: "bogus" })).toBe(false);
  });

  it("rejects a workflow node with invalid optional config", () => {
    expect(isWorkflowNodeDto({ ...validWorkflowNode, config: [] })).toBe(false);
  });

  it("rejects a workflow edge with an invalid variant union value", () => {
    expect(isWorkflowEdgeDto({ ...validWorkflowEdge, variant: "bogus" })).toBe(false);
  });
});
