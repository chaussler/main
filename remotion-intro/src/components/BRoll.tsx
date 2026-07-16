import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  Easing,
} from "remotion";
import { garamond, poppins } from "../theme";

// ---------------------------------------------------------------------------
// Timing windows (frames @30fps). PiP windows are LOCAL to each clip; card
// windows are in COMPOSITION frames (clip2 starts at frame 836).
// ---------------------------------------------------------------------------
export type Win = { from: number; to: number };

export const CLIP1_PIP: Win[] = [{ from: 198, to: 327 }]; // M1
export const CLIP2_PIP: Win[] = [
  { from: 186, to: 291 }, // M2  (antibodies)
  { from: 678, to: 861 }, // M3  (3 years / chronic Lyme)
  { from: 951, to: 1056 }, // M4 (gave me my life back)
];

const ease = Easing.bezier(0.5, 0, 0.2, 1);

// Ramp 0→1→0 across a window with eased edges.
const rampWin = (frame: number, w: Win, r = 10) =>
  interpolate(frame, [w.from, w.from + r, w.to - r, w.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export const pipAmount = (frame: number, windows: Win[]) =>
  windows.reduce((m, w) => Math.max(m, rampWin(frame, w)), 0);

export const inAnyWindow = (frame: number, windows: Win[]) =>
  windows.some((w) => frame >= w.from && frame < w.to);

// ---------------------------------------------------------------------------
// Guest clip that shrinks into a top-left PiP during its b-roll windows.
// ---------------------------------------------------------------------------
export const PipClip: React.FC<{ src: string; windows: Win[] }> = ({ src, windows }) => {
  const frame = useCurrentFrame();
  const p = pipAmount(frame, windows);
  const left = 36 * p;
  const top = 150 * p;
  const width = 1920 - 1516 * p; // → 404
  const height = 1080 - 853 * p; // → 227
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: 14 * p,
        overflow: "hidden",
        border: p > 0.02 ? `${4 * p}px solid rgba(255,255,255,0.9)` : "none",
        boxShadow: p > 0.02 ? `0 ${30 * p}px ${60 * p}px rgba(15,25,45,${0.35 * p})` : "none",
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// B-roll card scaffolding
// ---------------------------------------------------------------------------
const CARD = { left: 512, top: 132, width: 1360, height: 496 };
const ACCENT = "#9DB8D6";

const Card: React.FC<{ local: number; length: number; children: React.ReactNode }> = ({
  local,
  length,
  children,
}) => {
  const op = interpolate(local, [0, 12, length - 12, length], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(local, [0, 16], [46, 0], { extrapolateRight: "clamp", easing: ease });
  return (
    <div
      style={{
        position: "absolute",
        ...CARD,
        transform: `translateX(${x}px)`,
        opacity: op,
        borderRadius: 22,
        background: "linear-gradient(150deg, #1b2c48 0%, #26384f 100%)",
        boxShadow: "0 44px 96px rgba(12,20,38,0.45)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 78px",
      }}
    >
      {/* soft periwinkle glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(80% 120% at 15% 0%, rgba(157,184,214,0.22), transparent 60%)",
        }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: poppins,
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: ACCENT,
      marginBottom: 20,
    }}
  >
    {children}
  </div>
);

const Reveal: React.FC<{ local: number; delay: number; children: React.ReactNode }> = ({
  local,
  delay,
  children,
}) => {
  const op = interpolate(local, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(local, [delay, delay + 18], [22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return <div style={{ opacity: op, transform: `translateY(${y}px)` }}>{children}</div>;
};

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "6px 0" }}>
    <div style={{ width: 16, height: 16, borderRadius: 8, background: ACCENT, flexShrink: 0 }} />
    <span style={{ fontFamily: garamond, fontSize: 74, fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
      {children}
    </span>
  </div>
);

// ---- individual cards -----------------------------------------------------
const CardM1: React.FC<{ local: number; length: number }> = ({ local, length }) => (
  <Card local={local} length={length}>
    <Reveal local={local} delay={10}>
      <Kicker>Chronic Lyme can trigger</Kicker>
    </Reveal>
    <Reveal local={local} delay={22}>
      <Chip>Inflammation</Chip>
    </Reveal>
    <Reveal local={local} delay={34}>
      <Chip>Nutrient deficiencies</Chip>
    </Reveal>
  </Card>
);

const BigNumber: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: garamond, fontWeight: 700, fontSize: 210, lineHeight: 0.92, color: "#fff" }}>
    {children}
  </div>
);

const CardM2: React.FC<{ local: number; length: number }> = ({ local, length }) => (
  <Card local={local} length={length}>
    <Reveal local={local} delay={10}>
      <Kicker>Her thyroid antibodies</Kicker>
    </Reveal>
    <Reveal local={local} delay={20}>
      <BigNumber>7,000+</BigNumber>
    </Reveal>
    <Reveal local={local} delay={34}>
      <div style={{ fontFamily: poppins, fontSize: 34, color: "#D7E1EF", marginTop: 10 }}>
        a Hashimoto&rsquo;s thyroiditis diagnosis
      </div>
    </Reveal>
  </Card>
);

const CardM3: React.FC<{ local: number; length: number }> = ({ local, length }) => (
  <Card local={local} length={length}>
    <Reveal local={local} delay={10}>
      <Kicker>Time to the right diagnosis</Kicker>
    </Reveal>
    <Reveal local={local} delay={20}>
      <BigNumber>3 YEARS</BigNumber>
    </Reveal>
    <Reveal local={local} delay={110}>
      <div
        style={{
          marginTop: 22,
          alignSelf: "flex-start",
          display: "inline-block",
          background: ACCENT,
          color: "#16233a",
          fontFamily: poppins,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: 1,
          padding: "10px 28px",
          borderRadius: 12,
        }}
      >
        Chronic Lyme Disease
      </div>
    </Reveal>
  </Card>
);

const CardM4: React.FC<{ local: number; length: number }> = ({ local, length }) => (
  <Card local={local} length={length}>
    <Reveal local={local} delay={8}>
      <div style={{ fontFamily: garamond, fontSize: 130, color: ACCENT, height: 60, lineHeight: 0.7 }}>
        &ldquo;
      </div>
    </Reveal>
    <Reveal local={local} delay={16}>
      <div style={{ fontFamily: garamond, fontStyle: "italic", fontSize: 82, lineHeight: 1.15, color: "#fff" }}>
        It gave me my life back.
      </div>
    </Reveal>
    <Reveal local={local} delay={30}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 30 }}>
        <div style={{ width: 46, height: 3, background: ACCENT }} />
        <span style={{ fontFamily: poppins, fontSize: 30, fontWeight: 600, color: "#D7E1EF" }}>
          Melissa Schreibfeder
        </span>
      </div>
    </Reveal>
  </Card>
);

// ---- card layer (composition frames) --------------------------------------
type CardDef = { win: Win; Comp: React.FC<{ local: number; length: number }> };
const CARDS: CardDef[] = [
  { win: { from: 198, to: 327 }, Comp: CardM1 },
  { win: { from: 1022, to: 1127 }, Comp: CardM2 },
  { win: { from: 1514, to: 1697 }, Comp: CardM3 },
  { win: { from: 1787, to: 1892 }, Comp: CardM4 },
];

export const BRollLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {CARDS.map(({ win, Comp }, i) =>
        frame >= win.from && frame < win.to ? (
          <Comp key={i} local={frame - win.from} length={win.to - win.from} />
        ) : null
      )}
    </AbsoluteFill>
  );
};
