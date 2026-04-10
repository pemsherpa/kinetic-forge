import { create } from 'zustand';
import { Node, Edge, XYPosition } from '@xyflow/react';
import { ConsensusResult, NodeConfig, NodeStatus } from '../types';

interface WorkflowStore {
  nodes: Node[];
  edges: Edge[];
  nodeStatuses: Record<string, NodeStatus>;
  nodeResults: Record<string, any>;
  selectedNodeId: string | null;
  isExecuting: boolean;
  executionLog: Array<{ step: string, ts: number, data: any }>;
  
  buildFromConsensus: (result: ConsensusResult) => void;
  addNode: (type: string, position?: XYPosition) => void;
  removeNode: (id: string) => void;
  updateNodeConfig: (id: string, config: Partial<NodeConfig>) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  setNodeResult: (id: string, result: any) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  selectNode: (id: string | null) => void;
  resetExecution: () => void;
  executeAll: (claim: any) => Promise<void>;
  exportAsN8nJSON: () => object;
  importFromN8nJSON: (json: object) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  nodeStatuses: {},
  nodeResults: {},
  selectedNodeId: null,
  isExecuting: false,
  executionLog: [],

  buildFromConsensus: (result: ConsensusResult) => {
    import('../pipeline/buildPipelineGraph').then(({ buildPipelineGraph }) => {
      const { nodes, edges } = buildPipelineGraph(result);
      set({ nodes, edges, nodeStatuses: {}, nodeResults: {}, executionLog: [] });
    });
  },

  addNode: (type, position) => {
    // simplified implementation for palette drop
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'pipelineNode',
      position: position || { x: 50, y: 50 },
      data: {
        config: {
          id,
          type,
          label: type.toUpperCase(),
          systemPromptHint: 'Manual node added',
          parallelGroup: undefined,
          conditional: false
        }
      }
    };
    set(state => ({ nodes: [...state.nodes, newNode] }));
  },

  removeNode: (id) => {
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
    }));
  },

  updateNodeConfig: (id, config) => {
    set(state => ({
      nodes: state.nodes.map(n => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, config: { ...(n.data.config as object), ...config } } };
        }
        return n;
      })
    }));
  },

  setNodeStatus: (id, status) => set(state => ({
    nodeStatuses: { ...state.nodeStatuses, [id]: status }
  })),

  setNodeResult: (id, result) => set(state => ({
    nodeResults: { ...state.nodeResults, [id]: result }
  })),

  setNodes: (nodes) => set(state => ({
    nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
  })),

  setEdges: (edges) => set(state => ({
    edges: typeof edges === 'function' ? edges(state.edges) : edges
  })),

  selectNode: (id) => set({ selectedNodeId: id }),

  resetExecution: () => set({ nodeStatuses: {}, nodeResults: {}, executionLog: [], isExecuting: false }),

  executeAll: async (claim) => {
    set({ isExecuting: true });
    // Dynamically loaded to prevent circular logic
    const { executeAllLogic } = await import('../pipeline/executeAll');
    await executeAllLogic(claim, get, set);
    set({ isExecuting: false });
  },

  exportAsN8nJSON: () => {
    // Mock export
    return { nodes: get().nodes, connections: get().edges };
  },

  importFromN8nJSON: (json: any) => {
    // Mock import
    if (json.nodes) set({ nodes: json.nodes, edges: json.connections || [] });
  }
}));
