import { interpolate, Easing } from "remotion";

// Smooth in/out opacity for a segment given the local frame and its length.
export const segFade = (local: number, length: number, fadeIn = 12, fadeOut = 12) =>
  interpolate(
    local,
    [0, fadeIn, length - fadeOut, length],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

// Gentle ease used for entrance motion.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// Linear map with clamping.
export const lerp = (
  local: number,
  inRange: [number, number],
  outRange: [number, number],
  easing?: (n: number) => number
) =>
  interpolate(local, inRange, outRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
