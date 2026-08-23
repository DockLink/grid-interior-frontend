export type LayoutView = "drawings" | "confirmation";

export type LayoutDrawingType = "pdf" | "dwg" | "img";
export type LayoutTaskStatus = "todo" | "in-progress" | "done";

export interface LayoutArea {
  id: number;
  name: string;
}

export interface LayoutDrawingFile {
  id: number;
  name: string;
  type: LayoutDrawingType;
  size: string;
  date: string;
  url?: string;
}

export interface LayoutTask {
  id: number;
  title: string;
  assigneeId: number;
  status: LayoutTaskStatus;
}

const ALLOWED: LayoutView[] = ["drawings", "confirmation"];

export function layoutViewFromParam(view: string | undefined): LayoutView {
  if (view && ALLOWED.includes(view as LayoutView)) return view as LayoutView;
  return "drawings";
}
