export type SupplierCategory =
  | "Furniture"
  | "Flooring"
  | "Lighting"
  | "Fabrics"
  | "Masonry"
  | "Electrical"
  | "Plumbing"
  | "Tiles"
  | "Joinery"
  | "Ironmongery";

export type SubVendorSpecialty =
  | "Masonry"
  | "Plumbing"
  | "Electrical"
  | "Plastering"
  | "Joinery"
  | "Tiling"
  | "Painting"
  | "HVAC";

export type SupplierStatus = "Active" | "Inactive";
export type AvailabilityStatus = "Available" | "Busy" | "Unknown";
export type DeliveryStatus = "Delivered" | "Pending" | "Delayed";
export type PaymentStatus = "Paid" | "Partial" | "Unpaid";

export interface SupplierApi {
  id: string;
  name: string;
  category: SupplierCategory;
  contact_person?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  active_projects?: number;
  total_orders?: number;
  avg_lead_time?: string | null;
  credit_terms?: string | null;
  status: SupplierStatus;
  notes?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  activeProjects: number;
  totalOrders: number;
  avgLeadTime: string;
  creditTerms: string;
  status: SupplierStatus;
  notes?: string;
}

export interface SupplierRate {
  id: string;
  item: string;
  rate: string;
  unit: string;
  creditTerms: string;
  leadTime: string;
}

export interface SupplierOrder {
  id: string;
  date: string;
  project: string;
  item: string;
  quantity: string;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  amount: string;
}

export interface SubVendorApi {
  id: string;
  name: string;
  company?: string | null;
  specialty: SubVendorSpecialty;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  availability: AvailabilityStatus;
  past_projects?: number;
  payment_record?: "Excellent" | "Good" | "Fair";
  notes?: string | null;
}

export interface SubVendor {
  id: string;
  name: string;
  company: string;
  specialty: SubVendorSpecialty;
  phone: string;
  email: string;
  address: string;
  availability: AvailabilityStatus;
  pastProjects: number;
  paymentRecord: "Excellent" | "Good" | "Fair";
  notes?: string;
}

export interface SubVendorHistory {
  id: string;
  date: string;
  project: string;
  scope: string;
  amount: string;
  status: PaymentStatus;
}

export interface SubVendorPayment {
  id: string;
  project: string;
  amount: string;
  date: string;
  status: PaymentStatus;
}

export interface SuppliersListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SuppliersListResponse {
  data: SupplierApi[];
  meta: SuppliersListMeta;
}

export interface SuppliersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: SupplierCategory;
  status?: SupplierStatus;
}

export interface CreateSupplierPayload {
  name: string;
  category: SupplierCategory;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  status?: SupplierStatus;
  notes?: string;
  avg_lead_time?: string;
  credit_terms?: string;
}

export interface UpdateSupplierPayload extends Partial<CreateSupplierPayload> {}

export interface CreateSubVendorPayload {
  name: string;
  specialty: SubVendorSpecialty;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  availability?: AvailabilityStatus;
  payment_record?: "Excellent" | "Good" | "Fair";
  notes?: string;
}

export interface UpdateSubVendorPayload {
  name?: string;
  company?: string;
  specialty?: SubVendorSpecialty;
  phone?: string;
  email?: string;
  address?: string;
  availability?: AvailabilityStatus;
  notes?: string;
}

export interface SubVendorsListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubVendorsListResponse {
  data: SubVendorApi[];
  meta: SubVendorsListMeta;
}

export interface SubVendorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: SubVendorSpecialty;
  availability?: AvailabilityStatus;
}
