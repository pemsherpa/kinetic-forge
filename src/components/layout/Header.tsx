import React from 'react';
import { Shield, Settings } from 'lucide-react';
import { useClaimsStore } from '../../stores/claimsStore';

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { stats } = useClaimsStore();

  return (
    <header className="h-[48px] bg-surface border-b border-border-strong flex items-center justify-between px-[20px] shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 text-amber" />
        <h1 className="font-heading text-[15px] font-semibold text-text-primary tracking-wide">ClaimMind</h1>
        <div className="px-2 py-0.5 bg-amber-dim border-[0.5px] border-amber rounded-[4px]">
          <span className="font-mono text-[10px] text-amber tracking-[0.08em]">COUNCIL v3</span>
        </div>
      </div>

      <div className="flex items-center font-mono text-[12px] gap-2">
        <div className="flex items-center gap-[0.5ex]">
          <span className="text-amber">{stats.processed}</span>
          <span className="text-text-muted">processed</span>
        </div>
        <span className="text-text-muted">·</span>
        <div className="flex items-center gap-[0.5ex]">
          <span className="text-amber">{stats.approved}</span>
          <span className="text-text-muted">approved</span>
        </div>
        <span className="text-text-muted">·</span>
        <div className="flex items-center gap-[0.5ex]">
          <span className="text-amber">{stats.rejected}</span>
          <span className="text-text-muted">rejected</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-[10px] font-mono text-text-secondary">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${true ? 'bg-green animate-pulse-status' : 'bg-surface border border-border'}`} />
            <span>OpenRouter [12ms]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full bg-surface border border-border`} />
            <span>Ollama [—]</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full bg-surface border border-border`} />
            <span>Custom [—]</span>
          </div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="text-text-secondary hover:text-amber transition-colors w-[20px] h-[20px] flex items-center justify-center"
        >
          <Settings className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
}
