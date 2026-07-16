import { AbsoluteFill } from "remotion";
import { SHOW } from "../theme";

// The flat periwinkle backdrop from the show template, with a very subtle
// vertical sheen for depth (matches the soft studio look of the example).
export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 100% at 50% 0%, ${SHOW.chip} 0%, ${SHOW.bg} 45%, ${SHOW.bgDeep} 100%)`,
      }}
    />
  );
};
