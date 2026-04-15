/* ── Day End Management types ── */

export type DayEndStatus = "open" | "closed";

export interface DayEndSummary {
  branchId: number;
  branchName: string;
  businessDate: string; // YYYY-MM-DD
  status: DayEndStatus;
  openedBy: string;
  openingTime: string;
  closingTime?: string;
  closedBy?: string;
  closedAt?: string;
}

export interface DayEndStats {
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
  averageOrderValue: number;
  cancelledOrders: number;
}

export interface PaymentBreakdown {
  method: string;
  amount: number;
  percentage: number;
}

export interface ExpenseEntry {
  id: string;
  title: string;
  category: string;
  amount: number;
  createdAt: string;
}

export interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
}

export interface HourlySales {
  hour: string;
  orders: number;
  revenue: number;
}

export interface DayEndRecord {
  id: string;
  date: string;
  branchName: string;
  branchId: number;
  totalSales: number;
  totalExpenses: number;
  netRevenue: number;
  status: DayEndStatus;
  closedBy?: string;
  closedAt?: string;
}
