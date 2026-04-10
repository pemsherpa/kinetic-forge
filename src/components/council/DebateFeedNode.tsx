import React, { useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCouncilStore } from '../../stores/councilStore';

export function DebateFeedNode() {
  const { debateMessages, phase, votes } = useCouncilStore();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [debateMessages.length]);

  return (
    <div className="w-[300px] bg-elevated border border-border-strong rounded shadow-xl flex flex-col font-mono text-[11px] overflow-hidden">
      <Handle type="target" position={Position.Left} id="d1" style={{ top: '25%', opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="d2" style={{ top: '25%', opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="d3" style={{ top: '75%', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="db-out" style={{ left: '50%', opacity: 0 }} />
      
      <div className="flex justify-between items-center px-3 py-2 border-b border-border-strong bg-surface">
        <span className="text-text-primary tracking-widest uppercase">LIVE DEBATE</span>
        <span className="text-amber">{phase === 'done' ? 'Done' : phase === 'idle' ? 'Ready' : 'In Progress'}</span>
      </div>

      <div 
        ref={feedRef}
        className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto thin-scrollbar max-h-[160px]"
      >
        {debateMessages.length === 0 ? (
          <div className="text-text-muted italic">Waiting to convene...</div>
        ) : (
          debateMessages.map((msg, i) => {
            const colors = {
              strategist: 'text-strategist',
              critic: 'text-critic',
              executor: 'text-executor'
            };
            return (
              <div key={i} className="flex gap-2 leading-tight">
                <span className={`${colors[msg.agent]} shrink-0`}>{`> [${msg.agent.toUpperCase()}]:`}</span>
                <span className="text-text-primary">{msg.text}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="px-3 py-2 border-t border-border-strong bg-surface flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${votes.strategist ? 'bg-green' : 'bg-surface border border-border text-transparent'}`} />
          <div className={`w-2 h-2 rounded-full ${votes.critic ? 'bg-green' : 'bg-surface border border-border text-transparent'}`} />
          <div className={`w-2 h-2 rounded-full ${votes.executor ? 'bg-green' : 'bg-surface border border-border text-transparent'}`} />
        </div>
        <span className="text-amber-bright italic text-[10px]">
          {phase === 'done' || phase === 'consensus' ? 'Consensus reached' : (phase === 'idle' ? '' : 'Voting...')}
        </span>
      </div>
    </div>
  );
}
