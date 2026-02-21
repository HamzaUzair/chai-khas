"use client";

import type { ItemPerformance } from "@/types/menuSales";

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function downloadMenuSalesCsv(
  rows: ItemPerformance[],
  filename = "menu-sales.csv"
) {
  const header = [
    "Item",
    "Category",
    "Sold Qty",
    "Revenue (PKR)",
    "Avg Price (PKR)",
    "Trend %",
    "Active",
    "Branches",
  ];

  const csvRows = rows.map((r) => [
    escapeCsv(r.itemName),
    escapeCsv(r.category),
    String(r.soldQty),
    String(r.revenue),
    String(r.avgPrice),
    String(r.trendPct),
    r.isActive ? "Yes" : "No",
    escapeCsv(
      r.branchBreakdown.map((b) => `${b.branchName}:${b.qty}`).join("; ")
    ),
  ]);

  const csv = [
    header.join(","),
    ...csvRows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
