export const BUILDER_LEFT_MIN = 240;
export const BUILDER_LEFT_MAX = 520;
export const BUILDER_LEFT_DEFAULT = 320;

export const BUILDER_RIGHT_MIN = 280;
export const BUILDER_RIGHT_MAX = 520;
export const BUILDER_RIGHT_DEFAULT = 320;

export function clampBuilderLeftWidth(n: number): number {
  return Math.min(BUILDER_LEFT_MAX, Math.max(BUILDER_LEFT_MIN, n));
}

export function clampBuilderRightWidth(n: number): number {
  return Math.min(BUILDER_RIGHT_MAX, Math.max(BUILDER_RIGHT_MIN, n));
}
