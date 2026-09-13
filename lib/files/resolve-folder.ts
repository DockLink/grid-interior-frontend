import type { ProjectFolderNode, ProjectFolderTree } from "@/types/files";

/** Canonical folder labels used across hub screens. */
export const FOLDER_LABELS = {
  drawings: "DRAWINGS",
  spacePlans: "Space Plans",
  detailedDrawings: "Detailed Drawings",
  designs: "DESIGNS",
  threed: "3Ds",
  gallery: "Site Photos",
  galleryAlt: "Gallery",
  photos: "Photos",
} as const;

function normalizeName(name: string): string {
  return name
    .replace(/^\d+(\.\d+)*\s+/, "")
    .trim()
    .toLowerCase();
}

function nameMatches(nodeName: string, label: string): boolean {
  const n = normalizeName(nodeName);
  const l = label.trim().toLowerCase();
  return n === l || n.endsWith(l) || n.includes(l);
}

function walk(
  nodes: ProjectFolderNode[],
  visit: (node: ProjectFolderNode) => boolean,
): ProjectFolderNode | null {
  for (const node of nodes) {
    if (visit(node)) return node;
    const found = walk(node.children ?? [], visit);
    if (found) return found;
  }
  return null;
}

/** Find first folder whose name matches any of the labels (numbered prefixes ignored). */
export function findFolderByLabels(
  tree: ProjectFolderTree | null | undefined,
  labels: string[],
): ProjectFolderNode | null {
  if (!tree?.tree?.length || !labels.length) return null;
  return walk(tree.tree, (node) => labels.some((label) => nameMatches(node.name, label)));
}

export function findFolderPathByLabels(
  tree: ProjectFolderTree | null | undefined,
  labels: string[],
): string | null {
  return findFolderByLabels(tree, labels)?.path ?? null;
}

/** Prefer a child of `parent` matching labels; otherwise search whole tree. */
export function findChildFolderByLabels(
  tree: ProjectFolderTree | null | undefined,
  parentLabels: string[],
  childLabels: string[],
): ProjectFolderNode | null {
  const parent = findFolderByLabels(tree, parentLabels);
  if (parent?.children?.length) {
    const child = parent.children.find((c) =>
      childLabels.some((label) => nameMatches(c.name, label)),
    );
    if (child) return child;
  }
  return findFolderByLabels(tree, childLabels);
}

export function resolveSpacePlansFolder(
  tree: ProjectFolderTree | null | undefined,
): ProjectFolderNode | null {
  return findChildFolderByLabels(
    tree,
    [FOLDER_LABELS.drawings],
    [FOLDER_LABELS.spacePlans],
  );
}

export function resolveDetailedDrawingsFolder(
  tree: ProjectFolderTree | null | undefined,
): ProjectFolderNode | null {
  return findChildFolderByLabels(
    tree,
    [FOLDER_LABELS.drawings],
    [FOLDER_LABELS.detailedDrawings],
  );
}

export function resolveThreedFolder(
  tree: ProjectFolderTree | null | undefined,
): ProjectFolderNode | null {
  return findChildFolderByLabels(
    tree,
    [FOLDER_LABELS.designs],
    [FOLDER_LABELS.threed],
  );
}

export function resolveGalleryFolder(
  tree: ProjectFolderTree | null | undefined,
): ProjectFolderNode | null {
  return findFolderByLabels(tree, [
    FOLDER_LABELS.gallery,
    FOLDER_LABELS.galleryAlt,
    FOLDER_LABELS.photos,
  ]);
}

/** Child folders of a node as area-like options (id = path, name = display). */
export function folderChildrenAsAreas(
  folder: ProjectFolderNode | null,
): { id: string; name: string; path: string }[] {
  if (!folder) return [];
  const children = folder.children ?? [];
  if (!children.length) {
    return [{ id: folder.path, name: "All", path: folder.path }];
  }
  return children.map((c) => ({
    id: c.path,
    name: c.name.replace(/^\d+(\.\d+)*\s+/, "").trim() || c.name,
    path: c.path,
  }));
}
