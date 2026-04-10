import React from 'react';
import { Shield, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="h-12 bg-surface border-b border-border-strong flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-amber" />
        <h1 className="font-heading text-[16px] text-text-primary font-medium tracking-wide">ClaimMind</h1>
        <div className="px-2 py-0.5 bg-amber-dim border border-amber rounded-full">
          <span className="font-mono text-[10px] text-amber uppercase tracking-wider">COUNCIL v3</span>
        </div>
      </div>

      <div className="flex items-center font-mono text-[13px] text-text-secondary gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-text-primary">142</span>
          <span>processed</span>
        </div>
        <span className="text-text-muted">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-green">98</span>
          <span>approved</span>
        </div>
        <span className="text-text-muted">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-red">44</span>
          <span>rejected</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green animate-blink" />
            <span className="text-text-primary">OpenRouter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-surface border border-border" />
            <span>Ollama</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-surface border border-border" />
            <span>Custom</span>
          </div>
        </div>
        <button className="text-text-secondary hover:text-amber transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
