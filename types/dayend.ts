/* ── Day End Management types (API-aligned) ── */

export type DayEndStatus = "open" | "closed";

export interface DayEndSummary {
  branchId: number;
  branchName: string;
  businessDate: string; // YYYY-MM-DD
  status: DayEndStatus;
  openedBy: string;
  openingTime: string; // HH:mm (first order of the day) or "—"
  closedBy?: string;
  closedAt?: string; // ISO timestamp
  dayEndId?: number;
  note?: string;
}

export interface DayEndStats {
  totalOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  netRevenue: number;
  averageOrderValue: number;
  cancelledOrders: number;
  grossSales: number;
  discounts: number;
  serviceCharges: number;
}

export interface PaymentBreakdown {
  method: "Cash" | "Card" | "Online" | "Credit";
  amount: number;
  count: number;
  percentage: number;
}

export interface ExpenseEntry {
  id: number;
  title: string;
  category: string;
  amount: number;
  createdAt: string; // ISO
}

export interface TopSellingItem {
  name: string;
  quantity: number;
  revenue: number;
}

export interface HourlySales {
  hour: string; // "HH:00"
  orders: number;
  revenue: number;
}

export interface DayEndRecord {
  id: number;
  date: string; // YYYY-MM-DD business date
  branchName: string;
  branchId: number;
  totalSales: number;
  totalExpenses: number;
  netRevenue: number;
  totalOrders: number;
  cancelledOrders: number;
  status: DayEndStatus;
  closedBy?: string;
  closedAt?: string; // ISO
  note?: string;
}

/** Response shape of GET /api/dayend?branchId=&date= */
export interface DayEndResponse {
  summary: DayEndSummary;
  stats: DayEndStats;
  payments: PaymentBreakdown[];
  expenses: ExpenseEntry[];
  topItems: TopSellingItem[];
  hourlySales: HourlySales[];
}
