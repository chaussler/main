import { Img, staticFile } from "remotion";
import { garamond, poppins, FNA, SHOW } from "../theme";
import { lerp, easeOut } from "../util";

type Props = {
  local: number;
  length: number;
  kicker: string;
  lines: string[];
};

// Portrait "title card": framed headshot with a slow Ken Burns move, paired
// with an editorial name + credentials lockup. Used for the open and close.
export const HeadshotCard: React.FC<Props> = ({ local, length, kicker, lines }) => {
  // Ken Burns on the portrait
  const kb = lerp(local, [0, length], [1.04, 1.11], (n) => n);
  const kbY = lerp(local, [0, length], [0, -14], (n) => n);

  // Portrait entrance
  const pX = lerp(local, [0, 26], [-48, 0], easeOut);
  const pOp = lerp(local, [0, 20], [0, 1], easeOut);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 82,
      }}
    >
      {/* Framed portrait */}
      <div
        style={{
          width: 486,
          height: 618,
          borderRadius: 14,
          background: "#fff",
          padding: 14,
          boxShadow:
            "0 40px 84px rgba(23,35,55,0.32), 0 12px 26px rgba(23,35,55,0.20)",
          transform: `translateX(${pX}px)`,
          opacity: pOp,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("headshot.jpeg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${kb}) translateY(${kbY}px)`,
            }}
          />
        </div>
      </div>

      {/* Name + credentials */}
      <div style={{ width: 720 }}>
        <Reveal local={local} delay={16}>
          <div
            style={{
              fontFamily: poppins,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 4,
              color: FNA.tealDeep,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {kicker}
          </div>
        </Reveal>
        <Reveal local={local} delay={24}>
          <div
            style={{
              fontFamily: garamond,
              fontSize: 88,
              fontWeight: 600,
              lineHeight: 1.02,
              color: SHOW.ink,
            }}
          >
            Melissa Schreibfeder
          </div>
        </Reveal>
        <Reveal local={local} delay={34}>
          <div
            style={{
              width: 92,
              height: 4,
              borderRadius: 2,
              background: FNA.teal,
              margin: "26px 0 24px",
            }}
          />
        </Reveal>
        {lines.map((l, i) => (
          <Reveal key={i} local={local} delay={40 + i * 8}>
            <div
              style={{
                fontFamily: poppins,
                fontSize: 27,
                fontWeight: 400,
                lineHeight: 1.5,
                color: SHOW.inkSoft,
              }}
            >
              {l}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};

const Reveal: React.FC<{
  local: number;
  delay: number;
  children: React.ReactNode;
}> = ({ local, delay, children }) => {
  const op = lerp(local, [delay, delay + 16], [0, 1], easeOut);
  const y = lerp(local, [delay, delay + 20], [16, 0], easeOut);
  return <div style={{ opacity: op, transform: `translateY(${y}px)` }}>{children}</div>;
};
