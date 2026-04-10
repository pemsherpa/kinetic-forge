import React, { useState } from 'react';
import { ClaimResult } from '../../stores/claimsStore';

interface ResultCardProps {
  result: ClaimResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const { claim, status, confidence, estimatedPayout, reason, customerMessage, damageSeverity, fraudIndicators, debateMessages } = result;
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    status === 'Approved'
      ? 'bg-green/20 text-green border-green/50'
      : status === 'Rejected'
        ? 'bg-red/20 text-red border-red/50'
        : 'bg-amber/20 text-amber border-amber/50';

  const severityColor =
    damageSeverity === 'Major'
      ? 'text-red'
      : damageSeverity === 'Moderate'
        ? 'text-amber'
        : 'text-green';

  const agentColors: Record<string, string> = {
    strategist: 'text-strategist',
    critic: 'text-critic',
    executor: 'text-executor',
  };

  return (
    <div className="w-full bg-card border border-border-strong rounded-[6px] flex flex-col font-mono text-[11px] overflow-hidden text-text-primary">

      {/* Header */}
      <div className="p-3 border-b border-border-strong bg-surface">
        <div className="flex justify-between items-center mb-1">
          <span className="text-amber font-semibold">{claim.id}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${statusColor}`}>
            {status}
          </span>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div className="font-heading text-[20px] tracking-tight">₹{claim.amount.toLocaleString('en-IN')}</div>
          {estimatedPayout !== undefined && (
            <div className="text-right">
              <div className="text-text-muted text-[9px]">Payout</div>
              <div className={`font-heading text-[16px] ${status === 'Approved' ? 'text-green' : 'text-text-muted'}`}>
                ₹{estimatedPayout.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        {/* Confidence bar */}
        <div className="w-full h-[3px] bg-surface rounded overflow-hidden mt-2 mb-1">
          <div
            className={`h-full transition-all ${confidence > 80 ? 'bg-green' : confidence > 60 ? 'bg-amber' : 'bg-red'}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-text-muted">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-3 py-2 border-b border-border-strong flex gap-3 flex-wrap text-[10px]">
        <span className="text-text-secondary">Policy: <span className="text-text-primary">{claim.type}</span></span>
        {damageSeverity && (
          <span className="text-text-secondary">Damage: <span className={severityColor}>{damageSeverity}</span></span>
        )}
        <span className="text-text-secondary">Docs: <span className="text-text-primary">{claim.documentsComplete ? 'Complete' : claim.documentsPartial ? 'Partial' : 'Missing'}</span></span>
        <span className="text-text-secondary">Past: <span className={claim.pastClaims > 3 ? 'text-red' : 'text-text-primary'}>{claim.pastClaims}</span></span>
      </div>

      {/* Fraud indicators */}
      {fraudIndicators && fraudIndicators.length > 0 && (
        <div className="px-3 py-2 border-b border-border-strong bg-red/5">
          <div className="text-[9px] text-red uppercase mb-1">Flags</div>
          {fraudIndicators.map((f, i) => (
            <div key={i} className="text-[10px] text-red/80">⚠ {f}</div>
          ))}
        </div>
      )}

      {/* Reason */}
      {reason && (
        <div className="px-3 py-2 border-b border-border-strong">
          <div className="text-[9px] text-amber uppercase mb-1">Decision Reason</div>
          <div className="text-text-secondary leading-relaxed">{reason}</div>
        </div>
      )}

      {/* Customer message */}
      {customerMessage && (
        <div className="px-3 py-2 border-b border-border-strong bg-surface/50">
          <div className="text-[9px] text-amber uppercase mb-1">Customer Message</div>
          <div className="text-text-secondary italic leading-relaxed">{customerMessage}</div>
        </div>
      )}

      {/* Council log (expandable) */}
      <div
        className="px-3 py-2 cursor-pointer hover:bg-surface/80 flex items-center justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="text-[10px] text-amber">Council Debate Log</div>
        <span className={`text-[10px] text-amber transition-transform ${expanded ? 'rotate-180' : ''}`}>↓</span>
      </div>

      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-1 bg-bg max-h-[200px] overflow-y-auto custom-scrollbar">
          {debateMessages && debateMessages.length > 0 ? (
            debateMessages.map((msg) => (
              <div key={msg.id} className="flex gap-2 leading-tight">
                <span className={`${agentColors[msg.agent] ?? 'text-text-secondary'} shrink-0 text-[10px]`}>
                  [R{msg.round}][{msg.agent.toUpperCase()}]:
                </span>
                <span className="text-text-secondary text-[10px]">{msg.text}</span>
              </div>
            ))
          ) : (
            <div className="text-text-muted italic text-[10px]">No debate log available.</div>
          )}
        </div>
      )}
    </div>
  );
}
