import type { DetailCategoryId } from "@/types/detail";
import type { ProjectFolderNode } from "@/types/files";

/** Display / folder name used under Detailed Drawings for each category. */
export const DETAIL_CATEGORY_FOLDER_NAMES: Record<DetailCategoryId, string> = {
  electrical: "Electrical",
  flooring: "Flooring",
  ceiling: "Ceiling",
  walls: "Walls, Doors & Windows",
  furniture: "Furniture",
  interior: "Interior Elements",
};

const CATEGORY_FOLDER_ALIASES: Record<DetailCategoryId, string[]> = {
  electrical: ["electrical"],
  flooring: ["flooring"],
  ceiling: ["ceiling"],
  walls: ["walls", "doors", "windows"],
  furniture: ["furniture", "ff&e", "ffe"],
  interior: ["interior", "elements"],
};

function normalizeFolderName(name: string): string {
  return name.replace(/^\d+(\.\d+)*\s+/, "").trim().toLowerCase();
}

/**
 * Resolve a category's dedicated subfolder under Detailed Drawings.
 * Returns null when missing — never falls back to the parent folder
 * (that would leak files across categories).
 */
export function matchDetailCategoryFolder(
  detailed: ProjectFolderNode | null,
  categoryId: DetailCategoryId,
): string | null {
  if (!detailed) return null;
  const folderName = DETAIL_CATEGORY_FOLDER_NAMES[categoryId];
  const aliases = [
    ...CATEGORY_FOLDER_ALIASES[categoryId],
    folderName.toLowerCase().split(",")[0]?.trim() ?? "",
    folderName.toLowerCase(),
  ].filter(Boolean);

  const children = detailed.children ?? [];
  const match = children.find((child) => {
    const name = normalizeFolderName(child.name);
    return aliases.some((a) => name === a || name.includes(a));
  });
  return match?.path ?? null;
}

export function categoryFolderDisplayName(categoryId: DetailCategoryId): string {
  return DETAIL_CATEGORY_FOLDER_NAMES[categoryId];
}
