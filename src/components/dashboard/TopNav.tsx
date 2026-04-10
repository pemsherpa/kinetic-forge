import { Search, Bell, Settings } from "lucide-react";

const navLinks = ["Dashboard", "Workflows", "Agents", "Archive"];

export function TopNav() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-surface-highest">
      <div className="flex items-center gap-8">
        <h1 className="font-display text-lg font-bold tracking-widest text-neon-cyan uppercase">
          Kinetic Foundry
        </h1>
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <button
              key={link}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                i === 0
                  ? "text-foreground bg-surface-mid"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 text-sm bg-surface-low text-foreground placeholder:text-muted-foreground outline-none w-48 focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <button className="p-2 text-muted-foreground hover:text-neon-amber transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-neon-amber rounded-full" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
