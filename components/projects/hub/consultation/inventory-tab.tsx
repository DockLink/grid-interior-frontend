"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import type { ConsultInventoryItem } from "@/types/consultation";

import { GradientBtn, PillSwitch, SectionCard, SectionTitle } from "./consultation-ui";
import { SectionNotes } from "./section-notes";

function isDraftId(id: string) {
  return id.startsWith("mock-");
}

function InventoryRow({
  item,
  isLast,
  onToggleMeasured,
  onDelete,
  onChange,
}: {
  item: ConsultInventoryItem;
  isLast: boolean;
  onToggleMeasured: () => void;
  onDelete: () => void;
  onChange: (field: keyof ConsultInventoryItem, val: string | boolean) => void;
}) {
  const [hov, setHov] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const cellInput = (field: keyof ConsultInventoryItem, val: string, w?: number) => (
    <input
      value={val}
      onChange={(e) => onChange(field, e.target.value)}
      className="box-border rounded-[7px] border border-[var(--figma-border)] bg-white px-2 py-1.5 text-[11px] text-[var(--figma-navy)] outline-none transition-[border] duration-150 neu-inset focus:border-[1.5px] focus:border-[var(--figma-teal)]"
      style={{ width: w || 72 }}
    />
  );

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="transition-colors duration-100"
      style={{
        background: hov ? "rgba(14,124,134,0.03)" : "#fff",
        borderBottom: isLast ? "none" : "1px solid var(--figma-border)",
      }}
    >
      <td className="px-2.5 py-2">{cellInput("name", item.name, 140)}</td>
      <td className="px-2.5 py-2">{cellInput("spec", item.spec, 160)}</td>
      <td className="px-2.5 py-2">{cellInput("h", item.h, 52)}</td>
      <td className="px-2.5 py-2">{cellInput("w", item.w, 52)}</td>
      <td className="px-2.5 py-2">{cellInput("l", item.l, 52)}</td>
      <td className="px-2.5 py-2">{cellInput("qty", item.qty, 44)}</td>
      <td className="px-2.5 py-2">{cellInput("notes", item.notes, 100)}</td>
      <td className="px-2.5 py-2 text-center">
        <button
          type="button"
          onClick={onToggleMeasured}
          className="flex size-[22px] cursor-pointer items-center justify-center rounded-full transition-all duration-[180ms]"
          style={{
            background: item.measured ? "#3FA66B" : "#fff",
            border: item.measured ? "none" : "2px solid var(--figma-border)",
            boxShadow: item.measured ? "var(--neu-raised)" : "var(--neu-inset)",
          }}
        >
          {item.measured && <MaterialIcon name="check" size={13} className="text-white" />}
        </button>
      </td>
      <td className="w-8 px-1.5 py-2">
        {hov && (
          <button
            type="button"
            onClick={onDelete}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            className="flex cursor-pointer items-center rounded-[5px] border-none bg-transparent p-[3px] transition-colors duration-[120ms]"
            style={{ color: deleteHover ? "var(--figma-alert)" : "var(--figma-gray400)" }}
          >
            <MaterialIcon name="delete" outlined size={15} />
          </button>
        )}
      </td>
    </tr>
  );
}

export function InventoryTab({ projectId }: { projectId: string }) {
  const {
    inventory: remoteItems,
    createInventory,
    updateInventory,
    deleteInventory,
    isAuthOff,
  } = useConsultation(projectId);
  const [included, setIncluded] = useState(true);
  const [items, setItems] = useState<ConsultInventoryItem[]>(remoteItems);
  const [saving, setSaving] = useState(false);

  // Keep unsaved draft rows when remote consultation data refreshes
  useEffect(() => {
    setItems((prev) => {
      const drafts = prev.filter((i) => isDraftId(i.id));
      if (drafts.length === 0) return remoteItems;
      const remoteIds = new Set(remoteItems.map((i) => i.id));
      return [...remoteItems, ...drafts.filter((d) => !remoteIds.has(d.id))];
    });
  }, [remoteItems]);

  const toggleMeasured = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const next = !item.measured;
    setItems((p) => p.map((it) => (it.id === id ? { ...it, measured: next } : it)));
    if (!isAuthOff && !isDraftId(id)) void updateInventory(id, { measured: next });
  };

  const handleAddItem = () => {
    const tempId = `mock-inv-${Date.now()}`;
    setItems((p) => [
      ...p,
      {
        id: tempId,
        name: "",
        spec: "",
        h: "",
        w: "",
        l: "",
        qty: "1",
        notes: "",
        measured: false,
      },
    ]);
  };

  const handleSaveItems = async () => {
    const pendingItems = items.filter((i) => isDraftId(i.id));
    if (pendingItems.length === 0) {
      toast.message("No new items to save");
      return;
    }

    setSaving(true);
    try {
      for (const item of pendingItems) {
        const created = await createInventory({
          name: item.name.trim() || "New item",
          spec: item.spec,
          h: item.h,
          w: item.w,
          l: item.l,
          qty: item.qty || "1",
          notes: item.notes,
          measured: item.measured,
        });
        if (created) {
          setItems((prev) => prev.map((p) => (p.id === item.id ? created : p)));
        }
      }
      toast.success(
        pendingItems.length === 1 ? "Item saved" : `${pendingItems.length} items saved`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to save items");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard>
        <SectionTitle
          icon="inventory_2"
          title="Inventory List"
          right={<PillSwitch on={included} setOn={setIncluded} label="Include Inventory List" />}
        />

        {!included ? (
          <div className="flex items-center gap-2.5 rounded-[10px] border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] px-4 py-5">
            <MaterialIcon name="inventory_2" outlined size={18} className="text-[var(--figma-gray400)]" />
            <span className="text-[13px] text-[var(--figma-gray400)]">
              Inventory list not included for this consultation.
            </span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--figma-gray50)]">
                    {["Item Name", "Specifications", "H (cm)", "W (cm)", "L (cm)", "Qty", "Notes", "Measured"].map(
                      (col) => (
                        <th
                          key={col}
                          className="whitespace-nowrap border-b border-[var(--figma-border)] px-2.5 py-[9px] text-left text-[11px] font-semibold tracking-wide text-[var(--figma-navy)]"
                        >
                          {col}
                        </th>
                      ),
                    )}
                    <th className="border-b border-[var(--figma-border)] px-2.5 py-[9px]" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <InventoryRow
                      key={item.id}
                      item={item}
                      isLast={idx === items.length - 1}
                      onToggleMeasured={() => toggleMeasured(item.id)}
                      onDelete={() => {
                        setItems((p) => p.filter((i) => i.id !== item.id));
                        if (!isDraftId(item.id)) void deleteInventory(item.id);
                      }}
                      onChange={(field, val) => {
                        setItems((p) =>
                          p.map((i) => (i.id === item.id ? { ...i, [field]: val } : i)),
                        );
                        if (!isAuthOff && field !== "measured" && !isDraftId(item.id)) {
                          const payload =
                            field === "name" && typeof val === "string" && !val.trim()
                              ? { name: "New item" }
                              : { [field]: val };
                          void updateInventory(item.id, payload);
                        }
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <GradientBtn label="Add Item" icon="add" small onClick={handleAddItem} />
              <GradientBtn
                label={saving ? "Saving…" : "Save Items"}
                icon="save"
                small
                disabled={saving}
                onClick={() => void handleSaveItems()}
              />
            </div>
          </>
        )}
      </SectionCard>
      <SectionNotes section="inventory" projectId={projectId} />
    </>
  );
}
