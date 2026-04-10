import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';

export function CouncilEdge({
  id,
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
  let strokeColor = 'rgba(255,255,255,0.1)';
  let particleColor = '#ffffff';

  if (agent && agent !== 'consensus') {
    const status = agentStatuses[agent];
    isActive = ['THINKING', 'SPOKE', 'OBJECTING', 'RESPONDING', 'PROPOSING'].includes(status);
    const colorMap = {
      strategist: '#8B5CF6',
      critic: '#F97316',
      executor: '#14B8A6',
    };
    strokeColor = colorMap[agent] ?? strokeColor;
    particleColor = strokeColor;
  } else if (agent === 'consensus') {
    isActive = true;
    strokeColor = '#F59E0B';
    particleColor = '#F59E0B';
  }

  const pathId = `cp-${id}`;
  const filterId = `cglow-${id}`;
  const duration = agent === 'strategist' ? '1.8s' : agent === 'critic' ? '2.1s' : '2.4s';

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isActive ? '2.5' : '1'} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`lg-${id}`} gradientUnits="userSpaceOnUse"
          x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={strokeColor} stopOpacity={isActive ? '0.6' : '0.15'} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={isActive ? '1' : '0.25'} />
        </linearGradient>
      </defs>

      {/* Invisible thick path used as motion route */}
      <path id={pathId} d={edgePath} fill="none" stroke="transparent" strokeWidth="1" />

      {/* Main edge */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: isActive ? 2 : 0.8,
          stroke: isActive ? `url(#lg-${id})` : 'rgba(255,255,255,0.08)',
          filter: isActive ? `url(#${filterId})` : 'none',
          strokeDasharray: isActive ? '6 3' : '0',
          animation: isActive ? 'councilDash 1.4s linear infinite' : 'none',
          transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated particle traveler */}
      {isActive && (
        <circle r="3.5" fill={particleColor} opacity="0.9" filter={`url(#${filterId})`}>
          <animateMotion dur={duration} repeatCount="indefinite" rotate="auto">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      {/* Second smaller particle offset */}
      {isActive && (
        <circle r="1.8" fill={particleColor} opacity="0.5">
          <animateMotion dur={duration} begin="-0.7s" repeatCount="indefinite" rotate="auto">
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      )}

      <style>{`
        @keyframes councilDash { to { stroke-dashoffset: -18; } }
      `}</style>
    </>
  );
}
