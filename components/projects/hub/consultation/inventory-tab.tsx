"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SAMPLE_INVENTORY } from "@/lib/projects/mock-consultation";
import type { ConsultInventoryItem } from "@/types/consultation";

import { GradientBtn, PillSwitch, SectionCard, SectionTitle } from "./consultation-ui";

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

export function InventoryTab() {
  const [included, setIncluded] = useState(true);
  const [items, setItems] = useState<ConsultInventoryItem[]>(SAMPLE_INVENTORY);

  const toggleMeasured = (id: number) => {
    setItems((p) => p.map((it) => (it.id === id ? { ...it, measured: !it.measured } : it)));
  };

  return (
    <SectionCard>
      <SectionTitle
        icon="inventory_2"
        title="Inventory List"
        right={<PillSwitch on={included} setOn={setIncluded} label="Include Inventory List" />}
      />

      {!included ? (
        <div className="flex items-center gap-2.5 rounded-[10px] border border-dashed border-[var(--figma-border)] bg-[var(--figma-gray50)] px-4 py-5">
          <MaterialIcon name="inventory_2" outlined size={18} className="text-[var(--figma-gray400)]" />
          <span className="text-[13px] text-[var(--figma-gray400)]">Inventory list not included for this consultation.</span>
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
                    onDelete={() => setItems((p) => p.filter((i) => i.id !== item.id))}
                    onChange={(field, val) =>
                      setItems((p) => p.map((i) => (i.id === item.id ? { ...i, [field]: val } : i)))
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <GradientBtn
              label="Add Item"
              icon="add"
              small
              onClick={() =>
                setItems((p) => [
                  ...p,
                  {
                    id: Date.now(),
                    name: "",
                    spec: "",
                    h: "",
                    w: "",
                    l: "",
                    qty: "1",
                    notes: "",
                    measured: false,
                  },
                ])
              }
            />
          </div>
        </>
      )}
    </SectionCard>
  );
}
