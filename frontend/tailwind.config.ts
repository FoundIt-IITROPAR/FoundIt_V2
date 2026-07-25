import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F6F3EC",
        ink: "#1E2A38",
        "ink-soft": "#48566A",
        amber: {
          DEFAULT: "#E29A3C",
          dark: "#B9772A",
          light: "#F4D9A8",
        },
        rust: {
          DEFAULT: "#C1503D",
          dark: "#9A3E30",
          light: "#EFC9C0",
        },
        pine: {
          DEFAULT: "#3F7D63",
          dark: "#2E5D49",
          light: "#CBE3D6",
        },
        line: "#DCD5C4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        tag: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        tag: "6px",
      },
      backgroundImage: {
        perforation:
          "radial-gradient(circle, rgba(30,42,56,0.18) 1.5px, transparent 1.5px)",
      },
      backgroundSize: {
        perf: "10px 10px",
      },
    },
  },
  plugins: [],
};
export default config;
