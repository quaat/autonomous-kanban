import React, { useState } from "react";
import { 
  X, 
  Settings, 
  Lock
} from "lucide-react";
import { WorkflowNode, WorkflowNodeConfig } from "../../types/workflow";

interface WorkflowInspectorProps {
  node: WorkflowNode;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedConfig: WorkflowNodeConfig) => void;
}

function getStringValue(config: WorkflowNodeConfig | undefined, key: string, fallback: string): string {
  if (!config) return fallback;
  const val = (config as Record<string, unknown>)[key];
  return typeof val === "string" ? val : fallback;
}

function getNumberValue(config: WorkflowNodeConfig | undefined, key: string, fallback: number): number {
  if (!config) return fallback;
  const val = (config as Record<string, unknown>)[key];
  return typeof val === "number" ? val : fallback;
}

function getBooleanValue(config: WorkflowNodeConfig | undefined, key: string, fallback: boolean): boolean {
  if (!config) return fallback;
  const val = (config as Record<string, unknown>)[key];
  return typeof val === "boolean" ? val : fallback;
}

export default function WorkflowInspector({ 
  node, 
  onClose,
  onUpdateNode
}: WorkflowInspectorProps) {
  const [activeTab, setActiveTab] = useState<"properties" | "transitions" | "comments">("properties");
  
  // Local config fields for the form, initialized directly from node props
  const [nodeName, setNodeName] = useState<string>(node.label);
  const [reviewer, setReviewer] = useState<string>(
    getStringValue(node.config, "reviewer", "GPT-4.1")
  );
  const [maxIterations, setMaxIterations] = useState<number>(
    getNumberValue(node.config, "maxIterations", 3)
  );
  const [severity, setSeverity] = useState<string>(
    getStringValue(node.config, "severityThreshold", "High")
  );
  const [requireTests, setRequireTests] = useState<boolean>(
    getBooleanValue(node.config, "requireTests", true)
  );
  const [duration, setDuration] = useState<string>(
    getStringValue(node.config, "estimatedDuration", "15 min")
  );
  const [timeout, setTimeoutVal] = useState<string>(
    getStringValue(node.config, "timeout", "2 h")
  );

  const handleFieldChange = (field: keyof WorkflowNodeConfig, value: string | number | boolean) => {
    onUpdateNode(node.id, {
      ...node.config,
      [field]: value,
      nodeName: field === "nodeName" ? value : nodeName
    });
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white shadow-xl flex flex-col h-full shrink-0 z-10 animate-in slide-in-from-right duration-200 text-left select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 leading-tight">{nodeName}</h3>
            <span className="text-[10px] text-slate-400 font-semibold">{node.subtitle || "Workflow Node"}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label="Close settings inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50/50">
        <button 
          onClick={() => setActiveTab("properties")}
          className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
            activeTab === "properties" 
              ? "border-blue-600 text-blue-600 font-bold bg-white" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Properties
        </button>
        <button 
          onClick={() => setActiveTab("transitions")}
          className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
            activeTab === "transitions" 
              ? "border-blue-600 text-blue-600 font-bold bg-white" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Transitions (3)
        </button>
        <button 
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
            activeTab === "comments" 
              ? "border-blue-600 text-blue-600 font-bold bg-white" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Comments
        </button>
      </div>

      {/* Tab Contents Frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === "properties" && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            {/* Node Name */}
            <div className="space-y-1.5">
              <label htmlFor="node-name-input" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Node Name</label>
              <input 
                id="node-name-input"
                type="text" 
                value={nodeName}
                onChange={(e) => {
                  setNodeName(e.target.value);
                  handleFieldChange("nodeName", e.target.value);
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-1.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Node Type */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</div>
              <div className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-medium flex items-center justify-between">
                <span>{node.type.toUpperCase().replace(/_/g, " ")}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Custom Review Task Configuration Block */}
            {node.type === "review_task" && (
              <div className="space-y-4 border border-blue-100 bg-blue-50/15 p-3.5 rounded-xl">
                {/* Reviewer Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="reviewer-model-select" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Reviewer Model</label>
                  <select 
                    id="reviewer-model-select"
                    value={reviewer} 
                    onChange={(e) => { setReviewer(e.target.value); handleFieldChange("reviewer", e.target.value); }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="GPT-4.1">GPT-4.1 Turbo</option>
                    <option value="Claude-3.5">Claude 3.5 Sonnet</option>
                    <option value="Gemini-1.5">Gemini 1.5 Pro</option>
                  </select>
                </div>

                {/* Max Retries */}
                <div className="space-y-1.5">
                  <label htmlFor="max-iterations-input" className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Max Iterations</label>
                  <input 
                    id="max-iterations-input"
                    type="number" 
                    value={maxIterations} 
                    onChange={(e) => { setMaxIterations(Number(e.target.value)); handleFieldChange("maxIterations", Number(e.target.value)); }}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    min={1} 
                    max={10} 
                  />
                </div>

                {/* Severity Badge Toggle */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Severity Threshold</div>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map((level) => (
                      <button 
                        key={level}
                        onClick={() => { setSeverity(level); handleFieldChange("severityThreshold", level); }}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                          severity === level 
                            ? "bg-blue-600 border-transparent text-white shadow-xs" 
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-500"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Require Tests Toggle */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1">
                  <label className="relative inline-flex items-center cursor-pointer gap-2 w-full justify-between">
                    <span className="text-[10px] font-bold text-slate-600">Require Tests passing</span>
                    <input 
                      type="checkbox" 
                      checked={requireTests} 
                      onChange={(e) => { setRequireTests(e.target.checked); handleFieldChange("requireTests", e.target.checked); }}
                      className="sr-only peer" 
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Estimations row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label htmlFor="duration-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Duration</label>
                <input 
                  id="duration-input"
                  type="text" 
                  value={duration} 
                  onChange={(e) => { setDuration(e.target.value); handleFieldChange("estimatedDuration", e.target.value); }}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none font-medium" 
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="timeout-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeout</label>
                <input 
                  id="timeout-input"
                  type="text" 
                  value={timeout} 
                  onChange={(e) => { setTimeoutVal(e.target.value); handleFieldChange("timeout", e.target.value); }}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none font-medium" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "transitions" && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Outgoing Transitions</div>
            
            <div className="space-y-2">
              <div className="p-3 border border-slate-200/80 rounded-lg hover:border-slate-300 bg-white">
                <div className="flex items-center justify-between text-emerald-700 mb-1.5">
                  <span className="font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    On pass
                  </span>
                  <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-1 py-0.5 rounded font-bold">Default</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mt-1">
                  <span>Destination Node:</span>
                  <strong className="text-slate-800">Done</strong>
                </div>
              </div>

              <div className="p-3 border border-slate-200/80 rounded-lg hover:border-slate-300 bg-white">
                <div className="flex items-center justify-between text-rose-700 mb-1.5">
                  <span className="font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    On fail
                  </span>
                  <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 px-1 py-0.5 rounded font-bold">Default</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mt-1">
                  <span>Destination Node:</span>
                  <strong className="text-slate-800">Add review findings / retry</strong>
                </div>
              </div>

              <div className="p-3 border border-slate-200/80 rounded-lg hover:border-slate-300 bg-white">
                <div className="flex items-center justify-between text-amber-700 mb-1.5">
                  <span className="font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Max iterations reached
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mt-1">
                  <span>Destination Node:</span>
                  <strong className="text-slate-800">Blocked / Escalate</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-blue-600">Product Manager</span>
                <span className="text-[10px] text-slate-400 font-medium">1d ago</span>
              </div>
              <p className="text-slate-600 leading-relaxed">Let's make sure the threshold severity matches the overall workspace constraints before auto-deploying.</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-indigo-600">Lead Architect</span>
                <span className="text-[10px] text-slate-400 font-medium">12h ago</span>
              </div>
              <p className="text-slate-600 leading-relaxed">The retry loop has been thoroughly tested. Max iterations reached edge goes straight to escalation path safely.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer info lock indicator */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-center gap-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <Lock className="w-3.5 h-3.5" />
        <span>Configured in Active Sandbox</span>
      </div>
    </div>
  );
}
