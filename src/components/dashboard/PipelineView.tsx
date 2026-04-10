import { GlassNode } from "./GlassNode";
import { AlertTriangle } from "lucide-react";

function PneumaticTube({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <div className="flex justify-center py-1">
      <div className="w-1 h-8 pneumatic-tube" style={{ width: "4px" }} />
    </div>
  ) : (
    <div className="flex items-center">
      <div className="pneumatic-tube w-12 h-1" />
    </div>
  );
}

function Chip({ icon, label, variant = "default" }: { icon: string; label: string; variant?: string }) {
  const colors = variant === "amber" ? "bg-neon-amber/10 text-neon-amber" : "bg-surface-mid text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium ${colors}`}>
      <span className="material-symbols-outlined text-[12px]">{icon}</span>
      {label}
    </span>
  );
}

export function PipelineView() {
  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground tracking-wide">
            Pipeline Omni-View
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Operational Status:{" "}
            <span className="text-neon-emerald font-semibold">ACTIVE [NOMINAL]</span>
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Global Throughput</p>
            <p className="font-display text-lg font-bold text-neon-cyan">1.4 TB/S</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Cycles</p>
            <p className="font-display text-lg font-bold text-neon-amber">98.2%</p>
          </div>
        </div>
      </div>

      {/* Pipeline flow */}
      <div className="flex flex-col gap-0 items-center">
        {/* Row 1: Crystallizer */}
        <GlassNode
          icon="filter_alt"
          title="The Crystallizer"
          subtitle="Intent Decomposition (Architect Agent)"
          className="w-full max-w-md"
        >
          <div className="flex gap-2">
            <Chip icon="compare" label="Compare" />
            <Chip icon="text_fields" label="Text" />
            <Chip icon="image" label="Image" />
          </div>
        </GlassNode>

        <PneumaticTube vertical />

        {/* Row 2: Forensic Sifter */}
        <GlassNode
          icon="search"
          title="The Forensic Sifter"
          subtitle="Contrastive Audit (Forensic Agent)"
          className="w-full max-w-md"
        >
          <div className="flex gap-2">
            <Chip icon="gavel" label="Policy" />
            <Chip icon="calculate" label="Math" />
            <Chip icon="security" label="Fraud" />
          </div>
        </GlassNode>

        <PneumaticTube vertical />

        {/* Row 3: Specialist Forge */}
        <GlassNode
          icon="precision_manufacturing"
          title="The Specialist Forge"
          subtitle="Parallel Compute"
          className="w-full max-w-md"
        >
          <div className="flex gap-2">
            <Chip icon="gavel" label="Policy" variant="amber" />
            <Chip icon="calculate" label="Math" variant="amber" />
            <Chip icon="security" label="Fraud" variant="amber" />
          </div>
        </GlassNode>

        <PneumaticTube vertical />

        {/* Row 4: Logic Critic */}
        <GlassNode
          icon="visibility"
          title="The Logic Critic"
          subtitle="Adversarial Review (Critic Agent)"
          className="w-full max-w-md"
        />

        {/* Error bypass */}
        <div className="flex items-center gap-2 py-2">
          <div className="pneumatic-tube w-8 h-1" style={{ background: "hsl(0, 85%, 55%)", boxShadow: "0 0 12px hsla(0,85%,55%,0.6)" }} />
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-neon-red/15 text-neon-red animate-neon-pulse">
            <AlertTriangle className="w-3 h-3" />
            ADVERSARIAL REJECTION BYPASS
          </span>
          <div className="pneumatic-tube w-8 h-1" style={{ background: "hsl(0, 85%, 55%)", boxShadow: "0 0 12px hsla(0,85%,55%,0.6)" }} />
        </div>

        {/* Row 5: Synthesis Press */}
        <GlassNode
          icon="compress"
          title="The Synthesis Press"
          subtitle="Final Consensus (Narrator Agent)"
          className="w-full max-w-md"
        />
      </div>

      {/* Bottom status bar */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-surface-low p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Active Schema</p>
            <span className="material-symbols-outlined text-[14px] text-muted-foreground">expand_more</span>
          </div>
          <p className="text-xs text-muted-foreground">Processing Node</p>
          <p className="font-mono text-sm text-neon-cyan font-bold">CRYSTALLIZER_01</p>
        </div>

        <div className="bg-surface-low p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Neural Load</p>
          <div className="flex items-end gap-3">
            <p className="font-display text-3xl font-bold text-neon-amber">44</p>
            <p className="text-xs text-muted-foreground pb-1">FLOPS</p>
          </div>
          <div className="flex gap-1 mt-2">
            {[70, 50, 85, 40, 60, 90, 55, 75].map((h, i) => (
              <div key={i} className="w-2 bg-neon-amber/30 rounded-sm" style={{ height: `${h * 0.3}px` }}>
                <div className="w-full bg-neon-amber rounded-sm" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-low p-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Consensus Delta</p>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-neon-emerald text-[18px]">verified_user</span>
            <p className="text-xs text-foreground">Synchronicity achieved in <span className="text-neon-emerald font-bold">12ms</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
