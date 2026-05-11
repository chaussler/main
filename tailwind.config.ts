import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        panel: "#121a2b",
        panel2: "#18233a",
        muted: "#8b97ad",
        accent: "#5b8def",
        good: "#3ecf8e",
        bad: "#f06a6a",
        warn: "#e2b53e",
      },
    },
  },
  plugins: [],
};
export default config;
