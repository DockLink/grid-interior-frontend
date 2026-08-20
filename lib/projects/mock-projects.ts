import type { Project } from "@/types/projects";
import type {
  ActiveProjectView,
  HistoricalGalleryItem,
  HistoricalProjectView,
  HubTeamMember,
} from "@/types/project-hub";

/** Default project for sidebar / command-palette demo links. */
export const DEFAULT_DEMO_PROJECT_ID = "mock-1";

export const TEAM_MEMBERS: HubTeamMember[] = [
  { id: 1, name: "Priya Nair", role: "Project Coordinator", initials: "PN", color: "#0E7C86" },
  { id: 2, name: "Ashan Perera", role: "3D Designer", initials: "AP", color: "#7C3AED" },
  { id: 3, name: "Dilani Silva", role: "Interior Designer", initials: "DS", color: "#D97706" },
  { id: 4, name: "Roshan Fernando", role: "Site Supervisor", initials: "RF", color: "#1B2A4A" },
  { id: 5, name: "Chamari Gunasena", role: "Draftsperson", initials: "CG", color: "#BE185D" },
  { id: 6, name: "Nuwan Jayaweera", role: "Quantity Surveyor", initials: "NJ", color: "#0284C7" },
];

const ACTIVE_RAW: Omit<ActiveProjectView, "id">[] = [
  {
    name: "Marchetti Villa Renovation",
    clientId: 1,
    clientName: "Giulia Marchetti",
    phase: "Execution",
    phaseIndex: 5,
    status: "On Track",
    progress: 82,
    nextDeadline: "14 Aug 2026",
    teamIds: [1, 2, 4, 6],
    startDate: "12 Jan 2026",
    location: "14 Via Colombo, Dehiwala",
    distanceKm: 2.4,
    projectType: "Full Renovation",
    tasksTotal: 48,
    tasksDone: 39,
    daysActive: 200,
    description:
      "Complete interior renovation of a 4-bedroom villa including kitchen remodel, master bathroom redesign, and full living area transformation with bespoke furniture throughout.",
    activity: [
      { icon: "construction", iconColor: "#1B2A4A", text: "Site inspection completed by Roshan Fernando", time: "2 hours ago" },
      { icon: "task_alt", iconColor: "#3FA66B", text: 'Task "Tile installation — master bath" marked complete', time: "5 hours ago" },
      { icon: "upload_file", iconColor: "#0E7C86", text: "BOQ v3 uploaded by Nuwan Jayaweera", time: "Yesterday" },
      { icon: "chat", iconColor: "#7C3AED", text: "Meeting notes added from client call", time: "2 days ago" },
    ],
  },
  {
    name: "Bianchi Penthouse Fit-out",
    clientId: 2,
    clientName: "Federico Bianchi",
    phase: "3D Design",
    phaseIndex: 3,
    status: "At Risk",
    progress: 45,
    nextDeadline: "22 Jul 2026",
    teamIds: [1, 2, 3],
    startDate: "03 Mar 2026",
    location: "8 Galle Rd, Colombo 3",
    distanceKm: 6.8,
    projectType: "New Fit-out",
    tasksTotal: 36,
    tasksDone: 16,
    daysActive: 150,
    description:
      "High-end penthouse fit-out across three floors. Feature wall design, custom joinery, and premium lighting scheme with integrated smart home system.",
    activity: [
      { icon: "view_in_ar", iconColor: "#0E7C86", text: "3D render revision submitted for client review", time: "1 hour ago" },
      { icon: "warning", iconColor: "#F26D6D", text: "Deadline risk flagged — client approval pending", time: "3 hours ago" },
      { icon: "task_alt", iconColor: "#3FA66B", text: "3D Design phase started", time: "1 week ago" },
    ],
  },
  {
    name: "Romano Residence — Kitchen & Dining",
    clientId: 3,
    clientName: "Luca Romano",
    phase: "Detail Drawings",
    phaseIndex: 4,
    status: "On Track",
    progress: 63,
    nextDeadline: "30 Jul 2026",
    teamIds: [1, 3, 5],
    startDate: "15 Feb 2026",
    location: "22 Havelock Rd, Colombo 5",
    distanceKm: 5.1,
    projectType: "Partial Renovation",
    tasksTotal: 28,
    tasksDone: 18,
    daysActive: 166,
    description:
      "Open-plan kitchen and dining renovation with island bench, bespoke cabinetry, stone worktops, and concealed appliance storage.",
    activity: [
      { icon: "architecture", iconColor: "#BE185D", text: "Detail drawing set DP-04 issued for review", time: "4 hours ago" },
      { icon: "check_circle", iconColor: "#3FA66B", text: "Layout phase signed off by client", time: "2 days ago" },
    ],
  },
  {
    name: "Visconti Office Interiors",
    clientId: 4,
    clientName: "Alessandra Visconti",
    phase: "Concept Design",
    phaseIndex: 1,
    status: "In Progress",
    progress: 20,
    nextDeadline: "08 Aug 2026",
    teamIds: [1, 2, 3],
    startDate: "01 Jun 2026",
    location: "44 Union Place, Colombo 2",
    distanceKm: 7.2,
    projectType: "Commercial Fit-out",
    tasksTotal: 22,
    tasksDone: 4,
    daysActive: 60,
    description:
      "Modern open-plan office fit-out for a boutique law firm. Concept includes breakout zones, private meeting rooms, and a client reception lobby.",
    activity: [
      { icon: "lightbulb", iconColor: "#D97706", text: "Concept moodboard presented to client", time: "1 day ago" },
      { icon: "folder_open", iconColor: "#0284C7", text: "Project files folder created", time: "3 days ago" },
    ],
  },
  {
    name: "De Luca Coastal Retreat",
    clientId: 5,
    clientName: "Marco De Luca",
    phase: "Layout",
    phaseIndex: 2,
    status: "On Track",
    progress: 35,
    nextDeadline: "18 Aug 2026",
    teamIds: [1, 3, 5, 6],
    startDate: "10 Apr 2026",
    location: "9 Marine Drive, Negombo",
    distanceKm: 38.5,
    projectType: "New Build Interior",
    tasksTotal: 44,
    tasksDone: 15,
    daysActive: 112,
    description:
      "Tropical-contemporary interior for a new-build beachfront property. Layout planning for 5 bedrooms, open living space, and outdoor entertaining deck.",
    activity: [
      { icon: "grid_view", iconColor: "#0284C7", text: "Floor plan layout v2 sent to client", time: "6 hours ago" },
      { icon: "task_alt", iconColor: "#3FA66B", text: "Consultation phase completed", time: "1 week ago" },
    ],
  },
  {
    name: "Ferretti Apartment Refresh",
    clientId: 6,
    clientName: "Renata Ferretti",
    phase: "Consultation",
    phaseIndex: 0,
    status: "In Progress",
    progress: 8,
    nextDeadline: "28 Jul 2026",
    teamIds: [1, 3],
    startDate: "18 Jun 2026",
    location: "5A Lauries Rd, Colombo 4",
    distanceKm: 3.6,
    projectType: "Soft Furnishing Refresh",
    tasksTotal: 14,
    tasksDone: 1,
    daysActive: 43,
    description:
      "Soft furnishing and styling refresh for a 2-bedroom apartment — new upholstery, window treatments, artwork curation, and accessory styling.",
    activity: [
      { icon: "chat", iconColor: "#7C3AED", text: "Initial brief discussion recorded", time: "Yesterday" },
      { icon: "person_add", iconColor: "#0E7C86", text: "Dilani Silva assigned to project", time: "2 days ago" },
    ],
  },
  {
    name: "Negroni Commercial Suite",
    clientId: 7,
    clientName: "Pietro Negroni",
    phase: "Execution",
    phaseIndex: 5,
    status: "Overdue",
    progress: 91,
    nextDeadline: "10 Jul 2026",
    teamIds: [1, 4, 6],
    startDate: "05 Sep 2025",
    location: "76 Duplication Rd, Colombo 3",
    distanceKm: 6.0,
    projectType: "Commercial Fit-out",
    tasksTotal: 52,
    tasksDone: 47,
    daysActive: 329,
    description:
      "Boutique hotel lobby, restaurant, and 6 guest suite interiors. Project nearing completion with final snagging list underway.",
    activity: [
      { icon: "error", iconColor: "#EF4444", text: "Deadline overdue — awaiting contractor sign-off", time: "2 hours ago" },
      { icon: "construction", iconColor: "#1B2A4A", text: "Final snagging walkthrough completed", time: "3 days ago" },
    ],
  },
  {
    name: "Conti Family Home — Master Suite",
    clientId: 8,
    clientName: "Carla Conti",
    phase: "3D Design",
    phaseIndex: 3,
    status: "On Track",
    progress: 52,
    nextDeadline: "25 Aug 2026",
    teamIds: [1, 2, 5],
    startDate: "20 Mar 2026",
    location: "33 Barnes Place, Colombo 7",
    distanceKm: 4.8,
    projectType: "Partial Renovation",
    tasksTotal: 30,
    tasksDone: 16,
    daysActive: 133,
    description:
      "Luxury master suite redesign including walk-in wardrobe, ensuite bathroom, and private sitting area with bespoke millwork.",
    activity: [
      { icon: "view_in_ar", iconColor: "#0E7C86", text: "3D walkthrough approved by client", time: "1 day ago" },
      { icon: "task_alt", iconColor: "#3FA66B", text: "Layout phase completed", time: "3 days ago" },
    ],
  },
];

export const ACTIVE_PROJECTS: ActiveProjectView[] = ACTIVE_RAW.map((p, i) => ({
  ...p,
  id: `mock-${i + 1}`,
}));

const HISTORICAL_RAW: Omit<HistoricalProjectView, "id">[] = [
  {
    name: "Grassi Villa — Full Interior",
    clientName: "Elena Grassi",
    startDate: "Jan 2025",
    completionDate: "Sep 2025",
    year: 2025,
    type: "Full Renovation",
    description:
      "Complete transformation of a 5-bedroom colonial villa with bespoke furniture, period-inspired detailing, and landscaped courtyard integration.",
    photo: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Elegant interior with bespoke furniture",
  },
  {
    name: "Ricci Showroom Fit-out",
    clientName: "Sergio Ricci",
    startDate: "Mar 2025",
    completionDate: "Jul 2025",
    year: 2025,
    type: "Commercial",
    description:
      "Premium automotive showroom interior featuring polished concrete, floor-to-ceiling glazing, and a minimalist product presentation layout.",
    photo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Modern showroom interior",
  },
  {
    name: "Colombo City Loft — Studio",
    clientName: "Chamara Bandara",
    startDate: "Nov 2024",
    completionDate: "Mar 2025",
    year: 2025,
    type: "New Fit-out",
    description:
      "Industrial-chic studio apartment with exposed brick, polished concrete floors, and custom steel-frame joinery throughout.",
    photo: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Industrial studio apartment interior",
  },
  {
    name: "Peiris Residence — Living & Dining",
    clientName: "Tharanga Peiris",
    startDate: "Aug 2024",
    completionDate: "Dec 2024",
    year: 2024,
    type: "Partial Renovation",
    description:
      "Open-plan living and dining space redesign for a contemporary family home — bespoke millwork, custom soft furnishings, and a statement feature wall.",
    photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Contemporary living and dining space",
  },
  {
    name: "Wijesinghe Boutique Hotel Lobby",
    clientName: "Nilusha Wijesinghe",
    startDate: "May 2024",
    completionDate: "Oct 2024",
    year: 2024,
    type: "Hospitality",
    description:
      "Boutique hotel lobby and reception design with hand-carved timber accents, locally sourced stone, and curated art installation.",
    photo: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Boutique hotel lobby interior",
  },
  {
    name: "Karunaratne Office Tower — Floors 14 & 15",
    clientName: "Indunil Karunaratne",
    startDate: "Feb 2024",
    completionDate: "Jul 2024",
    year: 2024,
    type: "Commercial",
    description:
      "Corporate office fit-out across two floors for a financial services firm — private offices, trading floor, boardroom, and staff amenities.",
    photo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Modern corporate office interior",
  },
  {
    name: "Senanayake Family Home",
    clientName: "Rukmal Senanayake",
    startDate: "Oct 2023",
    completionDate: "Mar 2024",
    year: 2024,
    type: "Full Renovation",
    description:
      "Full interior renovation of a three-storey family home — 4 bedrooms, open kitchen, home office, and media room with integrated AV.",
    photo: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Modern family home interior",
  },
  {
    name: "Mendis Spa & Wellness Centre",
    clientName: "Sandhya Mendis",
    startDate: "Jun 2023",
    completionDate: "Nov 2023",
    year: 2023,
    type: "Hospitality",
    description:
      "Day spa interior encompassing reception, 6 treatment rooms, relaxation lounge, and changing facilities in a tropical biophilic aesthetic.",
    photo: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Spa interior with biophilic design",
  },
  {
    name: "Jayawardena Penthouse",
    clientName: "Suresh Jayawardena",
    startDate: "Jan 2023",
    completionDate: "Aug 2023",
    year: 2023,
    type: "New Fit-out",
    description:
      "Luxury penthouse fit-out on the 32nd floor — open-plan living, chef's kitchen, private cinema, and rooftop terrace styling.",
    photo: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Luxury penthouse interior",
  },
  {
    name: "Dias Restaurant & Bar",
    clientName: "Mahesh Dias",
    startDate: "Mar 2023",
    completionDate: "Jun 2023",
    year: 2023,
    type: "Hospitality",
    description:
      "Contemporary restaurant and cocktail bar interior for a 120-cover venue — custom banquettes, statement lighting, and hand-laid terrazzo flooring.",
    photo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop&auto=format",
    photoAlt: "Contemporary restaurant interior",
  },
];

export const HISTORICAL_PROJECTS: HistoricalProjectView[] = HISTORICAL_RAW.map((p, i) => ({
  ...p,
  id: `mock-${101 + i}`,
}));

export const HISTORICAL_GALLERY: Record<string, HistoricalGalleryItem[]> = {
  "mock-101": [
    { url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=700&h=500&fit=crop&auto=format", alt: "Living area", caption: "Main living area with bespoke sofa" },
    { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&h=500&fit=crop&auto=format", alt: "Master bedroom", caption: "Master bedroom with custom joinery" },
    { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&h=500&fit=crop&auto=format", alt: "Kitchen", caption: "Open kitchen with island bench" },
    { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=700&h=500&fit=crop&auto=format", alt: "Bathroom", caption: "Ensuite bathroom — freestanding tub" },
    { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=700&h=500&fit=crop&auto=format", alt: "Courtyard", caption: "Courtyard integration" },
    { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=700&h=500&fit=crop&auto=format", alt: "Dining area", caption: "Formal dining space" },
  ],
};

/** Mutable store for projects created via the New Project modal. */
let extraActiveProjects: ActiveProjectView[] = [];

export function isMockProjectId(id: string): boolean {
  return id.startsWith("mock-");
}

export function getAllActiveProjects(): ActiveProjectView[] {
  return [...extraActiveProjects, ...ACTIVE_PROJECTS];
}

export function addActiveProject(project: ActiveProjectView) {
  extraActiveProjects = [project, ...extraActiveProjects];
}

export function getActiveProject(id: string): ActiveProjectView | null {
  return getAllActiveProjects().find((p) => p.id === id) ?? null;
}

export function getHistoricalProject(id: string): HistoricalProjectView | null {
  return HISTORICAL_PROJECTS.find((p) => p.id === id) ?? null;
}

export function getHistoricalGallery(id: string): HistoricalGalleryItem[] {
  const project = getHistoricalProject(id);
  if (!project) return [];
  return (
    HISTORICAL_GALLERY[id] ?? [
      { url: project.photo, alt: project.photoAlt, caption: project.name },
    ]
  );
}

export function filterActiveProjects(opts: {
  search?: string;
  phase?: string;
  status?: string;
}): ActiveProjectView[] {
  const q = opts.search?.toLowerCase() ?? "";
  return getAllActiveProjects().filter((p) => {
    const matchPhase = !opts.phase || opts.phase === "All" || p.phase === opts.phase;
    const matchStatus = !opts.status || opts.status === "All" || p.status === opts.status;
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q);
    return matchPhase && matchStatus && matchSearch;
  });
}

export function filterHistoricalProjects(opts: {
  search?: string;
  year?: string;
}): HistoricalProjectView[] {
  const q = opts.search?.toLowerCase() ?? "";
  return HISTORICAL_PROJECTS.filter((p) => {
    const matchYear = !opts.year || opts.year === "All" || p.year === Number(opts.year);
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q);
    return matchYear && matchSearch;
  });
}

export function getMockProjectDetail(id: string): Project | null {
  const active = getActiveProject(id);
  if (!active) return null;

  return {
    id: active.id,
    code: `GI-${active.id.replace("mock-", "").padStart(3, "0")}`,
    name: active.name,
    description: active.description,
    start_date: "2026-01-12",
    duration: "12 months",
    location: active.location,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: String(active.clientId),
      name: active.clientName,
    },
    images: [],
    current_stage: active.phase,
  };
}

/** @deprecated Use ACTIVE_PROJECTS — kept for any legacy imports */
export const MOCK_PROJECTS = ACTIVE_PROJECTS.map((p) => ({
  id: p.id,
  name: p.name,
  client: p.clientName,
  thumbnail: "",
  status: "Active" as const,
  number: `GI-${p.id.replace("mock-", "")}`,
  location: p.location,
  currentStage: p.phase,
  startDate: p.startDate,
  updatedAt: p.nextDeadline,
  updatedAtIso: new Date().toISOString(),
}));
