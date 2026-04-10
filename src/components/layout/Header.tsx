import React, { useEffect, useState } from 'react';
import { Shield, Settings, Cpu } from 'lucide-react';
import { useClaimsStore } from '../../stores/claimsStore';
import { useModelStore } from '../../stores/modelStore';

export function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { stats } = useClaimsStore();
  const { models, isDetecting, autoDetect } = useModelStore();
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [tick, setTick] = useState(0);

  // Probe Ollama health every 10s
  useEffect(() => {
    const probe = async () => {
      try {
        const r = await fetch('http://localhost:11434/api/tags');
        setOllamaOk(r.ok);
      } catch {
        setOllamaOk(false);
      }
    };
    probe();
    const id = setInterval(() => { probe(); setTick((t) => t + 1); }, 10_000);
    return () => clearInterval(id);
  }, []);

  // Auto-detect models on mount
  useEffect(() => { autoDetect(); }, [autoDetect]);

  const ollamaModels = models.filter((m) => m.provider === 'Ollama');

  return (
    <header className="h-[48px] bg-surface/80 backdrop-blur-sm border-b border-border-strong flex items-center justify-between px-[20px] shrink-0 relative overflow-hidden">
      {/* Ambient amber glow strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber/40 to-transparent" />

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="w-4 h-4 text-amber" style={{ filter: 'drop-shadow(0 0 4px var(--amber))' }} />
        </div>
        <h1 className="font-heading text-[15px] font-semibold text-text-primary tracking-wide"
          style={{ textShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
          Zathura
        </h1>
        <div className="px-2 py-0.5 bg-amber-dim border-[0.5px] border-amber rounded-[4px]">
          <span className="font-mono text-[10px] text-amber tracking-[0.08em]">COUNCIL v3</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center font-mono text-[11px] gap-4">
        {[
          { label: 'processed', value: stats.processed, color: 'text-text-primary' },
          { label: 'approved',  value: stats.approved,  color: 'text-green' },
          { label: 'rejected',  value: stats.rejected,  color: 'text-red' },
          { label: 'pending',   value: stats.pending,   color: 'text-amber' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center">
            <span className={`font-heading text-[14px] font-bold ${color}`}>{value}</span>
            <span className="text-text-muted text-[9px] uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3 text-[10px] font-mono">
          {/* Ollama status */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                ollamaOk === true ? 'bg-green animate-pulse-status' :
                ollamaOk === false ? 'bg-red' : 'bg-amber animate-pulse-status'
              }`}
              style={ollamaOk ? { boxShadow: '0 0 4px var(--green)' } : {}}
            />
            <span className="text-text-secondary">
              Ollama {ollamaOk ? `[${ollamaModels.length} models]` : '[offline]'}
            </span>
          </div>

          {/* Model count */}
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-executor opacity-70" />
            <span className="text-text-secondary">
              {isDetecting ? (
                <span className="text-amber animate-pulse">detecting...</span>
              ) : (
                <span className="text-executor">{models.length} loaded</span>
              )}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-text-secondary hover:text-amber transition-colors w-[20px] h-[20px] flex items-center justify-center"
          style={{ filter: 'none' }}
        >
          <Settings className="w-[16px] h-[16px]" />
        </button>
      </div>
    </header>
  );
}
