import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        mono: ["IBM Plex Mono", "monospace"],
        heading: ["Syne", "sans-serif"],
        display: ["Syne", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        card: "var(--card)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "border-active": "var(--border-active)",
        amber: {
          DEFAULT: "var(--amber)",
          dim: "var(--amber-dim)",
          glow: "var(--amber-glow)",
        },
        strategist: {
          DEFAULT: "var(--strategist)",
          dim: "var(--strategist-dim)",
          border: "var(--strategist-border)",
        },
        critic: {
          DEFAULT: "var(--critic)",
          dim: "var(--critic-dim)",
          border: "var(--critic-border)",
        },
        executor: {
          DEFAULT: "var(--executor)",
          dim: "var(--executor-dim)",
          border: "var(--executor-border)",
        },
        green: {
          DEFAULT: "var(--green)",
          dim: "var(--green-dim)",
        },
        red: {
          DEFAULT: "var(--red)",
          dim: "var(--red-dim)",
        },
        blue: "var(--blue)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        /* fallback shadcn vars for internal compatibility */
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        popover: "var(--elevated)",
        "popover-foreground": "var(--text-primary)",
        primary: {
          DEFAULT: "var(--amber)",
          foreground: "#080808",
        },
        secondary: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--elevated)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--amber-dim)",
          foreground: "var(--amber)",
        },
        destructive: {
          DEFAULT: "var(--red)",
          foreground: "var(--text-primary)",
        },
        input: "var(--border-strong)",
        ring: "var(--amber)",
      },
      borderRadius: {
        lg: "6px",
        md: "4px",
        sm: "2px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shimmer: {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
        spinRing: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        flowEdge: {
          to: { strokeDashoffset: "-20" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-status": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 1.2s infinite",
        "spin-ring": "spinRing 1s linear infinite",
        "flow-edge": "flowEdge 700ms linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
