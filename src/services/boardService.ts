import { getApiClient } from "../api/client";
import { activityEventDtoToDomain, taskDomainToDto, taskDtoToDomain } from "../api/mappers";
import { TaskCard, ActivityLog, TaskStatus } from "../types/board";

export async function getTasks(): Promise<TaskCard[]> {
  const tasks = await getApiClient().listTasks();
  return tasks.map(taskDtoToDomain);
}

export async function getEvents(): Promise<ActivityLog[]> {
  const events = await getApiClient().listActivityEvents();
  return events.map(activityEventDtoToDomain);
}

export async function createTask(
  task: Partial<TaskCard> & { title: string; status: TaskStatus }
): Promise<TaskCard> {
  const newTask = await getApiClient().createTask({
    description: "",
    priority: "medium",
    labels: [],
    ...task,
  });
  return taskDtoToDomain(newTask);
}

export async function updateTask(updatedTask: TaskCard): Promise<TaskCard> {
  const task = await getApiClient().updateTask(taskDomainToDto(updatedTask));
  return taskDtoToDomain(task);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskCard> {
  const task = await getApiClient().moveTask({ id, status });
  return taskDtoToDomain(task);
}

export async function createEvent(event: Omit<ActivityLog, "id">): Promise<ActivityLog> {
  const newEvent = await getApiClient().createActivityEvent(event);
  return activityEventDtoToDomain(newEvent);
}
