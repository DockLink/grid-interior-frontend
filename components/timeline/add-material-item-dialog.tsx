"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
import { todayIsoDate } from "@/lib/suppliers/map-vendor-tasks";
import { projectTabRoute } from "@/types/navigation";
import type { VendorPartyKind } from "@/types/vendor-tasks";

export type MaterialPartyOption = {
  partyKind: VendorPartyKind;
  partyId: string;
  label: string;
};

export function AddMaterialItemDialog({
  open,
  onOpenChange,
  projectId,
  partyOptions,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  partyOptions: MaterialPartyOption[];
  isSubmitting?: boolean;
  onSubmit: (input: {
    title: string;
    partyKind: VendorPartyKind;
    partyId: string;
    dueDate: string;
    notes?: string;
  }) => Promise<void>;
}) {
  const first = partyOptions[0];
  const [title, setTitle] = useState("");
  const [partyKey, setPartyKey] = useState("");
  const [dueDate, setDueDate] = useState(todayIsoDate());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setNotes("");
    setDueDate(todayIsoDate());
    setPartyKey(first ? `${first.partyKind}:${first.partyId}` : "");
  }, [open, first?.partyKind, first?.partyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    const sep = partyKey.indexOf(":");
    const partyKind = partyKey.slice(0, sep) as VendorPartyKind;
    const partyId = partyKey.slice(sep + 1);
    if (!trimmed || !partyKind || !partyId || !dueDate) return;
    await onSubmit({
      title: trimmed,
      partyKind,
      partyId,
      dueDate,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Add material item</DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Creates a vendor task on this project for procurement tracking.
            </p>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            {partyOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Link a supplier or sub-vendor on the{" "}
                <Link
                  href={projectTabRoute(projectId, "links")}
                  className="font-medium text-[var(--figma-teal)] underline"
                  onClick={() => onOpenChange(false)}
                >
                  Suppliers & Clients
                </Link>{" "}
                tab before adding items.
              </p>
            ) : (
              <>
                <div>
                  <Label htmlFor="material-item">Item</Label>
                  <Input
                    id="material-item"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lobby chandelier"
                    autoFocus
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="material-party">Supplier / sub-vendor</Label>
                  <select
                    id="material-party"
                    value={partyKey}
                    onChange={(e) => setPartyKey(e.target.value)}
                    className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {partyOptions.map((p) => (
                      <option key={`${p.partyKind}:${p.partyId}`} value={`${p.partyKind}:${p.partyId}`}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="material-due">Due date</Label>
                  <Input
                    id="material-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="material-notes">Notes</Label>
                  <Input
                    id="material-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional"
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {partyOptions.length > 0 && (
              <Button type="submit" disabled={!title.trim() || !dueDate || isSubmitting}>
                {isSubmitting ? "Saving…" : "Add item"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
