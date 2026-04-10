import React, { useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';

export function DebateFeedNode() {
  const { debateMessages, phase, votes } = useCouncilStore();
  const feedRef = useRef<HTMLDivElement>(null);
  const isLive = phase !== 'idle' && phase !== 'done' && phase !== 'error';
  const isDone = phase === 'done' || phase === 'consensus';

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [debateMessages.length]);

  const agentColor: Record<string, string> = {
    strategist: 'text-strategist',
    critic: 'text-critic',
    executor: 'text-executor',
  };

  const agentBg: Record<string, string> = {
    strategist: 'bg-strategist/10 border-strategist/20',
    critic: 'bg-critic/10 border-critic/20',
    executor: 'bg-executor/10 border-executor/20',
  };

  const voteColors = [
    votes.strategist ? '#8B5CF6' : 'transparent',
    votes.critic ? '#F97316' : 'transparent',
    votes.executor ? '#14B8A6' : 'transparent',
  ];

  return (
    <div className="w-[310px] bg-elevated/90 backdrop-blur-sm border border-border-strong rounded-[6px] shadow-2xl flex flex-col font-mono text-[11px] overflow-hidden node-glow-amber-sm">
      <Handle type="target" position={Position.Left} id="d1" style={{ top: '25%', opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="d2" style={{ top: '25%', opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="d3" style={{ top: '75%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="db-out" style={{ left: '50%', opacity: 0 }} />

      {/* Holographic top bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-strategist via-amber to-executor opacity-80" />

      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-border-strong bg-surface/60">
        <div className="flex items-center gap-2">
          {isLive && <div className="w-2 h-2 rounded-full bg-amber animate-ping-slow" />}
          <span className="text-text-primary tracking-widest uppercase font-semibold text-[11px]">Live Debate</span>
        </div>
        <span className={`text-[10px] font-semibold transition-colors ${isDone ? 'text-green' : isLive ? 'text-amber animate-pulse-status' : 'text-text-muted'}`}>
          {isDone ? '✓ Complete' : isLive ? '● In Progress' : 'Ready'}
        </span>
      </div>

      {/* Feed */}
      <div
        ref={feedRef}
        className="flex-1 p-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar max-h-[200px]"
      >
        {debateMessages.length === 0 ? (
          <div className="text-text-muted italic text-[10px] p-1">Waiting to convene council...</div>
        ) : (
          debateMessages.map((msg, i) => (
            <div
              key={msg.id ?? i}
              className={`flex gap-2 leading-tight border rounded-[3px] px-2 py-1 ${agentBg[msg.agent] ?? 'bg-surface border-border'}`}
            >
              <span className={`${agentColor[msg.agent] ?? 'text-text-secondary'} shrink-0 font-semibold`}>
                [R{msg.round}]
              </span>
              <span className={`${agentColor[msg.agent] ?? 'text-text-secondary'} shrink-0`}>
                [{msg.agent.slice(0, 4).toUpperCase()}]:
              </span>
              <span className="text-text-primary line-clamp-2">{msg.text}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer votes */}
      <div className="px-3 py-2 border-t border-border-strong bg-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {voteColors.map((color, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full border transition-all duration-500"
              style={{
                background: color !== 'transparent' ? color : 'transparent',
                borderColor: color !== 'transparent' ? color : 'var(--border-strong)',
                boxShadow: color !== 'transparent' ? `0 0 6px ${color}` : 'none',
              }}
            />
          ))}
        </div>
        <span className={`italic text-[10px] font-semibold transition-colors ${isDone ? 'text-green' : 'text-text-muted'}`}>
          {isDone ? 'Consensus reached' : phase === 'idle' ? '' : 'Deliberating...'}
        </span>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-strategist/30 via-amber/30 to-executor/30" />
    </div>
  );
}
