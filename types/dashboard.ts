/* ── Dashboard analytics types ── */

export interface DashboardStats {
  todaySales: number;
  ordersToday: number;
  avgOrderValue: number;
  totalBranches: number;
  menuItems: number;
  activeDeals: number;
  salesLast7Days: { date: string; sales: number }[];
  branchPerformance: BranchPerformanceRow[];
  topSellingItems: { name: string; quantity: number }[];
  bestBranch: { branchName: string; todaySales: number; ordersToday: number } | null;
  lowestBranch: { branchName: string; todaySales: number; ordersToday: number } | null;
  alerts: { type: string; message: string }[];
  totalActiveBranches: number;
}

export interface BranchPerformanceRow {
  branchId: number;
  branchName: string;
  todaySales: number;
  ordersToday: number;
  runningOrders: number;
  completedOrders: number;
  avgOrderValue: number;
}
