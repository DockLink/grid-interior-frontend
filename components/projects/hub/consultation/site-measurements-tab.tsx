"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { useConsultation } from "@/hooks/use-consultation";
import { useUploadFile } from "@/hooks/use-upload-file";
import { getApiErrorMessage } from "@/lib/api/handle-api-error";
import { useHubTeam } from "@/lib/projects/hub-team-context";
import type { ConsultRoom, ConsultSketch } from "@/types/consultation";

import { GradientBtn, SectionCard, SectionTitle } from "./consultation-ui";
import { SectionNotes } from "./section-notes";

const SKETCH_MAX_BYTES = 25 * 1024 * 1024;
const SKETCH_ACCEPT = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

function isDraftId(id: string) {
  return id.startsWith("mock-");
}

function formatUploadedLabel(isoOrEmpty: string): string {
  if (!isoOrEmpty) return "Uploaded just now";
  const d = new Date(isoOrEmpty);
  if (Number.isNaN(d.getTime())) return `Uploaded ${isoOrEmpty}`;
  const formatted = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Uploaded ${formatted}`;
}

function isAllowedSketchFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "png", "jpg", "jpeg"].includes(ext)) return true;
  return ["application/pdf", "image/png", "image/jpeg"].includes(file.type);
}

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

export function SiteMeasurementsTab({ projectId }: { projectId: string }) {
  const teamMembers = useHubTeam();
  const {
    rooms: remoteRooms,
    sketch: remoteSketch,
    createRoom,
    updateRoom,
    deleteRoom,
    upsertSketch,
    deleteSketch,
    isAuthOff,
  } = useConsultation(projectId);
  const { uploadFile } = useUploadFile();
  const [rooms, setRooms] = useState<ConsultRoom[]>(remoteRooms);
  const [sketch, setSketch] = useState<ConsultSketch | null>(remoteSketch);
  const [dragOver, setDragOver] = useState(false);
  const [isUploadingSketch, setIsUploadingSketch] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [visitStatus, setVisitStatus] = useState<"scheduled" | "completed" | "cancelled">(
    "scheduled",
  );
  const [attendees, setAttendees] = useState([1, 3, 4]);
  const sketchInputRef = useRef<HTMLInputElement>(null);

  // Keep unsaved draft rows when remote consultation data refreshes
  useEffect(() => {
    setRooms((prev) => {
      const drafts = prev.filter((r) => isDraftId(r.id));
      if (drafts.length === 0) return remoteRooms;
      const remoteIds = new Set(remoteRooms.map((r) => r.id));
      return [...remoteRooms, ...drafts.filter((d) => !remoteIds.has(d.id))];
    });
  }, [remoteRooms]);

  useEffect(() => {
    setSketch(remoteSketch);
  }, [remoteSketch]);

  const updateLocal = (id: string, field: keyof ConsultRoom, val: string) => {
    setRooms((p) => p.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const persistField = (id: string, field: keyof ConsultRoom, val: string) => {
    updateLocal(id, field, val);
    if (!isAuthOff && !isDraftId(id)) {
      const payload =
        field === "name" && !val.trim() ? { name: "New room" } : { [field]: val };
      void updateRoom(id, payload);
    }
  };

  const handleAddRoom = () => {
    const tempId = `mock-room-${Date.now()}`;
    setRooms((p) => [...p, { id: tempId, name: "", length: "", width: "", height: "" }]);
  };

  const handleSaveMeasurements = async () => {
    const pendingRooms = rooms.filter((r) => isDraftId(r.id));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (pendingRooms.length === 0) return;

    setSaving(true);
    try {
      for (const room of pendingRooms) {
        const created = await createRoom({
          name: room.name.trim() || "New room",
          length: room.length,
          width: room.width,
          height: room.height,
        });
        if (created) {
          setRooms((prev) => prev.map((p) => (p.id === room.id ? created : p)));
        }
      }
      toast.success(
        pendingRooms.length === 1 ? "Room saved" : `${pendingRooms.length} rooms saved`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to save rooms");
    } finally {
      setSaving(false);
    }
  };

  const processSketchFile = async (file: File) => {
    if (!isAllowedSketchFile(file)) {
      toast.error("Unsupported file type. Please upload PDF, PNG, or JPG.");
      return;
    }
    if (file.size > SKETCH_MAX_BYTES) {
      toast.error("File size exceeds 25 MB limit.");
      return;
    }

    setIsUploadingSketch(true);
    try {
      let storageFileId = `local-${Date.now()}`;
      if (!isAuthOff) {
        const { token } = await uploadFile(file);
        storageFileId = token;
      }

      const uploadedAt = new Date().toISOString();
      const savedSketch = await upsertSketch({
        file_name: file.name,
        storage_file_id: storageFileId,
        uploaded_at: uploadedAt,
      });

      if (savedSketch) {
        setSketch(savedSketch);
      } else if (isAuthOff) {
        setSketch({
          id: `mock-sketch-${Date.now()}`,
          fileName: file.name,
          uploadedAt,
          storageFileId,
          fileUrl: null,
        });
      }
      toast.success("Measurement sketch uploaded");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to upload measurement sketch");
    } finally {
      setIsUploadingSketch(false);
    }
  };

  const handleSketchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processSketchFile(file);
    e.target.value = "";
  };

  const openSketchPicker = () => {
    if (isUploadingSketch) return;
    sketchInputRef.current?.click();
  };

  const handleRemoveSketch = async () => {
    if (isUploadingSketch) return;
    try {
      await deleteSketch();
      setSketch(null);
      toast.success("Measurement sketch removed");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Failed to remove measurement sketch");
    }
  };

  return (
    <div>
      <input
        ref={sketchInputRef}
        type="file"
        accept={SKETCH_ACCEPT}
        className="hidden"
        onChange={handleSketchInputChange}
      />

      <SectionCard>
        <SectionTitle icon="event" title="Site Visit Booking" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Visit date</label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="box-border w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-[13px] neu-inset outline-none focus:border-[var(--figma-teal)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Time</label>
            <input
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="box-border w-full rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white px-3 py-2.5 text-[13px] neu-inset outline-none focus:border-[var(--figma-teal)]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--figma-navy)]">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {(["scheduled", "completed", "cancelled"] as const).map((s) => {
                const active = visitStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setVisitStatus(s)}
                    className="cursor-pointer rounded-full px-3 py-1.5 text-[12px] capitalize"
                    style={{
                      border: active ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                      color: active ? "var(--figma-teal)" : "var(--figma-gray500)",
                      fontWeight: active ? 700 : 400,
                      background: active ? "rgba(14,124,134,0.07)" : "#fff",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-2 text-[13px] font-medium text-[var(--figma-navy)]">Attendees</div>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((m) => {
              const on = attendees.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setAttendees((prev) => (on ? prev.filter((id) => id !== m.id) : [...prev, m.id]))
                  }
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border px-2 py-1 text-[12px]"
                  style={{
                    borderColor: on ? m.color : "var(--figma-border)",
                    background: on ? `${m.color}18` : "#fff",
                    color: on ? "var(--figma-navy)" : "var(--figma-gray500)",
                    fontWeight: on ? 600 : 400,
                  }}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: m.color }}
                  >
                    {m.initials}
                  </span>
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle icon="upload_file" title="Measurement Sketch" />
        {sketch ? (
          <div className="overflow-hidden rounded-xl border-[1.5px] border-[var(--figma-border)] bg-[var(--figma-gray50)]">
            <div
              className="relative flex h-[180px] items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f0f7f8, #e8f4f5)" }}
            >
              {sketch.fileUrl && /\.(png|jpe?g)$/i.test(sketch.fileName) ? (
                <img
                  src={sketch.fileUrl}
                  alt={sketch.fileName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <svg width="240" height="140" viewBox="0 0 240 140" fill="none" className="opacity-60">
                  <rect x="20" y="10" width="200" height="120" rx="4" stroke="var(--figma-teal)" strokeWidth="1.5" fill="none" />
                  <rect x="20" y="10" width="80" height="55" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(14,124,134,0.06)" />
                  <rect x="100" y="10" width="120" height="55" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(27,42,74,0.04)" />
                  <rect x="20" y="65" width="110" height="65" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(14,124,134,0.04)" />
                  <rect x="130" y="65" width="90" height="65" stroke="var(--figma-navy)" strokeWidth="1" fill="rgba(27,42,74,0.03)" />
                  <text x="52" y="42" fontSize="9" fill="var(--figma-teal)" fontFamily="monospace">
                    Sketch
                  </text>
                </svg>
              )}
              <div className="absolute right-2.5 top-2.5 flex gap-1.5">
                <button
                  type="button"
                  disabled={isUploadingSketch}
                  onClick={() => void handleRemoveSketch()}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--figma-border)] bg-white/90 px-2.5 py-[5px] text-[11px] text-[var(--figma-gray500)] disabled:cursor-wait disabled:opacity-60"
                >
                  <MaterialIcon name="delete" outlined size={14} />
                  Remove
                </button>
                <button
                  type="button"
                  disabled={isUploadingSketch}
                  onClick={openSketchPicker}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-[var(--figma-teal)] bg-white/90 px-2.5 py-[5px] text-[11px] text-[var(--figma-teal)] disabled:cursor-wait disabled:opacity-60"
                >
                  <MaterialIcon name="upload" outlined size={14} />
                  {isUploadingSketch ? "Uploading…" : "Replace"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5">
              <MaterialIcon name="insert_drive_file" outlined size={16} className="text-[var(--figma-teal)]" />
              <span className="truncate text-xs font-medium text-[var(--figma-navy)]">
                {sketch.fileName}
              </span>
              <span className="ml-auto shrink-0 text-[11px] text-[var(--figma-gray400)]">
                {formatUploadedLabel(sketch.uploadedAt)}
              </span>
            </div>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isUploadingSketch) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (isUploadingSketch) return;
              const file = e.dataTransfer.files?.[0];
              if (file) void processSketchFile(file);
            }}
            onClick={openSketchPicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openSketchPicker();
            }}
            className={`flex flex-col items-center gap-3 rounded-[14px] border-2 border-dashed px-8 py-11 transition-all duration-200 neu-inset ${
              isUploadingSketch ? "cursor-wait opacity-70" : "cursor-pointer"
            }`}
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
              <div className="mb-1 text-sm font-semibold text-[var(--figma-navy)]">
                {isUploadingSketch ? "Uploading…" : "Upload Measurement Sketch"}
              </div>
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
              onClick={handleAddRoom}
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
                onChange={(field, val) => persistField(room.id, field, val)}
                onDelete={() => {
                  setRooms((p) => p.filter((r) => r.id !== room.id));
                  if (!isDraftId(room.id)) void deleteRoom(room.id);
                }}
              />
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex justify-end">
          <GradientBtn
            label={saving ? "Saving…" : saved ? "Saved!" : "Save Measurements"}
            icon={saved && !saving ? "check" : "save"}
            disabled={saving}
            onClick={() => void handleSaveMeasurements()}
          />
        </div>
      </SectionCard>

      <SectionNotes section="site" projectId={projectId} />
    </div>
  );
}
