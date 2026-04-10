import React from 'react';
import { PipelineCanvas } from './PipelineCanvas';
import { useWorkflowStore } from '../../stores/workflowStore';
import { useClaimsStore } from '../../stores/claimsStore';

export function PipelineTab() {
  const { isExecuting, resetExecution, executeAll } = useWorkflowStore();
  const { currentClaim } = useClaimsStore();

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="h-[44px] border-b-[0.5px] border-border bg-surface px-[16px] flex items-center gap-[8px] shrink-0">
        <button className="h-[28px] px-[12px] border-[0.5px] border-border-strong bg-elevated text-text-secondary rounded-[4px] font-mono text-[11px] hover:text-text-primary hover:border-border-active transition-colors">
          + Add Node
        </button>
        <button className="h-[28px] px-[12px] border-[0.5px] border-border-strong bg-elevated text-text-secondary rounded-[4px] font-mono text-[11px] hover:text-text-primary hover:border-border-active transition-colors">
          Export JSON
        </button>
        <button className="h-[28px] px-[12px] border-[0.5px] border-border-strong bg-elevated text-text-secondary rounded-[4px] font-mono text-[11px] hover:text-text-primary hover:border-border-active transition-colors">
          Import JSON
        </button>
        <button 
          onClick={resetExecution}
          className="h-[28px] px-[12px] border-[0.5px] border-border-strong bg-elevated text-text-secondary rounded-[4px] font-mono text-[11px] hover:text-text-primary hover:border-border-active transition-colors"
        >
          Reset
        </button>
        
        <button 
          disabled={isExecuting || !currentClaim}
          onClick={() => currentClaim && executeAll(currentClaim)}
          className="ml-auto h-[28px] px-[12px] bg-amber text-[#080808] border-none rounded-[4px] font-display font-semibold text-[11px] cursor-pointer hover:brightness-105 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isExecuting ? (
            <>
              <div className="spin-ring scale-[0.6] origin-center -ml-1 border-bg" />
              <span>Executing...</span>
            </>
          ) : (
            <span>▶ Execute</span>
          )}
        </button>
      </div>

      <div className="flex-1 relative bg-bg panel-texture">
         <PipelineCanvas />
      </div>
    </div>
  );
}
