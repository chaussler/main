import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Michael Sonick, DMD — dark theme, brand orange accent
        page: "#000000", // app background (brand "Dark")
        panel: "#121214", // cards (slightly raised off pure black)
        panel2: "#1c1c20", // inner tiles
        line: "#2a2a30", // borders
        ink: "#f4f4f5", // primary text
        muted: "#9aa0aa", // secondary text
        accent: "#F15D32", // brand orange
        good: "#34d399",
        bad: "#f87171",
        warn: "#fbbf24",
      },
    },
  },
  plugins: [],
};
export default config;
