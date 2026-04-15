/* ── Deals Management types (UI-only for now) ── */

export type DealStatus = "active" | "inactive";

export interface DealItem {
  id: string;
  name: string;
  quantity: number;
}

export interface Deal {
  id: string;
  name: string;
  type: string;
  description?: string;
  branchId: number;
  branchName: string;
  items: DealItem[];
  price: number;
  status: DealStatus;
}

export interface DealFormDataItem {
  id: string;
  name: string;
  quantity: number;
}

export interface DealFormData {
  name: string;
  type: string;
  branchId: number | "";
  description: string;
  status: DealStatus;
  price: string;
  items: DealFormDataItem[];
}

