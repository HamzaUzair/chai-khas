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
  superAdmin?: SuperAdminDashboardStats;
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

export interface SuperAdminDashboardStats {
  platformOverview: {
    totalRestaurants: number;
    activeRestaurants: number;
    singleBranchRestaurants: number;
    multiBranchRestaurants: number;
    totalBranches: number;
    restaurantAdmins: number;
    branchAdmins: number;
    pendingSetup: number;
  };
  restaurantOverview: {
    restaurantId: number;
    name: string;
    type: "Single Branch" | "Multi Branch";
    totalBranches: number;
    restaurantAdminAssigned: boolean;
    branchAdminsAssigned: number;
    status: "Active" | "Inactive";
    createdAt: number;
    setupStatus: "Healthy" | "Needs Setup" | "Missing Admin" | "Inactive";
  }[];
  branchAssignmentOverview: {
    branchId: number;
    restaurantName: string;
    branchName: string;
    branchCode: string;
    branchAdminAssigned: boolean;
    branchAdminName: string | null;
    status: "Active" | "Inactive";
  }[];
  recentActivity: {
    id: string;
    type:
      | "restaurant_created"
      | "restaurant_admin_assigned"
      | "branch_created"
      | "branch_admin_assigned";
    message: string;
    createdAt: number;
  }[];
  setupAlerts: {
    id: string;
    severity: "warning" | "critical";
    title: string;
    detail: string;
  }[];
  charts: {
    restaurantsCreated: { label: string; count: number }[];
    branchesCreated: { label: string; count: number }[];
    branchTypeDistribution: { label: "Single Branch" | "Multi Branch"; count: number }[];
    restaurantStatusDistribution: { label: "Active" | "Inactive"; count: number }[];
    adminAssignmentCompletion: {
      restaurantsWithAdmin: number;
      totalRestaurants: number;
      branchesWithAdmin: number;
      totalBranches: number;
    };
  };
}
