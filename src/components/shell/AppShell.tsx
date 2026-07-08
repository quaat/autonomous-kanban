import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  ChevronDown
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
  currentView: "board" | "workflow";
  onViewChange: (view: "board" | "workflow") => void;
  onSearch: (query: string) => void;
}

export default function AppShell({ 
  children, 
  currentView, 
  onViewChange,
  onSearch
}: AppShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const notifications = [
    { id: 1, text: "Planner created 8 implementation tasks", time: "2m ago", unread: true },
    { id: 2, text: "Review failed: 2 findings on verification pipeline", time: "14m ago", unread: true },
    { id: 3, text: "Claude started feature/worker-lease task block", time: "27m ago", unread: false },
    { id: 4, text: "Task completed: Audit event model", time: "1h ago", unread: false },
    { id: 5, text: "Worker heartbeat missed: Codex on dnd-kit task", time: "2h ago", unread: false }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-800 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Global Top Nav */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-50">
        {/* Left Side: Brand & Selector */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onViewChange("board")}
            className="flex items-center gap-2.5 cursor-pointer group text-left focus:outline-none"
            aria-label="Navigate to board view"
          >
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-blue-700 transition-colors shrink-0">
              A
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-800">
              Autonomous Development
            </span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="relative">
            <button 
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-md text-sm border border-slate-200 cursor-pointer text-slate-600 hover:bg-slate-200/65 transition-all"
            >
              <span className="text-slate-500 text-xs">Project:</span>
              <span className="font-semibold text-slate-800 text-xs">autonomous-development</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showProjectMenu && (
              <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Select Project</div>
                <button className="w-full text-left px-3 py-1.5 text-xs text-slate-700 bg-blue-50 font-medium border-l-2 border-blue-600 flex items-center justify-between">
                  <span>autonomous-development</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </button>
                <button className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                  <span>agents-analytics-dashboard</span>
                </button>
                <button className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">
                  <span>verification-pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Right Side: Chips, Bells, Profile */}
        <div className="flex items-center gap-3">
          {/* Active Workers Status Chip */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 border border-green-200 rounded text-[11px] font-semibold text-green-700 uppercase tracking-wider shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Workers: 4 Active
          </div>

          {/* Review Limit Chip */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-purple-50 border border-purple-200 rounded text-[11px] font-semibold text-purple-700 uppercase tracking-wider shrink-0">
            Review Limit: 3
          </div>

          {/* Notification Bell */}
          <div className="relative ml-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5 text-slate-500" />
              <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs">
                <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Notifications</span>
                  <span className="text-[10px] text-blue-600 cursor-pointer font-medium hover:underline">Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-3.5 py-2 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 cursor-pointer ${n.unread ? 'bg-blue-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-slate-700 font-medium">{n.text}</span>
                        {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1"></div>}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 shrink-0">
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-blue-50 border border-slate-200"
                aria-label="User Avatar: Administrator"
              >
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">admin@example.com</span>
              <span className="text-[10px] text-slate-400 font-medium">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub navigation bar */}
      <nav className="h-11 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 select-none z-40">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onViewChange("board")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              currentView === "board" 
                ? "bg-blue-50 text-blue-600 font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            aria-label="Switch to Kanban Board view"
          >
            Board
          </button>
          <button 
            onClick={() => onViewChange("workflow")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              currentView === "workflow" 
                ? "bg-blue-50 text-blue-600 font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            aria-label="Switch to Visual Editor view"
          >
            Visual Editor
          </button>
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
            {currentView === "board" ? "Kanban Workspace" : "Flow Designer"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <span>Group: <strong className="text-slate-700 font-semibold">None</strong></span>
          <span>Sort: <strong className="text-slate-700 font-semibold">Priority</strong></span>
          <span className="flex items-center gap-1">WIP limit: <strong className="text-slate-800 font-bold">3</strong></span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
