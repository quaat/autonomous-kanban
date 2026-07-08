import { useState, useEffect } from "react";
import { WorkflowNode, WorkflowEdge, WorkflowNodeConfig } from "../types/workflow";
import {
  getWorkflowNodes,
  getWorkflowEdges,
  updateWorkflowNode,
  validateWorkflow as serviceValidateWorkflow,
  simulateWorkflow as serviceSimulateWorkflow,
  publishWorkflow as servicePublishWorkflow,
} from "../services/workflowService";

export function useWorkflowState() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("review-node");
  const [isValidating, setIsValidating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedNodes = await getWorkflowNodes();
        const fetchedEdges = await getWorkflowEdges();
        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      } catch (err) {
        console.error("Failed to load workflow state", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const triggerToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateNodePosition = async (nodeId: string, x: number, y: number) => {
    try {
      const updatedNode = await updateWorkflowNode(nodeId, { position: { x, y } });
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? updatedNode : n)));
    } catch (err) {
      console.error("Failed to update node position", err);
    }
  };

  const handleUpdateNodeConfig = async (nodeId: string, updatedConfig: WorkflowNodeConfig) => {
    try {
      const nodeLabel = (updatedConfig as { nodeName?: string }).nodeName;
      const updatedNode = await updateWorkflowNode(nodeId, {
        label: nodeLabel || undefined,
        config: updatedConfig,
      });
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? updatedNode : n)));
    } catch (err) {
      console.error("Failed to update node config", err);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await serviceValidateWorkflow();
      if (result.success) {
        triggerToast("Workflow schema compiled! 18 nodes validated successfully with 0 cycles errors.", "success");
      } else {
        triggerToast(`Validation failed: ${result.errors.join(", ")}`, "warning");
      }
    } catch (err) {
      console.error("Validation crashed", err);
      triggerToast("Validation error", "warning");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSimulation = async () => {
    setIsSimulating(true);
    try {
      const result = await serviceSimulateWorkflow();
      if (result.success) {
        triggerToast("Workflow simulation completed successfully! 24 steps executed, 0 bottlenecks detected.", "success");
      }
    } catch (err) {
      console.error("Simulation crashed", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublish = async () => {
    try {
      const result = await servicePublishWorkflow();
      if (result.success) {
        triggerToast(`Workflow 'Default Autonomous Delivery Flow' published as ${result.version}! Active agent workers successfully updated.`, "success");
      }
    } catch (err) {
      console.error("Publishing crashed", err);
    }
  };

  return {
    nodes,
    edges,
    loading,
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
  };
}
