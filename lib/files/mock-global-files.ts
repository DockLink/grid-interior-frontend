export interface GlobalFileRow {
  id: string;
  fileName: string;
  project: string;
  folder: string;
  size: string;
  updatedAt: string;
  uploadedBy: string;
}

export const MOCK_GLOBAL_FILES: GlobalFileRow[] = [
  {
    id: "gf1",
    fileName: "FF&E Schedule v4.xlsx",
    project: "Lumière Penthouse",
    folder: "3.0 Procurement",
    size: "1.2 MB",
    updatedAt: "2h ago",
    uploadedBy: "Priya Shah",
  },
  {
    id: "gf2",
    fileName: "Moodboard_living.pdf",
    project: "Noir Boutique Hotel",
    folder: "2.0 Concept",
    size: "8.4 MB",
    updatedAt: "Yesterday",
    uploadedBy: "Luca Bianchi",
  },
  {
    id: "gf3",
    fileName: "Site photos.zip",
    project: "Verdant Residence",
    folder: "1.0 Survey",
    size: "42 MB",
    updatedAt: "3d ago",
    uploadedBy: "Kenji Watanabe",
  },
  {
    id: "gf4",
    fileName: "Client presentation.key",
    project: "Cascade Spa",
    folder: "4.0 Presentations",
    size: "18 MB",
    updatedAt: "1w ago",
    uploadedBy: "Elena Rossi",
  },
  {
    id: "gf5",
    fileName: "Floor plan_revC.dwg",
    project: "Atrium Office HQ",
    folder: "2.1 Drawings",
    size: "3.1 MB",
    updatedAt: "2w ago",
    uploadedBy: "Noah Adler",
  },
];
