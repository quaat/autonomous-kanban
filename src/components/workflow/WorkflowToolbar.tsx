import React, { useState } from "react";
import { 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Share2, 
  Sliders, 
  RotateCw,
  MoreHorizontal
} from "lucide-react";

interface WorkflowToolbarProps {
  onValidate: () => void;
  onSimulation: () => void;
  onPublish: () => void;
  isValidating: boolean;
  isSimulating: boolean;
}

export default function WorkflowToolbar({
  onValidate,
  onSimulation,
  onPublish,
  isValidating,
  isSimulating
}: WorkflowToolbarProps) {
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState("Default Autonomous Delivery Flow");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-2xs z-10 shrink-0 select-none text-left">
      {/* Left side: Breadcrumb & Title */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span>Workflow Builder</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-blue-600 font-bold">Visual Editor</span>
        </div>

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => { if (e.key === "Enter") setIsEditingTitle(false); }}
              className="text-sm font-bold text-slate-900 border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 outline-none focus:bg-white"
            />
          ) : (
            <button 
              onClick={() => setIsEditingTitle(true)}
              className="text-left text-sm font-extrabold text-slate-900 leading-tight hover:text-blue-600 cursor-pointer focus:outline-none"
              aria-label="Edit workflow title"
            >
              {title}
            </button>
          )}
          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200/50 rounded-full text-[10px] font-bold">
            v3
          </span>
        </div>
      </div>

      {/* Center/Right actions: Validate, simulation, auto-layout, etc. */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Validate button */}
        <button 
          onClick={onValidate}
          disabled={isValidating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer active:scale-97 ${
            isValidating ? "bg-slate-100 border-transparent opacity-60" : "bg-white"
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isValidating ? "text-slate-400 animate-spin" : "text-emerald-500"}`} />
          <span>{isValidating ? "Validating..." : "Validate"}</span>
        </button>

        {/* Auto Layout button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer">
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>Auto-layout</span>
        </button>

        {/* Simulation button */}
        <button 
          onClick={onSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer active:scale-97 ${
            isSimulating ? "bg-slate-100 border-transparent opacity-60" : "bg-white"
          }`}
        >
          <Play className={`w-3.5 h-3.5 ${isSimulating ? "text-slate-400 animate-spin" : "text-blue-600"}`} />
          <span>{isSimulating ? "Simulating..." : "Simulation"}</span>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer" title="Undo" aria-label="Undo last change">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded cursor-pointer" title="Redo" aria-label="Redo change">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom panel */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 10, 50))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="px-1.5 text-[10px] font-mono font-bold text-slate-600 w-11 text-center">
            {zoom}%
          </span>
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 10, 150))}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>

        {/* Fit View */}
        <button 
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-xs cursor-pointer" 
          title="Fit View"
          aria-label="Fit visual workflow inside view port"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* More Overflow options */}
        <button 
          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors shadow-xs cursor-pointer"
          aria-label="More workflow options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Publish / Deploy Workflow */}
        <button 
          onClick={onPublish}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-97"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}
