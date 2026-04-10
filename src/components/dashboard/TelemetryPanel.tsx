import { Play } from "lucide-react";

interface LogEntry {
  time: string;
  agent: string;
  color: string;
  lines: { text: string; critical?: boolean }[];
}

const logEntries: LogEntry[] = [
  {
    time: "[T+00ms]",
    agent: "ARCHITECT",
    color: "text-neon-cyan",
    lines: [
      { text: 'Goal detected: "Aggregate financial risk profiles across Tier 1 nodes."' },
      { text: "Decomposing intent into 4 sub-tasks..." },
    ],
  },
  {
    time: "[T+142ms]",
    agent: "FORENSIC",
    color: "text-neon-cyan",
    lines: [
      { text: "Mismatch detected in Input_Source_B. Discrepancy: Image Metadata vs Header Text." },
      { text: "Initiating secondary scan...", critical: true },
    ],
  },
  {
    time: "[T+258ms]",
    agent: "SPECIALIST_MATH",
    color: "text-neon-amber",
    lines: [
      { text: "Executing Parallel Compute: Weighted Variance across 12M data points." },
    ],
  },
  {
    time: "[T+310ms]",
    agent: "CRITIC",
    color: "text-neon-amber",
    lines: [
      { text: "Logic failure detected in branch 0x4F. Reasoning loop detected in Consensus Logic." },
      { text: "Triggering bypass to FORENSIC node." },
    ],
  },
  {
    time: "[T+312ms]",
    agent: "SYS_CORE",
    color: "text-muted-foreground",
    lines: [
      { text: "Re-routing payload 882-C via industrial bypass pipe..." },
    ],
  },
  {
    time: "[T+445ms]",
    agent: "NARRATOR",
    color: "text-neon-emerald",
    lines: [
      { text: "Consensus reached. Formatting final intelligence report." },
    ],
  },
];

export function TelemetryPanel() {
  return (
    <aside className="w-80 shrink-0 bg-surface-lowest flex flex-col border-l border-surface-mid/30">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-surface-low">
        <h3 className="font-display text-xs font-bold tracking-wider text-foreground uppercase">
          System Telemetry
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-amber animate-sync" />
          <span className="text-[9px] font-mono text-neon-amber uppercase">Syncing</span>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto terminal-scroll p-4 space-y-4">
        {logEntries.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground">{entry.time}</span>
              <span className={`font-mono text-[10px] font-bold ${entry.color}`}>{entry.agent}</span>
            </div>
            {entry.lines.map((line, li) => (
              <div key={li} className="flex items-start gap-2">
                {line.critical && (
                  <span className="inline-flex px-1.5 py-0 text-[8px] font-bold bg-neon-red/20 text-neon-red animate-neon-pulse mt-0.5">
                    CRITICAL
                  </span>
                )}
                <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                  {line.text}
                </p>
              </div>
            ))}
          </div>
        ))}

        {/* Output chips */}
        <div className="flex gap-2 pt-2">
          <span className="px-2 py-1 text-[10px] font-mono font-bold bg-surface-mid text-neon-cyan">
            JSON_STRUCT
          </span>
          <span className="px-2 py-1 text-[10px] font-mono font-bold bg-surface-mid text-neon-emerald">
            PDF_REPORT
          </span>
        </div>
      </div>

      {/* Command input */}
      <div className="p-3 bg-surface-low">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">terminal</span>
          <span className="text-[10px] text-muted-foreground font-medium">Direct Command</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            placeholder="Enter command..."
            className="flex-1 bg-surface-lowest px-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
          />
          <button className="p-1.5 bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 transition-colors">
            <Play className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
