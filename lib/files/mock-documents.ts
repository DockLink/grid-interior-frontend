export type FolderType = string;

export interface FolderNode {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  children?: FolderNode[];
}

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
  stage?: "before" | "after";
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
  keyDecisions: string;
}

export const FOLDER_TREE: FolderNode[] = [
  {
    id: "drawings",
    label: "DRAWINGS",
    icon: "architecture",
    color: "#1B2A4A",
    bg: "#F3F4F6",
    children: [
      { id: "drawings/space-plans", label: "Space Plans", icon: "grid_view", color: "#1B2A4A", bg: "#F3F4F6" },
      { id: "drawings/electrical-plans", label: "Electrical Plans", icon: "bolt", color: "#D97706", bg: "#FEF3C7" },
      { id: "drawings/elevation-drawings", label: "Elevation Drawings", icon: "view_week", color: "#0891B2", bg: "#E0F7FA" },
      { id: "drawings/section-drawings", label: "Section Drawings", icon: "view_agenda", color: "#7C3AED", bg: "#EDE9FE" },
      { id: "drawings/detailed-drawings", label: "Detailed Drawings", icon: "architecture", color: "#BE185D", bg: "#FCE7F3" },
    ],
  },
  {
    id: "designs",
    label: "DESIGNS",
    icon: "palette",
    color: "#7C3AED",
    bg: "#EDE9FE",
    children: [
      { id: "designs/concepts", label: "Concepts", icon: "lightbulb", color: "#D97706", bg: "#FEF3C7" },
      { id: "designs/3ds", label: "3Ds", icon: "view_in_ar", color: "#0E7C86", bg: "#CCFBF1" },
      { id: "designs/material-boards", label: "Material Boards", icon: "texture", color: "#8B5CF6", bg: "#EDE9FE" },
      { id: "designs/exterior", label: "Exterior", icon: "cottage", color: "#059669", bg: "#D1FAE5" },
      { id: "designs/mood-boards", label: "Mood Boards", icon: "auto_awesome", color: "#8B5CF6", bg: "#EDE9FE" },
    ],
  },
  {
    id: "approved",
    label: "APPROVED",
    icon: "verified",
    color: "#3FA66B",
    bg: "#DCFCE7",
    children: [
      { id: "approved/drawings", label: "Drawings", icon: "architecture", color: "#3FA66B", bg: "#DCFCE7" },
      { id: "approved/designs", label: "Designs", icon: "palette", color: "#3FA66B", bg: "#DCFCE7" },
      { id: "approved/detailing", label: "Detailing", icon: "handyman", color: "#3FA66B", bg: "#DCFCE7" },
      { id: "approved/client-approvals", label: "Client Approvals", icon: "approval", color: "#3FA66B", bg: "#DCFCE7" },
    ],
  },
  {
    id: "admin",
    label: "ADMIN",
    icon: "admin_panel_settings",
    color: "#D97706",
    bg: "#FEF3C7",
    children: [
      { id: "admin/contracts", label: "Contracts", icon: "gavel", color: "#D97706", bg: "#FEF3C7" },
      { id: "admin/boqs", label: "BOQs", icon: "receipt_long", color: "#1B2A4A", bg: "#E2E8F0" },
      { id: "admin/invoices", label: "Invoices", icon: "request_quote", color: "#0E7C86", bg: "#CCFBF1" },
      { id: "admin/meeting-minutes", label: "Meeting Minutes", icon: "article", color: "#0284C7", bg: "#E0F2FE" },
      { id: "admin/supplier-quotes", label: "Supplier Quotes", icon: "handshake", color: "#0E7C86", bg: "rgba(14,124,134,0.10)" },
    ],
  },
  {
    id: "site-photos",
    label: "SITE PHOTOS",
    icon: "photo_camera",
    color: "#EC4899",
    bg: "#FCE7F3",
  },
  {
    id: "client-brief",
    label: "CLIENT BRIEF",
    icon: "description",
    color: "#0E7C86",
    bg: "#CCFBF1",
  },
];

function flattenFolders(nodes: FolderNode[]): FolderNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenFolders(n.children) : [])]);
}

export const FOLDER_CFG: Record<string, { label: string; icon: string; color: string; bg: string }> =
  Object.fromEntries(
    flattenFolders(FOLDER_TREE).map((n) => [n.id, { label: n.label, icon: n.icon, color: n.color, bg: n.bg }]),
  );

export function folderMatches(fileFolder: string, active: string | "all"): boolean {
  if (active === "all") return true;
  return fileFolder === active || fileFolder.startsWith(`${active}/`);
}

export const MOCK_FILES: DocFile[] = [
  {
    id: 1,
    name: "Lobby_Space_Plan_v2.pdf",
    type: "pdf",
    size: "4.1 MB",
    date: "21 Jul 2026",
    folder: "drawings/space-plans",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 2,
    name: "Electrical_Schematic.dwg",
    type: "dwg",
    size: "2.7 MB",
    date: "22 Jul 2026",
    folder: "drawings/electrical-plans",
    uploader: { initials: "AP", color: "#0891B2" },
  },
  {
    id: 11,
    name: "Lobby_Elevation_North.pdf",
    type: "pdf",
    size: "3.2 MB",
    date: "22 Jul 2026",
    folder: "drawings/elevation-drawings",
    uploader: { initials: "CG", color: "#BE185D" },
  },
  {
    id: 12,
    name: "Section_AA.dwg",
    type: "dwg",
    size: "1.8 MB",
    date: "23 Jul 2026",
    folder: "drawings/section-drawings",
    uploader: { initials: "CG", color: "#BE185D" },
  },
  {
    id: 13,
    name: "Joinery_Details_v1.pdf",
    type: "pdf",
    size: "5.4 MB",
    date: "25 Jul 2026",
    folder: "drawings/detailed-drawings",
    uploader: { initials: "DS", color: "#D97706" },
  },
  {
    id: 3,
    name: "Moodboard_Lobby_v1.pdf",
    type: "pdf",
    size: "8.3 MB",
    date: "18 Jul 2026",
    folder: "designs/mood-boards",
    uploader: { initials: "DS", color: "#D97706" },
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
  },
  {
    id: 4,
    name: "Material_Swatches.jpg",
    type: "img",
    size: "1.9 MB",
    date: "18 Jul 2026",
    folder: "designs/material-boards",
    uploader: { initials: "PN", color: "#7C3AED" },
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300&h=200&fit=crop",
  },
  {
    id: 14,
    name: "Concept_Lobby_NonRender.pdf",
    type: "pdf",
    size: "6.1 MB",
    date: "12 Jul 2026",
    folder: "designs/concepts",
    uploader: { initials: "DS", color: "#D97706" },
  },
  {
    id: 15,
    name: "Lobby_3D_Camera01.jpg",
    type: "img",
    size: "7.2 MB",
    date: "16 Jul 2026",
    folder: "designs/3ds",
    uploader: { initials: "AP", color: "#0891B2" },
    url: "https://images.unsplash.com/photo-1614267861476-0d129972a0f4?w=300&h=200&fit=crop",
  },
  {
    id: 16,
    name: "Entrance_Exterior.jpg",
    type: "img",
    size: "4.4 MB",
    date: "16 Jul 2026",
    folder: "designs/exterior",
    uploader: { initials: "AP", color: "#0891B2" },
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=200&fit=crop",
  },
  {
    id: 8,
    name: "Concept_Approval_Signed.pdf",
    type: "pdf",
    size: "2.1 MB",
    date: "23 Jul 2026",
    folder: "approved/client-approvals",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 17,
    name: "Approved_Space_Plans.pdf",
    type: "pdf",
    size: "3.8 MB",
    date: "23 Jul 2026",
    folder: "approved/drawings",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 18,
    name: "Approved_Concept_Pack.pdf",
    type: "pdf",
    size: "9.1 MB",
    date: "23 Jul 2026",
    folder: "approved/designs",
    uploader: { initials: "DS", color: "#D97706" },
  },
  {
    id: 19,
    name: "Approved_Detailing_Set.pdf",
    type: "pdf",
    size: "4.6 MB",
    date: "26 Jul 2026",
    folder: "approved/detailing",
    uploader: { initials: "CG", color: "#BE185D" },
  },
  {
    id: 7,
    name: "Interior_Design_Contract.pdf",
    type: "pdf",
    size: "3.5 MB",
    date: "10 Jul 2026",
    folder: "admin/contracts",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 20,
    name: "BOQ_Execution_v3.xlsx",
    type: "xls",
    size: "1.4 MB",
    date: "26 Jul 2026",
    folder: "admin/boqs",
    uploader: { initials: "NJ", color: "#0284C7" },
  },
  {
    id: 21,
    name: "Invoice_Advance_01.pdf",
    type: "pdf",
    size: "0.4 MB",
    date: "12 Jul 2026",
    folder: "admin/invoices",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 22,
    name: "Minutes_Concept_Review.pdf",
    type: "pdf",
    size: "0.6 MB",
    date: "22 Jul 2026",
    folder: "admin/meeting-minutes",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 5,
    name: "Stone_Supplier_Quote_Jul26.pdf",
    type: "pdf",
    size: "1.2 MB",
    date: "20 Jul 2026",
    folder: "admin/supplier-quotes",
    uploader: { initials: "RF", color: "#059669" },
  },
  {
    id: 6,
    name: "FF&E_Quote_Furniture.xlsx",
    type: "xls",
    size: "0.8 MB",
    date: "19 Jul 2026",
    folder: "admin/supplier-quotes",
    uploader: { initials: "RF", color: "#059669" },
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
  {
    id: 23,
    name: "Client_Brief_Marchetti.pdf",
    type: "pdf",
    size: "2.2 MB",
    date: "05 Jul 2026",
    folder: "client-brief",
    uploader: { initials: "PN", color: "#7C3AED" },
  },
  {
    id: 24,
    name: "Site_Visit_Audio.m4a",
    type: "audio",
    size: "18.4 MB",
    date: "24 Jul 2026",
    folder: "client-brief",
    uploader: { initials: "DS", color: "#D97706" },
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
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1484154214963-4c675539affa?w=400&h=300&fit=crop",
    category: "before-after",
    stage: "before",
    uploaderName: "Social Media Admin",
    uploaderInitials: "SM",
    uploaderColor: "#EC4899",
    date: "12 Jan 2026",
    month: "January 2026",
  },
  {
    id: 10,
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop",
    category: "before-after",
    stage: "after",
    uploaderName: "Social Media Admin",
    uploaderInitials: "SM",
    uploaderColor: "#EC4899",
    date: "10 Aug 2026",
    month: "August 2026",
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
    keyDecisions:
      "Proceed with Concept 1. Feature wall width increased by 200mm. Seating cluster rotated 15° toward the courtyard.",
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
    keyDecisions:
      "East corridor width recorded as 1180mm (drawings showed 1250mm). Drawings to be revised before layout sign-off.",
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
    keyDecisions:
      "Paid consultation confirmed. Full inventory list included. Preferred start September 2026.",
  },
];
