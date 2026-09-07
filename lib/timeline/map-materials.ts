import { formatVendorTaskDate } from "@/lib/suppliers/map-vendor-tasks";
import type { MaterialItem } from "@/lib/timeline/mock-timeline";
import type { ProjectLinks } from "@/types/project-links";
import type { VendorTask, VendorTaskStatus } from "@/types/vendor-tasks";

const STATUS_MAP: Record<VendorTaskStatus, MaterialItem["status"]> = {
  todo: "pending",
  "in-progress": "ordered",
  done: "delivered",
};

function resolveParty(task: VendorTask, links: ProjectLinks): { name: string; category: string } {
  if (task.partyKind === "supplier") {
    const supplier = links.suppliers.find((s) => s.id === task.partyId);
    return {
      name: supplier?.name ?? "Unknown supplier",
      category: supplier?.category ?? "Uncategorized",
    };
  }
  const vendor = links.subVendors.find((s) => s.id === task.partyId);
  return {
    name: vendor?.name ?? "Unknown vendor",
    category: vendor?.specialty ?? "Uncategorized",
  };
}

export function mapVendorTasksToMaterialItems(
  tasks: VendorTask[],
  links: ProjectLinks,
): MaterialItem[] {
  return tasks.map((task, index) => {
    const party = resolveParty(task, links);
    return {
      id: index + 1,
      category: party.category,
      item: task.title,
      supplier: party.name,
      status: STATUS_MAP[task.status],
      eta: formatVendorTaskDate(task.dueDate),
      value: "—",
      notes: task.description,
    };
  });
}

export function materialItemsHaveNumericValue(items: MaterialItem[]): boolean {
  return items.some((item) => {
    const digits = item.value.replace(/[^0-9]/g, "");
    return digits.length > 0;
  });
}

export function sumMaterialValues(items: MaterialItem[]): number {
  return items.reduce((sum, item) => {
    const digits = item.value.replace(/[^0-9]/g, "");
    return sum + (digits ? parseInt(digits, 10) : 0);
  }, 0);
}
