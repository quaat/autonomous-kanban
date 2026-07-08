import React, { useState } from "react";
import { 
  X, 
  Cpu, 
  GitBranch, 
  Clock, 
  Layers, 
  Pause, 
  Sparkles, 
  FileText,
  CheckSquare
} from "lucide-react";
import { TaskCard, TaskStatus } from "../../types/board";

interface TaskDetailDrawerProps {
  task: TaskCard | null;
  onClose: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddComment: (taskId: string, commentText: string) => void;
  onStatusTransition?: (taskId: string, direction: 'forward' | 'backward') => void;
}

export default function TaskDetailDrawer({ 
  task, 
  onClose, 
  onAddComment
}: TaskDetailDrawerProps) {
  // Local state for acceptance criteria checklist items, initialized unconditionally
  const [criteria, setCriteria] = useState(() => {
    if (task?.id === "task-8") {
      return [
        { id: 1, text: "Worker can atomically claim a task", checked: true },
        { id: 2, text: "Lease expires and task becomes available", checked: true },
        { id: 3, text: "Lease auto-renews while heartbeat active", checked: true },
        { id: 4, text: "Stale workers are detected and released", checked: false },
        { id: 5, text: "Comprehensive tests and docs", checked: false }
      ];
    } else {
      return [
        { id: 1, text: "Core feature fully implemented", checked: task?.status === "done" },
        { id: 2, text: "Unit and integration tests pass successfully", checked: task?.status === "done" || task?.status === "in_review" },
        { id: 3, text: "No critical lint, safety, or type checker issues", checked: task?.status === "done" || task?.status === "in_review" },
        { id: 4, text: "Documentation updated and reviewed", checked: task?.status === "done" },
      ];
    }
  });

  const [commentText, setCommentText] = useState("");
  const [commentList, setCommentList] = useState(() => [
    { id: "c1", text: "Checked out local branch and verified schema lock queries.", time: "1h ago", author: "Claude Agent" },
    { id: "c2", text: "Added telemetry to monitor heartbeats closely.", time: "45m ago", author: "Claude Agent" }
  ]);

  if (!task) return null;

  const toggleCriterion = (id: number) => {
    setCriteria(criteria.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      time: "Just now",
      author: "Administrator"
    };

    setCommentList([newComment, ...commentList]);
    onAddComment(task.id, commentText);
    setCommentText("");
  };

  const checkedCount = criteria.filter(c => c.checked).length;
  const progressPercent = Math.round((checkedCount / criteria.length) * 100);

  // Map backend friendly state keys to friendly labels
  const STATUS_LABELS: Record<TaskStatus, string> = {
    idea: "Idea",
    ready_for_implementation: "Ready for Implementation",
    to_do: "To Do",
    in_progress: "In Progress",
    feedback_required: "Feedback Required",
    in_review: "In Review",
    done: "Done"
  };

  const getStatusBadgeStyle = (status: TaskStatus) => {
    switch (status) {
      case "idea": return "bg-blue-50 text-blue-700 border-blue-200";
      case "ready_for_implementation": return "bg-sky-50 text-sky-700 border-sky-200";
      case "to_do": return "bg-slate-50 text-slate-700 border-slate-200";
      case "in_progress": return "bg-amber-50 text-amber-700 border-amber-200";
      case "feedback_required": return "bg-purple-50 text-purple-700 border-purple-200";
      case "in_review": return "bg-pink-50 text-pink-700 border-pink-200";
      case "done": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="w-96 border-l border-slate-200 bg-white shadow-xl flex flex-col h-full shrink-0 z-10 animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(task.status)}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className="text-[10px] font-mono text-slate-400">ID: {task.id}</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Close details panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Title & Desc */}
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">{task.title}</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{task.description}</p>
        </div>

        {/* Acceptance Criteria Checklist */}
        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              Acceptance Criteria
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">
              {checkedCount} / {criteria.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="space-y-2.5">
            {criteria.map((item) => (
              <label 
                key={item.id} 
                className="flex items-start gap-2.5 cursor-pointer group"
              >
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => toggleCriterion(item.id)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className={`text-xs leading-relaxed transition-all ${
                  item.checked ? "line-through text-slate-400 font-normal" : "text-slate-600 font-medium group-hover:text-slate-900"
                }`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Vertical Dependency Chain Chain */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dependencies Chain</h3>
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-3.5 relative">
            <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-slate-100"></div>

            {/* Step 1 */}
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-mono text-[10px] font-bold shadow-2xs">
                ✓
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-semibold text-slate-700 leading-tight">Create PostgreSQL task schema</p>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Prerequisite</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-mono text-[10px] font-bold shadow-2xs">
                ✓
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-semibold text-slate-700 leading-tight">Design task dependency graph</p>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Prerequisite</span>
              </div>
            </div>

            {/* Step 3 (Current Task) */}
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-300 text-blue-600 flex items-center justify-center font-mono text-[10px] font-bold animate-pulse shadow-xs">
                ▶
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-bold text-blue-900 leading-tight">{task.title}</p>
                <span className="text-[9px] text-blue-500 font-semibold uppercase tracking-wider">Active claim node</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3.5 relative z-10 opacity-50">
              <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center font-mono text-[10px] font-bold">
                ○
              </div>
              <div className="flex-1 text-left">
                <p className="text-[11px] font-semibold text-slate-600 leading-tight">Kanban board drag-and-drop</p>
                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Downstream task</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Worker Metadata Section */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-700">Worker Diagnostics</span>
          </div>
          <div className="p-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Assigned Agent</span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {task.agent || "Unassigned"}
              </span>
            </div>

            {task.branch && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Branch</span>
                <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-600 flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  {task.branch}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Review Iteration</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {task.reviewIteration ? `${task.reviewIteration.current} of ${task.reviewIteration.max}` : "0 of 3"}
              </span>
            </div>

            {task.elapsed && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Elapsed Duration</span>
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {task.elapsed}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Comments & Activity Stream */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Task Thread Logs</h3>
          
          <form onSubmit={handlePostComment} className="mb-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask worker or append instruction..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 shadow-2xs cursor-pointer transition-colors"
              >
                Post
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {commentList.map((comment) => (
              <div key={comment.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold ${comment.author === 'Administrator' ? 'text-blue-600' : 'text-amber-700'}`}>
                    {comment.author}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">{comment.time}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-left">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
        <button className="flex-1 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer">
          <FileText className="w-3.5 h-3.5" />
          <span>Open Logs</span>
        </button>
        <button className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Request Review</span>
        </button>
        <button 
          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 shadow-xs cursor-pointer"
          aria-label="Pause execution"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
