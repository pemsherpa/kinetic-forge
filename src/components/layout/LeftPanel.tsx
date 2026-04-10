import React from 'react';
import { ClaimForm } from '../form/ClaimForm';
import { ModelRegistry } from '../models/ModelRegistry';

export function LeftPanel() {
  return (
    <div className="w-[288px] h-full flex flex-col border-r-[0.5px] border-border-strong shrink-0 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col">
        <section className="flex flex-col relative px-4">
          <ClaimForm />
        </section>
        
        <div className="h-[1px] bg-border w-full my-4 relative flex justify-center">
          <span className="absolute -top-[7px] bg-surface px-2 text-[10px] font-mono text-amber tracking-widest uppercase">
            MODELS
          </span>
        </div>
        
        <section className="flex flex-col relative px-4 pb-4">
          <ModelRegistry />
        </section>
      </div>
    </div>
  );
}
