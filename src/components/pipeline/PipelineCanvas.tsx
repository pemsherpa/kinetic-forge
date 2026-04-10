import React, { useEffect } from 'react';
import { ReactFlow, Background, ConnectionMode, useNodesState, useEdgesState } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useWorkflowStore } from '../../stores/workflowStore';
import { buildPipelineGraph } from '../../pipeline/buildPipelineGraph';

import { PipelineNode } from './PipelineNode';

const nodeTypes = {
  pipelineNode: PipelineNode
};

export function PipelineCanvas() {
  const { consensusResult } = useCouncilStore();
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    if (consensusResult) {
      const graph = buildPipelineGraph(consensusResult);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [consensusResult, setNodes, setEdges]);

  return (
    <div className={`w-full h-full transition-opacity duration-600 ${consensusResult ? 'opacity-100' : 'opacity-0'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background color="rgba(255,255,255,0.035)" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
