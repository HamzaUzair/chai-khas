/**
 * Reusable constants for Printers module.
 * Single source of truth for dropdowns and labels.
 */

import type { PrinterType, ConnectionType, PrinterPurpose } from "@/types/printer";

export const PRINTER_TYPES: { value: PrinterType; label: string }[] = [
  { value: "receipt", label: "Receipt Printer" },
  { value: "kitchen", label: "Kitchen Printer" },
  { value: "bar", label: "Bar Printer" },
  { value: "invoice", label: "Invoice Printer" },
  { value: "token", label: "Token Printer" },
  { value: "refund", label: "Refund Printer" },
];

export const CONNECTION_TYPES: { value: ConnectionType; label: string }[] = [
  { value: "usb", label: "USB" },
  { value: "network", label: "Network" },
  { value: "bluetooth", label: "Bluetooth" },
];

export const PAPER_SIZES = ["58mm", "80mm", "A4"] as const;

export const ASSIGNED_AREAS = [
  "Cash Counter",
  "Main Kitchen",
  "BBQ Station",
  "Drinks Station",
  "Front Desk",
  "Bar",
  "Takeaway Counter",
  "Drive-Thru",
] as const;

export const PRINTER_PURPOSES: { value: PrinterPurpose; label: string }[] = [
  { value: "receipts", label: "Receipts" },
  { value: "kitchen_orders", label: "Kitchen Orders" },
  { value: "drinks_orders", label: "Drinks Orders" },
  { value: "invoices", label: "Invoices" },
  { value: "tokens", label: "Tokens" },
  { value: "refunds", label: "Refunds" },
];

export function getPrinterTypeLabel(type: PrinterType): string {
  return PRINTER_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getConnectionTypeLabel(conn: ConnectionType): string {
  return CONNECTION_TYPES.find((c) => c.value === conn)?.label ?? conn;
}

export function getPurposeLabel(purpose: PrinterPurpose): string {
  return PRINTER_PURPOSES.find((p) => p.value === purpose)?.label ?? purpose;
}
