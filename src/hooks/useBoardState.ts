import { useState, useEffect, DragEvent } from "react";
import { TaskCard, TaskStatus, ActivityLog } from "../types/board";
import {
  getTasks,
  getEvents,
  createTask,
  updateTask as serviceUpdateTask,
  updateTaskStatus,
  createEvent,
} from "../services/boardService";

export function useBoardState(searchQuery: string) {
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [events, setEvents] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("task-8");
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [activeAddColumn, setActiveAddColumn] = useState<TaskStatus | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedTasks = await getTasks();
        const fetchedEvents = await getEvents();
        setTasks(fetchedTasks);
        setEvents(fetchedEvents);
      } catch (err) {
        console.error("Failed to load board state", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q)) ||
      task.labels.some((l) => l.toLowerCase().includes(q))
    );
  });

  const handleDragStart = (e: DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, columnId: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: DragEvent, targetColumn: TaskStatus) => {
    e.preventDefault();
    setDraggedOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    await handleMoveCard(taskId, targetColumn);
  };

  const handleMoveCard = async (taskId: string, targetColumn: TaskStatus) => {
    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove) return;

    const oldStatus = taskToMove.status;
    if (oldStatus === targetColumn) return;

    try {
      const updated = await updateTaskStatus(taskId, targetColumn);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

      const newLog = await createEvent({
        time: "Just now",
        type: targetColumn === "done" ? "success" : "info",
        message: `Task moved to ${targetColumn.replace(/_/g, " ")}`,
        detail: taskToMove.title,
      });

      setEvents((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error("Failed to move card", err);
    }
  };

  const handleAddCard = async (columnId: TaskStatus) => {
    if (!newCardTitle.trim()) return;

    try {
      const newCard = await createTask({
        title: newCardTitle,
        description: "Custom task created locally during sandbox session.",
        status: columnId,
        priority: "medium",
        labels: [columnId === "idea" ? "idea" : "Manual Task"],
        dueDate: "May 25",
        comments: 0,
      });

      setTasks((prev) => [...prev, newCard]);
      setSelectedTaskId(newCard.id);
      setNewCardTitle("");
      setActiveAddColumn(null);

      const newLog = await createEvent({
        time: "Just now",
        type: "info",
        message: `Task created locally`,
        detail: newCardTitle,
      });

      setEvents((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error("Failed to add card", err);
    }
  };

  const handleSelectOption = async (taskId: string, option: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (option === "Auto-enqueue") {
      await handleMoveCard(taskId, "in_progress");
    } else {
      setSelectedTaskId(taskId);
    }
  };

  const handleAddCommentFromDrawer = async (taskId: string, comment: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const updatedTask = { ...task, comments: (task.comments || 0) + 1 };
      await serviceUpdateTask(updatedTask);

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

      const newLog = await createEvent({
        time: "Just now",
        type: "info",
        message: `Administrator posted thread message`,
        detail: comment.substring(0, 40) + "...",
      });

      setEvents((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  return {
    tasks,
    events,
    loading,
    selectedTaskId,
    setSelectedTaskId,
    selectedTask,
    filteredTasks,
    draggedOverColumn,
    activeAddColumn,
    setActiveAddColumn,
    newCardTitle,
    setNewCardTitle,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleMoveCard,
    handleAddCard,
    handleSelectOption,
    handleAddCommentFromDrawer,
  };
}
