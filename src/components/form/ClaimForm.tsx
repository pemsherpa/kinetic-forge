import React, { useState } from 'react';
import { useClaimsStore } from '../../stores/claimsStore';
import { exampleClaims } from '../../data/exampleClaims';

export function ClaimForm() {
  const { setActiveClaim } = useClaimsStore();
  const [claim, setClaim] = useState(exampleClaims['C1']);
  const [showPolicyDrop, setShowPolicyDrop] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = async () => {
    setActiveClaim(claim);
    // Council API execution logic is deferred to the run button in the center panel for the new spec
    // Wait, the spec says: "Submit button... text = 'Convening council...' ... Disabled state during processing"
    const { useCouncilStore } = await import('../../stores/councilStore');
    useCouncilStore.getState().startDebate(claim);
  };

  const isDebating = false; // derive from store if needed

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex justify-between items-end mb-1">
        <label className="font-mono text-[10px] text-amber tracking-[0.12em] uppercase">Claim Input</label>
        
        <div className="relative">
          <button 
            className="text-amber font-mono text-[11px] hover:text-amber-bright"
            onClick={() => setShowExamples(!showExamples)}
          >
            Load Example ↓
          </button>
          
          {showExamples && (
            <div className="absolute right-0 top-full mt-1 w-[200px] bg-elevated border-[0.5px] border-border-strong rounded-[6px] z-50 overflow-hidden shadow-lg">
              {Object.entries(exampleClaims).map(([key, c]) => (
                <div 
                  key={key}
                  className="px-3 py-2 text-[11px] font-mono hover:bg-amber-dim cursor-pointer flex items-center gap-2"
                  onClick={() => { setClaim(c); setShowExamples(false); }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${c.amount > 500000 ? 'bg-red' : c.amount < 30000 ? 'bg-green' : 'bg-amber'}`} />
                  <span className="truncate">{c.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Claim ID</label>
        <input 
          type="text" 
          placeholder="C-001"
          value={claim.id} 
          onChange={(e) => setClaim({ ...claim, id: e.target.value })}
          className="bg-transparent border-[0.5px] border-border-strong rounded-[4px] font-mono text-[13px] text-text-primary px-[10px] py-[7px] w-full transition-colors focus:border-amber focus:shadow-[0_0_0_2px_var(--amber-dim)] outline-none" 
        />
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Description</label>
        <textarea 
          rows={3} 
          value={claim.description} 
          onChange={(e) => setClaim({ ...claim, description: e.target.value })}
          className="bg-transparent border-[0.5px] border-border-strong rounded-[4px] font-mono text-[13px] text-text-primary px-[10px] py-[7px] w-full transition-colors focus:border-amber focus:shadow-[0_0_0_2px_var(--amber-dim)] outline-none resize-none custom-scrollbar" 
        />
      </div>

      <div className="flex flex-col mb-3 relative">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Policy Type</label>
        <button 
          className="bg-transparent border-[0.5px] border-border-strong rounded-[4px] font-mono text-[13px] text-text-primary px-[10px] py-[7px] w-full transition-colors text-left flex justify-between items-center"
          onClick={() => setShowPolicyDrop(!showPolicyDrop)}
        >
          {claim.type}
          <span className="text-[10px] text-text-muted">▼</span>
        </button>

        {showPolicyDrop && (
          <div className="absolute top-[50px] left-0 right-0 bg-elevated border-[0.5px] border-border-strong rounded-[6px] z-50 overflow-hidden shadow-lg">
            {['Comprehensive', 'Third-Party'].map(t => (
              <div 
                key={t}
                className="h-[32px] hover:bg-amber-dim font-mono text-[13px] flex items-center justify-between px-[10px] cursor-pointer"
                onClick={() => { setClaim({ ...claim, type: t }); setShowPolicyDrop(false); }}
              >
                <span>{t}</span>
                {claim.type === t && <span className="text-amber">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Claim Amount</label>
        <div className="relative">
          <span className="absolute left-[10px] top-[8px] text-amber font-mono text-[13px]">₹</span>
          <input 
            type="number" 
            value={claim.amount || ''} 
            onChange={(e) => setClaim({ ...claim, amount: Number(e.target.value) })}
            className="bg-transparent border-[0.5px] border-border-strong rounded-[4px] font-mono text-[13px] text-text-primary pl-[28px] pr-[10px] py-[7px] w-full transition-colors focus:border-amber focus:shadow-[0_0_0_2px_var(--amber-dim)] outline-none" 
          />
        </div>
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Past Claims</label>
        <div className="flex flex-row items-center">
          <button 
            className="w-[24px] h-[24px] border-[0.5px] border-border-strong rounded-[3px] text-amber hover:bg-amber-dim flex items-center justify-center font-mono"
            onClick={() => setClaim(c => ({ ...c, pastClaims: Math.max(0, c.pastClaims - 1) }))}
          >−</button>
          <div className="min-w-[32px] text-center font-mono text-[14px] text-text-primary">{claim.pastClaims}</div>
          <button 
            className="w-[24px] h-[24px] border-[0.5px] border-border-strong rounded-[3px] text-amber hover:bg-amber-dim flex items-center justify-center font-mono"
            onClick={() => setClaim(c => ({ ...c, pastClaims: c.pastClaims + 1 }))}
          >+</button>
        </div>
      </div>

      <div className="flex flex-col mb-3">
        <label className="font-display text-[10px] text-text-secondary uppercase tracking-[0.1em] mb-1">Documents</label>
        <div className="flex gap-[6px]">
          {['Complete', 'Partial', 'Missing'].map((docState) => {
            const isActive = docState === 'Complete' ? claim.documentsComplete : docState === 'Partial' ? claim.documentsPartial : claim.documentsMissing;
            return (
              <button
                key={docState}
                className={`py-[5px] px-[10px] rounded-[4px] border-[0.5px] font-mono text-[12px] transition-colors flex-1 text-center 
                  ${isActive 
                    ? 'bg-amber-dim border-amber text-amber' 
                    : 'bg-transparent border-border-strong text-text-secondary hover:border-amber-dim'}`}
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
        className="mt-4 w-full h-[40px] bg-amber text-[#080808] font-display font-semibold text-[13px] rounded-[5px] border-none cursor-pointer hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 relative flex items-center justify-center gap-2"
      >
        {isDebating ? (
          <>
            <div className="spin-ring" />
            <span>Convening council...</span>
          </>
        ) : (
          <span>Convening council...</span>
        )}
      </button>

      <div className="mt-2 text-center">
        <button className="text-amber font-mono text-[11px] hover:text-amber-bright">
          Batch — 5 claims →
        </button>
      </div>
    </div>
  );
}
