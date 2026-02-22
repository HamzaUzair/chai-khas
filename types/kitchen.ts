/* ── Kitchen Management types ── */

export type StaffRole = "chef" | "kitchen_staff" | "runner" | "manager";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  chef: "Chef",
  kitchen_staff: "Kitchen Staff",
  runner: "Runner",
  manager: "Manager",
};

export interface KitchenStation {
  id: string;
  branchId: number;
  branchName: string;
  title: string;
  code: string;
  printerName?: string;
  status: "active" | "inactive";
  staffIds: string[];
  createdAt: number;
}

export interface KitchenStaff {
  id: string;
  branchId: number;
  branchName: string;
  name: string;
  role: StaffRole;
  phone?: string;
  status: "active" | "inactive";
}

export interface StationFormData {
  branchId: number | "";
  title: string;
  code: string;
  printerName: string;
  status: "active" | "inactive";
}

export interface StaffFormData {
  branchId: number | "";
  name: string;
  role: StaffRole;
  phone: string;
  status: "active" | "inactive";
}
