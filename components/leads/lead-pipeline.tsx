"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LEAD_STAGE_CFG,
  MOCK_LEADS,
  type CommChannel,
  type LeadRecord,
  type LeadSource,
  type LeadStage,
} from "@/lib/leads/mock-leads";

const COLUMNS: { stage: LeadStage; label: string; color: string }[] = [
  { stage: "new_inquiry", label: "New Inquiry", color: "#0B2545" },
  { stage: "meeting_booked", label: "Meeting Booked", color: "#0FA8A0" },
  { stage: "proposal_sent", label: "Proposal Sent", color: "#F59E0B" },
];

export function LeadPipeline() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<LeadSource | "All">("All");
  const [selected, setSelected] = useState<LeadRecord | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [logText, setLogText] = useState("");
  const [logChannel, setLogChannel] = useState<CommChannel>("note");
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const q = search.toLowerCase();
        const matchQ = !q || l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q);
        const matchS = source === "All" || l.source === source;
        return matchQ && matchS;
      }),
    [leads, search, source],
  );

  function moveLead(id: string, stage: LeadStage) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
    setSelected((prev) => (prev?.id === id ? { ...prev, stage } : prev));
  }

  const sources: Array<LeadSource | "All"> = ["All", "Referral", "Instagram", "Website", "Walk-in"];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#16233D]">Lead Pipeline</h2>
          <p className="text-[14px] text-[#5B6B85]">
            {leads.filter((l) => l.stage !== "won" && l.stage !== "lost").length} active inquiries
          </p>
          <DemoCaption className="mt-1" />
        </div>
        <Button className="rounded-full bg-[#0FA8A0] text-white hover:bg-[#0B9990]" onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Lead
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-52">
          <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#5B6B85]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className="h-9 pl-8" />
        </div>
        {sources.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSource(s)}
            className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
            style={{
              background: source === s ? "rgba(15,168,160,0.12)" : "#F0F2F5",
              color: source === s ? "#0FA8A0" : "#5B6B85",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <KanbanCol
            key={col.stage}
            title={col.label}
            color={col.color}
            leads={filtered.filter((l) => l.stage === col.stage)}
            onDrop={() => draggingId && moveLead(draggingId, col.stage)}
            onCardDrag={setDraggingId}
            onOpen={setSelected}
          />
        ))}
        <div className="grid gap-3">
          <KanbanCol
            title="Won"
            color="#2FBE6B"
            leads={filtered.filter((l) => l.stage === "won")}
            onDrop={() => draggingId && moveLead(draggingId, "won")}
            onCardDrag={setDraggingId}
            onOpen={setSelected}
          />
          <KanbanCol
            title="Lost"
            color="#FF6B6B"
            leads={filtered.filter((l) => l.stage === "lost")}
            onDrop={() => draggingId && moveLead(draggingId, "lost")}
            onCardDrag={setDraggingId}
            onOpen={setSelected}
          />
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-white">
          <SheetHeader className="relative">
            <SheetTitle>{selected?.name}</SheetTitle>
            <SheetCloseButton onClick={() => setSelected(null)} />
          </SheetHeader>
          <SheetBody className="space-y-4 text-[13px]">
            <p className="text-[#5B6B85]">{selected?.company}</p>
            <p>{selected?.email}</p>
            <p>{selected?.phone}</p>
            <p>Value {selected?.value}</p>
            <div className="flex flex-wrap gap-1">
              {(Object.keys(LEAD_STAGE_CFG) as LeadStage[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => selected && moveLead(selected.id, st)}
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    background: selected?.stage === st ? LEAD_STAGE_CFG[st].bg : "#F0F2F5",
                    color: selected?.stage === st ? LEAD_STAGE_CFG[st].color : "#5B6B85",
                  }}
                >
                  {LEAD_STAGE_CFG[st].label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowLog(true)}>
              Log communication
            </Button>
            <div className="space-y-2">
              {selected?.commLog.map((c) => (
                <div key={c.id} className="rounded-lg bg-[#F8FAFB] p-3">
                  <p className="text-[11px] font-semibold capitalize text-[#5B6B85]">{c.channel} · {c.at}</p>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="h-10" />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button
              className="bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
              onClick={() => {
                if (!newName.trim()) return;
                setLeads((prev) => [
                  {
                    id: `l${Date.now()}`,
                    name: newName.trim(),
                    company: newCompany.trim() || "—",
                    email: "",
                    phone: "",
                    source: "Website",
                    stage: "new_inquiry",
                    value: "—",
                    initials: newName.slice(0, 2).toUpperCase(),
                    color: "#0FA8A0",
                    commLog: [],
                  },
                  ...prev,
                ]);
                setNewName("");
                setNewCompany("");
                setShowNew(false);
                toast.success("Lead created — now in New Inquiry");
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLog} onOpenChange={setShowLog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log communication</DialogTitle></DialogHeader>
          <DialogBody className="space-y-3">
            <div className="flex gap-2">
              {(["email", "call", "meeting", "note"] as CommChannel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setLogChannel(ch)}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold capitalize"
                  style={{
                    background: logChannel === ch ? "rgba(15,168,160,0.12)" : "#F0F2F5",
                    color: logChannel === ch ? "#0FA8A0" : "#5B6B85",
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
            <Textarea value={logText} onChange={(e) => setLogText(e.target.value)} rows={4} />
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLog(false)}>Cancel</Button>
            <Button
              className="bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
              onClick={() => {
                if (!selected || !logText.trim()) return;
                const entry = { id: `c${Date.now()}`, channel: logChannel, text: logText.trim(), at: "Just now" };
                setLeads((prev) =>
                  prev.map((l) => (l.id === selected.id ? { ...l, commLog: [entry, ...l.commLog] } : l)),
                );
                setSelected((prev) => (prev ? { ...prev, commLog: [entry, ...prev.commLog] } : prev));
                setLogText("");
                setShowLog(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanCol({
  title,
  color,
  leads,
  onDrop,
  onCardDrag,
  onOpen,
}: {
  title: string;
  color: string;
  leads: LeadRecord[];
  onDrop: () => void;
  onCardDrag: (id: string | null) => void;
  onOpen: (lead: LeadRecord) => void;
}) {
  return (
    <div
      className="min-h-[220px] rounded-2xl bg-[#F8FAFB] p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="h-1.5 w-8 rounded-full" style={{ background: color }} />
        <span className="text-[12px] font-bold text-[#16233D]">{title}</span>
        <span className="ml-auto text-[11px] text-[#5B6B85]">{leads.length}</span>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <button
            key={l.id}
            type="button"
            draggable
            onDragStart={() => onCardDrag(l.id)}
            onDragEnd={() => onCardDrag(null)}
            onClick={() => onOpen(l)}
            className="w-full rounded-xl border border-[#E4E9F0] bg-white p-3 text-left shadow-sm"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ background: l.color }}>
                {l.initials}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#16233D]">{l.name}</p>
                <p className="text-[11px] text-[#5B6B85]">{l.company}</p>
              </div>
            </div>
            <p className="text-[11px] font-medium text-[#0FA8A0]">{l.value}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
