import React, { useState } from 'react';
import { useModelStore } from '../../stores/modelStore';
// import { AddModelDialog } from './AddModelDialog';

export function ModelRegistry() {
  const { models } = useModelStore();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col gap-3 font-mono text-[12px] text-text-primary">
      <div className="text-amber text-[10px] tracking-widest uppercase">
        MODELS
      </div>

      <div className="flex flex-col border border-border-strong rounded overflow-hidden">
        {models.map((model) => (
          <div key={model.id} className="h-[36px] border-b border-border-strong last:border-0 flex items-center justify-between px-2 hover:bg-surface transition-colors cursor-default group">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green" />
              <span className="truncate max-w-[120px]" title={model.name}>{model.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
               {model.provider === 'OpenRouter' && (
                 <span className="bg-amber-dim text-amber px-1 rounded text-[9px]">OR</span>
               )}
               {model.provider === 'Ollama' && (
                 <span className="bg-executor-dim text-executor px-1 rounded text-[9px]">OL</span>
               )}
               <button className="text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                 ···
               </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => setShowAdd(true)}
        className="w-full h-[32px] border border-dashed border-amber/50 text-amber hover:bg-amber-dim/50 rounded flex items-center justify-center transition-colors"
      >
        ± Add Model
      </button>

      {/* TODO: Placeholder for live benchmarks */}
      <div className="mt-2 text-[10px] text-amber cursor-pointer hover:text-amber-bright">
        LIVE BENCHMARKS ↓
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-[400px] border border-border-strong rounded p-4 flex flex-col gap-4">
            <h2 className="text-amber">Add New Model</h2>
            <div className="text-text-muted text-[11px] mb-4">Implementation placeholder for AddModelDialog</div>
            <button className="bg-surface border border-border-strong py-1" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
