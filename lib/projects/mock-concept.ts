import type {
  ConceptArea,
  ConceptCard,
  ConceptRenderImage,
  ConceptRevisionEntry,
} from "@/types/concept";

export const CONCEPT_AREAS: ConceptArea[] = [
  { id: 1, name: "Lobby", icon: "door_front", conceptCount: 3 },
  { id: 2, name: "Directors Room", icon: "work", conceptCount: 0 },
  { id: 3, name: "Meeting Room", icon: "groups", conceptCount: 0 },
  { id: 4, name: "Reception Area", icon: "desk", conceptCount: 0 },
  { id: 5, name: "Kitchen & Break", icon: "kitchen", conceptCount: 0 },
];

export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: 1,
    name: "Concept 1",
    areaId: 1,
    fileName: "Lobby_Concept_A.jpg",
    fileType: "jpg",
    fileSize: "2.4 MB",
    thumb: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=280&fit=crop&auto=format",
    confirmStatus: "confirmed",
  },
  {
    id: 2,
    name: "Concept 2",
    areaId: 1,
    fileName: "Lobby_Concept_B.jpg",
    fileType: "jpg",
    fileSize: "1.9 MB",
    thumb: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop&auto=format",
    confirmStatus: "pending",
  },
  {
    id: 3,
    name: "Concept 3",
    areaId: 1,
    fileName: "Lobby_Concept_C.pdf",
    fileType: "pdf",
    fileSize: "3.1 MB",
    thumb: "",
    confirmStatus: "pending",
  },
];

export const CONCEPT_RENDER_GALLERY: ConceptRenderImage[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop&auto=format",
    caption: "Main lobby — east view",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
    caption: "Reception counter detail",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    caption: "Ceiling feature — overview",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&auto=format",
    caption: "Seating alcove — night mode",
  },
];

export const CONCEPT_REVISION_LOG: ConceptRevisionEntry[] = [
  { id: 1, date: "18 Jul 2026", note: "Adjusted ceiling height annotation", chargeable: false },
  { id: 2, date: "21 Jul 2026", note: "Replaced sofa spec — client request", chargeable: false },
  { id: 3, date: "25 Jul 2026", note: "Added partition wall to east side", chargeable: true },
];
