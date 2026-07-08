import React from "react";
import { useWorkflowState } from "../../hooks/useWorkflowState";
import WorkflowToolbar from "./WorkflowToolbar";
import ComponentPalette from "./ComponentPalette";
import WorkflowCanvas from "./WorkflowCanvas";
import WorkflowInspector from "./WorkflowInspector";
import WorkflowStatusBar from "./WorkflowStatusBar";

export default function WorkflowPage() {
  const {
    nodes,
    edges,
    loading,
    error,
    retry,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    isValidating,
    isSimulating,
    toast,
    triggerToast,
    handleUpdateNodePosition,
    handleUpdateNodeConfig,
    handleValidate,
    handleSimulation,
    handlePublish,
  } = useWorkflowState();

  if (loading) {
    return (
      <div className="flex-1 bg-[#F3F4F6] p-6 text-sm font-semibold text-slate-500">
        Loading workflow...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#F3F4F6] p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <p className="font-bold">{error}</p>
          <button
            onClick={() => void retry()}
            className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative select-none bg-[#F3F4F6]">
      {/* Top Workflow Builder Actions Header */}
      <WorkflowToolbar
        onValidate={handleValidate}
        onSimulation={handleSimulation}
        onPublish={handlePublish}
        isValidating={isValidating}
        isSimulating={isSimulating}
      />

      {/* Main work area split layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Component Drag Palette */}
        <ComponentPalette />

        {/* Center: Large Interactive Vector Canvas */}
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={(nodeId) => setSelectedNodeId(nodeId || null)}
          onUpdateNodePosition={handleUpdateNodePosition}
        />

        {/* Right Side: Active Inspector settings block */}
        {selectedNode && (
          <WorkflowInspector
            key={selectedNode.id}
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNodeConfig}
          />
        )}
      </div>

      {/* Bottom status bar metrics strip */}
      <WorkflowStatusBar
        isValidating={isValidating}
        isSimulating={isSimulating}
        onViewReport={() =>
          triggerToast("Opening full simulation run logs and dependency matrix report.", "info")
        }
      />

      {/* Floating Animated Feedback Toast */}
      {toast && (
        <div
          className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl border shadow-xl z-50 flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom duration-200 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠️" : "ℹ️"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
