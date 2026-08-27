import type { LayoutArea, LayoutDrawingFile, LayoutTask } from "@/types/layout";

/** id 0 = full layout covering all rooms in one document */
export const LAYOUT_ALL_AREA_ID = 0;

export const LAYOUT_AREAS: LayoutArea[] = [
  { id: LAYOUT_ALL_AREA_ID, name: "All" },
  { id: 1, name: "Lobby" },
  { id: 2, name: "Directors Room" },
  { id: 3, name: "Meeting Room" },
  { id: 4, name: "Reception Area" },
  { id: 5, name: "Kitchen & Break" },
];

export const LAYOUT_INITIAL_DRAWINGS: LayoutDrawingFile[] = [
  {
    id: 1,
    areaId: LAYOUT_ALL_AREA_ID,
    name: "Full_Layout_All_Rooms_v2.pdf",
    type: "pdf",
    size: "12.6 MB",
    date: "26 Jul 2026",
  },
  {
    id: 2,
    areaId: LAYOUT_ALL_AREA_ID,
    name: "Full_Floor_Plan.dwg",
    type: "dwg",
    size: "4.8 MB",
    date: "26 Jul 2026",
  },
  { id: 3, areaId: 1, name: "Lobby_Layout_v1.pdf", type: "pdf", size: "5.4 MB", date: "24 Jul 2026" },
  { id: 4, areaId: 1, name: "Lobby_Dimensions.dwg", type: "dwg", size: "2.1 MB", date: "25 Jul 2026" },
  { id: 5, areaId: 1, name: "Lobby_Lighting.pdf", type: "pdf", size: "3.8 MB", date: "25 Jul 2026" },
];

export const LAYOUT_INITIAL_TASKS: LayoutTask[] = [
  { id: 1, title: "Finalise floor plan dimensions", assigneeId: 1, status: "done" },
  { id: 2, title: "Review structural constraints", assigneeId: 2, status: "in-progress" },
  { id: 3, title: "Prepare client presentation", assigneeId: 1, status: "todo" },
];
