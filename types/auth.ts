export type AppRole =
  | "SUPER_ADMIN"
  | "BRANCH_ADMIN"
  | "ORDER_TAKER"
  | "CASHIER"
  | "ACCOUNTANT";

export interface AuthSession {
  userId: number;
  username: string;
  fullName: string;
  role: AppRole;
  branchId: number | null;
  branchName: string | null;
  terminal: number;
  token: string;
}

