import React from "react";
import { 
  Plus, 
  Lightbulb, 
  CheckSquare, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Play,
  HelpCircle
} from "lucide-react";
import { TaskStatus } from "../../types/board";
import { useBoardState } from "../../hooks/useBoardState";
import TaskCard from "./TaskCard";
import TaskDetailDrawer from "./TaskDetailDrawer";
import ActivityPanel from "./ActivityPanel";

interface BoardPageProps {
  searchQuery: string;
}

export default function BoardPage({ searchQuery }: BoardPageProps) {
  const {
    tasks,
    events,
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
    handleSelectOption,
    handleAddCard,
    handleAddCommentFromDrawer,
  } = useBoardState(searchQuery);

  // Kanban Columns Definition
  const COLUMNS: Array<{ id: TaskStatus; label: string; icon: React.ReactNode; color: string }> = [
    { 
      id: "idea", 
      label: "Idea", 
      icon: <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />, 
      color: "border-t-amber-400" 
    },
    { 
      id: "ready_for_implementation", 
      label: "Ready for Implementation", 
      icon: <Play className="w-4 h-4 text-sky-500" />, 
      color: "border-t-sky-400" 
    },
    { 
      id: "to_do", 
      label: "To Do", 
      icon: <CheckSquare className="w-4 h-4 text-indigo-500" />, 
      color: "border-t-indigo-400" 
    },
    { 
      id: "in_progress", 
      label: "In Progress", 
      icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: "12s" }} />, 
      color: "border-t-blue-500" 
    },
    { 
      id: "feedback_required", 
      label: "Feedback Required", 
      icon: <HelpCircle className="w-4 h-4 text-purple-500" />, 
      color: "border-t-purple-500" 
    },
    { 
      id: "in_review", 
      label: "In Review", 
      icon: <Eye className="w-4 h-4 text-pink-500" />, 
      color: "border-t-pink-500" 
    },
    { 
      id: "done", 
      label: "Done", 
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, 
      color: "border-t-emerald-500" 
    }
  ];

  const countInProgress = tasks.filter(t => t.status === "in_progress").length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F3F4F6]">
      {/* Columns & Details wrapper */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board Container */}
        <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start select-none min-w-0">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            const isDraggedOver = draggedOverColumn === col.id;

            return (
              <div 
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-64 flex flex-col max-h-full transition-all duration-150 relative shrink-0 rounded-lg p-1 ${
                  isDraggedOver 
                    ? "bg-slate-200/50 ring-2 ring-blue-500/20" 
                    : ""
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 mb-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {col.icon}
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest text-left">
                      {col.label}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {col.id === "in_progress" && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        countInProgress > 3 
                          ? "bg-red-50 text-red-700 border-red-200" 
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        WIP {countInProgress} / 3
                      </span>
                    )}

                    <button 
                      onClick={() => setActiveAddColumn(activeAddColumn === col.id ? null : col.id)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      aria-label={`Add task to ${col.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Tasks Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[300px]">
                  {/* Task adding overlay widget */}
                  {activeAddColumn === col.id && (
                    <div className="p-3 border border-slate-200 rounded-lg bg-white shadow-xs space-y-2 animate-in fade-in duration-150">
                      <input 
                        type="text" 
                        placeholder="Task title..." 
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:bg-white"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddCard(col.id);
                        }}
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => setActiveAddColumn(null)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-500 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleAddCard(col.id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}

                  {columnTasks.map((task) => (
                    <div 
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="active:cursor-grabbing transition-transform"
                    >
                      <TaskCard 
                        card={task} 
                        isSelected={selectedTaskId === task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        onSelectOption={handleSelectOption}
                      />
                    </div>
                  ))}

                  {columnTasks.length === 0 && !activeAddColumn && (
                    <div className="h-28 border border-dashed border-slate-200 rounded-lg bg-white/45 flex flex-col items-center justify-center text-slate-400 p-4">
                      <span className="text-[10px] font-medium leading-normal">Drag tasks here</span>
                    </div>
                  )}
                </div>

                {/* Quick Add card bottom link */}
                <button 
                  onClick={() => setActiveAddColumn(activeAddColumn === col.id ? null : col.id)}
                  className="mt-2.5 p-2 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-xs rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-1 text-xs font-bold cursor-pointer text-center shrink-0"
                  aria-label={`Add task to ${col.label} column`}
                >
                  <Plus className="w-4 h-4 text-slate-400" />
                  <span>Add task</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Sliding Right-side Drawer */}
        {selectedTask && (
          <TaskDetailDrawer 
            key={selectedTask.id}
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onUpdateStatus={async () => {
              // Read-only or handles updates internally in later stages
            }}
            onAddComment={handleAddCommentFromDrawer}
          />
        )}
      </div>

      {/* Bottom Activity Logs Section */}
      <ActivityPanel logs={events} onClearLogs={() => {}} />
    </div>
  );
}
