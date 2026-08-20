export type ThreeDView = "visualizations" | "confirmation";

export interface ThreeDArea {
  id: number;
  name: string;
}

export interface ThreeDRenderImage {
  id: number;
  url: string;
  caption: string;
}

const ALLOWED: ThreeDView[] = ["visualizations", "confirmation"];

export function threedViewFromParam(view: string | undefined): ThreeDView {
  if (view && ALLOWED.includes(view as ThreeDView)) return view as ThreeDView;
  return "visualizations";
}
