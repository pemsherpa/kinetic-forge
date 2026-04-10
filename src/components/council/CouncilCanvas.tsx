import React, { useMemo, useEffect, useState } from 'react';
import { ReactFlow, Background, Node, Edge, ConnectionMode, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { StrategistNode } from './StrategistNode';
import { CriticNode } from './CriticNode';
import { ExecutorNode } from './ExecutorNode';
import { DebateFeedNode } from './DebateFeedNode';
import { ConsensusNode } from './ConsensusNode';
import { CouncilEdge } from './CouncilEdge';

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

const INITIAL_NODES: Node[] = [
  {
    id: 'strategist',
    type: 'strategist',
    position: { x: window.innerWidth / 2 - 400, y: 50 },
    data: {},
    draggable: false,
  },
  {
    id: 'critic',
    type: 'critic',
    position: { x: window.innerWidth / 2 + 100, y: 50 },
    data: {},
    draggable: false,
  },
  {
    id: 'debate',
    type: 'debateFeed',
    position: { x: window.innerWidth / 2 - 150, y: 150 },
    data: {},
    draggable: false,
  },
  {
    id: 'executor',
    type: 'executor',
    position: { x: window.innerWidth / 2 - 400, y: 250 },
    data: {},
    draggable: false,
  }
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e-strat-debate', source: 'strategist', target: 'debate', type: 'council', data: { agent: 'strategist' } },
  { id: 'e-crit-debate', source: 'critic', target: 'debate', type: 'council', data: { agent: 'critic' } },
  { id: 'e-exec-debate', source: 'executor', target: 'debate', type: 'council', data: { agent: 'executor' } },
];

export function CouncilCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const { consensusResult } = useCouncilStore();

  useEffect(() => {
    // Add consensus node dynamically when consensus is reached
    if (consensusResult && !nodes.find(n => n.id === 'consensus')) {
      setNodes(nds => [
        ...nds,
        {
          id: 'consensus',
          type: 'consensus',
          position: { x: window.innerWidth / 2 - 150, y: 400 },
          data: { result: consensusResult },
          draggable: false,
        }
      ]);
      setEdges(eds => [
        ...eds,
        { id: 'e-debate-cons', source: 'debate', target: 'consensus', type: 'council', data: { agent: 'consensus' } }
      ])
    } else if (!consensusResult && nodes.find(n => n.id === 'consensus')) {
      // Clean up if reset
      setNodes(INITIAL_NODES);
      setEdges(INITIAL_EDGES);
    }
  }, [consensusResult, setNodes, setEdges, nodes]);

  // Adjust positions on resize
  useEffect(() => {
    const handleResize = () => {
      setNodes(nds => nds.map(n => {
        if (n.id === 'strategist') return { ...n, position: { x: window.innerWidth / 2 - 400, y: 50 } };
        if (n.id === 'critic') return { ...n, position: { x: window.innerWidth / 2 + 100, y: 50 } };
        if (n.id === 'debate') return { ...n, position: { x: window.innerWidth / 2 - 150, y: 150 } };
        if (n.id === 'executor') return { ...n, position: { x: window.innerWidth / 2 - 400, y: 250 } };
        if (n.id === 'consensus') return { ...n, position: { x: window.innerWidth / 2 - 150, y: 380 } };
        return n;
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setNodes]);

  return (
    <div className="w-full h-full relative">
      {/* Toolbar could be placed here: <CouncilToolbar /> */}
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="rgba(255,255,255,0.035)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
