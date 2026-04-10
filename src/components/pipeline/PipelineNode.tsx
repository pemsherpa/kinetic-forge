import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ConsensusNode } from '../../types';

export function PipelineNode({ data }: { data: { config: ConsensusNode; status?: string } }) {
  const { config, status = 'IDLE' } = data;
  
  const isRunning = status === 'RUNNING';
  const isDone = status === 'DONE';

  return (
    <div className={`w-[260px] bg-card border border-border-strong rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-lg overflow-hidden relative ${isRunning ? 'animate-pulse-amber-ring' : ''} ${isDone ? 'border-green' : ''}`}>
      <Handle type="target" position={Position.Top} id="in" style={{ top: 0 }} />
      
      {/* Attribution Badge */}
      <div className="absolute -top-[10px] right-2 bg-amber-dim border border-amber px-1 rounded uppercase text-[9px] text-amber tracking-widest z-20">
        COUNCIL
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className={`w-[8px] h-[8px] rounded-full ${isDone ? 'bg-green' : isRunning ? 'bg-amber' : 'bg-surface border border-border'}`} />
          <span className="font-heading font-medium tracking-wide">{config.label}</span>
        </div>
        <div className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface text-text-muted">
          {config.type}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 z-10">
        {config.conditional && (
          <div className="text-[10px] text-amber/80 font-mono mb-1">(conditional: {config.conditionNote})</div>
        )}
        <div className="text-text-secondary text-[11px] leading-tight">
          {config.systemPromptHint}
        </div>

        <div className="h-[0.5px] bg-border-strong w-full my-1" />
        
        <div className="flex justify-between items-center text-[10px] text-text-muted">
          <span>Model: auto ▾</span>
          <div className="flex gap-2">
            <button className="hover:text-amber transition-colors">✎ Edit</button>
            <button className="hover:text-red transition-colors">× Remove</button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="out" style={{ bottom: 0 }} />
    </div>
  );
}
