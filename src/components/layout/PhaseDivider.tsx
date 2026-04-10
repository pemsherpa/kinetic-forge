import React, { useRef, useEffect } from 'react';
import { useCouncilStore } from '../../stores/councilStore';

interface PhaseDividerProps {
  onDrag: (deltaY: number) => void;
}

export function PhaseDivider({ onDrag }: PhaseDividerProps) {
  const { consensusResult } = useCouncilStore();
  const dividerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      onDrag(e.movementY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onDrag]);

  return (
    <div 
      ref={dividerRef}
      className="h-[2px] w-full bg-border-strong relative cursor-row-resize hover:bg-amber-dim group z-50 shrink-0"
      onMouseDown={() => {
        isDragging.current = true;
        document.body.style.cursor = 'row-resize';
      }}
    >
      <div className="absolute inset-x-0 -top-1 -bottom-1 z-10" />
      {consensusResult ? (
        <div className="absolute h-[1px] w-full bg-amber top-0 left-0">
          <div className="w-[4px] h-[4px] rounded-full bg-amber shadow-[0_0_8px_var(--amber)] absolute -top-[1.5px] animate-slide-dot" />
        </div>
      ) : (
        <div className="absolute h-[2px] w-[2px] rounded-full bg-amber top-[0px] left-0" />
      )}
    </div>
  );
}
