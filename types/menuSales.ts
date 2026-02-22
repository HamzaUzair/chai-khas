/* ── Menu Sales / Item Performance types ── */

export type MSTimeRange = "today" | "this_week" | "this_month" | "custom";

export interface MSBranch {
  id: number;
  name: string;
}

export interface MSMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  isActive: boolean;
}

/** A single line-item inside a mock order */
export interface MSOrderItem {
  itemId: string;
  branchId: number;
  qty: number;
  price: number; // unit price at time of order
  createdAt: number; // epoch ms
}

/* ── Aggregated row for the table ── */
export interface ItemPerformance {
  itemId: string;
  itemName: string;
  category: string;
  soldQty: number;
  revenue: number;
  avgPrice: number;
  branchBreakdown: { branchId: number; branchName: string; qty: number; revenue: number }[];
  /** % change vs previous equal-length period (mock) */
  trendPct: number;
  isActive: boolean;
}

export type MSSortField = "soldQty" | "revenue";
export type MSSortDir = "asc" | "desc";
