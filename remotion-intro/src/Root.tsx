import { Composition } from "remotion";
import { Intro } from "./Intro";
import { ColdOpen, COLD_OPEN_FRAMES } from "./ColdOpen";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ColdOpen"
        component={ColdOpen}
        durationInFrames={COLD_OPEN_FRAMES} /* ~63.2s @ 30fps */
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={1275} /* 42.5s @ 30fps */
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
