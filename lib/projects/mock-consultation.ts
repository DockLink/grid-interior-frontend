import type {
  ConsultAudioFile,
  ConsultComment,
  ConsultInventoryItem,
  ConsultRoom,
  ConsultTask,
} from "@/types/consultation";

export const SAMPLE_TASKS: ConsultTask[] = [
  { id: 1, title: "Schedule initial site visit", assigneeId: 1, status: "Done" },
  { id: 2, title: "Prepare consultation questionnaire", assigneeId: 3, status: "In Progress" },
  { id: 3, title: "Confirm client availability", assigneeId: 1, status: "Pending" },
];

export const SAMPLE_ROOMS: ConsultRoom[] = [
  { id: 1, name: "Living Room", length: "7.20", width: "5.40", height: "2.90" },
  { id: 2, name: "Master Bedroom", length: "5.80", width: "4.60", height: "2.90" },
  { id: 3, name: "Kitchen", length: "4.10", width: "3.80", height: "2.70" },
  { id: 4, name: "Dining Area", length: "3.90", width: "3.50", height: "2.90" },
];

export const SAMPLE_INVENTORY: ConsultInventoryItem[] = [
  {
    id: 1,
    name: "Existing 3-seater sofa",
    spec: "Fabric, beige, contemporary",
    h: "85",
    w: "90",
    l: "220",
    qty: "1",
    notes: "Good condition",
    measured: true,
  },
  {
    id: 2,
    name: "Dining table",
    spec: "Timber, 6-seater",
    h: "76",
    w: "90",
    l: "180",
    qty: "1",
    notes: "Retain",
    measured: true,
  },
  {
    id: 3,
    name: "Wardrobe unit",
    spec: "MDF, white gloss, 3-door",
    h: "220",
    w: "60",
    l: "180",
    qty: "2",
    notes: "Replace",
    measured: false,
  },
  {
    id: 4,
    name: "Bedside tables",
    spec: "Timber, pair",
    h: "55",
    w: "45",
    l: "45",
    qty: "2",
    notes: "",
    measured: false,
  },
];

export const SAMPLE_AUDIO: ConsultAudioFile[] = [
  {
    id: 1,
    name: "Site visit recording — Level 1.m4a",
    duration: "14:32",
    date: "24 Jul 2026",
    size: "18.4 MB",
  },
  {
    id: 2,
    name: "Client briefing notes.mp3",
    duration: "08:17",
    date: "24 Jul 2026",
    size: "9.1 MB",
  },
  {
    id: 3,
    name: "Contractor walkthrough.m4a",
    duration: "22:05",
    date: "25 Jul 2026",
    size: "28.7 MB",
  },
];

export const SAMPLE_COMMENTS: ConsultComment[] = [
  {
    id: 1,
    memberId: 1,
    text: "Initial brief confirmed with client. They want a contemporary style with warm tones and natural materials. No strict budget cap mentioned — quality is priority.",
    time: "24 Jul 2026, 10:15 AM",
  },
  {
    id: 2,
    memberId: 3,
    text: "Client mentioned they want to retain the dining table and the original timber flooring on ground floor. Will factor this into the concept phase.",
    time: "24 Jul 2026, 11:42 AM",
  },
  {
    id: 3,
    memberId: 2,
    text: "3D reference images shared by client via WhatsApp — uploaded to Documents. Strong preference for integrated joinery and hidden storage.",
    time: "24 Jul 2026, 02:08 PM",
  },
  {
    id: 4,
    memberId: 1,
    text: "Follow-up call scheduled for 28 July to review concept direction. Client confirmed site access for full measurement team on 30 July.",
    time: "25 Jul 2026, 09:30 AM",
  },
];
