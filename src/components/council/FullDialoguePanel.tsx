import React, { useState } from 'react';
import { useCouncilStore } from '../../stores/councilStore';

const AGENT_COLOR: Record<string, string> = {
  strategist: '#8B5CF6',
  critic: '#F97316',
  executor: '#14B8A6',
};

const AGENT_BG: Record<string, string> = {
  strategist: 'bg-strategist/10 border-strategist/25',
  critic: 'bg-critic/10 border-critic/25',
  executor: 'bg-executor/10 border-executor/25',
};

type Tab = 'debate' | 'reasoning';

export function FullDialoguePanel({ onClose }: { onClose: () => void }) {
  const { debateMessages, consensusResult } = useCouncilStore();
  const [tab, setTab] = useState<Tab>('debate');
  const [agentFilter, setAgentFilter] = useState<string | null>(null);

  const rounds = Array.from(new Set(debateMessages.map((m) => m.round))).sort((a, b) => a - b);
  const filtered = agentFilter
    ? debateMessages.filter((m) => m.agent === agentFilter)
    : debateMessages;

  const d = consensusResult?.claimDecision;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="w-[520px] bg-elevated border-l border-border-strong flex flex-col font-mono text-[11px] overflow-hidden animate-slide-in-left shadow-2xl"
        style={{ animationDirection: 'reverse', animation: 'slideInLeft 0.25s ease both' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border-strong bg-surface/60 shrink-0">
          <div>
            <div className="font-heading font-semibold text-[14px] text-text-primary">Council Transcript</div>
            <div className="text-text-muted text-[10px] mt-0.5">{debateMessages.length} messages across {rounds.length} rounds</div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-amber text-[20px] leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-strong shrink-0">
          {(['debate', 'reasoning'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 h-[36px] font-mono text-[11px] uppercase tracking-widest transition-colors border-b-2 ${
                tab === t
                  ? 'text-amber border-amber'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              {t === 'debate' ? 'Full Debate' : 'Decision Reasoning'}
            </button>
          ))}
        </div>

        {/* ── Debate tab ── */}
        {tab === 'debate' && (
          <>
            {/* Agent filter */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border-strong shrink-0">
              <span className="text-text-muted text-[10px]">Filter:</span>
              {[null, 'strategist', 'critic', 'executor'].map((a) => (
                <button
                  key={String(a)}
                  onClick={() => setAgentFilter(a)}
                  className={`px-2 py-0.5 rounded-[3px] text-[10px] transition-colors border ${
                    agentFilter === a
                      ? 'border-amber text-amber bg-amber-dim'
                      : 'border-border text-text-secondary hover:border-border-strong'
                  }`}
                  style={a ? { borderColor: agentFilter === a ? '' : AGENT_COLOR[a] + '50', color: agentFilter === a ? '' : AGENT_COLOR[a] } : {}}
                >
                  {a ?? 'All'}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
              {rounds.map((round) => {
                const roundMsgs = filtered.filter((m) => m.round === round);
                if (roundMsgs.length === 0) return null;
                return (
                  <div key={round}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-[0.5px] flex-1 bg-border-strong" />
                      <span className="text-[9px] text-text-muted uppercase tracking-widest px-2">Round {round}</span>
                      <div className="h-[0.5px] flex-1 bg-border-strong" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {roundMsgs.map((msg, i) => (
                        <div
                          key={msg.id ?? i}
                          className={`rounded-[4px] border p-3 ${AGENT_BG[msg.agent] ?? 'bg-surface border-border'}`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: AGENT_COLOR[msg.agent] ?? '#666', boxShadow: `0 0 5px ${AGENT_COLOR[msg.agent] ?? '#666'}` }}
                            />
                            <span
                              className="font-semibold uppercase text-[10px] tracking-wider"
                              style={{ color: AGENT_COLOR[msg.agent] ?? '#fff' }}
                            >
                              {msg.agent}
                            </span>
                            <span className="text-text-muted text-[9px] ml-auto">R{msg.round}</span>
                          </div>
                          <div className="text-text-primary leading-relaxed whitespace-pre-wrap text-[11px]">
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-text-muted italic text-center py-8">No debate messages yet. Convene the council first.</div>
              )}
            </div>
          </>
        )}

        {/* ── Reasoning tab ── */}
        {tab === 'reasoning' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
            {!consensusResult ? (
              <div className="text-text-muted italic text-center py-8">No consensus reached yet.</div>
            ) : (
              <>
                {/* Pipeline rationale */}
                <div className="bg-surface border border-border-strong rounded-[4px] p-3">
                  <div className="text-amber text-[9px] uppercase tracking-widest mb-2">Pipeline Rationale</div>
                  <div className="text-text-secondary leading-relaxed">{consensusResult.rationale}</div>
                </div>

                {/* Decision details */}
                {d && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-[0.5px] flex-1 bg-border-strong" />
                      <span className="text-[9px] text-text-muted uppercase tracking-widest px-2">Claim Decision</span>
                      <div className="h-[0.5px] flex-1 bg-border-strong" />
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between bg-surface border border-border-strong rounded-[4px] px-3 py-2">
                      <span className="text-text-secondary">Final Status</span>
                      <span className={`font-bold text-[13px] uppercase ${d.status === 'Approved' ? 'text-green' : d.status === 'Rejected' ? 'text-red' : 'text-amber'}`}
                        style={{ textShadow: `0 0 12px currentColor` }}>
                        {d.status}
                      </span>
                    </div>

                    {/* Step-by-step reasoning */}
                    <div className="flex flex-col gap-2">
                      {[
                        {
                          step: '01', label: 'Coverage Validation',
                          result: d.coverageValid ? '✓ Covered' : '✗ Not Covered',
                          color: d.coverageValid ? 'text-green' : 'text-red',
                          detail: d.coverageValid
                            ? 'Comprehensive policy covers own-vehicle damage. Claim is within policy scope.'
                            : 'Third-Party policy does NOT cover own-vehicle damage. Coverage is invalid for this claim type.',
                        },
                        {
                          step: '02', label: 'Fraud & Risk Check',
                          result: d.fraudIndicators.length > 0 ? `${d.fraudIndicators.length} flag(s)` : 'Clean',
                          color: d.fraudIndicators.length > 0 ? 'text-red' : 'text-green',
                          detail: d.fraudIndicators.length > 0
                            ? `Flags raised:\n${d.fraudIndicators.map((f) => `  • ${f}`).join('\n')}`
                            : 'No fraud indicators detected. Claim appears consistent and legitimate.',
                        },
                        {
                          step: '03', label: 'Damage Assessment',
                          result: d.damageSeverity,
                          color: d.damageSeverity === 'Major' ? 'text-red' : d.damageSeverity === 'Moderate' ? 'text-amber' : 'text-green',
                          detail: `Damage classified as ${d.damageSeverity}.\nPayout range for ${d.damageSeverity}: ${d.damageSeverity === 'Major' ? '30–50%' : d.damageSeverity === 'Moderate' ? '50–70%' : '70–90%'} of claim amount.\nSelected rate: ${d.payoutPercentage}%.`,
                        },
                        {
                          step: '04', label: 'Payout Calculation',
                          result: `₹${d.estimatedPayout.toLocaleString('en-IN')}`,
                          color: d.status === 'Approved' ? 'text-green' : 'text-text-muted',
                          detail: d.status === 'Approved'
                            ? `Gross: ${d.payoutPercentage}% × claim amount\nMinus ₹3,000 deductible\nNet payout: ₹${d.estimatedPayout.toLocaleString('en-IN')}`
                            : 'No payout — claim was not approved.',
                        },
                        {
                          step: '05', label: 'Confidence Score',
                          result: `${Math.round(d.confidenceScore * 100)}%`,
                          color: d.confidenceScore >= 0.8 ? 'text-green' : d.confidenceScore >= 0.6 ? 'text-amber' : 'text-red',
                          detail: `${d.confidenceScore >= 0.8 ? 'HIGH confidence' : d.confidenceScore >= 0.6 ? 'MEDIUM confidence' : 'LOW confidence'} — ${d.confidenceScore >= 0.8 ? 'clear case with complete data.' : d.confidenceScore >= 0.6 ? 'some ambiguity or partial documentation.' : 'missing data, multiple risk flags.'}`,
                        },
                        {
                          step: '06', label: 'Decision Reason',
                          result: d.status,
                          color: d.status === 'Approved' ? 'text-green' : d.status === 'Rejected' ? 'text-red' : 'text-amber',
                          detail: d.reason,
                        },
                      ].map(({ step, label, result, color, detail }) => (
                        <div key={step} className="bg-surface border border-border-strong rounded-[4px] p-3 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-text-muted text-[9px]">{step}</span>
                              <span className="text-text-primary font-semibold">{label}</span>
                            </div>
                            <span className={`font-bold text-[11px] ${color}`}>{result}</span>
                          </div>
                          <div className="text-text-secondary leading-relaxed whitespace-pre-wrap border-t border-border pt-1.5 text-[10px]">
                            {detail}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer message */}
                    <div className="bg-amber/5 border border-amber/20 rounded-[4px] p-3">
                      <div className="text-amber text-[9px] uppercase tracking-widest mb-2">Customer Message</div>
                      <div className="text-text-secondary italic leading-relaxed">{d.customerMessage}</div>
                    </div>
                  </>
                )}

                {/* Workflow nodes used */}
                <div className="flex flex-col gap-1">
                  <div className="text-[9px] text-text-muted uppercase tracking-widest mb-1">Pipeline Workflow ({consensusResult.nodes.length} nodes)</div>
                  {consensusResult.nodes.map((node, i) => (
                    <div key={node.id} className="flex items-center gap-2 bg-surface border border-border rounded-[4px] px-3 py-1.5">
                      <span className="text-text-muted text-[9px] w-4">{i + 1}.</span>
                      <span className="text-text-primary font-semibold">{node.label}</span>
                      {node.parallel && <span className="text-executor text-[9px] ml-auto">∥ parallel</span>}
                      {node.conditional && <span className="text-amber text-[9px] ml-auto">⊃ conditional</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
