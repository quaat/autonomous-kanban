import React from "react";
import { 
  Clock, 
  MessageSquare, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Calendar,
  HelpCircle,
  Cpu
} from "lucide-react";
import { TaskCard as TaskCardType } from "../../types";

interface TaskCardProps {
  card: TaskCardType;
  isSelected: boolean;
  onClick: () => void;
  onSelectOption?: (taskId: string, option: string) => void;
}

export default function TaskCard({ 
  card, 
  isSelected, 
  onClick,
  onSelectOption
}: TaskCardProps) {
  const getPriorityColor = (priority: TaskCardType["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-emerald-500";
    }
  };

  const getBadgeStyle = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("planned")) return "bg-blue-50 text-blue-700 border-blue-200/50";
    if (l.includes("architecture")) return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
    if (l.includes("backend")) return "bg-teal-50 text-teal-700 border-teal-200/50";
    if (l.includes("frontend") || l.includes("ui/ux")) return "bg-purple-50 text-purple-700 border-purple-200/50";
    if (l.includes("database")) return "bg-rose-50 text-rose-700 border-rose-200/50";
    if (l.includes("websocket") || l.includes("api")) return "bg-sky-50 text-sky-700 border-sky-200/50";
    if (l.includes("idea")) return "bg-slate-50 text-slate-500 border-slate-200/50";
    return "bg-slate-50 text-slate-600 border-slate-200/50";
  };

  const isCompleted = card.status === "done";
  const isInProgress = card.status === "in_progress";
  const isFeedback = card.status === "feedback_required";
  const isInReview = card.status === "in_review";

  return (
    <div 
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`w-full group relative rounded-lg border p-3.5 bg-white shadow-sm hover:shadow transition-all duration-150 text-left cursor-pointer flex flex-col gap-3 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isSelected 
          ? "ring-2 ring-blue-500 border-blue-500 shadow-md" 
          : "hover:border-blue-400"
      }`}
      aria-label={`View task details for: ${card.title}`}
    >
      {/* Top row: Priority & Title & Status icons */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(card.priority)}`}></span>
          <h4 className={`text-[12.5px] font-bold text-slate-800 leading-snug tracking-tight group-hover:text-slate-900 transition-colors truncate ${isCompleted ? 'line-through text-slate-400' : ''}`}>
            {card.title}
          </h4>
        </div>
        {isCompleted && (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        )}
      </div>

      {/* Main card body / specific column templates */}
      {isFeedback ? (
        <div className="flex flex-col gap-2.5 mt-0.5">
          <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-2.5 text-[11.5px] text-amber-900 leading-relaxed font-medium flex gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>{card.description}</p>
              <div className="flex gap-1.5 flex-wrap">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectOption) onSelectOption(card.id, "Auto-enqueue");
                  }}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-amber-200 text-[10px] font-bold text-amber-800 cursor-pointer transition-colors"
                >
                  Choose Option
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectOption) onSelectOption(card.id, "Comment");
                  }}
                  className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : isInProgress ? (
        <div className="flex flex-col gap-2.5">
          <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span>Agent: <strong className="text-slate-700">{card.agent || "Claude"}</strong></span>
              </span>
              <span className="font-mono font-bold text-slate-700">{card.progress}%</span>
            </div>
            
            {/* Progress block */}
            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${card.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[10.5px] font-medium text-slate-400">
            {card.branch && (
              <span className="flex items-center gap-1 font-mono truncate">
                <GitBranch className="w-3 h-3 text-slate-300" />
                <span>{card.branch}</span>
              </span>
            )}
            {card.elapsed && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-300" />
                <span>{card.elapsed} elapsed</span>
              </span>
            )}
          </div>
        </div>
      ) : isInReview ? (
        <div className="flex flex-col gap-2">
          {card.description && (
            <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{card.description}</p>
          )}
          <div className="flex flex-col gap-1 rounded bg-pink-50/45 border border-pink-100 p-2 text-[10.5px] text-pink-900 font-medium space-y-1">
            <div className="flex items-center justify-between">
              <span>Reviewer: <strong>{card.agent || "GPT-4.1"}</strong></span>
              <span className="bg-pink-100/80 text-pink-700 px-1 py-0.5 rounded text-[9px] font-bold">
                Iteration {card.reviewIteration?.current} of {card.reviewIteration?.max}
              </span>
            </div>
            {card.labels.some(l => l.includes("findings")) && (
              <span className="text-pink-600 font-bold flex items-center gap-1 text-[10px]">
                ⚠️ {card.labels.find(l => l.includes("findings"))}
              </span>
            )}
          </div>
        </div>
      ) : (
        card.description && (
          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{card.description}</p>
        )
      )}

      {/* Dependency Badges / Custom Tags */}
      {card.dependencies && card.dependencies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50/50 text-[9.5px] font-semibold text-amber-700">
            <Layers className="w-2.5 h-2.5" />
            <span>{card.dependencies.length} dependency{card.dependencies.length > 1 ? 'ies' : ''}</span>
          </span>
        </div>
      )}

      {/* Bottom Row: Tags & Metadata (Comments, Avatar, Dates) */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-0.5">
        {/* Custom Labels list */}
        <div className="flex flex-wrap gap-1 max-w-[70%]">
          {card.labels.filter(l => !l.includes("Agent:") && !l.includes("Progress:") && !l.includes("Branch:") && !l.includes("findings") && !l.includes("Iteration") && !l.includes("Reviewer:") && !l.includes("Severity:")).map((label, idx) => (
            <span 
              key={idx} 
              className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getBadgeStyle(label)}`}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Calendar, Comments & Avatar */}
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 shrink-0">
          {card.dueDate && (
            <span className="flex items-center gap-0.5" title="Due Date">
              <Calendar className="w-3 h-3 text-slate-300" />
              <span>{card.dueDate}</span>
            </span>
          )}

          {card.comments !== undefined && card.comments > 0 && (
            <span className="flex items-center gap-0.5" title="Comments thread">
              <MessageSquare className="w-3 h-3 text-slate-300" />
              <span>{card.comments}</span>
            </span>
          )}

          {card.assigneeAvatar ? (
            <img 
              src={card.assigneeAvatar} 
              alt="Assignee" 
              className="w-4.5 h-4.5 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div 
              className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-bold border border-blue-200" 
              title={card.agent ? `Agent: ${card.agent}` : "Assigned Developer"}
            >
              {card.agent ? card.agent.substring(0, 2).toUpperCase() : "AD"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
