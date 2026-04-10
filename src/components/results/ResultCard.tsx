import React, { useState } from 'react';
import { ClaimInput } from '../../types';

interface ResultCardProps {
  claim: ClaimInput;
  status: string;
  confidence: number;
}

export function ResultCard({ claim, status, confidence }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-card border border-border-strong rounded flex flex-col font-mono text-[11px] overflow-hidden text-text-primary">
      <div className="p-3 border-b border-border-strong bg-surface">
        <div className="flex justify-between items-center mb-2">
          <span className="text-amber">{claim.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${status === 'Approved' ? 'bg-green/20 text-green border border-green/50' : 'bg-red/20 text-red border border-red/50'}`}>
            {status}
          </span>
        </div>
        <div className="font-heading text-[22px] tracking-tight">
          ₹{claim.amount.toLocaleString('en-IN')}
        </div>
        
        {/* Confidence bar */}
        <div className="w-full h-[3px] bg-surface rounded overflow-hidden mt-3 mb-1">
          <div 
            className={`h-full ${confidence > 90 ? 'bg-green' : confidence > 70 ? 'bg-amber' : 'bg-red'}`} 
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-text-muted">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
      </div>

      {/* Council Decision mini-section */}
      <div 
        className="px-3 py-2 border-b border-border-strong bg-surface cursor-pointer hover:bg-surface/80 flex items-center justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="text-[10px] text-amber">Council Decision</div>
          <div className="text-[9px] text-text-muted">Proposed by: Strategist · Challenged by: Critic · Finalized: 3/3 votes</div>
        </div>
        <span className={`text-[10px] text-amber transition-transform ${expanded ? 'rotate-180' : ''}`}>↓</span>
      </div>

      {expanded && (
        <div className="p-3 bg-bg flex flex-col gap-3">
          <div className="pl-2 border-l-2 border-amber italic text-text-secondary line-clamp-2 hover:line-clamp-none transition-all">
            "The claimant states: {claim.description}"
          </div>
          
          {/* Mock log for now */}
          <div className="bg-surface border border-border p-2 rounded text-[10px] flex flex-col gap-1">
            <div className="text-strategist">{">"} [STRATEGIST] Processing logic clear.</div>
            <div className="text-critic">{">"} [CRITIC] Verified against known fraud patterns.</div>
            <div className="text-executor">{">"} [EXECUTOR] Pipeline executed in 1.4s.</div>
            <div className="text-amber mt-1">Consensus: Validated and executed.</div>
          </div>
        </div>
      )}
    </div>
  );
}
