import React, { useEffect } from 'react';
import { useModelStore } from '../../stores/modelStore';

export function ModelRegistry() {
  const { models, isDetecting, autoDetect } = useModelStore();

  useEffect(() => {
    // on component mount auto-detect
    autoDetect();
  }, [autoDetect]);

  return (
    <div className="flex flex-col gap-3 font-mono text-[12px] text-text-primary mt-2">
      {isDetecting && (
        <div className="text-amber text-[10px] animate-pulse">Detecting models...</div>
      )}

      <div className="flex flex-col border-[0.5px] border-border rounded-[4px] overflow-hidden">
         {models.length === 0 ? (
           <div className="text-center text-text-muted text-[12px] p-4">
             No models detected. Add one or start Ollama.
           </div>
         ) : (
           models.map((model) => (
             <div key={model.id} className="h-[38px] border-b-[0.5px] border-border last:border-0 flex items-center justify-between px-[12px] gap-[8px] hover:bg-surface transition-colors cursor-default group">
               
               <div className="flex items-center gap-[8px] overflow-hidden">
                 <div className="w-[7px] h-[7px] rounded-full bg-green animate-pulse-status shrink-0" />
                 <span className="truncate max-w-[130px]" title={model.name}>{model.name}</span>
               </div>
               
               <div className="flex items-center gap-[8px] shrink-0">
                  {model.provider === 'OpenRouter' && (
                    <span className="bg-amber-dim text-amber px-[6px] py-[2px] rounded-[3px] text-[10px]">OR</span>
                  )}
                  {model.provider === 'Ollama' && (
                    <span className="bg-executor-dim text-executor px-[6px] py-[2px] rounded-[3px] text-[10px]">OL</span>
                  )}
                  {model.provider === 'Custom' && (
                    <span className="bg-[rgba(59,130,246,0.1)] text-blue px-[6px] py-[2px] rounded-[3px] text-[10px]">CUST</span>
                  )}
                  
                  <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    ···
                  </button>
               </div>
             </div>
           ))
         )}
      </div>

      <button
        onClick={() => autoDetect()}
        className="w-full h-[28px] border-[0.5px] border-border-strong bg-transparent text-text-secondary font-mono text-[11px] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors hover:text-amber hover:border-amber"
      >
        {isDetecting ? <span className="animate-pulse">Scanning...</span> : '↻ Refresh'}
      </button>
    </div>
  );
}
