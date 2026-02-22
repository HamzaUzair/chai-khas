"use client";

import type { DailySummary, ReportKPIs } from "@/types/salesReport";

function fmtPkr(n: number) {
  return n.toLocaleString("en-PK");
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function downloadReportCsv(
  kpis: ReportKPIs,
  rows: DailySummary[],
  filename = "sales-report.csv"
) {
  const lines: string[] = [];

  // ── KPI summary block ──
  lines.push("=== SALES REPORT - FINANCIAL SUMMARY ===");
  lines.push("");
  lines.push(`Gross Sales,PKR ${fmtPkr(kpis.grossSales)}`);
  lines.push(`Net Revenue,PKR ${fmtPkr(kpis.netRevenue)}`);
  lines.push(`Total Orders,${kpis.totalOrders}`);
  lines.push(`Avg Order Value,PKR ${fmtPkr(kpis.avgOrderValue)}`);
  lines.push(`Cash,PKR ${fmtPkr(kpis.cashAmount)} (${kpis.cashCount})`);
  lines.push(`Card,PKR ${fmtPkr(kpis.cardAmount)} (${kpis.cardCount})`);
  lines.push(`Online,PKR ${fmtPkr(kpis.onlineAmount)} (${kpis.onlineCount})`);
  lines.push(`Credit,PKR ${fmtPkr(kpis.creditAmount)} (${kpis.creditCount})`);
  lines.push(`Tax Collected,PKR ${fmtPkr(kpis.taxCollected)}`);
  lines.push(`Discounts Given,PKR ${fmtPkr(kpis.discountsGiven)} (${kpis.discountCount})`);
  lines.push(`Refunds,PKR ${fmtPkr(kpis.refundsAmount)} (${kpis.refundCount})`);
  lines.push(`Service Charges,PKR ${fmtPkr(kpis.serviceCharges)}`);
  lines.push("");

  // ── Daily summary table ──
  lines.push("=== DAILY BREAKDOWN ===");
  const header = [
    "Date",
    "Orders",
    "Gross Sales",
    "Discounts",
    "Refunds",
    "Tax",
    "Net Revenue",
    "Cash",
    "Card",
    "Online",
    "Credit",
  ];
  lines.push(header.join(","));

  for (const r of rows) {
    lines.push(
      [
        escapeCsv(r.dateLabel),
        String(r.orders),
        String(r.gross),
        String(r.discounts),
        String(r.refunds),
        String(r.tax),
        String(r.net),
        String(r.cash),
        String(r.card),
        String(r.online),
        String(r.credit),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
