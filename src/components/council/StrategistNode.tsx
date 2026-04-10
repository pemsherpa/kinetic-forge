import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useModelStore } from '../../stores/modelStore';

export function StrategistNode() {
  const { agentStatuses, debateMessages, agentModels, setShowDialogue } = useCouncilStore();
  const { models } = useModelStore();

  const status = agentStatuses.strategist;
  const isThinking = status === 'THINKING';
  const isActive = status !== 'IDLE';

  const myMessages = debateMessages.filter((m) => m.agent === 'strategist');
  const lastMsg = myMessages[myMessages.length - 1]?.text ?? '';

  const glowClass = isThinking
    ? 'node-glow-strategist-pulse'
    : isActive
      ? 'node-glow-strategist'
      : '';

  return (
    <div
      className={`w-[270px] relative bg-card/90 backdrop-blur-sm border-y border-r border-[rgba(139,92,246,0.35)] border-l-[3px] border-l-strategist rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-2xl overflow-hidden transition-shadow duration-500 ${glowClass}`}
    >
      <Handle type="source" position={Position.Right} id="s1" style={{ top: '50%', background: 'var(--strategist)', boxShadow: '0 0 6px var(--strategist)' }} />

      {/* Holographic top bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-strategist to-transparent opacity-80" />

      {/* Scan line overlay (only when thinking) */}
      {isThinking && <div className="scanline-overlay scanline-strategist" />}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(139,92,246,0.2)] bg-strategist/5">
        <div className="flex items-center gap-2">
          <div className={`w-[8px] h-[8px] rounded-full bg-strategist ${isThinking ? 'animate-ping-slow' : 'animate-pulse-status'}`} />
          <span className="font-heading font-semibold tracking-widest text-strategist text-[11px] uppercase">Strategist</span>
        </div>
        <div
          className={`px-2 py-0.5 text-[9px] rounded-[3px] uppercase font-bold tracking-widest transition-all duration-300 ${
            status === 'IDLE'
              ? 'text-text-muted bg-transparent border border-border'
              : 'text-bg bg-strategist shadow-[0_0_8px_var(--strategist)]'
          }`}
        >
          {status}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10">
        <div className="italic text-text-secondary text-[10px]">"The Workflow Architect"</div>
        <div className="h-[0.5px] bg-strategist/20 w-full" />

        <div className="flex justify-between items-center text-text-secondary">
          <span className="truncate max-w-[170px] text-[10px]" title={agentModels?.strategist ?? ''}>
            {agentModels?.strategist ?? '— no model —'}
          </span>
          <span className="text-strategist text-[9px] shrink-0 ml-1 opacity-70">AUTO</span>
        </div>
        <div className="text-text-muted text-[10px]">Role: workflow design · step ordering</div>
        <div className="h-[0.5px] bg-strategist/20 w-full" />

        <div className="min-h-[48px]">
          {lastMsg ? (
            <div className="italic text-strategist line-clamp-3 text-[10px] leading-relaxed">
              {lastMsg}
            </div>
          ) : (
            <div className="text-text-muted italic opacity-40 text-[10px]">Waiting for claim data...</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-[10px] text-text-secondary">
          <button className="hover:text-strategist transition-colors">Edit ✎</button>
          <button className="hover:text-strategist transition-colors" onClick={() => setShowDialogue(true)}>Full Dialogue ↗</button>
        </div>
      </div>

      {/* Bottom holographic bar */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-strategist/40 to-transparent" />
    </div>
  );
}
