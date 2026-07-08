import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  User, 
  Cpu, 
  HelpCircle, 
  FileText, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { WorkflowNode, WorkflowEdge } from "../../types";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
}

export default function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  // Handle dragging nodes locally
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    setDraggingNodeId(node.id);
    dragStartOffset.current = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId || !canvasRef.current) return;
      
      const canvasBounds = canvasRef.current.getBoundingClientRect();
      let newX = e.clientX - dragStartOffset.current.x;
      let newY = e.clientY - dragStartOffset.current.y;

      // Bound within canvas
      newX = Math.max(10, Math.min(newX, canvasBounds.width - 160));
      newY = Math.max(10, Math.min(newY, canvasBounds.height - 70));

      // Snap to grid (10px grid)
      newX = Math.round(newX / 10) * 10;
      newY = Math.round(newY / 10) * 10;

      onUpdateNodePosition(draggingNodeId, newX, newY);
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
    };

    if (draggingNodeId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingNodeId, onUpdateNodePosition]);

  // Dimensions helper
  const getNodeDimensions = (type: WorkflowNode["type"]) => {
    if (type === "start" || type === "end") return { w: 44, h: 44 };
    if (type === "decision") return { w: 48, h: 48 };
    return { w: 154, h: 54 };
  };

  // Helper to compute anchor point for each edge source/target
  const getAnchorPoint = (node: WorkflowNode, side: "left" | "right" | "top" | "bottom") => {
    const { w, h } = getNodeDimensions(node.type);
    const x = node.position.x;
    const y = node.position.y;

    switch (side) {
      case "left": return { x, y: y + h / 2 };
      case "right": return { x: x + w, y: y + h / 2 };
      case "top": return { x: x + w / 2, y };
      case "bottom": return { x: x + w / 2, y: y + h };
    }
  };

  // Compute standard orthogonal or curved Bezier line
  const calculatePath = (edge: WorkflowEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return "";

    const sDim = getNodeDimensions(sourceNode.type);
    const tDim = getNodeDimensions(targetNode.type);

    // Determine anchors based on relative positions
    let sourceSide: "left" | "right" | "top" | "bottom";
    let targetSide: "left" | "right" | "top" | "bottom";

    const sX = sourceNode.position.x;
    const sY = sourceNode.position.y;
    const tX = targetNode.position.x;
    const tY = targetNode.position.y;

    if (tX > sX + sDim.w) {
      sourceSide = "right";
      targetSide = "left";
    } else if (sX > tX + tDim.w) {
      sourceSide = "left";
      targetSide = "right";
    } else if (tY > sY + sDim.h) {
      sourceSide = "bottom";
      targetSide = "top";
    } else {
      sourceSide = "top";
      targetSide = "bottom";
    }

    // Specific manual overrides to perfectly match the layout diagram path lines!
    if (edge.id === "e6") { // graph-node to ready-node
      sourceSide = "right";
      targetSide = "left";
    }
    if (edge.id === "e18") { // retry-node to todo-node
      sourceSide = "left";
      targetSide = "bottom";
    }
    if (edge.id === "e12") { // needs-feedback to verification
      sourceSide = "bottom";
      targetSide = "top";
    }
    if (edge.id === "e4") { // clarify-node to plan-node
      sourceSide = "bottom";
      targetSide = "left";
    }

    const start = getAnchorPoint(sourceNode, sourceSide);
    const end = getAnchorPoint(targetNode, targetSide);

    // If straight horizontal line, just draw simple line
    if (Math.abs(start.y - end.y) < 15 && start.x < end.x && (sourceSide === "right" && targetSide === "left")) {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Orthogonal routing helper for premium diagram layout
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (sourceSide === "right" && targetSide === "left") {
      const midX = start.x + dx / 2;
      return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    }
    if (sourceSide === "bottom" && targetSide === "top") {
      const midY = start.y + dy / 2;
      return `M ${start.x} ${start.y} L ${start.x} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
    }
    if (sourceSide === "bottom" && targetSide === "left") {
      return `M ${start.x} ${start.y} L ${start.x} ${end.y} L ${end.x} ${end.y}`;
    }
    if (sourceSide === "left" && targetSide === "bottom") {
      return `M ${start.x} ${start.y} L ${end.x} ${start.y} L ${end.x} ${end.y}`;
    }

    // Curved fallback
    const controlX = start.x + dx * 0.4;
    const controlY = start.y;
    const controlX2 = end.x - dx * 0.4;
    const controlY2 = end.y;

    return `M ${start.x} ${start.y} C ${controlX} ${controlY}, ${controlX2} ${controlY2}, ${end.x} ${end.y}`;
  };

  // Node Content Render Switch
  const renderNodeContent = (node: WorkflowNode) => {
    const isSelected = node.id === selectedNodeId;

    switch (node.type) {
      case "start":
        return (
          <div className="flex flex-col items-center select-none">
            <div className={`w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-500/80 shadow-xs flex items-center justify-center transition-all ${
              isSelected ? "ring-2 ring-blue-500 ring-offset-2 scale-102" : "hover:border-emerald-600"
            }`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-400"></div>
            </div>
            <div className="text-center mt-2 w-28 absolute -bottom-10 left-1/2 -translate-x-1/2">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight">{node.label}</h5>
              <p className="text-[9px] text-slate-400 font-medium">{node.subtitle}</p>
            </div>
          </div>
        );

      case "end":
        return (
          <div className="flex flex-col items-center select-none">
            <div className={`w-11 h-11 rounded-full bg-emerald-50 border-2 border-emerald-500/80 shadow-xs flex items-center justify-center transition-all ${
              isSelected ? "ring-2 ring-blue-500 ring-offset-2 scale-102" : "hover:border-emerald-600"
            }`}>
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-center mt-2 w-28 absolute -bottom-10 left-1/2 -translate-x-1/2">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight">{node.label}</h5>
              <p className="text-[9px] text-slate-400 font-medium">{node.subtitle}</p>
            </div>
          </div>
        );

      case "decision":
        return (
          <div className="relative select-none flex items-center justify-center w-12 h-12">
            {/* The actual rotated diamond shape */}
            <div className={`w-10 h-10 bg-amber-50 border-2 border-amber-500/80 rotate-45 flex items-center justify-center shadow-2xs transition-all ${
              isSelected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100" : ""
            }`}></div>
            {/* Inner non-rotated content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <HelpCircle className="w-4 h-4 text-amber-600" />
            </div>
            {/* Label placed above */}
            <div className="text-center w-36 absolute -top-9 left-1/2 -translate-x-1/2 leading-none">
              <h5 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-tight">{node.label}</h5>
            </div>
          </div>
        );

      case "llm_task":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-white flex items-center gap-2.5 px-3 shadow-2xs hover:shadow-xs transition-all text-left relative ${
            isSelected 
              ? "border-blue-600 ring-4 ring-blue-100" 
              : "border-blue-200 hover:border-blue-400"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-blue-500 font-semibold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      case "human_task":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-white flex items-center gap-2.5 px-3 shadow-2xs hover:shadow-xs transition-all text-left relative ${
            isSelected 
              ? "border-purple-600 ring-4 ring-purple-100" 
              : "border-purple-200 hover:border-purple-400"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-purple-500 font-semibold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      case "service_task":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-white flex items-center gap-2.5 px-3 shadow-2xs hover:shadow-xs transition-all text-left relative ${
            isSelected 
              ? "border-teal-600 ring-4 ring-teal-100" 
              : "border-teal-200 hover:border-teal-400"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-teal-500 font-semibold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      case "kanban_state":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-white flex items-center gap-2.5 px-3 shadow-2xs hover:shadow-xs transition-all text-left relative ${
            isSelected 
              ? "border-sky-600 ring-4 ring-sky-100" 
              : "border-sky-200 hover:border-sky-450"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-sky-500 font-semibold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      case "review_task":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-blue-50/5 border-blue-600 flex items-center gap-2.5 px-3 shadow-md hover:shadow-lg transition-all text-left relative ${
            isSelected ? "ring-4 ring-blue-100" : ""
          }`}>
            {/* Sizing selection handles for a detailed mockup look! */}
            {isSelected && (
              <>
                <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-2 border-blue-600 bg-white z-20"></div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-2 border-blue-600 bg-white z-20"></div>
                <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-2 border-blue-600 bg-white z-20"></div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-2 border-blue-600 bg-white z-20"></div>
                <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 border-2 border-blue-600 bg-white h-2 z-20"></div>
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 border-2 border-blue-600 bg-white h-2 z-20"></div>
              </>
            )}
            <div className="w-7 h-7 rounded-lg bg-blue-600 border border-blue-500 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-extrabold text-blue-900 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      case "blocked":
        return (
          <div className={`w-[154px] h-[54px] rounded-xl border-2 bg-white flex items-center gap-2.5 px-3 shadow-2xs hover:shadow-xs transition-all text-left relative ${
            isSelected 
              ? "border-red-600 ring-4 ring-red-100" 
              : "border-red-200 hover:border-red-400"
          }`}>
            <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0 leading-tight">
              <h5 className="text-[11.5px] font-bold text-red-900 leading-tight truncate">{node.label}</h5>
              <span className="text-[9px] text-red-500 font-semibold uppercase tracking-wider">{node.subtitle}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 bg-slate-50/50 dotted-canvas overflow-auto relative p-10 select-none cursor-crosshair min-h-[600px]"
      onMouseDown={() => onSelectNode("")}
      role="presentation"
    >
      {/* SVG Connections Overlay Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none min-w-[1200px] min-h-[800px] z-0">
        <defs>
          <marker 
            id="arrow" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
          </marker>
          <marker 
            id="arrow-success" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
          </marker>
          <marker 
            id="arrow-warning" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>
          <marker 
            id="arrow-error" 
            viewBox="0 0 10 10" 
            refX="6" 
            refY="5" 
            markerWidth="6" 
            markerHeight="6" 
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
          </marker>
        </defs>

        {/* Render Connection Edges */}
        {edges.map((edge) => {
          const pathD = calculatePath(edge);
          if (!pathD) return null;

          let strokeColor = "#94a3b8"; // slate-400
          let arrowId = "arrow";
          let strokeDash = undefined;

          if (edge.variant === "success") { strokeColor = "#10b981"; arrowId = "arrow-success"; }
          if (edge.variant === "warning") { strokeColor = "#f59e0b"; arrowId = "arrow-warning"; }
          if (edge.variant === "error") { strokeColor = "#ef4444"; arrowId = "arrow-error"; }
          if (edge.variant === "dashed") { strokeDash = "4,4"; }

          // Find center point along path to display floating connector label (e.g. Yes, No, Resume)
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          let labelX = 0;
          let labelY = 0;

          if (sourceNode && targetNode) {
            // Estimate path mid point
            const startPt = getAnchorPoint(sourceNode, "right");
            const endPt = getAnchorPoint(targetNode, "left");

            if (edge.id === "e4") { // clarify to plan (going down and right)
              labelX = sourceNode.position.x + 25;
              labelY = sourceNode.position.y + 75;
            } else if (edge.id === "e12") { // feedback-2 loop
              labelX = sourceNode.position.x + 25;
              labelY = sourceNode.position.y + 75;
            } else if (edge.id === "e18") { // iterate return path
              labelX = sourceNode.position.x - 40;
              labelY = sourceNode.position.y - 120;
            } else {
              labelX = (startPt.x + endPt.x) / 2;
              labelY = (startPt.y + endPt.y) / 2;
            }
          }

          return (
            <g key={edge.id}>
              {/* Stroke line path */}
              <path 
                d={pathD} 
                fill="none" 
                stroke={strokeColor} 
                strokeWidth={1.8} 
                strokeDasharray={strokeDash}
                markerEnd={`url(#${arrowId})`}
                className="transition-all"
              />

              {/* Floating Edge Text Label */}
              {edge.label && labelX > 0 && (
                <g transform={`translate(${labelX}, ${labelY})`}>
                  <rect 
                    x="-24" 
                    y="-9" 
                    width="48" 
                    height="18" 
                    rx="4" 
                    fill="#ffffff" 
                    stroke="#e2e8f0" 
                    strokeWidth="1"
                  />
                  <text 
                    textAnchor="middle" 
                    alignmentBaseline="middle" 
                    y="1.5"
                    className="text-[9px] font-bold font-sans"
                    fill={strokeColor === "#94a3b8" ? "#64748b" : strokeColor}
                  >
                    {edge.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Render Node Cards */}
      <div className="absolute inset-0 pointer-events-none min-w-[1200px] min-h-[800px] z-10">
        {nodes.map((node) => {
          const { w, h } = getNodeDimensions(node.type);

          return (
            <div 
              key={node.id}
              style={{ 
                left: node.position.x, 
                top: node.position.y,
                width: w,
                height: h
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectNode(node.id);
                }
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              className="absolute pointer-events-auto cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              aria-label={`Select node: ${node.label}`}
            >
              {renderNodeContent(node)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
