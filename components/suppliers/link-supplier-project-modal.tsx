"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GradientButton, OutlineButton } from "@/components/clients/client-ui";
import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useLinkSupplierToProject } from "@/hooks/use-link-supplier-to-project";
import { useProjects } from "@/hooks/use-projects";
import { handleApiError } from "@/lib/api/handle-api-error";
import { cn } from "@/lib/utils";

export function LinkSupplierProjectModal({
  supplierId,
  supplierName,
  role,
  linkedProjectIds,
  onClose,
  onLinked,
}: {
  supplierId: string;
  supplierName: string;
  role: string;
  linkedProjectIds: string[];
  onClose: () => void;
  onLinked?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { projects, isLoading, error } = useProjects({ limit: 100, page: 1 });
  const { linkProject, isLinking } = useLinkSupplierToProject(supplierId);

  const available = useMemo(() => {
    const linked = new Set(linkedProjectIds);
    return projects.filter((p) => {
      if (linked.has(p.id)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
    });
  }, [projects, linkedProjectIds, search]);

  const handleLink = async () => {
    if (!selectedId) return;
    try {
      await linkProject(selectedId, role);
      toast.success("Project linked to supplier");
      onLinked?.();
      onClose();
    } catch (err) {
      handleApiError(err, { toast: true });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(27,42,74,0.20)] backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="hub-modal-in flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[20px] bg-white px-8 py-7"
        style={{ boxShadow: "var(--neu-modal)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-[var(--figma-navy)]">Link Existing Project</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">
              Select a project to associate with {supplierName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <div className="relative mb-3">
          <MaterialIcon
            name="search"
            outlined
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--figma-gray400)]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="hub-input-focus w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pr-3.5 pl-9 text-sm text-[var(--figma-navy)] outline-none neu-inset"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">Loading projects…</div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-600">{error}</div>
          ) : available.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--figma-gray500)]">
              No unlinked projects found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {available.map((p) => {
                const selected = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3 text-left transition-all duration-150",
                      selected
                        ? "border-[var(--figma-teal)] bg-[rgba(14,124,134,0.06)]"
                        : "border-[var(--figma-border)] bg-white",
                    )}
                  >
                    <MaterialIcon
                      name="folder_open"
                      outlined
                      size={20}
                      className={selected ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-[var(--figma-navy)]">{p.name}</div>
                      <div className="text-[11px] text-[var(--figma-gray500)]">
                        {p.client} · {p.currentStage ?? "No phase"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2.5">
          <OutlineButton onClick={onClose} className="flex-1">
            Cancel
          </OutlineButton>
          <GradientButton
            icon="link"
            onClick={() => void handleLink()}
            className="flex-[2]"
            disabled={!selectedId || isLinking}
          >
            {isLinking ? "Linking…" : "Link Project"}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
