export const VIEWPORT_WIDTHS = {
  desktop: 600,
  tablet: 500,
  mobile: 375,
} as const;

export type ViewportMode = keyof typeof VIEWPORT_WIDTHS;

export const getViewportWidth = (mode: ViewportMode): number =>
  VIEWPORT_WIDTHS[mode] ?? VIEWPORT_WIDTHS.desktop;
