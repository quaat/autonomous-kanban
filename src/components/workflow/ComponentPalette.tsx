import React, { useState } from "react";
import { 
  Circle, 
  Sparkles, 
  User, 
  Cpu, 
  Clock, 
  Bell, 
  HelpCircle, 
  GitFork, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  LayoutGrid
} from "lucide-react";

export default function ComponentPalette() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    events: true,
    tasks: true,
    decisions: true,
    kanban: true
  });

  const toggleGroup = (group: keyof typeof expandedGroups) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const paletteItems = {
    events: [
      { id: "start", label: "Start Event", icon: <Circle className="w-4 h-4 text-emerald-500 fill-emerald-500/10" /> },
      { id: "end", label: "End Event", icon: <Circle className="w-4 h-4 text-red-500 fill-red-500/10" /> }
    ],
    tasks: [
      { id: "llm_task", label: "LLM Task", icon: <Sparkles className="w-4 h-4 text-blue-600" /> },
      { id: "human_task", label: "Human Task", icon: <User className="w-4 h-4 text-purple-600" /> },
      { id: "service_task", label: "Service Task", icon: <Cpu className="w-4 h-4 text-teal-600" /> },
      { id: "delay", label: "Delay", icon: <Clock className="w-4 h-4 text-amber-600" /> },
      { id: "notification", label: "Notification", icon: <Bell className="w-4 h-4 text-yellow-600" /> }
    ],
    decisions: [
      { id: "decision", label: "Decision", icon: <HelpCircle className="w-4 h-4 text-orange-600" /> },
      { id: "split", label: "Conditional Split", icon: <GitFork className="w-4 h-4 text-orange-600" /> }
    ],
    kanban: [
      { id: "kanban_state", label: "Kanban State", icon: <FileText className="w-4 h-4 text-sky-600" /> }
    ]
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-slate-200 bg-white flex flex-col items-center py-4 gap-4 z-10 shrink-0">
        <button 
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          title="Expand Palette"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 border-r border-slate-200 bg-white flex flex-col h-full z-10 shrink-0 select-none">
      {/* Header with collapse button */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Components Palette</span>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
        >
          Collapse
        </button>
      </div>

      {/* Component Groups List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Events Group */}
        <div>
          <button 
            onClick={() => toggleGroup("events")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 cursor-pointer text-left"
          >
            <span>Events</span>
            {expandedGroups.events ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {expandedGroups.events && (
            <div className="space-y-1.5 pl-0.5">
              {paletteItems.events.map(item => (
                <div 
                  key={item.id} 
                  draggable={true}
                  className="flex items-center gap-2.5 px-3 py-2 border border-slate-200/60 rounded-lg hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-grab active:cursor-grabbing bg-white shadow-xs transition-all"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Group */}
        <div>
          <button 
            onClick={() => toggleGroup("tasks")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 cursor-pointer text-left"
          >
            <span>Tasks</span>
            {expandedGroups.tasks ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {expandedGroups.tasks && (
            <div className="space-y-1.5 pl-0.5">
              {paletteItems.tasks.map(item => (
                <div 
                  key={item.id} 
                  draggable={true}
                  className="flex items-center gap-2.5 px-3 py-2 border border-slate-200/60 rounded-lg hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-grab active:cursor-grabbing bg-white shadow-xs transition-all"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decisions Group */}
        <div>
          <button 
            onClick={() => toggleGroup("decisions")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 cursor-pointer text-left"
          >
            <span>Decisions</span>
            {expandedGroups.decisions ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {expandedGroups.decisions && (
            <div className="space-y-1.5 pl-0.5">
              {paletteItems.decisions.map(item => (
                <div 
                  key={item.id} 
                  draggable={true}
                  className="flex items-center gap-2.5 px-3 py-2 border border-slate-200/60 rounded-lg hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-grab active:cursor-grabbing bg-white shadow-xs transition-all"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kanban States Group */}
        <div>
          <button 
            onClick={() => toggleGroup("kanban")}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 cursor-pointer text-left"
          >
            <span>Kanban States</span>
            {expandedGroups.kanban ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {expandedGroups.kanban && (
            <div className="space-y-1.5 pl-0.5">
              {paletteItems.kanban.map(item => (
                <div 
                  key={item.id} 
                  draggable={true}
                  className="flex items-center gap-2.5 px-3 py-2 border border-slate-200/60 rounded-lg hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-grab active:cursor-grabbing bg-white shadow-xs transition-all"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Box at bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2 rounded-b-lg m-2">
        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
          💡
        </div>
        <div className="text-left leading-normal">
          <p className="text-[10px] font-bold text-slate-700">Drag to Create</p>
          <p className="text-[9px] text-slate-400">Drag elements onto the canvas grid below.</p>
        </div>
      </div>
    </div>
  );
}
