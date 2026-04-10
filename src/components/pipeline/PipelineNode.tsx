import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ConsensusNode } from '../../types';
import { useWorkflowStore } from '../../stores/workflowStore';

const NODE_TYPES: Record<string, { color: string, label: string, tag: string }> = {
  intake:         { color: '#71717A', label: 'INTAKE',         tag: 'general' },
  coverage:       { color: '#3B82F6', label: 'COVERAGE CHECK', tag: 'analysis' },
  fraud:          { color: '#EF4444', label: 'FRAUD DETECTOR', tag: 'analysis' },
  vision:         { color: '#14B8A6', label: 'VISION AI',      tag: 'vision' },
  gate:           { color: '#F59E0B', label: 'DECISION GATE',  tag: 'reasoning' },
  payout:         { color: '#10B981', label: 'PAYOUT ENGINE',  tag: 'efficiency' },
  confidence:     { color: '#8B5CF6', label: 'CONFIDENCE',     tag: 'reasoning' },
  communication:  { color: '#3B82F6', label: 'COMMS AGENT',    tag: 'communication' },
  output:         { color: '#71717A', label: 'OUTPUT',         tag: 'general' },
};

export function PipelineNode({ data }: { data: { config: ConsensusNode } }) {
  const { config } = data;
  const { nodeStatuses, nodeResults, removeNode } = useWorkflowStore();
  
  const status = nodeStatuses[config.id] || 'IDLE';
  const result = nodeResults[config.id];
  
  const isRunning = status === 'RUNNING';
  const isDone = status === 'DONE';
  const isSkipped = status === 'SKIPPED';
  
  const typeMeta = NODE_TYPES[config.type] || NODE_TYPES.intake;

  return (
    <div 
      className={`w-[260px] bg-card border-[0.5px] border-border-strong rounded-[8px] font-mono flex flex-col shadow-lg transition-all ${isRunning ? 'border-amber shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''} ${isSkipped ? 'opacity-50' : ''}`}
      style={{ borderLeft: `3px solid ${typeMeta.color}` }}
    >
      <Handle type="target" position={Position.Top} id="in" style={{ top: -1 }} />
      
      {/* Header */}
      <div className={`h-[36px] px-[12px] flex items-center gap-[8px] border-b-[0.5px] border-border-strong ${config.type === 'gate' && result ? 'bg-amber-dim' : ''}`}>
        <div className={`w-[8px] h-[8px] rounded-full shrink-0 ${isRunning ? 'bg-amber animate-pulse' : isDone ? 'bg-green' : isSkipped ? 'bg-text-secondary' : 'bg-surface border border-border'}`} />
        <span className="font-display font-semibold text-[11px] text-text-primary uppercase tracking-[0.08em] truncate">
          {typeMeta.label}
        </span>
        <div className="ml-auto text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface text-text-muted">
          {status}
        </div>
      </div>

      {/* Body */}
      <div className="p-[10px_12px] flex flex-col">
        {config.conditional && (
          <div className="text-[10px] text-amber mb-1">(conditional)</div>
        )}
        <div className="text-text-secondary text-[11px] leading-[1.4] line-clamp-2 max-h-[3.2em] break-words whitespace-pre-wrap">
          {config.systemPromptHint}
        </div>

        {/* Dynamic Results */}
        {isDone && result && (
          <div className="bg-surface border-[0.5px] border-border rounded-[4px] p-[8px_10px] mt-[8px] flex flex-col text-[11px]">
            {config.type === 'gate' ? (
               <div className={`font-display text-[14px] font-semibold text-center py-2 ${(result.branch || '').toUpperCase() === 'APPROVED' ? 'text-green' : 'text-red'}`}>
                 {(result.branch || 'PENDING').toUpperCase()}
               </div>
            ) : config.type === 'output' ? (
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-text-secondary">Status</span>
                   <span className={result.status === 'Approved' ? 'text-green' : 'text-red'}>{result.status}</span>
                 </div>
                 <div className="font-display text-[18px] text-amber tracking-tight mt-1 mb-1">
                   ₹{(result.confidence || 0).toLocaleString()} <span className="text-[10px] text-text-muted top-[-4px] relative">Est. Payout</span>
                 </div>
                 <div className="w-full h-[3px] bg-bg rounded overflow-hidden">
                   <div className={`h-full ${result.confidenceScore > 80 ? 'bg-green' : 'bg-amber'}`} style={{ width: `${result.confidenceScore || 0}%` }} />
                 </div>
                 <div className="mt-2 pl-2 border-l-[2px] border-amber font-mono text-[10px] text-text-secondary italic whitespace-pre-wrap break-words max-h-[80px] overflow-y-auto custom-scrollbar">
                   {result.message}
                 </div>
               </div>
            ) : (
               Object.keys(result).slice(0, 3).map((k) => (
                 <div key={k} className="flex gap-2">
                   <span className="text-text-secondary">{k}:</span>
                   <span className="text-text-primary break-all">{String(result[k])}</span>
                 </div>
               ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-[32px] border-t-[0.5px] border-border flex items-center px-[10px] gap-[6px]">
        <span className="text-[10px] text-text-muted truncate max-w-[100px]">auto-detect</span>
        <span className="bg-amber-dim text-amber rounded-[2px] px-[4px] py-[1px] text-[9px]">auto</span>
        
        <button className="ml-auto text-[10px] text-text-secondary hover:text-amber">Edit ✎</button>
        <button onClick={() => removeNode(config.id)} className="text-[10px] text-text-secondary hover:text-red transition-colors w-[16px] flex justify-center items-center">×</button>
      </div>

      <Handle type="source" position={Position.Bottom} id="out" style={{ bottom: -1 }} />
    </div>
  );
}
