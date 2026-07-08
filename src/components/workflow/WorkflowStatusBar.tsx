import React from "react";
import { 
  CheckCircle2, 
  RotateCw, 
  Layers, 
  Play, 
  ChevronUp, 
  FileText
} from "lucide-react";

interface WorkflowStatusBarProps {
  isValidating: boolean;
  isSimulating: boolean;
  onViewReport: () => void;
}

export default function WorkflowStatusBar({
  isValidating,
  isSimulating,
  onViewReport
}: WorkflowStatusBarProps) {
  return (
    <div className="border-t border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs shrink-0 select-none text-left z-10">
      {/* Metrics container */}
      <div className="flex flex-wrap items-center gap-6 md:gap-10">
        
        {/* Block 1: Validation */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            {isValidating ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4.5 h-4.5" />
            )}
          </div>
          <div>
            <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">
              {isValidating ? "Validating flow..." : "Workflow valid"}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">No blocking issues</p>
          </div>
        </div>

        {/* Block 2: Cycles check */}
        <div className="flex items-start gap-2.5 border-l border-slate-100 pl-6 md:pl-10">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <RotateCw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">0 cycle errors</h4>
            <p className="text-[10px] text-slate-500 font-medium">All paths are valid</p>
          </div>
        </div>

        {/* Block 3: Reusable Templates */}
        <div className="flex items-start gap-2.5 border-l border-slate-100 pl-6 md:pl-10">
          <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">2 reusable templates</h4>
            <p className="text-[10px] text-slate-500 font-medium">1 imported, 1 local</p>
          </div>
        </div>

        {/* Block 4: Simulation report */}
        <div className="flex items-start gap-2.5 border-l border-slate-100 pl-6 md:pl-10">
          <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            {isSimulating ? (
              <RotateCw className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <Play className="w-4 h-4 text-amber-500 fill-amber-500/10" />
            )}
          </div>
          <div>
            <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">
              {isSimulating ? "Simulation running..." : "Simulation last run: 2 min ago"}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">24 steps executed • 0 failures</p>
          </div>
        </div>
      </div>

      {/* Action CTA & Collapse */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onViewReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>View simulation report</span>
        </button>

        <button 
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Collapse panel"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
