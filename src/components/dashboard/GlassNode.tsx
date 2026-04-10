import React from "react";

interface GlassNodeProps {
  icon: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  className?: string;
}

export function GlassNode({ icon, title, subtitle, children, className = "" }: GlassNodeProps) {
  return (
    <div className={`glass-node p-6 glow-cyan transition-all hover:scale-[1.02] ${className}`}>
      <div className="flex items-center gap-3 mb-1">
        <span className="material-symbols-outlined text-neon-cyan text-[20px]">{icon}</span>
        <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>
      {children}
    </div>
  );
}
