import React, { useState } from 'react';
import { useClaimsStore } from '../../stores/claimsStore';
import { useCouncilStore } from '../../stores/councilStore';
import { exampleClaims } from '../../data/exampleClaims';
import { processClaim } from '../../api/processClaim';

export function ClaimForm() {
  const { setActiveClaim } = useClaimsStore();
  const { startDebate, isDebating } = useCouncilStore();
  
  const [claim, setClaim] = useState(exampleClaims['C1']);

  const handleSubmit = async () => {
    setActiveClaim(claim);
    import('../../council/runDebate').then(async (m) => {
      const consensus = await m.runDebate(claim);
      // after debate, process the claim:
      const { useWorkflowStore } = await import('../../stores/workflowStore');
      useWorkflowStore.getState().setIsRunning(true);
      const result = await processClaim(claim, consensus);
      useWorkflowStore.getState().setIsRunning(false);
      useClaimsStore.getState().addResult({ claim, ...result });
    });
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-[13px] text-text-primary">
      <div className="flex justify-between items-center text-amber text-[10px] uppercase">
        <label>Load Example ↓</label>
        <select 
          className="bg-transparent border-b border-amber outline-none cursor-pointer"
          onChange={(e) => setClaim(exampleClaims[e.target.value])}
        >
          <option value="C1" className="bg-surface text-green">C1 - Clean Baseline</option>
          <option value="C2" className="bg-surface text-red">C2 - Mismatch Risk</option>
          <option value="C3" className="bg-surface text-red">C3 - Fraud Risk</option>
          <option value="C4" className="bg-surface text-amber">C4 - Missing Docs</option>
          <option value="C5" className="bg-surface text-blue">C5 - Vision Test</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-heading text-[10px] text-text-secondary uppercase tracking-widest">Claim ID</label>
        <input 
          type="text" 
          value={claim.id} 
          onChange={(e) => setClaim({ ...claim, id: e.target.value })}
          className="bg-transparent border border-border-strong rounded py-1 px-2 focus:border-amber focus:ring-1 focus:ring-amber-dim outline-none transition-all" 
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-heading text-[10px] text-text-secondary uppercase tracking-widest">Description</label>
        <textarea 
          rows={3} 
          value={claim.description} 
          onChange={(e) => setClaim({ ...claim, description: e.target.value })}
          className="bg-transparent border border-border-strong rounded py-1 px-2 focus:border-amber focus:ring-1 focus:ring-amber-dim outline-none transition-all thin-scrollbar" 
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-heading text-[10px] text-text-secondary uppercase tracking-widest">Amount</label>
        <div className="relative">
          <span className="absolute left-2 top-1.5 text-amber">₹</span>
          <input 
            type="number" 
            value={claim.amount} 
            onChange={(e) => setClaim({ ...claim, amount: Number(e.target.value) })}
            className="w-full bg-transparent border border-border-strong rounded py-1 pl-6 pr-2 focus:border-amber focus:ring-1 focus:ring-amber-dim outline-none transition-all" 
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-heading text-[10px] text-text-secondary uppercase tracking-widest">Documents</label>
        <div className="flex gap-2">
          {['Complete', 'Partial', 'Missing'].map((docState) => {
            const isActive = docState === 'Complete' ? claim.documentsComplete : docState === 'Partial' ? claim.documentsPartial : claim.documentsMissing;
            return (
              <button
                key={docState}
                className={`flex-1 py-1 px-2 rounded border text-[11px] transition-colors ${isActive ? 'bg-amber-dim border-amber text-amber' : 'bg-transparent border-border-strong text-text-muted hover:border-amber-dim'}`}
                onClick={() => setClaim({
                  ...claim,
                  documentsComplete: docState === 'Complete',
                  documentsPartial: docState === 'Partial',
                  documentsMissing: docState === 'Missing',
                })}
              >
                {docState}
              </button>
            )
          })}
        </div>
      </div>

      <button 
        disabled={isDebating}
        onClick={handleSubmit} 
        className="w-full h-[40px] bg-amber text-bg font-heading font-medium text-[13px] rounded mt-4 hover:bg-amber-bright transition-colors disabled:opacity-50 relative overflow-hidden"
      >
        {isDebating ? (
          <span className="animate-pulse">Convening council...</span>
        ) : (
          <span>Convening council...</span>
        )}
      </button>

      <button className="text-amber text-[10px] text-center mt-2 hover:text-amber-bright">
        Batch — 5 claims →
      </button>
    </div>
  );
}
