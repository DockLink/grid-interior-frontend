"use client";

import { Fragment } from "react";
import { Check, Minus } from "lucide-react";

import { DemoCaption } from "@/components/demo/demo-caption";

const ROLES = [
  "Super Admin",
  "Designer 01",
  "Designer 02",
  "Project Coordinator",
  "Social Media Admin",
] as const;

type Cell = "full" | "limited" | "none";

const GROUPS: { name: string; perms: { label: string; cells: Cell[] }[] }[] = [
  {
    name: "Projects",
    perms: [
      { label: "View assigned", cells: ["full", "full", "full", "full", "full"] },
      { label: "Create", cells: ["full", "full", "none", "none", "none"] },
      { label: "Edit details", cells: ["full", "full", "limited", "none", "none"] },
      { label: "Archive", cells: ["full", "full", "none", "none", "none"] },
    ],
  },
  {
    name: "Files",
    perms: [
      { label: "View", cells: ["full", "full", "full", "full", "limited"] },
      { label: "Upload", cells: ["full", "full", "full", "full", "none"] },
      { label: "Share links", cells: ["full", "full", "full", "limited", "none"] },
      { label: "Delete", cells: ["full", "full", "limited", "none", "none"] },
    ],
  },
  {
    name: "Tasks",
    perms: [
      { label: "View board", cells: ["full", "full", "full", "full", "limited"] },
      { label: "Create / assign", cells: ["full", "full", "full", "none", "none"] },
      { label: "Complete own", cells: ["full", "full", "full", "full", "none"] },
    ],
  },
  {
    name: "Suppliers & BOQ",
    perms: [
      { label: "Manage suppliers", cells: ["full", "limited", "limited", "limited", "full"] },
      { label: "View BOQ / financials", cells: ["full", "limited", "limited", "limited", "none"] },
      { label: "Edit BOQ / rates", cells: ["full", "limited", "limited", "none", "none"] },
    ],
  },
  {
    name: "Users",
    perms: [
      { label: "View directory", cells: ["full", "full", "limited", "none", "none"] },
      { label: "Invite", cells: ["full", "full", "none", "none", "none"] },
      { label: "Change roles", cells: ["full", "limited", "none", "none", "none"] },
    ],
  },
];

function CellMark({ value }: { value: Cell }) {
  if (value === "full") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[rgba(15,168,160,0.12)] text-[#0FA8A0]">
        <Check size={13} />
      </span>
    );
  }
  if (value === "limited") {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-[rgba(245,158,11,0.12)] text-[#D97706]">
        <Minus size={13} />
      </span>
    );
  }
  return <span className="text-[12px] text-[#C4CDD8]">—</span>;
}

export function PermissionsMatrixView() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E9F0] bg-white">
      <div className="flex items-end justify-between gap-3 border-b border-[#E4E9F0] px-4 py-3">
        <div>
          <p className="text-[14px] font-semibold text-[#16233D]">Permissions matrix</p>
          <DemoCaption className="mt-0.5">Demo overlay — not wired to the API.</DemoCaption>
        </div>
        <div className="flex gap-3 text-[11px] text-[#5B6B85]">
          <span className="inline-flex items-center gap-1">
            <Check size={11} className="text-[#0FA8A0]" /> Full
          </span>
          <span className="inline-flex items-center gap-1">
            <Minus size={11} className="text-[#D97706]" /> Limited
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-[#F8FAFB] text-left text-[11px] tracking-wide text-[#5B6B85] uppercase">
              <th className="px-4 py-3 font-semibold">Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="px-3 py-3 text-center font-semibold">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <Fragment key={group.name}>
                <tr>
                  <td
                    colSpan={ROLES.length + 1}
                    className="bg-[#F8FAFB] px-4 py-2 text-[11px] font-bold tracking-wide text-[#0B2545] uppercase"
                  >
                    {group.name}
                  </td>
                </tr>
                {group.perms.map((perm) => (
                  <tr key={perm.label} className="border-t border-[#EEF1F5]">
                    <td className="px-4 py-2.5 text-[#16233D]">{perm.label}</td>
                    {perm.cells.map((cell, i) => (
                      <td key={ROLES[i]} className="px-3 py-2.5 text-center">
                        <CellMark value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
