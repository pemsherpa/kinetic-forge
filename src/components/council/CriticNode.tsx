import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useModelStore } from '../../stores/modelStore';

export function CriticNode() {
  const { agentStatuses, debateMessages } = useCouncilStore();
  const { models } = useModelStore();
  
  const status = agentStatuses.critic;
  const isThinking = status === 'THINKING' || status === 'OBJECTING';
  
  const myMessages = debateMessages.filter(m => m.agent === 'critic');
  const lastMsg = myMessages[myMessages.length - 1]?.text || '';

  return (
    <div className={`w-[260px] bg-card border-y border-l border-[rgba(249,115,22,0.4)] border-r-[3px] border-r-critic rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-lg overflow-hidden relative ${isThinking ? 'animate-shimmer-orange' : ''}`}>
      <Handle type="source" position={Position.Left} id="c1" style={{ top: '50%', background: 'var(--critic)' }} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className={`px-1.5 py-0.5 text-[9px] rounded uppercase ${status === 'IDLE' ? 'text-text-muted bg-transparent' : 'text-bg bg-critic'}`}>
          {status}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-heading font-medium tracking-wide text-critic">THE CRITIC</span>
          <div className="w-[8px] h-[8px] rounded-full bg-critic" />
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10 text-right">
        <div className="italic text-text-secondary">"The Edge Case Hunter"</div>
        <div className="h-[0.5px] bg-border-strong w-full" />
        <div className="flex justify-between items-center text-text-secondary">
          <span className="text-critic text-[9px]">AUTO</span>
          <span>[mixtral-8x7b ▾] :Model</span>
        </div>
        <div className="text-text-muted">Role: pattern recognition · edge cases</div>
        <div className="h-[0.5px] bg-border-strong w-full" />
        
        <div className="min-h-[40px]">
          {lastMsg ? (
             <div className="italic text-critic line-clamp-3 text-left">
               {lastMsg}
             </div>
          ) : (
            <div className="text-text-muted italic opacity-50">Monitoring proposals...</div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-2 text-[10px] text-text-secondary">
          <button className="hover:text-amber">View Full Dialogue ↗</button>
          <button className="hover:text-amber">✎ Edit</button>
        </div>
      </div>
    </div>
  );
}
