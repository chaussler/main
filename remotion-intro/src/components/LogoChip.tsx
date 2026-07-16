import { garamond, poppins, SHOW } from "../theme";

// Persistent "Take Back Your Health with Dr. Amy Myers" lockup, pinned
// top-left exactly like the example template.
export const LogoChip: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        padding: "14px 26px 16px 28px",
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        background: "rgba(206, 218, 231, 0.55)",
        boxShadow: "0 2px 10px rgba(32,48,74,0.10)",
        lineHeight: 1,
      }}
    >
      <div
        style={{
          fontFamily: garamond,
          fontSize: 40,
          fontWeight: 600,
          color: SHOW.ink,
          letterSpacing: 0.2,
        }}
      >
        Take Back Your{" "}
        <span style={{ color: SHOW.white }}>Health</span>
        <span
          style={{
            fontFamily: poppins,
            fontSize: 15,
            verticalAlign: "super",
            color: SHOW.ink,
            marginLeft: 2,
          }}
        >
          ®
        </span>
      </div>
      <div
        style={{
          fontFamily: poppins,
          fontSize: 16,
          fontWeight: 400,
          color: SHOW.inkSoft,
          marginTop: 8,
          letterSpacing: 0.3,
        }}
      >
        with Dr. Amy Myers
      </div>
    </div>
  );
};
