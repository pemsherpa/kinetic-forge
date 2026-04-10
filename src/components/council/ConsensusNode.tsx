import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';

export function ConsensusNode() {
  const { consensusResult, usedFallback } = useCouncilStore();

  if (!consensusResult) return null;

  return (
    <div className="w-[300px] bg-elevated border-y border-r border-amber border-l-[3px] border-l-amber rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-lg animate-in fade-in zoom-in duration-300">
      <Handle type="target" position={Position.Top} id="c-in" style={{ top: 0, opacity: 0 }} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-dim bg-amber/5">
        <span className="font-heading font-medium tracking-wide text-amber uppercase">CONSENSUS</span>
        {usedFallback && (
          <span className="bg-amber-dim text-amber px-1.5 py-0.5 text-[9px] rounded uppercase border border-amber">
            Fallback
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-2 relative z-10">
        <div className="flex justify-between items-center text-text-secondary">
          <span>Workflow agreed:</span>
          <span className="text-text-primary">{consensusResult.nodes.length} nodes</span>
        </div>
        <div className="flex justify-between items-center text-text-secondary">
          <span>Parallel groups:</span>
          <span className="text-text-primary">{consensusResult.parallelGroups.length}</span>
        </div>
        <div className="flex justify-between items-center text-text-secondary">
          <span>Status:</span>
          <span className="text-green">Locked</span>
        </div>
        
        <div className="h-[0.5px] bg-amber/20 w-full my-1" />
        
        <div className="flex justify-between mt-2 text-[10px] text-amber">
          <button className="hover:text-amber-bright">View Full Reasoning</button>
          <button className="hover:text-amber-bright">Edit Plan ✎</button>
        </div>
      </div>
    </div>
  );
}
