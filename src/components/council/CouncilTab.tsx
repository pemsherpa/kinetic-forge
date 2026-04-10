import React from 'react';
import { CouncilCanvas } from './CouncilCanvas';
import { useSettingsStore } from '../../stores/settingsStore';

export function CouncilTab() {
  const { showResearchBanner } = useSettingsStore();

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {showResearchBanner && (
        <div className="h-[28px] bg-strategist-dim border-b-[0.5px] border-strategist-border flex items-center px-[16px] gap-[8px] shrink-0">
          <div className="w-[6px] h-[6px] rounded-full bg-strategist" />
          <span className="font-mono text-[10px] text-text-secondary">
            Implementing: Du et al. ICML 2024 · Heterogeneous MAD · Research gap: homogeneous agents → cross-model backbone debate
          </span>
        </div>
      )}
      
      <div className="flex-1 relative">
         <CouncilCanvas />
      </div>
    </div>
  );
}
