import React, { useState } from "react";
import { 
  Clock, 
  BookOpen, 
  LifeBuoy
} from "lucide-react";
import { ActivityLog } from "../../types";

interface ActivityPanelProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export default function ActivityPanel({ logs, onClearLogs }: ActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "events" | "workers" | "insights">("activity");
  const [filterType, setFilterType] = useState<"all" | "info" | "success" | "error">("all");

  const filteredLogs = logs.filter(log => {
    if (filterType === "all") return true;
    if (filterType === "info" && log.type === "info") return true;
    if (filterType === "success" && log.type === "success") return true;
    if (filterType === "error" && log.type === "error") return true;
    return false;
  });

  return (
    <div className="bg-white border-t border-slate-200 flex flex-col z-10 shrink-0">
      {/* Tab Switchers Header */}
      <div className="px-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 -mb-px">
          <button 
            onClick={() => setActiveTab("activity")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "activity" 
                ? "border-blue-600 text-blue-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Activity
          </button>
          <button 
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "events" 
                ? "border-blue-600 text-blue-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Events
          </button>
          <button 
            onClick={() => setActiveTab("workers")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "workers" 
                ? "border-blue-600 text-blue-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Workers
          </button>
          <button 
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === "insights" 
                ? "border-blue-600 text-blue-600 font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Insights
          </button>
        </div>

        {/* Tab Controls (e.g. log filter selector) */}
        {activeTab === "activity" && (
          <div className="flex items-center gap-2">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "info" | "success" | "error")}
              className="text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5 outline-none"
            >
              <option value="all">All Levels</option>
              <option value="info">Info Logs</option>
              <option value="success">Success</option>
              <option value="error">Errors</option>
            </select>
            {onClearLogs && (
              <button 
                onClick={onClearLogs}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                Clear Stream
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab Contents Frame */}
      <div className="h-28 overflow-y-auto px-4 py-3 bg-slate-50/25">
        {activeTab === "activity" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredLogs.map((log) => {
              // Custom styled blocks matching layout mockup
              let iconStyle = "bg-blue-100 text-blue-700";
              let badge = "Info";
              if (log.type === "success") { iconStyle = "bg-emerald-100 text-emerald-700"; badge = "Done"; }
              if (log.type === "error") { iconStyle = "bg-rose-100 text-rose-700"; badge = "High"; }
              if (log.type === "agent") { iconStyle = "bg-amber-100 text-amber-700"; badge = "Running"; }

              return (
                <div key={log.id} className="rounded-lg border border-slate-200/60 bg-white p-3 shadow-2xs text-left relative overflow-hidden group hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      {log.time}
                    </span>
                    <span className={`text-[8.5px] font-bold px-1 py-0.5 rounded uppercase ${iconStyle}`}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">{log.message}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 flex items-center gap-1 truncate">
                    <span>{log.detail}</span>
                    {log.agent && <span className="text-amber-700 font-semibold">• {log.agent}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "events" && (
          <div className="text-left font-mono text-[11px] text-slate-600 space-y-1">
            <p className="text-slate-400">[04:02:15] DEBUG - Initializing task graph executor with depth 5.</p>
            <p className="text-emerald-600">[04:02:18] SUCCESS - Successfully compiled task workspace - 0 errors, 1 warning.</p>
            <p className="text-amber-600">[04:03:02] WARN - Claude lease heartbeat delay observed: 1500ms.</p>
            <p className="text-slate-400">[04:04:10] INFO - Spawning GPT-4.1 sandbox for task-11 verification checks.</p>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="flex gap-4 overflow-x-auto pb-1 text-left">
            <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2 flex items-center gap-3 min-w-44 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">C</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 leading-tight">Claude-3.5</h5>
                <p className="text-[10px] text-emerald-600 font-semibold">LEASE ACTIVE • 60%</p>
              </div>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2 flex items-center gap-3 min-w-44 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">CD</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 leading-tight">Codex-v2</h5>
                <p className="text-[10px] text-amber-600 font-semibold">LEASE ACTIVE • 35%</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 flex items-center gap-3 min-w-44 shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-xs">G</div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 leading-tight">GPT-4.1</h5>
                <p className="text-[10px] text-slate-400 font-semibold">IDLE • STANDBY</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="text-left text-xs text-slate-600 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-2xs">
              <h6 className="font-bold text-slate-700 mb-1">Pass rate by Worker</h6>
              <p className="text-[11px] text-slate-500 leading-normal">Claude achieved <strong className="text-emerald-600 font-bold">92% success rate</strong> across 15 tasks this session.</p>
            </div>
            <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-2xs">
              <h6 className="font-bold text-slate-700 mb-1">Resource Consumption</h6>
              <p className="text-[11px] text-slate-500 leading-normal">Avg. execution time is <strong className="text-slate-800 font-bold">12m 45s</strong> per verification cycle.</p>
            </div>
            <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-2xs">
              <h6 className="font-bold text-slate-700 mb-1">Queue Bottleneck</h6>
              <p className="text-[11px] text-slate-500 leading-normal">Dependent tasks queue is clear. No circular DAG bottlenecks detected.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Health Strip */}
      <footer className="border-t border-slate-200/80 px-4 py-1.5 bg-white flex items-center justify-between text-[11px] font-medium text-slate-500 shadow-2xs">
        {/* Left Side: System healthy indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>System healthy</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 pl-3">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              <span>API</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              <span>Database</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
              <span>Queue</span>
            </span>
          </div>

          <span className="text-[10px] text-slate-400 font-normal">Last updated: 2m ago</span>
        </div>

        {/* Right Side: Version, Links */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[10px]">v1.2.0</span>
          
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
            <button className="hover:text-slate-700 flex items-center gap-1 cursor-pointer">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Documentation</span>
            </button>
            <button className="hover:text-slate-700 flex items-center gap-1 cursor-pointer">
              <LifeBuoy className="w-3.5 h-3.5 text-slate-400" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
