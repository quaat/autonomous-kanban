import { describe, expect, it } from "vitest";
import { createTask, getEvents, getTasks, updateTaskStatus } from "./boardService";

describe("boardService", () => {
  it("maps task DTOs to board domain cards", async () => {
    const tasks = await getTasks();
    expect(tasks[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      labels: expect.any(Array),
    });
  });

  it("maps activity event DTOs to activity log domain events", async () => {
    const events = await getEvents();
    expect(events[0]).toMatchObject({
      id: expect.any(String),
      message: expect.any(String),
      type: expect.any(String),
    });
  });

  it("creates and moves tasks through the API boundary", async () => {
    const created = await createTask({
      title: "Service contract task",
      status: "to_do",
      priority: "high",
      labels: ["API"],
    });
    expect(created.status).toBe("to_do");
    const moved = await updateTaskStatus(created.id, "in_progress");
    expect(moved.status).toBe("in_progress");
  });
});
