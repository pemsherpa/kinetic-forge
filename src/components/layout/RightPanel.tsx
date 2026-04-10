import React from 'react';
import { useClaimsStore } from '../../stores/claimsStore';
import { ResultCard } from '../results/ResultCard';

export function RightPanel() {
  const { results } = useClaimsStore();

  return (
    <div className="w-[360px] h-full flex flex-col border-l border-border shrink-0 bg-surface/50 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-heading text-[12px] uppercase text-text-secondary tracking-widest">
          Results & Reasoning
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {results.length === 0 ? (
          <div className="text-center text-text-muted font-mono text-[12px] mt-10">
            No claims processed yet.
          </div>
        ) : (
          results.map((r, i) => (
            <ResultCard key={i} claim={r.claim} status={r.status} confidence={r.confidence} />
          ))
        )}
      </div>
    </div>
  );
}
