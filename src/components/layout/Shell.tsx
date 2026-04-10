import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { LeftPanel } from './LeftPanel';
import { CouncilTab } from '../council/CouncilTab';
import { PipelineTab } from '../pipeline/PipelineTab';
import { useSettingsStore } from '../../stores/settingsStore';
import { SettingsDrawer } from '../settings/SettingsDrawer';

export function Shell() {
  const [activeTab, setActiveTab] = useState<'COUNCIL' | 'PIPELINE'>('COUNCIL');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex flex-col h-screen w-screen bg-bg overflow-hidden text-text-primary">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        
        <main className="flex-1 flex flex-col min-w-0 relative bg-surface panel-texture">
          <div className="h-[40px] border-b border-border-strong px-4 flex shrink-0">
            <button 
              className={`h-[40px] px-[18px] font-mono text-[12px] tracking-[0.08em] transition-colors duration-150 border-b-2
                ${activeTab === 'COUNCIL' 
                  ? 'text-text-primary border-amber' 
                  : 'text-text-secondary border-transparent hover:text-text-primary'}`}
              onClick={() => setActiveTab('COUNCIL')}
            >
              COUNCIL
            </button>
            <button 
              className={`h-[40px] px-[18px] font-mono text-[12px] tracking-[0.08em] transition-colors duration-150 border-b-2
                ${activeTab === 'PIPELINE' 
                  ? 'text-text-primary border-amber' 
                  : 'text-text-secondary border-transparent hover:text-text-primary'}`}
              onClick={() => setActiveTab('PIPELINE')}
            >
              PIPELINE
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
             {activeTab === 'COUNCIL' ? <CouncilTab /> : <PipelineTab />}
          </div>
        </main>
      </div>

      {settingsOpen && <SettingsDrawer onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
