import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { useModelStore } from '../../stores/modelStore';

export function ExecutorNode() {
  const { agentStatuses, debateMessages } = useCouncilStore();
  const { models } = useModelStore();
  
  const status = agentStatuses.executor;
  const isThinking = status === 'THINKING';
  
  const myMessages = debateMessages.filter(m => m.agent === 'executor');
  const lastMsg = myMessages[myMessages.length - 1]?.text || '';

  return (
    <div className={`w-[260px] bg-card border-[rgba(20,184,166,0.4)] border-y border-r border-l-[3px] border-l-executor rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-lg overflow-hidden relative`}>
      <Handle type="source" position={Position.Right} id="e1" style={{ top: '50%', background: 'var(--executor)' }} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-[8px] h-[8px] rounded-full bg-executor" />
          <span className="font-heading font-medium tracking-wide text-executor">THE EXECUTOR</span>
        </div>
        <div className={`px-1.5 py-0.5 text-[9px] rounded uppercase ${status === 'IDLE' ? 'text-text-muted bg-transparent' : 'text-bg bg-executor'}`}>
          {status}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10">
        <div className="italic text-text-secondary">"The Pragmatist"</div>
        <div className="h-[0.5px] bg-border-strong w-full" />
        <div className="flex justify-between items-center text-text-secondary">
          <span>Model: [llama-3.1 ▾]</span>
          <span className="text-executor text-[9px]">AUTO</span>
        </div>
        <div className="text-text-muted">Role: feasibility · latency routing</div>
        <div className="h-[0.5px] bg-border-strong w-full" />
        
        <div className="min-h-[40px]">
          {lastMsg ? (
             <div className="italic text-executor line-clamp-3">
               {lastMsg}
             </div>
          ) : (
            <div className="text-text-muted italic opacity-50">Awaiting consensus data...</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-text-secondary">
          <button className="hover:text-amber">Edit ✎</button>
          <button className="hover:text-amber">View Full Dialogue ↗</button>
        </div>
      </div>
    </div>
  );
}
