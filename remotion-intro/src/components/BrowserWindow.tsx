import { Img, staticFile } from "remotion";
import { poppins } from "../theme";
import { lerp, easeInOut, easeOut } from "../util";

const NATIVE_W = 1500; // native pixel width of the scroll-strip assets

type Props = {
  src: string;
  imgHeight: number; // native pixel height of the strip
  fromFrac: number; // 0..1 start scroll position within scrollable range
  toFrac: number; // 0..1 end scroll position
  domain: string;
  local: number;
  length: number;
};

const CONTENT_W = 1440;
const CONTENT_H = 760;
const BAR_H = 52;

export const BrowserWindow: React.FC<Props> = ({
  src,
  imgHeight,
  fromFrac,
  toFrac,
  domain,
  local,
  length,
}) => {
  const scale = CONTENT_W / NATIVE_W;
  const scaledH = imgHeight * scale;
  const scrollRange = Math.max(0, scaledH - CONTENT_H);
  const p = lerp(local, [0, length], [0, 1], easeInOut);
  const y = -(fromFrac + (toFrac - fromFrac) * p) * scrollRange;

  // Entrance: gentle rise + settle from a slight tilt.
  const rise = lerp(local, [0, 22], [46, 0], easeOut);
  const tilt = lerp(local, [0, 22], [1.4, 0], easeOut);
  const zoom = lerp(local, [0, 22], [0.965, 1], easeOut);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 178,
        transform: `translateX(-50%) translateY(${rise}px) perspective(2200px) rotateX(${tilt}deg) scale(${zoom})`,
        width: CONTENT_W + 4,
        borderRadius: 16,
        background: "#1f1f22",
        boxShadow:
          "0 40px 90px rgba(23,35,55,0.34), 0 12px 30px rgba(23,35,55,0.22)",
        overflow: "hidden",
      }}
    >
      {/* Title bar (macOS Safari style) */}
      <div
        style={{
          height: BAR_H,
          background: "linear-gradient(#37373b, #2c2c30)",
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 9,
        }}
      >
        <Dot color="#ff5f57" />
        <Dot color="#febc2e" />
        <Dot color="#28c840" />
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              minWidth: 420,
              height: 30,
              borderRadius: 8,
              background: "#48484d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#d7d7db",
              fontFamily: poppins,
              fontSize: 15,
            }}
          >
            <span style={{ opacity: 0.7, fontSize: 13 }}>🔒</span>
            {domain}
          </div>
        </div>
        <div style={{ width: 54 }} />
      </div>

      {/* Content viewport */}
      <div
        style={{
          width: CONTENT_W,
          height: CONTENT_H,
          margin: "0 auto",
          background: "#fff",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            top: 0,
            left: -16,
            width: CONTENT_W + 32, // slight over-scale clips the chat-widget sliver at the right edge
            transform: `translateY(${y}px)`,
          }}
        />
      </div>
    </div>
  );
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{ width: 13, height: 13, borderRadius: "50%", background: color }}
  />
);
