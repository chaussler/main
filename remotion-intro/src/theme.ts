// Self-hosted fonts (bundled locally, no network needed at render time)
import "@fontsource/eb-garamond/400.css";
import "@fontsource/eb-garamond/500.css";
import "@fontsource/eb-garamond/600.css";
import "@fontsource/eb-garamond/400-italic.css";
import "@fontsource/eb-garamond/500-italic.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";

export const garamond = "'EB Garamond', Georgia, serif";
export const poppins = "'Poppins', system-ui, sans-serif";

// --- Show brand: "Take Back Your Health with Dr. Amy Myers" ---
export const SHOW = {
  bg: "#ABC0D4", // periwinkle slate-blue background sampled from the example
  bgDeep: "#9DB3C9",
  chip: "#B9C9DA", // slightly lighter panel for the logo chip
  ink: "#20304A", // dark navy text
  inkSoft: "#3C4C63",
  white: "#FFFFFF",
};

// --- Guest brand: Functional Nurse Academy ---
export const FNA = {
  teal: "#4FBEB2",
  tealDeep: "#3AA79B",
  navy: "#2E2A47", // deep plum-navy used across the site
  navyText: "#2B2740",
  lavender: "#F0EEF9",
  lavenderDeep: "#E7E3F6",
  white: "#FFFFFF",
};

// Timing helpers (fps = 30)
export const FPS = 30;
