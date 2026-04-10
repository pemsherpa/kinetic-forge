import React, { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

export function SettingsDrawer({ onClose }: { onClose: () => void }) {
  const settings = useSettingsStore();
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState(settings.openrouterKey);
  const [webhookUrlInput, setWebhookUrlInput] = useState(settings.webhookUrl);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<'success' | 'fail' | null>(null);

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookResult(null);
    settings.setKey('webhookUrl', webhookUrlInput);
    const ok = await settings.testWebhook();
    setWebhookResult(ok ? 'success' : 'fail');
    setTestingWebhook(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[360px] bg-elevated border-l-[0.5px] border-border-strong p-[24px] z-50 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200">
      
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="font-heading text-[16px] font-semibold text-text-primary">Settings</h2>
        <button onClick={onClose} className="text-text-secondary hover:text-amber text-[20px]">&times;</button>
      </div>

      {/* API Keys */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b-[0.5px] border-amber pb-1">
          <span className="font-display text-[11px] text-amber uppercase">API Keys</span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-text-secondary">OpenRouter API Key</label>
          <div className="flex gap-2">
            <input 
              type="password" 
              value={openrouterKeyInput}
              onChange={(e) => setOpenrouterKeyInput(e.target.value)}
              onBlur={() => settings.setKey('openrouterKey', openrouterKeyInput)}
              className="flex-1 bg-surface border-[0.5px] border-border-strong rounded-[4px] px-2 py-1.5 font-mono text-[11px] text-text-primary focus:border-amber outline-none"
              placeholder="sk-or-v1-..."
            />
            <button className="bg-surface border-[0.5px] border-border-strong px-3 rounded-[4px] font-mono text-[11px] text-text-secondary hover:text-amber">Test</button>
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b-[0.5px] border-amber pb-1">
          <span className="font-display text-[11px] text-amber uppercase">n8n Webhook</span>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-text-secondary">Webhook URL</label>
          <input 
            type="text" 
            value={webhookUrlInput}
            onChange={(e) => setWebhookUrlInput(e.target.value)}
            onBlur={() => settings.setKey('webhookUrl', webhookUrlInput)}
            placeholder="https://your-n8n.cloud/webhook/..."
            className="w-full bg-surface border-[0.5px] border-border-strong rounded-[4px] px-2 py-1.5 font-mono text-[11px] text-text-primary focus:border-amber outline-none"
          />
          <div className="flex justify-between items-center mt-1">
            <button 
              onClick={handleTestWebhook}
              disabled={testingWebhook || !webhookUrlInput}
              className="text-amber text-[10px] font-mono hover:text-amber-bright disabled:opacity-50"
            >
              {testingWebhook ? 'Testing...' : 'Test Webhook'}
            </button>
            {webhookResult === 'success' && <span className="text-green text-[10px] font-mono">Connected</span>}
            {webhookResult === 'fail' && <span className="text-red text-[10px] font-mono">Failed</span>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Use client-side mock if offline</label>
          <button 
            onClick={() => settings.setKey('useMockFallback', !settings.useMockFallback)}
            className={`w-[32px] h-[18px] rounded-full flex items-center px-[2px] transition-colors border-[0.5px] ${settings.useMockFallback ? 'bg-amber-dim border-amber' : 'bg-surface border-border-strong'}`}
          >
            <div className={`w-[12px] h-[12px] rounded-full transition-transform ${settings.useMockFallback ? 'bg-amber translate-x-[14px]' : 'bg-text-secondary'}`} />
          </button>
        </div>
      </div>

      {/* Council */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b-[0.5px] border-amber pb-1">
          <span className="font-display text-[11px] text-amber uppercase">Council Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Debate rounds</label>
          <div className="flex gap-2">
            <button onClick={() => settings.setKey('debateRounds', Math.max(1, settings.debateRounds - 1))} className="text-amber w-5 border border-border bg-surface text-center">-</button>
            <span className="font-mono text-[11px] w-4 text-center">{settings.debateRounds}</span>
            <button onClick={() => settings.setKey('debateRounds', Math.min(4, settings.debateRounds + 1))} className="text-amber w-5 border border-border bg-surface text-center">+</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Round timeout</label>
          <div className="flex items-center gap-2 w-[120px]">
            <input 
              type="range" min="10" max="120" step="10" 
              value={settings.roundTimeout}
              onChange={(e) => settings.setKey('roundTimeout', Number(e.target.value))}
              className="w-full accent-amber"
            />
            <span className="font-mono text-[10px] text-amber w-6">{settings.roundTimeout}s</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Show research citations</label>
          <button 
            onClick={() => settings.setKey('showResearchBanner', !settings.showResearchBanner)}
            className={`w-[32px] h-[18px] rounded-full flex items-center px-[2px] transition-colors border-[0.5px] ${settings.showResearchBanner ? 'bg-amber-dim border-amber' : 'bg-surface border-border-strong'}`}
          >
            <div className={`w-[12px] h-[12px] rounded-full transition-transform ${settings.showResearchBanner ? 'bg-amber translate-x-[14px]' : 'bg-text-secondary'}`} />
          </button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b-[0.5px] border-amber pb-1">
          <span className="font-display text-[11px] text-amber uppercase">Pipeline Settings</span>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Auto-layout parsing</label>
          <button 
            onClick={() => settings.setKey('autoLayout', !settings.autoLayout)}
            className={`w-[32px] h-[18px] rounded-full flex items-center px-[2px] transition-colors border-[0.5px] ${settings.autoLayout ? 'bg-amber-dim border-amber' : 'bg-surface border-border-strong'}`}
          >
            <div className={`w-[12px] h-[12px] rounded-full transition-transform ${settings.autoLayout ? 'bg-amber translate-x-[14px]' : 'bg-text-secondary'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <label className="font-mono text-[11px] text-text-secondary">Animation speed</label>
          <div className="flex gap-1">
            {['slow', 'normal', 'fast'].map(s => (
              <button 
                key={s}
                onClick={() => settings.setKey('animationSpeed', s)}
                className={`px-2 py-0.5 rounded-[3px] border-[0.5px] font-mono text-[10px] capitalize transition-colors ${settings.animationSpeed === s ? 'bg-amber-dim border-amber text-amber' : 'bg-transparent border-border-strong text-text-secondary'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mt-auto flex flex-col gap-1 border-t-[0.5px] border-border-strong pt-4">
        <span className="font-mono text-[11px] text-amber">Zathura v3.0</span>
        <span className="font-mono text-[10px] text-text-secondary opacity-70">
          Du et al. (ICML 2024) — arXiv:2305.14325<br/>
          Zhou & Chen (2025) — A-HMAD
        </span>
      </div>

    </div>
  );
}
