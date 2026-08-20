"use client";

import { useState } from "react";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SAMPLE_ROOMS } from "@/lib/projects/mock-consultation";
import type { ConsultRoom } from "@/types/consultation";

import { GradientBtn, SectionCard, SectionTitle } from "./consultation-ui";

function MeasurementRow({
  room,
  isLast,
  onChange,
  onDelete,
}: {
  room: ConsultRoom;
  isLast: boolean;
  onChange: (field: keyof ConsultRoom, val: string) => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  const fields = ["name", "length", "width", "height"] as const;

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
      {fields.map((field) => (
        <td key={field} className="px-3 py-2">
          <input
            value={room[field]}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={field === "name" ? "e.g. Living Room" : "0.00"}
            className="box-border w-full rounded-lg border border-[var(--figma-border)] bg-white px-2.5 py-[7px] text-xs text-[var(--figma-navy)] outline-none transition-[border] duration-150 neu-inset focus:border-[1.5px] focus:border-[var(--figma-teal)]"
          />
        </td>
      ))}
      <td className="w-10 px-3 py-2">
        {hov && (
          <button
            type="button"
            onClick={onDelete}
            onMouseEnter={() => setDeleteHover(true)}
            onMouseLeave={() => setDeleteHover(false)}
            className="flex cursor-pointer items-center rounded-md border-none bg-transparent p-1 transition-colors duration-[120ms]"
            style={{ color: deleteHover ? "var(--figma-alert)" : "var(--figma-gray400)" }}
          >
            <MaterialIcon name="delete" outlined size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}

export function SiteMeasurementsTab() {
  const [rooms, setRooms] = useState<ConsultRoom[]>(SAMPLE_ROOMS);
  const [sketchUploaded, setSketchUploaded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateRoom = (id: number, field: keyof ConsultRoom, val: string) => {
    setRooms((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  return (
    <div>
      <SectionCard>
        <SectionTitle icon="upload_file" title="Measurement Sketch" />
        {sketchUploaded ? (
          <div className="overflow-hidden rounded-xl border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)]">
            <div
              className="relative flex h-[180px] items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f0f7f8, #e8f4f5)" }}
            >
              <svg width="240" height="140" viewBox="0 0 240 140" fill="none" className="opacity-60">
                <rect x="20" y="10" width="200" height="120" rx="4" stroke="var(--figma-teal)" strokeWidth="1.5" fill="none" />
                <rect x="20" y="10" width="80" height="55" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(14,124,134,0.06)" />
                <rect x="100" y="10" width="120" height="55" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(27,42,74,0.04)" />
                <rect x="20" y="65" width="110" height="65" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(14,124,134,0.04)" />
                <rect x="130" y="65" width="90" height="65" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(27,42,74,0.03)" />
                <text x="52" y="42" fontSize="9" fill="var(--figma-teal)" fontFamily="monospace">
                  7.2m × 5.4m
                </text>
                <text x="148" y="42" fontSize="9" fill="var(--figma-navy)" fontFamily="monospace">
                  5.8m × 4.6m
                </text>
                <text x="62" y="104" fontSize="9" fill="var(--figma-teal)" fontFamily="monospace">
                  4.1m × 3.8m
                </text>
                <text x="156" y="104" fontSize="9" fill="var(--figma-navy)" fontFamily="monospace">
                  3.9m × 3.5m
                </text>
              </svg>
              <div className="absolute right-2.5 top-2.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSketchUploaded(false)}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--figma-border)] bg-white/90 px-2.5 py-[5px] text-[11px] text-[var(--figma-gray500)]"
                >
                  <MaterialIcon name="delete" outlined size={14} />
                  Remove
                </button>
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--figma-teal)] bg-white/90 px-2.5 py-[5px] text-[11px] text-[var(--figma-teal)]"
                >
                  <MaterialIcon name="upload" outlined size={14} />
                  Replace
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5">
              <MaterialIcon name="insert_drive_file" outlined size={16} className="text-[var(--figma-teal)]" />
              <span className="text-xs font-medium text-[var(--figma-navy)]">floor_plan_sketch_v2.pdf</span>
              <span className="ml-auto text-[11px] text-[var(--figma-gray400)]">Uploaded 24 Jul 2026</span>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setSketchUploaded(true);
            }}
            onClick={() => setSketchUploaded(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSketchUploaded(true);
            }}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-[14px] border-2 border-dashed px-8 py-11 transition-all duration-200 neu-inset"
            style={{
              borderColor: dragOver ? "var(--figma-teal)" : "var(--figma-border)",
              background: dragOver ? "rgba(14,124,134,0.04)" : "var(--figma-gray50)",
            }}
          >
            <div
              className="flex size-[52px] items-center justify-center rounded-[14px] transition-colors duration-200"
              style={{
                background: dragOver ? "rgba(14,124,134,0.12)" : "var(--figma-gray100)",
              }}
            >
              <MaterialIcon
                name="upload_file"
                outlined
                size={26}
                className={dragOver ? "text-[var(--figma-teal)]" : "text-[var(--figma-gray400)]"}
              />
            </div>
            <div className="text-center">
              <div className="mb-1 text-sm font-semibold text-[var(--figma-navy)]">Upload Measurement Sketch</div>
              <div className="text-xs text-[var(--figma-gray500)]">
                Drag & drop or click to browse · PDF, PNG, JPG up to 25 MB
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <SectionTitle
          icon="straighten"
          title="Room Measurements"
          right={
            <button
              type="button"
              onClick={() => setRooms((p) => [...p, { id: Date.now(), name: "", length: "", width: "", height: "" }])}
              className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs font-semibold text-[var(--figma-teal)]"
            >
              <MaterialIcon name="add" outlined size={15} />
              Add Room
            </button>
          }
        />
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--figma-gray50)]">
              {["Room / Area", "Length (m)", "Width (m)", "Height (m)", ""].map((col) => (
                <th
                  key={col}
                  className="border-b border-[var(--figma-border)] px-3 py-[9px] text-left text-[11px] font-semibold tracking-wide text-[var(--figma-navy)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, idx) => (
              <MeasurementRow
                key={room.id}
                room={room}
                isLast={idx === rooms.length - 1}
                onChange={(field, val) => updateRoom(room.id, field, val)}
                onDelete={() => setRooms((p) => p.filter((r) => r.id !== room.id))}
              />
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex justify-end">
          <GradientBtn
            label={saved ? "Saved!" : "Save Measurements"}
            icon={saved ? "check" : "save"}
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          />
        </div>
      </SectionCard>
    </div>
  );
}
