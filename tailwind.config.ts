import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: "var(--bg-app)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          elevated: "var(--bg-surface-elevated)",
          subtle: "var(--bg-surface-subtle)",
        },
        borderSubtle: "var(--border-subtle)",
        borderStrong: "var(--border-strong)",
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          active: "var(--accent-active)",
          subtle: "var(--accent-subtle)",
        },
        gain: {
          DEFAULT: "var(--color-gain)",
          subtle: "var(--color-gain-subtle)",
          border: "var(--color-gain-border)",
        },
        loss: {
          DEFAULT: "var(--color-loss)",
          subtle: "var(--color-loss-subtle)",
          border: "var(--color-loss-border)",
        },
        neutralMuted: "var(--color-neutral)",
        warningMuted: "var(--color-warning)",
      },
      borderRadius: {
        ui: "var(--radius-ui)", // Strict 12px
      },
      boxShadow: {
        ui: "var(--shadow-ui)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
      },
      minHeight: {
        touch: "var(--min-touch-target)",
      },
      minWidth: {
        touch: "var(--min-touch-target)",
      },
    },
  },
  plugins: [],
};

export default config;
