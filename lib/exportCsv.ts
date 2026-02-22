"use client";

import type { SaleOrder } from "@/types/salesList";

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("en-PK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function downloadCsv(orders: SaleOrder[], filename = "sales-list.csv") {
  const header = [
    "Order ID",
    "Branch",
    "Date/Time",
    "Type",
    "Table",
    "Payment",
    "Subtotal",
    "Discount",
    "Service Charge",
    "Total",
    "Status",
    "Paid",
    "Items",
  ];

  const rows = orders.map((o) => [
    escapeCsv(o.orderNo),
    escapeCsv(o.branchName),
    escapeCsv(fmtDate(o.createdAt)),
    escapeCsv(o.type),
    escapeCsv(o.table ?? "—"),
    escapeCsv(o.paymentMethod),
    String(o.subtotal),
    String(o.discount),
    String(o.serviceCharge),
    String(o.total),
    escapeCsv(o.status),
    o.paid ? "Yes" : "No",
    escapeCsv(o.items.map((it) => `${it.name} x${it.qty}`).join("; ")),
  ]);

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
