import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { LogoChip } from "./components/LogoChip";
import { Captions } from "./components/Caption";
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
      <Sequence from={0} durationInFrames={CLIP1_FRAMES}>
        <OffthreadVideo src={staticFile("clip1.mp4")} />
        {/* Captions scoped to this clip so they never bleed past the cut */}
        <Captions captions={clip1Captions} startFrame={0} />
      </Sequence>
      <Sequence from={CLIP1_FRAMES} durationInFrames={CLIP2_FRAMES}>
        <OffthreadVideo src={staticFile("clip2.mp4")} />
        <Captions captions={clip2Captions} startFrame={0} />
      </Sequence>

      {/* Persistent show logo, slides in at the top-left */}
      <AnimatedLogo />
    </AbsoluteFill>
  );
};
