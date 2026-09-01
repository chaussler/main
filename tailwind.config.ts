import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // class names used in data (e.g. reach.ts slice colors)
  ],
  theme: {
    extend: {
      colors: {
        // Podcast Reach Dashboard — dark studio theme, violet accent
        page: "#0b0b10", // app background
        panel: "#14141a", // cards (slightly raised off the background)
        panel2: "#1d1d26", // inner tiles
        line: "#2b2b36", // borders
        ink: "#f4f4f5", // primary text
        muted: "#9aa0aa", // secondary text
        accent: "#8b5cf6", // violet
        good: "#34d399",
        bad: "#f87171",
        warn: "#fbbf24",
      },
    },
  },
  plugins: [],
};
export default config;
