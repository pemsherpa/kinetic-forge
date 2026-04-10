import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useModelStore } from '../../stores/modelStore';

export function ExecutorNode() {
  const { agentStatuses, debateMessages, agentModels, setShowDialogue } = useCouncilStore();
  const { models } = useModelStore();

  const status = agentStatuses.executor;
  const isThinking = status === 'THINKING' || status === 'PROPOSING';
  const isActive = status !== 'IDLE';

  const myMessages = debateMessages.filter((m) => m.agent === 'executor');
  const lastMsg = myMessages[myMessages.length - 1]?.text ?? '';

  const glowClass = isThinking
    ? 'node-glow-executor-pulse'
    : isActive
      ? 'node-glow-executor'
      : '';

  return (
    <div
      className={`w-[270px] relative bg-card/90 backdrop-blur-sm border-[rgba(20,184,166,0.35)] border-y border-r border-l-[3px] border-l-executor rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-2xl overflow-hidden transition-shadow duration-500 ${glowClass}`}
    >
      <Handle type="source" position={Position.Right} id="e1" style={{ top: '50%', background: 'var(--executor)', boxShadow: '0 0 6px var(--executor)' }} />

      {/* Holographic top bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-executor to-transparent opacity-80" />

      {/* Scan line overlay */}
      {isThinking && <div className="scanline-overlay scanline-executor" />}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(20,184,166,0.2)] bg-executor/5">
        <div className="flex items-center gap-2">
          <div className={`w-[8px] h-[8px] rounded-full bg-executor ${isThinking ? 'animate-ping-slow' : 'animate-pulse-status'}`} />
          <span className="font-heading font-semibold tracking-widest text-executor text-[11px] uppercase">The Executor</span>
        </div>
        <div
          className={`px-2 py-0.5 text-[9px] rounded-[3px] uppercase font-bold tracking-widest transition-all duration-300 ${
            status === 'IDLE'
              ? 'text-text-muted bg-transparent border border-border'
              : 'text-bg bg-executor shadow-[0_0_8px_var(--executor)]'
          }`}
        >
          {status}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10">
        <div className="italic text-text-secondary text-[10px]">"The Pragmatist"</div>
        <div className="h-[0.5px] bg-executor/20 w-full" />

        <div className="flex justify-between items-center text-text-secondary">
          <span className="truncate max-w-[170px] text-[10px]" title={agentModels?.executor ?? ''}>
            {agentModels?.executor ?? '— no model —'}
          </span>
          <span className="text-executor text-[9px] shrink-0 ml-1 opacity-70">AUTO</span>
        </div>
        <div className="text-text-muted text-[10px]">Role: feasibility · latency routing</div>
        <div className="h-[0.5px] bg-executor/20 w-full" />

        <div className="min-h-[48px]">
          {lastMsg ? (
            <div className="italic text-executor line-clamp-3 text-[10px] leading-relaxed">
              {lastMsg}
            </div>
          ) : (
            <div className="text-text-muted italic opacity-40 text-[10px]">Awaiting consensus data...</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-[10px] text-text-secondary">
          <button className="hover:text-executor transition-colors">Edit ✎</button>
          <button className="hover:text-executor transition-colors" onClick={() => setShowDialogue(true)}>Full Dialogue ↗</button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-executor/40 to-transparent" />
    </div>
  );
}
