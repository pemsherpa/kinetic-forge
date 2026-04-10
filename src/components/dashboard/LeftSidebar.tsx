const mainItems = [
  { icon: "memory", label: "Logic Core" },
  { icon: "psychology", label: "Neural Net" },
  { icon: "database", label: "Storage" },
  { icon: "speed", label: "Compute" },
  { icon: "shield", label: "Security" },
];

const bottomItems = [
  { icon: "terminal", label: "Diagnostics" },
  { icon: "android", label: "Terminal" },
];

export function LeftSidebar() {
  return (
    <aside className="w-56 shrink-0 bg-surface-highest flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
          Reasoning Log
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-neon-pulse" />
          <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-wider">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {mainItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-mid transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5">
        {bottomItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-mid transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
