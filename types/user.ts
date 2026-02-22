/* ── User / Account Management types ── */

export type UserRole =
  | "Super Admin"
  | "Branch Admin"
  | "Order Taker"
  | "Accountant"
  | "Kitchen Staff";

export const USER_ROLES: UserRole[] = [
  "Super Admin",
  "Branch Admin",
  "Order Taker",
  "Accountant",
  "Kitchen Staff",
];

export interface AppUser {
  id: string;
  userId: number;        // display ID (auto-increment locally)
  username: string;      // email-style
  fullName: string;
  role: UserRole;
  branchId: number | null;
  branchName: string;
  branchCode: string;
  status: "Active" | "Inactive";
  terminal: number;
  createdAt: number;
}

export interface UserFormData {
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  role: UserRole | "";
  branchId: number | "";
  terminal: string;       // string for number input
  status: "Active" | "Inactive";
}
