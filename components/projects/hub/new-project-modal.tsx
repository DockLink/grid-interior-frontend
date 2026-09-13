"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { MaterialIcon } from "@/components/projects/hub/material-icon";
import { SiteAddressPicker } from "@/components/projects/hub/site-address-picker";
import { useClients } from "@/hooks/use-clients";
import { useCreateProject } from "@/hooks/use-create-project";
import { useUsers } from "@/hooks/use-users";
import { isAuthDisabled } from "@/lib/auth/dev-bypass";
import {
  PHASE_CFG,
  PHASES,
  PROJECT_MAIN_TYPES,
  PROJECT_SUB_TYPES_BY_MAIN,
  type ProjectMainType,
  type ProjectPhase,
} from "@/lib/projects/design-tokens";
import { buildSeededPhaseStages } from "@/lib/projects/seed-phases";
import { queryKeys } from "@/lib/query/keys";
import { getUserInitials, getUserListPrimaryLabel } from "@/lib/user/display";
import type { CreateProjectRequest } from "@/types/projects";

type Step = 1 | 2 | 3 | 4;

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Basic Info" },
    { n: 2, label: "Phase" },
    { n: 3, label: "Location" },
    { n: 4, label: "Team" },
  ] as const;

  return (
    <div className="mb-8 flex items-center">
      {steps.map((s, i) => {
        const done = s.n < step;
        const active = s.n === step;
        const future = s.n > step;
        return (
          <div key={s.n} className="flex flex-1 items-center" style={{ flex: i < steps.length - 1 ? 1 : 0 }}>
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                className="flex size-8 items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: done
                    ? "linear-gradient(135deg, var(--figma-teal), #0b9eab)"
                    : active
                      ? "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))"
                      : "var(--figma-gray100)",
                  boxShadow: done || active ? "var(--neu-raised)" : "var(--neu-inset)",
                  border: future ? "1.5px solid var(--figma-border)" : "none",
                }}
              >
                {done ? (
                  <MaterialIcon name="check" size={16} className="text-white" />
                ) : (
                  <span
                    className="text-[13px] font-bold"
                    style={{ color: active ? "#fff" : "var(--figma-gray400)" }}
                  >
                    {s.n}
                  </span>
                )}
              </div>
              <span
                className="whitespace-nowrap text-[11px]"
                style={{
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--figma-navy)" : done ? "var(--figma-teal)" : "var(--figma-gray400)",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="-mt-[18px] mx-1.5 h-0.5 flex-1 transition-all duration-300"
                style={{
                  background: done
                    ? "linear-gradient(90deg, var(--figma-teal), rgba(14,124,134,0.5))"
                    : "var(--figma-border)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: string;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasErr = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-[13px] font-medium"
        style={{ color: hasErr ? "var(--figma-alert)" : "var(--figma-navy)" }}
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <MaterialIcon
            name={icon}
            outlined
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
            style={{ color: focused ? "var(--figma-teal)" : "var(--figma-gray400)" }}
          />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="hub-input-focus w-full rounded-[10px] border bg-white text-[13px] text-[var(--figma-navy)] outline-none transition-all duration-150"
          style={{
            padding: icon ? "10px 12px 10px 36px" : "10px 14px",
            borderColor: hasErr ? "var(--figma-alert)" : focused ? "var(--figma-teal)" : "var(--figma-border)",
            borderWidth: hasErr || focused ? 2 : 1.5,
            boxShadow: hasErr
              ? "var(--neu-inset), 0 0 0 3px rgba(242,109,109,0.08)"
              : focused
                ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)"
                : "var(--neu-inset)",
          }}
        />
      </div>
      {hasErr && (
        <div className="flex items-center gap-1 text-[11px] text-[var(--figma-alert)]">
          <MaterialIcon name="error_outline" outlined size={13} />
          {error}
        </div>
      )}
    </div>
  );
}

const MEMBER_COLORS = ["#0E7C86", "#7C3AED", "#0891B2", "#D97706", "#1B2A4A", "#BE185D"];

function memberColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % MEMBER_COLORS.length;
  }
  return MEMBER_COLORS[hash] ?? MEMBER_COLORS[0];
}

export function NewProjectModal({
  onClose,
  onCreate,
  onCreated,
  preselectedClientId,
  redirectOnCreate = true,
}: {
  onClose: () => void;
  onCreate?: () => void;
  onCreated?: (projectId: string) => void;
  preselectedClientId?: string;
  redirectOnCreate?: boolean;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { createProject } = useCreateProject();
  const { users, isLoading: usersLoading } = useUsers({ page: 1, limit: 100, status: "ACTIVE" });
  const { clients, isLoading: clientsLoading } = useClients({ page: 1, limit: 100 });

  const studioMembers = useMemo(
    () => users.filter((u) => u.status === "ACTIVE"),
    [users],
  );
  const defaultDates = useMemo(() => {
    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const end = new Date(today);
    end.setFullYear(end.getFullYear() + 1);
    return { start, end: end.toISOString().slice(0, 10) };
  }, []);

  const [step, setStep] = useState<Step>(1);
  const [projectName, setProjectName] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(preselectedClientId ?? null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [mainType, setMainType] = useState<ProjectMainType | "">("");
  const [subType, setSubType] = useState("");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | null>(null);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [coordinator, setCoordinator] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [clientFocused, setClientFocused] = useState(false);

  const filteredClients = clients
    .filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
    .slice(0, 6);

  const selectedClientRecord = selectedClient
    ? clients.find((c) => c.id === selectedClient)
    : undefined;
  const selectedClientName = selectedClientRecord?.name ?? "";

  const validate1 = () => {
    const e: Record<string, string> = {};
    if (!projectName.trim()) e.name = "This field is required";
    if (!selectedClient) e.client = "Please select a client";
    if (!mainType) e.mainType = "Please select a main type";
    if (!subType) e.subType = "Please select a sub type";
    if (!startDate) e.startDate = "Start date is required";
    if (!endDate) e.endDate = "End date is required";
    if (startDate && endDate && endDate <= startDate) {
      e.endDate = "End date must be after start date";
    }
    return e;
  };

  const nextStep = () => {
    if (step === 1) {
      const e = validate1();
      if (Object.keys(e).length > 0) {
        setErrors(e);
        return;
      }
    }
    if (step === 2 && !selectedPhase) {
      setErrors({ phase: "Please select a starting phase" });
      return;
    }
    setErrors({});
    setStep((s) => (s + 1) as Step);
  };

  useEffect(() => {
    if (preselectedClientId) setSelectedClient(preselectedClientId);
  }, [preselectedClientId]);

  useEffect(() => {
    if (studioMembers.length === 0) return;
    setSelectedTeam((prev) => (prev.length ? prev : [studioMembers[0].id]));
    setCoordinator((prev) => prev || studioMembers[0].id);
  }, [studioMembers]);

  const handleCreate = async () => {
    if (isAuthDisabled()) {
      toast.error("Enable auth in .env.local to create projects on the server.");
      return;
    }

    const client = clients.find((c) => c.id === selectedClient);

    const payload: CreateProjectRequest = {
      name: projectName.trim(),
      main_type: mainType || undefined,
      sub_type: subType || undefined,
      start_date: startDate,
      end_date: endDate,
      location: address.trim() || undefined,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
      client: {
        name: client?.name ?? "Unknown Client",
        contact_email: client?.email || undefined,
        contact_number: client?.phone || undefined,
      },
    };

    setSaving(true);
    try {
      const created = await createProject(payload, {
        clientId: selectedClient || undefined,
        memberUserIds: selectedTeam.length ? selectedTeam : undefined,
        projectLeadUserId: coordinator || null,
        stages: buildSeededPhaseStages(startDate, endDate),
      });

      await qc.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success(`"${projectName}" created`);
      onCreate?.();
      onCreated?.(created.id);
      if (redirectOnCreate) {
        router.push(`/projects/${created.id}`);
      } else {
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  const toggleTeamMember = (id: string) => {
    setSelectedTeam((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-5 pt-8 backdrop-blur-[3px]"
      style={{ background: "rgba(27,42,74,0.20)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="hub-modal-in w-full max-w-[600px] rounded-[20px] bg-white px-10 py-9" style={{ boxShadow: "var(--neu-modal)" }}>
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2 className="m-0 mb-1 text-xl font-bold text-[var(--figma-navy)]">New Project</h2>
            <p className="m-0 text-[13px] text-[var(--figma-gray500)]">Complete 4 steps to set up your project</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border-none bg-[var(--figma-gray100)]"
          >
            <MaterialIcon name="close" outlined size={18} className="text-[var(--figma-gray500)]" />
          </button>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <div className="flex flex-col gap-[18px]">
            <FInput
              label="Project Name"
              value={projectName}
              onChange={(v) => {
                setProjectName(v);
                setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Marchetti Villa Renovation"
              icon="folder_open"
              error={errors.name}
            />

            <div className="relative flex flex-col gap-1">
              <label
                className="text-[13px] font-medium"
                style={{ color: errors.client ? "var(--figma-alert)" : "var(--figma-navy)" }}
              >
                Client
              </label>
              <div className="relative">
                <MaterialIcon
                  name="person_search"
                  outlined
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                  style={{ color: clientFocused ? "var(--figma-teal)" : "var(--figma-gray400)" }}
                />
                <input
                  value={selectedClient ? selectedClientName : clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setSelectedClient(null);
                    setShowClientDropdown(true);
                  }}
                  onFocus={() => {
                    setClientFocused(true);
                    setShowClientDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowClientDropdown(false);
                      setClientFocused(false);
                    }, 200);
                  }}
                  placeholder="Search client name…"
                  className="hub-input-focus w-full rounded-[10px] border bg-white py-2.5 pr-3 pl-9 text-[13px] text-[var(--figma-navy)] outline-none"
                  style={{
                    borderColor: errors.client
                      ? "var(--figma-alert)"
                      : clientFocused
                        ? "var(--figma-teal)"
                        : "var(--figma-border)",
                    borderWidth: errors.client || clientFocused ? 2 : 1.5,
                    boxShadow: clientFocused
                      ? "var(--neu-inset), 0 0 0 3px rgba(14,124,134,0.08)"
                      : "var(--neu-inset)",
                  }}
                />
              </div>
              {errors.client && (
                <div className="flex items-center gap-1 text-[11px] text-[var(--figma-alert)]">
                  <MaterialIcon name="error_outline" outlined size={13} />
                  {errors.client}
                </div>
              )}
              {showClientDropdown && (
                <div
                  className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl border border-[var(--figma-border)] bg-white"
                  style={{ boxShadow: "var(--neu-dropdown)" }}
                >
                  {clientsLoading ? (
                    <div className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">
                      Loading clients…
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="px-4 py-3 text-[12px] text-[var(--figma-gray500)]">
                      {clientSearch.trim() ? "No clients match your search" : "No clients found"}
                    </div>
                  ) : (
                    filteredClients.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedClient(c.id);
                          setClientSearch("");
                          setShowClientDropdown(false);
                          setErrors((p) => ({ ...p, client: "" }));
                        }}
                        className="flex w-full cursor-pointer items-center gap-2.5 border-b border-[var(--figma-border)] bg-transparent px-4 py-2.5 text-left font-[inherit] text-[13px] text-[var(--figma-navy)] last:border-b-0 hover:bg-[var(--figma-gray50)]"
                      >
                        <div
                          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{
                            background: c.color
                              ? c.color
                              : "linear-gradient(135deg, var(--figma-navy), var(--figma-teal))",
                          }}
                        >
                          {c.initials ||
                            c.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-[11px] text-[var(--figma-gray500)]">
                            {c.email || c.company || "—"}
                          </div>
                        </div>
                        {selectedClient === c.id && (
                          <MaterialIcon name="check" size={16} className="ml-auto text-[var(--figma-teal)]" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: errors.mainType ? "var(--figma-alert)" : "var(--figma-navy)" }}
                >
                  Main Type
                </label>
                <div className="relative">
                  <select
                    value={mainType}
                    onChange={(e) => {
                      setMainType(e.target.value as ProjectMainType | "");
                      setSubType("");
                      setErrors((p) => ({ ...p, mainType: "", subType: "" }));
                    }}
                    className="w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] bg-white py-2.5 pr-9 pl-3.5 text-[13px] text-[var(--figma-navy)] outline-none"
                    style={{
                      borderColor: errors.mainType ? "var(--figma-alert)" : "var(--figma-border)",
                      boxShadow: "var(--neu-inset)",
                    }}
                  >
                    <option value="">Select main type</option>
                    {PROJECT_MAIN_TYPES.map((mt) => (
                      <option key={mt} value={mt}>
                        {mt}
                      </option>
                    ))}
                  </select>
                  <MaterialIcon
                    name="expand_more"
                    outlined
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
                  />
                </div>
                {errors.mainType && (
                  <div className="text-[11px] text-[var(--figma-alert)]">{errors.mainType}</div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: errors.subType ? "var(--figma-alert)" : "var(--figma-navy)" }}
                >
                  Sub Type
                </label>
                <div className="relative">
                  <select
                    value={subType}
                    disabled={!mainType}
                    onChange={(e) => {
                      setSubType(e.target.value);
                      setErrors((p) => ({ ...p, subType: "" }));
                    }}
                    className="w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] bg-white py-2.5 pr-9 pl-3.5 text-[13px] text-[var(--figma-navy)] outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: errors.subType ? "var(--figma-alert)" : "var(--figma-border)",
                      boxShadow: "var(--neu-inset)",
                    }}
                  >
                    <option value="">{mainType ? "Select sub type" : "Select main type first"}</option>
                    {mainType &&
                      PROJECT_SUB_TYPES_BY_MAIN[mainType].map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                  </select>
                  <MaterialIcon
                    name="expand_more"
                    outlined
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
                  />
                </div>
                {errors.subType && (
                  <div className="text-[11px] text-[var(--figma-alert)]">{errors.subType}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: errors.startDate ? "var(--figma-alert)" : "var(--figma-navy)" }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setErrors((p) => ({ ...p, startDate: "", endDate: "" }));
                  }}
                  className="rounded-xl border-[1.5px] bg-white px-3.5 py-2.5 font-[inherit] text-[13px] text-[var(--figma-navy)] outline-none"
                  style={{
                    borderColor: errors.startDate ? "var(--figma-alert)" : "var(--figma-border)",
                    boxShadow: "var(--neu-inset)",
                  }}
                />
                {errors.startDate && (
                  <div className="text-[11px] text-[var(--figma-alert)]">{errors.startDate}</div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label
                  className="text-[13px] font-medium"
                  style={{ color: errors.endDate ? "var(--figma-alert)" : "var(--figma-navy)" }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrors((p) => ({ ...p, endDate: "" }));
                  }}
                  className="rounded-xl border-[1.5px] bg-white px-3.5 py-2.5 font-[inherit] text-[13px] text-[var(--figma-navy)] outline-none"
                  style={{
                    borderColor: errors.endDate ? "var(--figma-alert)" : "var(--figma-border)",
                    boxShadow: "var(--neu-inset)",
                  }}
                />
                {errors.endDate && (
                  <div className="text-[11px] text-[var(--figma-alert)]">{errors.endDate}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mt-0 mb-5 text-[13px] text-[var(--figma-gray500)]">
              Select the phase at which this project begins. You can start at any phase.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PHASES.map((phase, idx) => {
                const cfg = PHASE_CFG[phase];
                const isSelected = selectedPhase === phase;
                return (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => {
                      setSelectedPhase(phase);
                      setErrors({});
                    }}
                    className="relative flex cursor-pointer flex-col items-center gap-2.5 rounded-[14px] px-3.5 py-5 font-[inherit] transition-all duration-180"
                    style={{
                      background: isSelected ? "rgba(14,124,134,0.06)" : "#fff",
                      border: isSelected ? "2px solid var(--figma-teal)" : "1.5px solid var(--figma-border)",
                      boxShadow: isSelected
                        ? "var(--neu-raised), 0 0 0 2px rgba(14,124,134,0.10)"
                        : "var(--neu-card)",
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex size-[18px] items-center justify-center rounded-full bg-[var(--figma-teal)]">
                        <MaterialIcon name="check" size={12} className="text-white" />
                      </div>
                    )}
                    <div
                      className="flex size-11 items-center justify-center rounded-xl transition-all duration-180"
                      style={{ background: isSelected ? cfg.color : cfg.bg }}
                    >
                      <MaterialIcon
                        name={cfg.icon}
                        outlined={!isSelected}
                        size={22}
                        style={{ color: isSelected ? "#fff" : cfg.color }}
                      />
                    </div>
                    <div className="text-center">
                      <div
                        className="mb-0.5 text-xs font-semibold"
                        style={{ color: isSelected ? "var(--figma-navy)" : "var(--figma-gray500)" }}
                      >
                        Phase {idx + 1}
                      </div>
                      <div className="text-[11px]" style={{ color: isSelected ? "var(--figma-teal)" : "var(--figma-gray400)" }}>
                        {phase}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.phase && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--figma-alert)]">
                <MaterialIcon name="error_outline" outlined size={14} />
                {errors.phase}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <SiteAddressPicker
            address={address}
            latitude={latitude}
            longitude={longitude}
            distanceKm={distanceKm}
            onChange={(next) => {
              setAddress(next.address);
              setLatitude(next.latitude);
              setLongitude(next.longitude);
              setDistanceKm(next.distanceKm);
            }}
          />
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-3 block text-[13px] font-medium text-[var(--figma-navy)]">
                Assign Team Members
              </label>
              <div className="flex flex-col gap-2">
                {usersLoading && (
                  <div className="text-[13px] text-[var(--figma-gray500)]">Loading team members…</div>
                )}
                {!usersLoading && studioMembers.length === 0 && (
                  <div className="text-[13px] text-[var(--figma-gray500)]">No active users found.</div>
                )}
                {studioMembers.map((m) => {
                  const isSelected = selectedTeam.includes(m.id);
                  const initials = getUserInitials(m);
                  const name = getUserListPrimaryLabel(m);
                  const role = m.roles[0] ?? "Member";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleTeamMember(m.id)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-[11px] text-left font-[inherit] transition-all duration-150"
                      style={{
                        background: isSelected ? "rgba(14,124,134,0.05)" : "#fff",
                        borderColor: isSelected ? "var(--figma-teal)" : "var(--figma-border)",
                        borderWidth: isSelected ? 2 : 1.5,
                      }}
                    >
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: memberColor(m.id) }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-[var(--figma-navy)]">{name}</div>
                        <div className="text-[11px] text-[var(--figma-gray500)]">{role}</div>
                      </div>
                      <div
                        className="flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-150"
                        style={{
                          background: isSelected ? "var(--figma-teal)" : "var(--figma-gray100)",
                          border: isSelected ? "none" : "1.5px solid var(--figma-border)",
                        }}
                      >
                        {isSelected && <MaterialIcon name="check" size={13} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[var(--figma-navy)]">Project Coordinator</label>
              <div className="relative">
                <MaterialIcon
                  name="manage_accounts"
                  outlined
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
                <select
                  value={coordinator}
                  onChange={(e) => setCoordinator(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-[10px] border-[1.5px] border-[var(--figma-border)] bg-white py-2.5 pr-9 pl-9 text-[13px] text-[var(--figma-navy)] outline-none neu-inset"
                >
                  {studioMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getUserListPrimaryLabel(m)} — {m.roles[0] ?? "Member"}
                    </option>
                  ))}
                </select>
                <MaterialIcon
                  name="expand_more"
                  outlined
                  size={16}
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[var(--figma-gray400)]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--figma-border)] bg-[var(--figma-gray50)] p-4">
              <div className="mb-2.5 text-xs font-semibold tracking-wide text-[var(--figma-navy)]">
                PROJECT SUMMARY
              </div>
              {[
                { label: "Name", value: projectName || "—" },
                { label: "Client", value: selectedClientName || "—" },
                { label: "Main", value: mainType || "—" },
                { label: "Sub", value: subType || "—" },
                { label: "Phase", value: selectedPhase || "—" },
                {
                  label: "Team",
                  value: `${selectedTeam.length} member${selectedTeam.length !== 1 ? "s" : ""} assigned`,
                },
              ].map((item) => (
                <div key={item.label} className="mb-1 flex gap-3 text-xs">
                  <span className="w-14 shrink-0 text-[var(--figma-gray500)]">{item.label}</span>
                  <span className="font-medium text-[var(--figma-navy)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between border-t border-[var(--figma-border)] pt-5">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep((s) => (s - 1) as Step)}
            className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-2 font-[inherit] text-[13px] text-[var(--figma-gray500)] transition-colors hover:text-[var(--figma-navy)]"
          >
            <MaterialIcon name="arrow_back" outlined size={16} />
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--figma-gray400)]">Step {step} of 4</span>
            {step < 4 ? (
              <button type="button" onClick={nextStep} className="gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-[24px] px-7 py-[11px] text-sm font-semibold">
                Next
                <MaterialIcon name="arrow_forward" outlined size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="gi-gradient-cta flex cursor-pointer items-center gap-2 rounded-[24px] px-7 py-[11px] text-sm font-semibold disabled:cursor-default disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    Creating…
                  </>
                ) : (
                  <>
                    <MaterialIcon name="rocket_launch" outlined size={16} />
                    Create Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
