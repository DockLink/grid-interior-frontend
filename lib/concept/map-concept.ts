import type {
  ConceptArea,
  ConceptAreaApi,
  ConceptCard,
  ConceptCardApi,
  ConceptFileType,
  ConceptRenderApi,
  ConceptRenderImage,
  ConceptRevisionApi,
  ConceptRevisionEntry,
  ConceptTreeResponse,
  ConfirmStatus,
} from "@/types/concept";

function asConfirm(status: string): ConfirmStatus {
  const normalized = status.trim().toLowerCase();
  return normalized === "confirmed" || normalized === "approved"
    ? "confirmed"
    : "pending";
}

function asFileType(type: string | null | undefined): ConceptFileType {
  return type === "pdf" ? "pdf" : "jpg";
}

export function mapConceptCardApi(raw: ConceptCardApi, areaId?: string): ConceptCard {
  return {
    id: raw.id,
    name: raw.name ?? "",
    areaId: areaId ?? raw.area_id ?? "",
    fileName: raw.file_name ?? "",
    fileType: asFileType(raw.file_type),
    fileSize: raw.file_size ?? "",
    thumb: raw.thumb_url ?? "",
    confirmStatus: asConfirm(raw.confirm_status ?? "pending"),
  };
}

export function mapConceptAreaApi(raw: ConceptAreaApi): ConceptArea & {
  cards: ConceptCard[];
} {
  const cards = (raw.cards ?? []).map((c) => mapConceptCardApi(c, raw.id));
  return {
    id: raw.id,
    name: raw.name ?? "",
    icon: raw.icon || "room",
    conceptCount: raw.concept_count ?? cards.length,
    cards,
  };
}

export function mapConceptRenderApi(raw: ConceptRenderApi): ConceptRenderImage {
  return {
    id: raw.id,
    url: raw.url ?? "",
    caption: raw.caption ?? "",
  };
}

export function mapConceptRevisionApi(raw: ConceptRevisionApi): ConceptRevisionEntry {
  const d = raw.date ? new Date(raw.date) : null;
  const date =
    d && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : raw.date || "";
  return {
    id: raw.id,
    date,
    note: raw.note ?? "",
    chargeable: Boolean(raw.chargeable),
  };
}

export function mapConceptTree(raw: ConceptTreeResponse) {
  const areas = (raw.areas ?? []).map(mapConceptAreaApi);
  return {
    areas: areas.map(({ cards: _c, ...area }) => area),
    areasWithCards: areas,
    cards: areas.flatMap((a) => a.cards),
    renders: (raw.renders ?? []).map(mapConceptRenderApi),
    revisions: (raw.revisions ?? []).map(mapConceptRevisionApi),
  };
}
