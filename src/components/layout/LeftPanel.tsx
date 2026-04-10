import React from 'react';
import { ClaimForm } from '../form/ClaimForm';
import { ModelRegistry } from '../models/ModelRegistry';

export function LeftPanel() {
  return (
    <div className="w-[300px] h-full flex flex-col border-r border-border shrink-0 bg-surface/50 backdrop-blur-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
        <section className="flex flex-col gap-3 relative">
          <div className="absolute left-0 right-0 top-1/2 h-[0.5px] bg-amber z-0" />
          <div className="relative z-10 mx-auto bg-surface px-2 text-[10px] font-mono text-amber tracking-widest">
            INPUT
          </div>
        </section>
        <ClaimForm />
        
        <div className="h-[0.5px] bg-border-strong w-full my-2" />
        
        <ModelRegistry />
      </div>
    </div>
  );
}
