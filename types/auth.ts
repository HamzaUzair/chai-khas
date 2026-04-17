export type AppRole =
  | "SUPER_ADMIN"
  | "RESTAURANT_ADMIN"
  | "BRANCH_ADMIN"
  | "ORDER_TAKER"
  | "CASHIER"
  | "ACCOUNTANT"
  | "LIVE_KITCHEN";

export interface AuthSession {
  userId: number;
  username: string;
  fullName: string;
  role: AppRole;
  restaurantId: number | null;
  restaurantName: string | null;
  /**
   * Whether the tenant this user belongs to is a multi-branch restaurant.
   * Drives the Branches sidebar item and route guards for RESTAURANT_ADMIN.
   * `null` for SUPER_ADMIN (platform scope) or users with no restaurant.
   */
  restaurantHasMultipleBranches: boolean | null;
  branchId: number | null;
  branchName: string | null;
  terminal: number;
  token: string;
}
