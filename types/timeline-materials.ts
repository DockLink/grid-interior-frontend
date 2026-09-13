export interface MaterialItem {
  id: number;
  category: string;
  item: string;
  supplier: string;
  status: "approved" | "pending" | "ordered" | "delivered";
  eta: string;
  value: string;
  notes?: string;
}
