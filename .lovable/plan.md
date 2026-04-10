

# Kinetic Foundry — Industrial Pipeline Dashboard

## Overview
Build a dark, neon-accented industrial command center dashboard with a "Digital Forge" aesthetic. The UI features glassmorphic pipeline nodes, heavy stamping plate sidebars, glowing pneumatic tube connectors, and a live reasoning log — all on an obsidian substrate with hexagonal grid overlay.

## Phase 1: Design System Foundation
- Set up Google Fonts: Space Grotesk (display), Inter (UI), JetBrains Mono (terminal)
- Define CSS custom properties for the obsidian surface hierarchy (`#050505`, `#0e0e0e`, `#131313`, `#1a1a1a`, `#353534`)
- Define neon accent tokens: Cyan (data/primary), Amber (processing), Emerald (success), Red (error)
- Create glassmorphism utility classes (15% opacity, 20px backdrop blur)
- Add hexagonal grid SVG background pattern at 5% opacity
- Define glow/shadow utilities using cyan and amber tinted shadows

## Phase 2: Layout Shell
- **Top Nav Bar**: "KINETIC FOUNDRY" branding in Space Grotesk, nav links (Dashboard, Workflows, Agents, Archive), search bar, notification/settings icons — stamping plate style with sharp corners
- **Left Sidebar**: Heavy stamping plate (sharp corners, `surface-container-highest`), "Reasoning Log" header with live telemetry indicator, navigation items (Logic Core, Neural Net, Storage, Compute, Security) with Material Symbols icons, bottom items (Diagnostics, Terminal)
- **Main Content Area**: Pipeline Omni-View with status header showing throughput and active cycles
- **Right Panel**: System Telemetry log and Direct Command input

## Phase 3: Pipeline Visualization (Main Content)
- Build glass node components (20px radius, gradient border from cyan 30% to transparent, no internal dividers)
- Create 5 pipeline stage nodes: The Crystallizer, The Forensic Sifter, The Specialist Forge, The Logic Critic, The Synthesis Press
- Each node has an icon, title, subtitle, and role description
- The Specialist Forge includes sub-module chips (Policy, Math, Fraud)
- Connect nodes with glowing pneumatic tube lines (4px thick, amber, 12px outer glow)
- Add "Adversarial Rejection Bypass" error indicator between nodes

## Phase 4: Bottom Status Bar
- "Active Schema" collapsible panel showing Processing Node info
- "Neural Load" display with large FLOPS readout and animated bar indicators
- "Consensus Delta" status with success checkmark

## Phase 5: Right Panel — System Telemetry & Command
- Scrolling reasoning log in JetBrains Mono on `surface-container-lowest`
- Timestamped entries with color-coded agent labels (Architect=cyan, Forensic=cyan, Specialist=amber, Critic=amber, Narrator=emerald)
- "CRITICAL" status chips with pulse animation
- Clickable action links (e.g., "Triggering bypass to FORENSIC node")
- Output format chips (JSON_STRUCT, PDF_REPORT)
- Direct Command terminal input with play button at bottom

## Phase 6: Animations & Polish
- Pulsing animation on active status chips (0.5s duration)
- "SYNCING" indicator with animated dot
- Subtle glow transitions on hover for interactive elements
- Ambient cyan/amber tinted shadows on elevated components
- Ensure 60%+ of screen stays in the dark obsidian range

