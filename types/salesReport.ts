/* ── Sales Report (Accounting) types ── */

export type ReportPaymentMethod = "Cash" | "Card" | "Online" | "Credit";
export type ReportOrderStatus = "Complete" | "Cancelled" | "Refunded";
export type TimeRange = "today" | "this_week" | "this_month" | "custom";

export interface ReportOrder {
  id: string;
  orderNo: string;
  branchId: number;
  branchName: string;
  status: ReportOrderStatus;
  paymentMethod: ReportPaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;       // subtotal - discount + tax + serviceCharge
  refundAmount: number; // > 0 only when status === "Refunded"
  createdAt: number;   // epoch ms
}

export interface ReportBranch {
  id: number;
  name: string;
}

/* ── Aggregated daily row ── */
export interface DailySummary {
  date: string;       // "YYYY-MM-DD"
  dateLabel: string;  // "21 Feb 2026"
  orders: number;
  gross: number;
  discounts: number;
  refunds: number;
  tax: number;
  serviceCharges: number;
  net: number;
  cash: number;
  card: number;
  online: number;
  credit: number;
}

/* ── Top-level KPIs ── */
export interface ReportKPIs {
  grossSales: number;
  netRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  cashAmount: number;
  cashCount: number;
  cardAmount: number;
  cardCount: number;
  onlineAmount: number;
  onlineCount: number;
  creditAmount: number;
  creditCount: number;
  taxCollected: number;
  discountsGiven: number;
  discountCount: number;
  refundsAmount: number;
  refundCount: number;
  serviceCharges: number;
}

export type SortField = "date" | "net";
export type SortDir = "asc" | "desc";
