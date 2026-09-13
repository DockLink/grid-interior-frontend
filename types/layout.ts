export type LayoutView = "drawings" | "confirmation";

export type LayoutDrawingType = "pdf" | "dwg" | "img";
export type LayoutTaskStatus = "todo" | "in-progress" | "done";

export interface LayoutArea {
  id: number | string;
  name: string;
}

export interface LayoutDrawingFile {
  id: number | string;
  areaId: number | string;
  name: string;
  type: LayoutDrawingType;
  size: string;
  date: string;
  url?: string;
  fileId?: string;
}

export interface LayoutTask {
  id: number | string;
  title: string;
  assigneeId: number | string;
  status: LayoutTaskStatus;
}

const ALLOWED: LayoutView[] = ["drawings", "confirmation"];

export function layoutViewFromParam(view: string | undefined): LayoutView {
  if (view && ALLOWED.includes(view as LayoutView)) return view as LayoutView;
  return "drawings";
}
