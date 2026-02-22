"use client";

import type {
  ReportOrder,
  ReportBranch,
  ReportPaymentMethod,
  ReportOrderStatus,
  DailySummary,
  ReportKPIs,
} from "@/types/salesReport";

/* ═══════════ Helpers ═══════════ */

function uuid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}

const PAYMENTS: ReportPaymentMethod[] = ["Cash", "Card", "Online", "Credit"];
const TAX_RATE = 0.05; // 5 %

/* ═══════════ Generate 350 mock orders ═══════════ */

/**
 * Generate mock report orders.
 * Branches MUST come from the real API; if empty, returns [].
 */
export function generateReportOrders(branches: ReportBranch[]): ReportOrder[] {
  if (branches.length === 0) return [];

  const now = Date.now();
  const orders: ReportOrder[] = [];

  for (let i = 0; i < 350; i++) {
    const branch = pick(branches);
    const paymentMethod = pick(PAYMENTS);

    // ~75% complete, ~15% cancelled, ~10% refunded
    const roll = rnd(1, 100);
    let status: ReportOrderStatus = "Complete";
    if (roll > 90) status = "Refunded";
    else if (roll > 75) status = "Cancelled";

    const subtotal = rnd(200, 4500);
    const hasDiscount = rnd(1, 4) === 1; // 25 %
    const discount = hasDiscount ? rnd(50, Math.min(500, Math.floor(subtotal * 0.2))) : 0;
    const tax = Math.round((subtotal - discount) * TAX_RATE);
    const serviceCharge = rnd(1, 5) === 1 ? rnd(50, 200) : 0;
    const total = subtotal - discount + tax + serviceCharge;
    const refundAmount = status === "Refunded" ? total : 0;

    // spread across last 35 days
    const daysAgo = i < 30 ? 0 : i < 60 ? 1 : i < 90 ? rnd(2, 6) : rnd(0, 35);
    const hoursAgo = rnd(0, 23);
    const minsAgo = rnd(0, 59);
    const createdAt =
      now - daysAgo * 86_400_000 - hoursAgo * 3_600_000 - minsAgo * 60_000;

    orders.push({
      id: uuid(),
      orderNo: `ORD-${String(5000 + i).padStart(4, "0")}`,
      branchId: branch.id,
      branchName: branch.name,
      status,
      paymentMethod,
      subtotal,
      discount,
      tax,
      serviceCharge,
      total,
      refundAmount,
      createdAt,
    });
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

/* ═══════════ Aggregation helpers ═══════════ */

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

function toDateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toDateLabel(key: string): string {
  const [y, m, d] = key.split("-");
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** Compute KPIs from a filtered list of orders. */
export function computeKPIs(orders: ReportOrder[]): ReportKPIs {
  let grossSales = 0;
  let totalDiscounts = 0;
  let discountCount = 0;
  let totalRefunds = 0;
  let refundCount = 0;
  let totalTax = 0;
  let totalService = 0;
  let cashAmt = 0, cashCnt = 0;
  let cardAmt = 0, cardCnt = 0;
  let onlineAmt = 0, onlineCnt = 0;
  let creditAmt = 0, creditCnt = 0;

  for (const o of orders) {
    // cancelled orders don't count as revenue
    if (o.status === "Cancelled") continue;

    grossSales += o.total;
    totalTax += o.tax;
    totalService += o.serviceCharge;

    if (o.discount > 0) {
      totalDiscounts += o.discount;
      discountCount++;
    }

    if (o.status === "Refunded") {
      totalRefunds += o.refundAmount;
      refundCount++;
    }

    switch (o.paymentMethod) {
      case "Cash":   cashAmt += o.total; cashCnt++; break;
      case "Card":   cardAmt += o.total; cardCnt++; break;
      case "Online": onlineAmt += o.total; onlineCnt++; break;
      case "Credit": creditAmt += o.total; creditCnt++; break;
    }
  }

  const nonCancelledCount = orders.filter((o) => o.status !== "Cancelled").length;

  return {
    grossSales,
    netRevenue: grossSales - totalDiscounts - totalRefunds,
    totalOrders: nonCancelledCount,
    avgOrderValue: nonCancelledCount > 0 ? Math.round(grossSales / nonCancelledCount) : 0,
    cashAmount: cashAmt,
    cashCount: cashCnt,
    cardAmount: cardAmt,
    cardCount: cardCnt,
    onlineAmount: onlineAmt,
    onlineCount: onlineCnt,
    creditAmount: creditAmt,
    creditCount: creditCnt,
    taxCollected: totalTax,
    discountsGiven: totalDiscounts,
    discountCount,
    refundsAmount: totalRefunds,
    refundCount,
    serviceCharges: totalService,
  };
}

/** Build daily summary rows from a filtered list of orders. */
export function buildDailySummary(orders: ReportOrder[]): DailySummary[] {
  const map = new Map<string, DailySummary>();

  for (const o of orders) {
    if (o.status === "Cancelled") continue;

    const key = toDateKey(o.createdAt);
    let row = map.get(key);
    if (!row) {
      row = {
        date: key,
        dateLabel: toDateLabel(key),
        orders: 0,
        gross: 0,
        discounts: 0,
        refunds: 0,
        tax: 0,
        serviceCharges: 0,
        net: 0,
        cash: 0,
        card: 0,
        online: 0,
        credit: 0,
      };
      map.set(key, row);
    }

    row.orders++;
    row.gross += o.total;
    row.discounts += o.discount;
    row.refunds += o.refundAmount;
    row.tax += o.tax;
    row.serviceCharges += o.serviceCharge;

    switch (o.paymentMethod) {
      case "Cash":   row.cash += o.total; break;
      case "Card":   row.card += o.total; break;
      case "Online": row.online += o.total; break;
      case "Credit": row.credit += o.total; break;
    }
  }

  // compute net
  for (const row of map.values()) {
    row.net = row.gross - row.discounts - row.refunds;
  }

  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}
