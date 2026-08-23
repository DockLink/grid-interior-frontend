"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { DemoCaption } from "@/components/demo/demo-caption";
import { Badge } from "@/components/ui/badge";
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
import { MOCK_TEAM, type StudioMember, type StudioMemberRole } from "@/lib/team/mock-team";

const ROLE_STYLE: Record<StudioMemberRole, { bg: string; color: string }> = {
  Admin: { bg: "rgba(11,37,69,0.08)", color: "#0B2545" },
  "Team Lead": { bg: "rgba(15,168,160,0.12)", color: "#0FA8A0" },
  Member: { bg: "rgba(91,107,133,0.12)", color: "#5B6B85" },
};

export function TeamPage() {
  const [members, setMembers] = useState(MOCK_TEAM);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StudioMemberRole>("Member");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q),
    );
  }, [members, search]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold text-[#16233D]">Team</h2>
          <p className="text-[14px] text-[#5B6B85]">{members.length} studio members</p>
          <DemoCaption className="mt-1" />
        </div>
        <Button
          className="rounded-full bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
          onClick={() => setShowInvite(true)}
        >
          <Plus size={14} /> Invite Member
        </Button>
      </div>

      <div className="relative mb-5 w-64">
        <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#5B6B85]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search team…"
          className="h-9 pl-8"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <MemberCard key={m.id} member={m} />
        ))}
      </div>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
            </div>
            <div className="flex gap-2">
              {(["Member", "Team Lead", "Admin"] as StudioMemberRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
                  style={{
                    background: role === r ? "rgba(15,168,160,0.12)" : "#F0F2F5",
                    color: role === r ? "#0FA8A0" : "#5B6B85",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0FA8A0] text-white hover:bg-[#0B9990]"
              onClick={() => {
                if (!name.trim() || !email.trim()) return;
                setMembers((prev) => [
                  {
                    id: `m${Date.now()}`,
                    name: name.trim(),
                    email: email.trim(),
                    role,
                    initials: name.trim().slice(0, 2).toUpperCase(),
                    color: "#0FA8A0",
                    title: role === "Admin" ? "Studio Admin" : role,
                    projects: 0,
                    openTasks: 0,
                    status: "active",
                  },
                  ...prev,
                ]);
                setName("");
                setEmail("");
                setRole("Member");
                setShowInvite(false);
                toast.success("Invite sent (demo)");
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberCard({ member }: { member: StudioMember }) {
  const roleStyle = ROLE_STYLE[member.role];
  return (
    <div className="rounded-2xl border border-[#E4E9F0] bg-white p-5">
      <div className="mb-4 flex items-start gap-3">
        <span
          className="flex size-11 items-center justify-center rounded-xl text-[13px] font-bold text-white"
          style={{ background: member.color }}
        >
          {member.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#16233D]">{member.name}</p>
          <p className="truncate text-[12px] text-[#5B6B85]">{member.title}</p>
        </div>
        <Badge variant={member.status === "active" ? "success" : "secondary"}>
          {member.status}
        </Badge>
      </div>
      <p className="mb-3 text-[12px] text-[#5B6B85]">{member.email}</p>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: roleStyle.bg, color: roleStyle.color }}
        >
          {member.role}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-[#E4E9F0] pt-3 text-[12px]">
        <div>
          <p className="text-[18px] font-bold text-[#16233D]">{member.projects}</p>
          <p className="text-[#5B6B85]">Projects</p>
        </div>
        <div>
          <p className="text-[18px] font-bold text-[#16233D]">{member.openTasks}</p>
          <p className="text-[#5B6B85]">Open tasks</p>
        </div>
      </div>
    </div>
  );
}
