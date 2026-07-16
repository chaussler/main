import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Background } from "./components/Background";
import { LogoChip } from "./components/LogoChip";
import { BrowserWindow } from "./components/BrowserWindow";
import { HeadshotCard } from "./components/HeadshotCard";
import { QuoteCard } from "./components/QuoteCard";
import { segFade } from "./util";

const DOMAIN = "functionalnurseacademy.com";

// Native strip heights (see remotion-intro/public)
const HOME_H = 8250;
const TEST_H = 4714;

// A segment wrapper that fades its content in/out for clean cross-dissolves.
const Seg: React.FC<{
  from: number;
  len: number;
  fadeIn?: number;
  fadeOut?: number;
  children: (local: number, len: number) => React.ReactNode;
}> = ({ from, len, fadeIn = 14, fadeOut = 14, children }) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  return (
    <Sequence from={from} durationInFrames={len}>
      <AbsoluteFill style={{ opacity: segFade(local, len, fadeIn, fadeOut) }}>
        {children(local, len)}
      </AbsoluteFill>
    </Sequence>
  );
};

export const Intro: React.FC = () => {
  return (
    <AbsoluteFill>
      <Background />
      <Audio src={staticFile("soundtrack.wav")} />

      {/* S1 — Title / headshot (VO: "today's guest is a seasoned registered nurse…") */}
      <Seg from={0} len={246} fadeIn={18}>
        {(local, len) => (
          <HeadshotCard
            local={local}
            length={len}
            kicker="Today's Guest"
            lines={[
              "Registered Nurse · Approved Provider of Nursing CE",
              "Board-Certified Functional Medicine Practitioner",
              "Founder, Functional Nurse Academy",
            ]}
          />
        )}
      </Seg>

      {/* S2 — Home page: hero → humanitarian (VO: "built a successful functional medicine business…") */}
      <Seg from={234} len={240}>
        {(local, len) => (
          <BrowserWindow
            src="fna_home.png"
            imgHeight={HOME_H}
            fromFrac={0.09}
            toFrac={0.25}
            domain={DOMAIN}
            local={local}
            length={len}
          />
        )}
      </Seg>

      {/* S3 — Benefits / Goodbye Sick-Care (VO: "root cause, lifestyle and nutrition-based approaches…") */}
      <Seg from={462} len={246}>
        {(local, len) => (
          <BrowserWindow
            src="fna_home.png"
            imgHeight={HOME_H}
            fromFrac={0.52}
            toFrac={0.70}
            domain={DOMAIN}
            local={local}
            length={len}
          />
        )}
      </Seg>

      {/* S4 — Graduate testimonials grid (VO: "to train nurses nationwide…") */}
      <Seg from={696} len={240}>
        {(local, len) => (
          <BrowserWindow
            src="fna_testimonials.png"
            imgHeight={TEST_H}
            fromFrac={0.06}
            toFrac={0.44}
            domain={`${DOMAIN}/testimonials`}
            local={local}
            length={len}
          />
        )}
      </Seg>

      {/* S5a — Pull quote (VO: "later launched … to extend functional medicine training…") */}
      <Seg from={924} len={132}>
        {(local, len) => (
          <QuoteCard
            local={local}
            length={len}
            kicker="Graduates Say"
            quote="This is hands down the best functional medicine course that I have ever taken."
            author="Althea Douglas, FNP-BC"
            role="BC-FMP"
          />
        )}
      </Seg>

      {/* S5b — Second pull quote */}
      <Seg from={1050} len={96}>
        {(local, len) => (
          <QuoteCard
            local={local}
            length={len}
            kicker="Graduates Say"
            quote="I spent over $10K on another program and didn't learn half of what I did here."
            author="Stephanie Escamillia, NP-C"
            role="Functional Nurse Academy Graduate"
          />
        )}
      </Seg>

      {/* S6 — Closing name lockup (VO: "Welcome, Melissa, so happy to have you today.") */}
      <Seg from={1140} len={135} fadeOut={20}>
        {(local, len) => (
          <HeadshotCard
            local={local}
            length={len}
            kicker="Welcome, Melissa!"
            lines={[
              "Founder, Functional Nurse Academy",
              "& the Christian Functional Medicine Academy",
            ]}
          />
        )}
      </Seg>

      {/* Persistent show branding on top of everything */}
      <LogoChip />
    </AbsoluteFill>
  );
};
