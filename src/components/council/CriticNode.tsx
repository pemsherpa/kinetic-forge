import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useModelStore } from '../../stores/modelStore';

export function CriticNode() {
  const { agentStatuses, debateMessages, agentModels, setShowDialogue } = useCouncilStore();
  const { models } = useModelStore();

  const status = agentStatuses.critic;
  const isThinking = status === 'THINKING' || status === 'OBJECTING';
  const isActive = status !== 'IDLE';

  const myMessages = debateMessages.filter((m) => m.agent === 'critic');
  const lastMsg = myMessages[myMessages.length - 1]?.text ?? '';

  const glowClass = isThinking
    ? 'node-glow-critic-pulse'
    : isActive
      ? 'node-glow-critic'
      : '';

  return (
    <div
      className={`w-[270px] relative bg-card/90 backdrop-blur-sm border-y border-l border-[rgba(249,115,22,0.35)] border-r-[3px] border-r-critic rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-2xl overflow-hidden transition-shadow duration-500 ${glowClass}`}
    >
      <Handle type="source" position={Position.Left} id="c1" style={{ top: '50%', background: 'var(--critic)', boxShadow: '0 0 6px var(--critic)' }} />

      {/* Holographic top bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-critic to-transparent opacity-80" />

      {/* Scan line overlay */}
      {isThinking && <div className="scanline-overlay scanline-critic" />}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(249,115,22,0.2)] bg-critic/5">
        <div
          className={`px-2 py-0.5 text-[9px] rounded-[3px] uppercase font-bold tracking-widest transition-all duration-300 ${
            status === 'IDLE'
              ? 'text-text-muted bg-transparent border border-border'
              : 'text-bg bg-critic shadow-[0_0_8px_var(--critic)]'
          }`}
        >
          {status}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading font-semibold tracking-widest text-critic text-[11px] uppercase">The Critic</span>
          <div className={`w-[8px] h-[8px] rounded-full bg-critic ${isThinking ? 'animate-ping-slow' : 'animate-pulse-status'}`} />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10 text-right">
        <div className="italic text-text-secondary text-[10px]">"The Edge Case Hunter"</div>
        <div className="h-[0.5px] bg-critic/20 w-full" />

        <div className="flex justify-between items-center text-text-secondary">
          <span className="text-critic text-[9px] shrink-0 mr-1 opacity-70">AUTO</span>
          <span className="truncate max-w-[170px] text-right text-[10px]" title={agentModels?.critic ?? ''}>
            {agentModels?.critic ?? '— no model —'}
          </span>
        </div>
        <div className="text-text-muted text-[10px] text-right">Role: pattern recognition · edge cases</div>
        <div className="h-[0.5px] bg-critic/20 w-full" />

        <div className="min-h-[48px]">
          {lastMsg ? (
            <div className="italic text-critic line-clamp-3 text-left text-[10px] leading-relaxed">
              {lastMsg}
            </div>
          ) : (
            <div className="text-text-muted italic opacity-40 text-[10px]">Monitoring proposals...</div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-1 text-[10px] text-text-secondary">
          <button className="hover:text-critic transition-colors" onClick={() => setShowDialogue(true)}>Full Dialogue ↗</button>
          <button className="hover:text-critic transition-colors">Edit ✎</button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-critic/40 to-transparent" />
    </div>
  );
}
