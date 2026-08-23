import type { ThreeDArea, ThreeDRenderImage } from "@/types/threed";

export const THREED_AREAS: ThreeDArea[] = [
  { id: 1, name: "Lobby" },
  { id: 2, name: "Directors Room" },
  { id: 3, name: "Meeting Room" },
  { id: 4, name: "Reception Area" },
  { id: 5, name: "Kitchen & Break" },
];

export const THREED_RENDER_GALLERY: ThreeDRenderImage[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop&auto=format",
    caption: "Lobby — east view, final lighting",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    caption: "Feature ceiling — full render",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
    caption: "Reception counter — material detail",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&auto=format",
    caption: "Night-mode seating alcove",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&h=400&fit=crop&auto=format",
    caption: "Lobby — west view, natural light",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&auto=format",
    caption: "Entry vestibule — overhead view",
  },
];
