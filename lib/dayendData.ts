"use client";

import type {
  DayEndSummary,
  DayEndStats,
  PaymentBreakdown,
  ExpenseEntry,
  TopSellingItem,
  HourlySales,
  DayEndRecord,
} from "@/types/dayend";

/**
 * Mock Day End data for UI.
 * Replace with API fetch when backend is ready.
 */
export const MOCK_DAY_END_SUMMARY: DayEndSummary = {
  branchId: 1,
  branchName: "Main Branch",
  businessDate: "2026-03-08",
  status: "open",
  openedBy: "Admin",
  openingTime: "09:00 AM",
};

export const MOCK_DAY_END_STATS: DayEndStats = {
  totalOrders: 124,
  totalRevenue: 145320,
  totalExpenses: 8700,
  netRevenue: 136620,
  averageOrderValue: 1171,
  cancelledOrders: 6,
};

export const MOCK_PAYMENT_BREAKDOWN: PaymentBreakdown[] = [
  { method: "Cash", amount: 85000, percentage: 58.5 },
  { method: "Card", amount: 40000, percentage: 27.5 },
  { method: "Online", amount: 20320, percentage: 14.0 },
];

export const MOCK_EXPENSE_ENTRIES: ExpenseEntry[] = [
  { id: "e1", title: "Supplies", category: "Supplies", amount: 2000, createdAt: "2026-03-08T10:30:00" },
  { id: "e2", title: "Equipment Repair", category: "Maintenance", amount: 5500, createdAt: "2026-03-08T14:00:00" },
  { id: "e3", title: "Electricity", category: "Utilities", amount: 1200, createdAt: "2026-03-08T09:00:00" },
];

export const MOCK_TOP_SELLING_ITEMS: TopSellingItem[] = [
  { name: "Chicken Tikka", quantity: 45, revenue: 38250 },
  { name: "Zinger Burger", quantity: 32, revenue: 17600 },
  { name: "Chicken Karahi", quantity: 20, revenue: 36000 },
  { name: "Chai Khas Special", quantity: 58, revenue: 11600 },
  { name: "Margherita Pizza", quantity: 18, revenue: 21600 },
];

export const MOCK_HOURLY_SALES: HourlySales[] = [
  { hour: "09:00", orders: 8, revenue: 9200 },
  { hour: "10:00", orders: 12, revenue: 14500 },
  { hour: "11:00", orders: 15, revenue: 18200 },
  { hour: "12:00", orders: 22, revenue: 26800 },
  { hour: "13:00", orders: 18, revenue: 22100 },
  { hour: "14:00", orders: 14, revenue: 16800 },
  { hour: "15:00", orders: 10, revenue: 11200 },
  { hour: "16:00", orders: 8, revenue: 9500 },
  { hour: "17:00", orders: 12, revenue: 14420 },
  { hour: "18:00", orders: 5, revenue: 6000 },
];

export const MOCK_DAY_END_HISTORY: DayEndRecord[] = [
  {
    id: "de1",
    date: "2026-03-07",
    branchName: "Main Branch",
    branchId: 1,
    totalSales: 142500,
    totalExpenses: 9200,
    netRevenue: 133300,
    status: "closed",
    closedBy: "Admin",
    closedAt: "2026-03-07T23:00:00",
  },
  {
    id: "de2",
    date: "2026-03-06",
    branchName: "Main Branch",
    branchId: 1,
    totalSales: 128900,
    totalExpenses: 7500,
    netRevenue: 121400,
    status: "closed",
    closedBy: "Manager",
    closedAt: "2026-03-06T22:45:00",
  },
  {
    id: "de3",
    date: "2026-03-07",
    branchName: "Super Branch",
    branchId: 2,
    totalSales: 98500,
    totalExpenses: 6200,
    netRevenue: 92300,
    status: "closed",
    closedBy: "Admin",
    closedAt: "2026-03-07T23:15:00",
  },
];

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
