import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary accent
        primary: "#2563EB",

        // Snowfall gradient colors
        snowfall: {
          "0-2": "#DBEAFE",
          "2-4": "#60A5FA",
          "4-6": "#2563EB",
          "6-10": "#1E40AF",
          "10-plus": "#7C3AED",
        },

        // Light mode
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#1E293B",
        border: "#E2E8F0",

        // Dark mode
        "dark-background": "#0F172A",
        "dark-surface": "#1E293B",
        "dark-text": "#F1F5F9",
        "dark-border": "#334155",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "SF Pro", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Monaco", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
