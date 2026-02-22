"use client";

/* ══════════════════════════════════════════════════════════════
   Analytics Service — mock data generators.
   Structured so each function can be swapped with a real API later.
   ══════════════════════════════════════════════════════════════ */

export type DateRange = "today" | "7days" | "30days" | "custom";

/* ── helpers ── */
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function fmtDay(d: Date) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

/* ── branch info from localStorage ── */
interface BranchInfo { branchId: number; branchName: string; status: string }

export function getStoredBranches(): BranchInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("pos_branches") || "[]";
    const list = JSON.parse(raw) as { branch_id: number; branch_name: string; status: string }[];
    // Might be stored via API format
    if (list.length) return list.map(b => ({ branchId: b.branch_id, branchName: b.branch_name, status: b.status }));
  } catch { /* ignore */ }
  return [];
}

/* ══════════════ KPIs ══════════════ */
export interface KpiData {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  bestSellingItem: string;
  activeBranches: number;
}

export function getKpis(_branchId: number | "all", _range: DateRange): KpiData {
  const bestItems = ["Chicken Karahi", "Seekh Kabab", "Biryani", "Zinger Burger", "Chai Khas Special"];
  const totalOrders = rand(120, 580);
  const totalSales = rand(85000, 420000);
  return {
    totalSales,
    totalOrders,
    avgOrderValue: Math.round(totalSales / totalOrders),
    bestSellingItem: pick(bestItems),
    activeBranches: rand(1, 5),
  };
}

/* ══════════════ Revenue Trend ══════════════ */
export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export function getRevenueTrend(_branchId: number | "all", range: DateRange): RevenueTrendPoint[] {
  const days = range === "today" ? 1 : range === "7days" ? 7 : 30;
  const points: RevenueTrendPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    points.push({
      date: days === 1 ? "Today" : fmtDay(d),
      revenue: rand(15000, 85000),
      orders: rand(8, 60),
    });
  }
  return points;
}

/* ══════════════ Weekly Performance ══════════════ */
export interface WeeklyPoint {
  day: string;
  sales: number;
}

export function getWeeklyPerformance(_branchId: number | "all", _range: DateRange): WeeklyPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({ day, sales: rand(20000, 95000) }));
}

/* ══════════════ Branch Comparison ══════════════ */
export interface BranchCompRow {
  branchId: number;
  branchName: string;
  totalSales: number;
  orders: number;
  avgOrderValue: number;
  active: boolean;
}

export function getBranchComparison(_range: DateRange): BranchCompRow[] {
  // try real branches from localStorage
  let branches: BranchInfo[] = [];
  if (typeof window !== "undefined") {
    // from API-stored branches
    try {
      const raw = localStorage.getItem("pos_branches");
      if (raw) {
        branches = (JSON.parse(raw) as { branch_id: number; branch_name: string; status: string }[])
          .map(b => ({ branchId: b.branch_id, branchName: b.branch_name, status: b.status }));
      }
    } catch { /* ignore */ }
  }

  // fallback if empty
  if (branches.length === 0) {
    branches = [
      { branchId: 1, branchName: "Main Branch", status: "Active" },
      { branchId: 2, branchName: "North Campus", status: "Active" },
      { branchId: 3, branchName: "Downtown", status: "Inactive" },
    ];
  }

  return branches.map(b => {
    const orders = rand(40, 300);
    const totalSales = rand(50000, 350000);
    return {
      branchId: b.branchId,
      branchName: b.branchName,
      totalSales,
      orders,
      avgOrderValue: Math.round(totalSales / orders),
      active: b.status === "Active",
    };
  });
}

/* ══════════════ Best Sellers ══════════════ */
export interface BestSellerRow {
  name: string;
  category: string;
  qtySold: number;
  revenue: number;
}

export function getBestSellers(_branchId: number | "all", _range: DateRange): BestSellerRow[] {
  const items = [
    { name: "Chicken Karahi", category: "Karahi" },
    { name: "Seekh Kabab", category: "BBQ" },
    { name: "Chicken Biryani", category: "Rice" },
    { name: "Zinger Burger", category: "Burgers" },
    { name: "Chai Khas Special", category: "Drinks" },
    { name: "Pepperoni Pizza", category: "Pizza" },
    { name: "Malai Boti", category: "BBQ" },
    { name: "Club Sandwich", category: "Sandwiches" },
  ];
  return items
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((item, idx) => {
      const qty = rand(30, 200) - idx * 15;
      const price = rand(400, 2500);
      return { ...item, qtySold: Math.max(qty, 10), revenue: Math.max(qty, 10) * price };
    })
    .sort((a, b) => b.qtySold - a.qtySold);
}

/* ══════════════ Peak Hours ══════════════ */
export interface PeakHourPoint {
  hour: string;
  orders: number;
  label: string; // "Morning" | "Afternoon" | "Evening" | "Night"
}

export function getPeakHours(_branchId: number | "all", _range: DateRange): PeakHourPoint[] {
  const hours: PeakHourPoint[] = [];
  for (let h = 10; h <= 23; h++) {
    const ampm = h > 12 ? `${h - 12} PM` : h === 12 ? "12 PM" : `${h} AM`;
    let segment: string;
    if (h < 12) segment = "Morning";
    else if (h < 17) segment = "Afternoon";
    else if (h < 21) segment = "Evening";
    else segment = "Night";
    // Lunch & dinner peaks
    const isPeak = (h >= 12 && h <= 14) || (h >= 19 && h <= 21);
    hours.push({
      hour: ampm,
      orders: isPeak ? rand(25, 55) : rand(3, 20),
      label: segment,
    });
  }
  return hours;
}
