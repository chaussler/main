import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { captionSerif } from "../theme";
import type { Caption } from "../captions";

type Props = {
  captions: Caption[];
  startFrame: number; // composition frame where this clip's captions begin
};

// Pop-on phrase captions: white serif on a black rounded pill, centered low,
// each phrase springs in as speech reaches it — matching the example cold open.
export const Captions: React.FC<Props> = ({ captions, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = (frame - startFrame) / fps; // seconds into this clip

  // Find the active caption (last one whose window contains `local`).
  let active: { cap: Caption; index: number } | null = null;
  for (let i = 0; i < captions.length; i++) {
    const c = captions[i];
    const end = i < captions.length - 1 ? Math.max(c.end, captions[i + 1].start) : c.end + 0.6;
    if (local >= c.start && local < end) active = { cap: c, index: i };
  }
  if (!active) return null;

  const appear = spring({
    frame: frame - startFrame - Math.round(active.cap.start * fps),
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 180 },
    durationInFrames: 8,
  });
  const scale = 0.9 + appear * 0.1;
  const opacity = Math.min(1, appear * 1.4);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 288,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          transform: `scale(${scale})`,
          opacity,
          background: "rgba(0,0,0,0.88)",
          borderRadius: 16,
          padding: "8px 30px 14px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: captionSerif,
            fontWeight: 700,
            fontSize: 90,
            lineHeight: 1.12,
            color: "#fff",
            letterSpacing: 0.3,
          }}
        >
          {active.cap.text}
        </span>
      </div>
    </div>
  );
};
