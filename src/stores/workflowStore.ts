import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { ConsensusResult } from '../types';

export interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  isRunning: boolean;
  selectedNodeId: string | null;
  setNodes: (nodes: Node[] | ((val: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((val: Edge[]) => Edge[])) => void;
  buildFromConsensus: (result: ConsensusResult) => void;
  addNode: (node: Node) => void;
  removeNode: (id: string) => void;
  updateNodeConfig: (id: string, config: any) => void;
  resetWorkflow: () => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  edges: [],
  isRunning: false,
  selectedNodeId: null,

  setNodes: (nodes) => set((state) => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
  })),

  setEdges: (edges) => set((state) => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges
  })),

  buildFromConsensus: (result: ConsensusResult) => {
    // This will be populated later by buildPipelineGraph
  },

  addNode: (node: Node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),

  removeNode: (id: string) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== id),
    edges: state.edges.filter(e => e.source !== id && e.target !== id)
  })),

  updateNodeConfig: (id: string, config: any) => set((state) => ({
    nodes: state.nodes.map(n => 
      n.id === id ? { ...n, data: { ...n.data, ...config } } : n
    )
  })),

  resetWorkflow: () => set((state) => ({
    nodes: state.nodes.map(n => ({
      ...n,
      data: { ...n.data, status: 'IDLE' }
    }))
  })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setIsRunning: (isRunning) => set({ isRunning })
}));
