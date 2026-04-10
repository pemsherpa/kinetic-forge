import React, { useState } from 'react';
import { Header } from './Header';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { PhaseDivider } from './PhaseDivider';
import { CouncilCanvas } from '../council/CouncilCanvas';
import { PipelineCanvas } from '../pipeline/PipelineCanvas';

export function Shell() {
  const [topHeight, setTopHeight] = useState(55); // percentage

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        
        <main className="flex-1 flex flex-col min-w-0 relative">
          <div 
            className="w-full relative" 
            style={{ height: `${topHeight}%` }}
          >
            <CouncilCanvas />
          </div>

          <PhaseDivider 
            onDrag={(deltaY) => {
              setTopHeight(prev => {
                const newHeight = prev + (deltaY / window.innerHeight) * 100;
                return Math.max(20, Math.min(80, newHeight));
              });
            }} 
          />

          <div 
            className="w-full relative bg-surface/30" 
            style={{ height: `${100 - topHeight}%` }}
          >
            <PipelineCanvas />
          </div>
        </main>

        <RightPanel />
      </div>
    </div>
  );
}
