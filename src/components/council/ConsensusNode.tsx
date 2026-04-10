import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';
import { FullDialoguePanel } from './FullDialoguePanel';

export function ConsensusNode() {
  const { consensusResult, usedFallback, setShowDialogue, showDialogue } = useCouncilStore();

  if (!consensusResult) return null;

  const d = consensusResult.claimDecision;

  const statusColor = !d
    ? 'text-text-muted'
    : d.status === 'Approved'
      ? 'text-green'
      : d.status === 'Rejected'
        ? 'text-red'
        : 'text-amber';

  const severityColor = !d
    ? ''
    : d.damageSeverity === 'Major'
      ? 'text-red'
      : d.damageSeverity === 'Moderate'
        ? 'text-amber'
        : 'text-green';

  return (
    <div className="w-[320px] bg-elevated border-y border-r border-amber border-l-[3px] border-l-amber rounded-[6px] text-text-primary font-mono text-[11px] flex flex-col shadow-lg animate-in fade-in zoom-in duration-300">
      <Handle type="target" position={Position.Top} id="c-in" style={{ top: 0, opacity: 0 }} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-amber-dim bg-amber/5">
        <span className="font-heading font-medium tracking-wide text-amber uppercase">CONSENSUS</span>
        <div className="flex items-center gap-2">
          {usedFallback && (
            <span className="bg-amber-dim text-amber px-1.5 py-0.5 text-[9px] rounded uppercase border border-amber">
              Fallback
            </span>
          )}
          {d && (
            <span className={`font-bold uppercase text-[11px] ${statusColor}`}>{d.status}</span>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">

        {/* Claim Decision */}
        {d && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Payout</span>
              <span className={`font-heading text-[14px] ${d.status === 'Approved' ? 'text-green' : 'text-text-muted'}`}>
                ₹{d.estimatedPayout.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-center text-text-secondary">
              <span>Confidence</span>
              <div className="flex items-center gap-2">
                <div className="w-[60px] h-[4px] bg-surface rounded overflow-hidden">
                  <div
                    className={`h-full ${d.confidenceScore >= 0.8 ? 'bg-green' : d.confidenceScore >= 0.6 ? 'bg-amber' : 'bg-red'}`}
                    style={{ width: `${Math.round(d.confidenceScore * 100)}%` }}
                  />
                </div>
                <span className="text-text-primary">{Math.round(d.confidenceScore * 100)}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-text-secondary">
              <span>Damage Severity</span>
              <span className={severityColor}>{d.damageSeverity}</span>
            </div>

            <div className="flex justify-between items-center text-text-secondary">
              <span>Coverage Valid</span>
              <span className={d.coverageValid ? 'text-green' : 'text-red'}>
                {d.coverageValid ? 'Yes' : 'No'}
              </span>
            </div>

            {d.fraudIndicators.length > 0 && (
              <div className="bg-red/5 border border-red/20 rounded p-2 flex flex-col gap-0.5">
                <div className="text-red text-[9px] uppercase mb-0.5">Fraud Flags</div>
                {d.fraudIndicators.map((f, i) => (
                  <div key={i} className="text-red/80 text-[10px]">⚠ {f}</div>
                ))}
              </div>
            )}

            <div className="h-[0.5px] bg-amber/20 w-full" />

            <div className="text-text-secondary leading-relaxed text-[10px]">
              <span className="text-amber text-[9px] uppercase">Reason: </span>
              {d.reason}
            </div>

            <div className="bg-surface border border-border rounded p-2 text-[10px] text-text-secondary italic leading-relaxed">
              <span className="text-amber not-italic">Msg: </span>
              {d.customerMessage}
            </div>
          </>
        )}

        <div className="h-[0.5px] bg-amber/20 w-full" />

        {/* Pipeline meta */}
        <div className="flex justify-between items-center text-text-secondary">
          <span>Pipeline nodes</span>
          <span className="text-text-primary">{consensusResult.nodes.length}</span>
        </div>
        <div className="flex justify-between items-center text-text-secondary">
          <span>Parallel groups</span>
          <span className="text-text-primary">{consensusResult.parallelGroups.length}</span>
        </div>

        <div className="flex justify-between mt-1 text-[10px] text-amber">
          <button className="hover:text-amber-bright underline underline-offset-2" onClick={() => setShowDialogue(true)}>
            View Full Reasoning ↗
          </button>
          <button className="hover:text-amber-bright">Edit Plan ✎</button>
        </div>
      </div>

      {showDialogue && <FullDialoguePanel onClose={() => setShowDialogue(false)} />}
    </div>
  );
}
