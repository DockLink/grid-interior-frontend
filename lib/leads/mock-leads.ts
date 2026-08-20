export type LeadStage = "new_inquiry" | "meeting_booked" | "proposal_sent" | "won" | "lost";
export type LeadSource = "Referral" | "Instagram" | "Website" | "Walk-in";
export type CommChannel = "email" | "call" | "meeting" | "note";

export interface CommEntry {
  id: string;
  channel: CommChannel;
  text: string;
  at: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  stage: LeadStage;
  value: string;
  initials: string;
  color: string;
  commLog: CommEntry[];
}

export const LEAD_STAGE_CFG: Record<LeadStage, { label: string; color: string; bg: string }> = {
  new_inquiry: { label: "New Inquiry", color: "#0B2545", bg: "rgba(11,37,69,0.08)" },
  meeting_booked: { label: "Meeting Booked", color: "#0FA8A0", bg: "rgba(15,168,160,0.12)" },
  proposal_sent: { label: "Proposal Sent", color: "#D97706", bg: "rgba(245,158,11,0.12)" },
  won: { label: "Won", color: "#2FBE6B", bg: "rgba(47,190,107,0.12)" },
  lost: { label: "Lost", color: "#FF6B6B", bg: "rgba(255,107,107,0.12)" },
};

export const MOCK_LEADS: LeadRecord[] = [
  {
    id: "l1",
    name: "Sofia Alvarez",
    company: "Alvarez Residences",
    email: "sofia@alvarez.co",
    phone: "+1 415 555 0190",
    source: "Instagram",
    stage: "new_inquiry",
    value: "$180k",
    initials: "SA",
    color: "#0FA8A0",
    commLog: [{ id: "c1", channel: "email", text: "Requested a penthouse moodboard.", at: "2h ago" }],
  },
  {
    id: "l2",
    name: "James Okonkwo",
    company: "Harbor House",
    email: "james@harbor.house",
    phone: "+44 20 7946 0991",
    source: "Referral",
    stage: "meeting_booked",
    value: "$420k",
    initials: "JO",
    color: "#0B2545",
    commLog: [{ id: "c2", channel: "call", text: "Site visit booked for Friday.", at: "Yesterday" }],
  },
  {
    id: "l3",
    name: "Mei Lin",
    company: "Lin Hospitality",
    email: "mei@linhotels.sg",
    phone: "+65 6123 4400",
    source: "Website",
    stage: "proposal_sent",
    value: "$1.1M",
    initials: "ML",
    color: "#2FBE6B",
    commLog: [{ id: "c3", channel: "email", text: "Proposal v2 sent with FF&E schedule.", at: "3d ago" }],
  },
  {
    id: "l4",
    name: "Omar Haddad",
    company: "Atelier Haddad",
    email: "omar@atelierhaddad.com",
    phone: "+971 4 555 2211",
    source: "Walk-in",
    stage: "won",
    value: "$640k",
    initials: "OH",
    color: "#F59E0B",
    commLog: [{ id: "c4", channel: "meeting", text: "Signed letter of intent.", at: "1w ago" }],
  },
  {
    id: "l5",
    name: "Claire Dubois",
    company: "Maison Claire",
    email: "claire@maisonclaire.fr",
    phone: "+33 1 45 00 11 22",
    source: "Referral",
    stage: "lost",
    value: "$90k",
    initials: "CD",
    color: "#FF6B6B",
    commLog: [{ id: "c5", channel: "note", text: "Went with in-house architect.", at: "2w ago" }],
  },
];
