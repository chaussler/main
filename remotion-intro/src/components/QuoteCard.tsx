import { garamond, poppins, FNA } from "../theme";
import { lerp, easeOut } from "../util";

type Props = {
  local: number;
  length: number;
  kicker: string;
  quote: string;
  author: string;
  role: string;
};

// Functional Nurse Academy–styled pull-quote card (lavender/teal/navy).
export const QuoteCard: React.FC<Props> = ({
  local,
  length,
  kicker,
  quote,
  author,
  role,
}) => {
  const op = lerp(local, [0, 18], [0, 1], easeOut);
  const y = lerp(local, [0, 22], [34, 0], easeOut);
  const scale = lerp(local, [0, 22], [0.97, 1], easeOut);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 1240,
          padding: "70px 96px 76px",
          borderRadius: 26,
          background: FNA.lavender,
          boxShadow:
            "0 44px 96px rgba(23,35,55,0.30), 0 14px 30px rgba(23,35,55,0.18)",
          opacity: op,
          transform: `translateY(${y}px) scale(${scale})`,
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: garamond,
            fontSize: 190,
            lineHeight: 0.6,
            color: FNA.teal,
            height: 86,
            overflow: "hidden",
          }}
        >
          &ldquo;
        </div>

        <div
          style={{
            fontFamily: poppins,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: FNA.tealDeep,
            marginBottom: 22,
          }}
        >
          {kicker}
        </div>

        <div
          style={{
            fontFamily: garamond,
            fontSize: 52,
            lineHeight: 1.28,
            fontStyle: "italic",
            color: FNA.navyText,
          }}
        >
          {quote}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 40 }}>
          <div style={{ width: 54, height: 4, borderRadius: 2, background: FNA.teal }} />
          <div>
            <div
              style={{
                fontFamily: poppins,
                fontSize: 26,
                fontWeight: 600,
                color: FNA.navyText,
              }}
            >
              {author}
            </div>
            <div
              style={{
                fontFamily: poppins,
                fontSize: 20,
                fontWeight: 400,
                color: FNA.tealDeep,
                marginTop: 2,
              }}
            >
              {role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
