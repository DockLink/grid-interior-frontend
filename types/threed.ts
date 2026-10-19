export type ThreeDView = "visualizations" | "confirmation";

export interface ThreeDArea {
  id: number | string;
  name: string;
}

export interface ThreeDRenderImage {
  id: number | string;
  url: string;
  caption: string;
  fileId?: string;
}

export interface ThreeDConfirmation {
  id: string | null;
  project_id: string;
  presented: boolean;
  feedback_received: boolean;
  confirmed: boolean;
  feedback_notes: string;
  confirmed_at: string | null;
  updated_at: string | null;
}

export interface ThreeDConfirmationUpdate {
  presented?: boolean;
  feedback_received?: boolean;
  confirmed?: boolean;
  feedback_notes?: string;
}

const ALLOWED: ThreeDView[] = ["visualizations", "confirmation"];

export function threedViewFromParam(view: string | undefined): ThreeDView {
  if (view && ALLOWED.includes(view as ThreeDView)) return view as ThreeDView;
  return "visualizations";
}
