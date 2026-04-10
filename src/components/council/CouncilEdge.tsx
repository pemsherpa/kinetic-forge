import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';

export function CouncilEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { agentStatuses } = useCouncilStore();
  const agent = data?.agent as 'strategist' | 'critic' | 'executor' | 'consensus';
  
  let isActive = false;
  let strokeColor = 'var(--border-strong)';
  
  if (agent && agent !== 'consensus') {
    const status = agentStatuses[agent];
    isActive = status === 'SPOKE' || status === 'OBJECTING' || status === 'RESPONDING';
    strokeColor = `var(--${agent})`;
  }

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{
          ...style,
          strokeWidth: isActive ? 2 : 1,
          stroke: isActive ? strokeColor : 'var(--border-strong)',
          strokeDasharray: isActive ? '5,5' : '0',
          animation: isActive ? 'dash 1s linear infinite' : 'none',
        }} 
        markerEnd={markerEnd} 
      />
      <style>
        {`
          @keyframes dash {
            to { stroke-dashoffset: -10; }
          }
        `}
      </style>
    </>
  );
}
