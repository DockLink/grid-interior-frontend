// Mock documents data for Phase 4 Documents Workspace
// Ported from Design System for GRID CRM/src/screens/documents/DocumentsWorkspace.tsx

export type FolderType =
  | "drawings"
  | "moodboards"
  | "quotes"
  | "contracts"
  | "approvals"
  | "site-photos";

export interface DocFile {
  id: number;
  name: string;
  type: "pdf" | "dwg" | "img" | "xls" | "audio";
  size: string;
  date: string;
  folder: FolderType;
  uploader: { initials: string; color: string };
  url?: string;
}

export interface GalleryPhoto {
  id: number;
  url: string;
  category: "moodboards" | "swatches" | "site" | "before-after";
  uploaderName: string;
  uploaderInitials: string;
  uploaderColor: string;
  date: string;
  month: string;
}

export interface MeetingMinute {
  id: number;
  title: string;
  date: string;
  attendees: { initials: string; color: string; name: string }[];
  type: "typed" | "pdf" | "audio";
  preview: string;
}

export const FOLDER_CFG: Record<
  FolderType,
  { label: string; icon: string; color: string; bg: string }
> = {
  drawings: {
    label: "Drawings",
    icon: "architecture",
    color: "#1B2A4A",
    bg: "#F3F4F6",
  },
  moodboards: {
    label: "Mood Boards",
    icon: "auto_awesome",
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
  quotes: {
    label: "Supplier Quotes",
    icon: "request_quote",
    color: "#0E7C86",
    bg: "rgba(14,124,134,0.10)",
  },
  contracts: {
    label: "Contracts",
    icon: "gavel",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  approvals: {
    label: "Client Approvals",
    icon: "approval",
    color: "#3FA66B",
    bg: "#DCFCE7",
  },
  "site-photos": {
    label: "Site Photos",
    icon: "photo_camera",
    color: "#EC4899",
    bg: "#FCE7F3",
  },
};

export const MOCK_FILES: DocFile[] = [
  {
    id: 1,
    name: "Lobby_Layout_v2.pdf",
    type: "pdf",
    size: "4.1 MB",
    date: "21 Jul 2026",
    folder: "drawings",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 2,
    name: "Electrical_Schematic.dwg",
    type: "dwg",
    size: "2.7 MB",
    date: "22 Jul 2026",
    folder: "drawings",
    uploader: { initials: "AP", color: "#0891B2" },
  },
  {
    id: 3,
    name: "Moodboard_Lobby_v1.pdf",
    type: "pdf",
    size: "8.3 MB",
    date: "18 Jul 2026",
    folder: "moodboards",
    uploader: { initials: "DS", color: "#D97706" },
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    name: "Material_Swatches.jpg",
    type: "img",
    size: "1.9 MB",
    date: "18 Jul 2026",
    folder: "moodboards",
    uploader: { initials: "PN", color: "#7C3AED" },
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300&h=200&fit=crop",
  },
  {
    id: 5,
    name: "Stone_Supplier_Quote_Jul26.pdf",
    type: "pdf",
    size: "1.2 MB",
    date: "20 Jul 2026",
    folder: "quotes",
    uploader: { initials: "RF", color: "#059669" },
  },
  {
    id: 6,
    name: "FF&E_Quote_Furniture.xlsx",
    type: "xls",
    size: "0.8 MB",
    date: "19 Jul 2026",
    folder: "quotes",
    uploader: { initials: "RF", color: "#059669" },
  },
  {
    id: 7,
    name: "Interior_Design_Contract.pdf",
    type: "pdf",
    size: "3.5 MB",
    date: "10 Jul 2026",
    folder: "contracts",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 8,
    name: "Concept_Approval_Signed.pdf",
    type: "pdf",
    size: "2.1 MB",
    date: "23 Jul 2026",
    folder: "approvals",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 9,
    name: "Site_Visit_24Jul_001.jpg",
    type: "img",
    size: "5.6 MB",
    date: "24 Jul 2026",
    folder: "site-photos",
    uploader: { initials: "AP", color: "#0891B2" },
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop",
  },
  {
    id: 10,
    name: "Site_Visit_24Jul_002.jpg",
    type: "img",
    size: "4.8 MB",
    date: "24 Jul 2026",
    folder: "site-photos",
    uploader: { initials: "AP", color: "#0891B2" },
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop",
  },
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    category: "moodboards",
    uploaderName: "Dilani Silva",
    uploaderInitials: "DS",
    uploaderColor: "#D97706",
    date: "18 Jul 2026",
    month: "July 2026",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=500&fit=crop",
    category: "moodboards",
    uploaderName: "Priya Nair",
    uploaderInitials: "PN",
    uploaderColor: "#7C3AED",
    date: "18 Jul 2026",
    month: "July 2026",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=260&fit=crop",
    category: "swatches",
    uploaderName: "Priya Nair",
    uploaderInitials: "PN",
    uploaderColor: "#7C3AED",
    date: "20 Jul 2026",
    month: "July 2026",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=340&fit=crop",
    category: "site",
    uploaderName: "Ashan Perera",
    uploaderInitials: "AP",
    uploaderColor: "#0891B2",
    date: "24 Jul 2026",
    month: "July 2026",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=280&fit=crop",
    category: "site",
    uploaderName: "Ashan Perera",
    uploaderInitials: "AP",
    uploaderColor: "#0891B2",
    date: "24 Jul 2026",
    month: "July 2026",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=460&fit=crop",
    category: "site",
    uploaderName: "Ashan Perera",
    uploaderInitials: "AP",
    uploaderColor: "#0891B2",
    date: "24 Jul 2026",
    month: "July 2026",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1614267861476-0d129972a0f4?w=400&h=300&fit=crop",
    category: "moodboards",
    uploaderName: "Dilani Silva",
    uploaderInitials: "DS",
    uploaderColor: "#D97706",
    date: "15 Jun 2026",
    month: "June 2026",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=340&fit=crop",
    category: "swatches",
    uploaderName: "Priya Nair",
    uploaderInitials: "PN",
    uploaderColor: "#7C3AED",
    date: "15 Jun 2026",
    month: "June 2026",
  },
];

export const MOCK_MEETINGS: MeetingMinute[] = [
  {
    id: 1,
    title: "Concept Design Review — Lobby",
    date: "22 Jul 2026",
    attendees: [
      { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
      { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
      { initials: "GM", color: "#EC4899", name: "Giulia Marchetti" },
    ],
    type: "typed",
    preview:
      "Client approved Concept 1 for the lobby. Requested minor adjustment to seating arrangement and stone feature wall width.",
  },
  {
    id: 2,
    title: "Site Measurement Walk-Through",
    date: "17 Jul 2026",
    attendees: [
      { initials: "AP", color: "#0891B2", name: "Ashan Perera" },
      { initials: "DS", color: "#D97706", name: "Dilani Silva" },
    ],
    type: "audio",
    preview:
      "All key measurements confirmed. Discrepancy noted in East corridor — updated in system.",
  },
  {
    id: 3,
    title: "Initial Client Brief & Vision Session",
    date: "05 Jul 2026",
    attendees: [
      { initials: "PN", color: "#7C3AED", name: "Priya Nair" },
      { initials: "GM", color: "#EC4899", name: "Giulia Marchetti" },
      { initials: "RF", color: "#059669", name: "Roshan Fernando" },
    ],
    type: "pdf",
    preview:
      "Client vision: contemporary Italian, warm neutrals, statement lighting. Budget confirmed at LKR 24.8M.",
  },
];
