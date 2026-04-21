import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slatebg: "#0f172a",
        card: "#111827",
        line: "#1f2937",
        accent: {
          blue: "#38bdf8",
          green: "#22c55e",
          orange: "#fb923c",
        },
      },
      boxShadow: {
        glow: "0 10px 40px rgba(56, 189, 248, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
