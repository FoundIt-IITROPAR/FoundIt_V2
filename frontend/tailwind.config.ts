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
        paper: "#070B15",
        ink: "#F9F8F4",
        "ink-soft": "#9DAAC4",
        amber: {
          DEFAULT: "#B82601",
          dark: "#8E1C01",
          light: "#F6C2B5",
        },
        rust: {
          DEFAULT: "#813772",
          dark: "#612555",
          light: "#D6B7D4",
        },
        pine: {
          DEFAULT: "#19656F",
          dark: "#11474F",
          light: "#B8D8DE",
        },
        line: "#202D43",
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
