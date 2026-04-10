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
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        card: "var(--card)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        amber: {
          DEFAULT: "var(--amber)",
          dim: "var(--amber-dim)",
          bright: "var(--amber-bright)",
        },
        strategist: {
          DEFAULT: "var(--strategist)",
          dim: "var(--strategist-dim)",
        },
        critic: {
          DEFAULT: "var(--critic)",
          dim: "var(--critic-dim)",
        },
        executor: {
          DEFAULT: "var(--executor)",
          dim: "var(--executor-dim)",
        },
        green: "var(--green)",
        red: "var(--red)",
        blue: "var(--blue)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        /* fallback shadcn vars for internal compatibility */
        background: "var(--bg)",
        foreground: "var(--text-primary)",
        popover: "var(--surface)",
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
          foreground: "var(--amber-bright)",
        },
        destructive: {
          DEFAULT: "var(--red)",
          foreground: "var(--text-primary)",
        },
        input: "var(--border)",
        ring: "var(--amber)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        shimmerPurple: {
          "0%": { boxShadow: "inset 0 0 0 0 transparent" },
          "50%": { boxShadow: "inset 100px 0 50px -50px var(--strategist-dim)" },
          "100%": { boxShadow: "inset 0 0 0 0 transparent" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer-purple": "shimmerPurple 2s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
