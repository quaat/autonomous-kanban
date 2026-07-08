import { TaskCard, ActivityLog, TaskStatus } from "../types/board";
import { INITIAL_TASKS, INITIAL_EVENTS } from "../data/mockBoard";

let mockTasks = [...INITIAL_TASKS];
const mockEvents = [...INITIAL_EVENTS];

export async function getTasks(): Promise<TaskCard[]> {
  // Simulate network delay optionally or resolve immediately
  return [...mockTasks];
}

export async function getEvents(): Promise<ActivityLog[]> {
  return [...mockEvents];
}

export async function createTask(task: Partial<TaskCard> & { title: string; status: TaskStatus }): Promise<TaskCard> {
  const newTask: TaskCard = {
    id: `task-${Date.now()}`,
    description: "",
    priority: "medium",
    labels: [],
    ...task,
  };
  mockTasks.push(newTask);
  return newTask;
}

export async function updateTask(updatedTask: TaskCard): Promise<TaskCard> {
  mockTasks = mockTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
  return updatedTask;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskCard> {
  const task = mockTasks.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Task with ID ${id} not found`);
  }
  const updatedTask = { ...task, status };
  mockTasks = mockTasks.map((t) => (t.id === id ? updatedTask : t));
  return updatedTask;
}

export async function deleteTask(id: string): Promise<void> {
  mockTasks = mockTasks.filter((t) => t.id !== id);
}

export async function createEvent(event: Omit<ActivityLog, "id">): Promise<ActivityLog> {
  const newEvent: ActivityLog = {
    id: `evt-${Date.now()}`,
    ...event,
  };
  mockEvents.unshift(newEvent);
  return newEvent;
}
