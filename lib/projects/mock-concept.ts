import type {
  ConceptArea,
  ConceptCard,
  ConceptNonRenderFile,
  ConceptRenderImage,
  ConceptRevisionEntry,
} from "@/types/concept";

export const CONCEPT_AREAS: ConceptArea[] = [
  { id: 1, name: "Lobby", icon: "door_front", conceptCount: 3 },
  { id: 2, name: "Directors Room", icon: "work", conceptCount: 2 },
  { id: 3, name: "Meeting Room", icon: "groups", conceptCount: 1 },
  { id: 4, name: "Reception Area", icon: "desk", conceptCount: 2 },
  { id: 5, name: "Kitchen & Break", icon: "kitchen", conceptCount: 0 },
];

export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: 1,
    name: "Concept 1",
    areaId: 1,
    nonRenderStatus: "included",
    renderStatus: "complete",
    confirmStatus: "confirmed",
    thumb: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Concept 2",
    areaId: 1,
    nonRenderStatus: "skipped",
    renderStatus: "in-progress",
    confirmStatus: "pending",
    thumb: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Concept 3",
    areaId: 1,
    nonRenderStatus: "included",
    renderStatus: "not-started",
    confirmStatus: "pending",
    thumb: "",
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

export const CONCEPT_NONRENDER_FILES: ConceptNonRenderFile[] = [
  { id: 1, name: "Moodboard_Lobby_v1.pdf", type: "pdf", size: "4.2 MB", date: "22 Jul 2026" },
  {
    id: 2,
    name: "Sketch_entry_area.jpg",
    type: "img",
    size: "1.8 MB",
    date: "22 Jul 2026",
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=300&h=200&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Color_palette_ref.png",
    type: "img",
    size: "0.9 MB",
    date: "23 Jul 2026",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=200&fit=crop&auto=format",
  },
];

export const CONCEPT_REVISION_LOG: ConceptRevisionEntry[] = [
  { id: 1, date: "18 Jul 2026", note: "Adjusted ceiling height annotation", chargeable: false },
  { id: 2, date: "21 Jul 2026", note: "Replaced sofa spec — client request", chargeable: false },
  { id: 3, date: "25 Jul 2026", note: "Added partition wall to east side", chargeable: true },
];
