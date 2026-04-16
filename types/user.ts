/* ── User / Account Management types ── */

export type UserRole =
  | "SUPER_ADMIN"
  | "BRANCH_ADMIN"
  | "ORDER_TAKER"
  | "CASHIER"
  | "ACCOUNTANT";

export const ADMIN_USER_ROLES: UserRole[] = ["SUPER_ADMIN", "BRANCH_ADMIN"];
export const STAFF_USER_ROLES: UserRole[] = ["ORDER_TAKER", "CASHIER", "ACCOUNTANT"];
export const USER_ROLES: UserRole[] = [...ADMIN_USER_ROLES, ...STAFF_USER_ROLES];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  BRANCH_ADMIN: "Branch Admin",
  ORDER_TAKER: "Order Taker",
  CASHIER: "Cashier",
  ACCOUNTANT: "Accountant",
};

export function getRoleLabel(role: string): string {
  return USER_ROLE_LABELS[role as UserRole] ?? role;
}

export interface AppUser {
  id: string;
  userId: number;
  username: string;
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
  terminal: string;
  status: "Active" | "Inactive";
}
