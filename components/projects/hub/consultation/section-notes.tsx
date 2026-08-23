"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";

import { NotesThread } from "./notes-thread";

export function SectionNotes({ section }: { section: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-2xl bg-white px-5 py-4"
      style={{ boxShadow: "var(--neu-card)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
      >
        <MaterialIcon name="forum" outlined size={18} className="text-[var(--figma-teal)]" />
        <span className="text-[14px] font-bold text-[var(--figma-navy)]">Team notes</span>
        <span className="text-[11px] text-[var(--figma-gray400)]">Thread for this section</span>
        <MaterialIcon
          name={open ? "expand_less" : "expand_more"}
          outlined
          size={20}
          className="ml-auto text-[var(--figma-gray400)]"
        />
      </button>
      {open && (
        <div className="mt-4">
          <NotesThread compact section={section} />
        </div>
      )}
    </div>
  );
}
