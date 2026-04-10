import React, { useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StrategistNode } from './StrategistNode';
import { CriticNode } from './CriticNode';
import { ExecutorNode } from './ExecutorNode';
import { DebateFeedNode } from './DebateFeedNode';
import { ConsensusNode } from './ConsensusNode';
import { CouncilEdge } from './CouncilEdge';
import { StarfieldCanvas } from './StarfieldCanvas';

import { useCouncilStore } from '../../stores/councilStore';

const nodeTypes = {
  strategist: StrategistNode,
  critic: CriticNode,
  executor: ExecutorNode,
  debateFeed: DebateFeedNode,
  consensus: ConsensusNode,
};

const edgeTypes = {
  council: CouncilEdge,
};

const W = () => window.innerWidth - 300;
const H = () => window.innerHeight - 120;

function makeInitialNodes(): Node[] {
  const w = W();
  const h = H();
  return [
    {
      id: 'strategist',
      type: 'strategist',
      position: { x: w * 0.08, y: h * 0.05 },
      data: {},
    },
    {
      id: 'critic',
      type: 'critic',
      position: { x: w * 0.62, y: h * 0.05 },
      data: {},
    },
    {
      id: 'debate',
      type: 'debateFeed',
      position: { x: w * 0.34, y: h * 0.28 },
      data: {},
    },
    {
      id: 'executor',
      type: 'executor',
      position: { x: w * 0.08, y: h * 0.52 },
      data: {},
    },
  ];
}

const INITIAL_EDGES: Edge[] = [
  { id: 'e-strat-debate', source: 'strategist', target: 'debate', type: 'council', data: { agent: 'strategist' } },
  { id: 'e-crit-debate', source: 'critic', target: 'debate', type: 'council', data: { agent: 'critic' } },
  { id: 'e-exec-debate', source: 'executor', target: 'debate', type: 'council', data: { agent: 'executor' } },
];

export function CouncilCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(makeInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const { consensusResult } = useCouncilStore();

  useEffect(() => {
    if (consensusResult && !nodes.find((n) => n.id === 'consensus')) {
      const w = W();
      const h = H();
      setNodes((nds) => [
        ...nds,
        {
          id: 'consensus',
          type: 'consensus',
          position: { x: w * 0.34, y: h * 0.62 },
          data: { result: consensusResult },
        },
      ]);
      setEdges((eds) => [
        ...eds,
        { id: 'e-debate-cons', source: 'debate', target: 'consensus', type: 'council', data: { agent: 'consensus' } },
      ]);
    } else if (!consensusResult && nodes.find((n) => n.id === 'consensus')) {
      setNodes(makeInitialNodes());
      setEdges(INITIAL_EDGES);
    }
  }, [consensusResult, setNodes, setEdges, nodes]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Animated starfield background */}
      <StarfieldCanvas />

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(8,8,8,0.55) 100%)',
        }}
      />

      {/* ReactFlow */}
      <div className="absolute inset-0 z-[2]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.18, maxZoom: 1 }}
          minZoom={0.35}
          maxZoom={1.8}
          style={{ background: 'transparent' }}
          deleteKeyCode={null}
        >
          <Controls
            className="!bottom-4 !left-4 !bg-elevated !border !border-border-strong !rounded-[6px] !shadow-none"
            showInteractive={false}
          />
          <MiniMap
            className="!bottom-4 !right-4 !bg-elevated !border !border-border-strong !rounded-[6px]"
            nodeColor={(n) => {
              if (n.type === 'strategist') return 'var(--strategist)';
              if (n.type === 'critic') return 'var(--critic)';
              if (n.type === 'executor') return 'var(--executor)';
              if (n.type === 'consensus') return 'var(--amber)';
              return 'var(--border-strong)';
            }}
            maskColor="rgba(8,8,8,0.7)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
