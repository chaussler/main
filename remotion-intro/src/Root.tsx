import { Composition } from "remotion";
import { Intro } from "./Intro";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Intro"
      component={Intro}
      durationInFrames={1275} /* 42.5s @ 30fps */
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
