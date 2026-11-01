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
        jse: {
          bg: "#0A0E17",
          surface: "#111726",
          surfaceAlt: "#161F33",
          card: "rgba(18, 26, 44, 0.75)",
          border: "#1E293B",
          borderLight: "rgba(255, 255, 255, 0.08)",
          cyan: "#00F0FF",
          emerald: "#10B981",
          rose: "#F43F5E",
          amber: "#F59E0B",
          indigo: "#6366F1",
        },
        trading: {
          green: "#10b981",
          greenDark: "#059669",
          red: "#ef4444",
          redDark: "#dc2626",
          darkBg: "#070B12",
          cardBg: "#111726",
          border: "#1E293B",
          accent: "#00F0FF",
        },
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slight": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
