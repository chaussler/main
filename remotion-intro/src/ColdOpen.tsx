import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { LogoChip } from "./components/LogoChip";
import { Captions } from "./components/Caption";
import { BRollLayer, PipClip, CLIP1_PIP, CLIP2_PIP } from "./components/BRoll";
import { clip1Captions, clip2Captions } from "./captions";

// Clip lengths (frames @30fps): clip1 = 27.867s, clip2 = 35.367s
export const CLIP1_FRAMES = 836;
export const CLIP2_FRAMES = 1061;
export const COLD_OPEN_FRAMES = CLIP1_FRAMES + CLIP2_FRAMES; // 1897

const AnimatedLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const x = (1 - p) * -360;
  return (
    <AbsoluteFill style={{ transform: `translateX(${x}px)`, opacity: p }}>
      <LogoChip />
    </AbsoluteFill>
  );
};

export const ColdOpen: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Periwinkle backdrop revealed behind the guest during b-roll moments */}
      <Background />

      {/* B-roll cards sit behind the guest clip (revealed when it goes to PiP) */}
      <BRollLayer />

      {/* Guest clips — full-frame normally, shrink to a top-left PiP on b-roll */}
      <Sequence from={0} durationInFrames={CLIP1_FRAMES}>
        <PipClip src="clip1.mp4" windows={CLIP1_PIP} />
        <Captions captions={clip1Captions} startFrame={0} />
      </Sequence>
      <Sequence from={CLIP1_FRAMES} durationInFrames={CLIP2_FRAMES}>
        <PipClip src="clip2.mp4" windows={CLIP2_PIP} />
        {/* Hide captions during the closing quote card (M4) to avoid duplicate text */}
        <Captions captions={clip2Captions} startFrame={0} hideFrames={[{ from: 951, to: 1056 }]} />
      </Sequence>

      {/* Persistent show logo, slides in at the top-left */}
      <AnimatedLogo />
    </AbsoluteFill>
  );
};
