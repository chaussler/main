import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { poppins } from "../theme";
import type { Caption } from "../captions";

type Props = {
  captions: Caption[];
  startFrame: number; // composition frame where this clip's captions begin
};

const HIGHLIGHT = "#FFE000"; // yellow for the word currently being spoken

// Clean white sans-serif captions (no background box) with a heavy outline for
// legibility over the bright background; the active word is highlighted yellow.
export const Captions: React.FC<Props> = ({ captions, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = (frame - startFrame) / fps; // seconds into this clip

  let active: { cap: Caption; index: number } | null = null;
  for (let i = 0; i < captions.length; i++) {
    const c = captions[i];
    const end = i < captions.length - 1 ? Math.max(c.end, captions[i + 1].start) : c.end + 0.6;
    if (local >= c.start && local < end) active = { cap: c, index: i };
  }
  if (!active) return null;

  const cap = active.cap;
  // The active word is the last one that has started (holds through small gaps).
  let activeWord = -1;
  for (let i = 0; i < cap.words.length; i++) {
    if (cap.words[i].s <= local) activeWord = i;
  }

  const appear = spring({
    frame: frame - startFrame - Math.round(cap.start * fps),
    fps,
    config: { damping: 200, mass: 0.4, stiffness: 190 },
    durationInFrames: 7,
  });
  const scale = 0.94 + appear * 0.06;
  const opacity = Math.min(1, appear * 1.5);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 262,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1560,
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 24px",
          fontFamily: poppins,
          fontWeight: 700,
          fontSize: 78,
          lineHeight: 1.18,
          letterSpacing: 0.5,
          // Legibility without a background box: dark stroke behind the fill + soft shadow.
          WebkitTextStroke: "6px rgba(0,0,0,0.92)",
          paintOrder: "stroke fill",
          textShadow: "0 4px 14px rgba(0,0,0,0.55)",
        }}
      >
        {cap.words.map((w, i) => (
          <span key={i} style={{ color: i === activeWord ? HIGHLIGHT : "#fff" }}>
            {w.t}
          </span>
        ))}
      </div>
    </div>
  );
};
