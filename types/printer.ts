/* ── Printers Management types (POS printing configuration) ── */

export type PrinterType =
  | "receipt"
  | "kitchen"
  | "bar"
  | "invoice"
  | "token"
  | "refund";

export type ConnectionType = "usb" | "network" | "bluetooth";

export type PrinterStatus = "active" | "inactive" | "offline";

export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  branchId: number;
  branchName: string;
  assignedArea: string;
  connectionType: ConnectionType;
  ipAddress?: string;
  port?: number;
  usbPort?: string;
  paperSize: string;
  status: PrinterStatus;
  /** What this printer is assigned to print */
  assignedPurposes: PrinterPurpose[];
  /** Auto-print options */
  autoPrintReceipts: boolean;
  autoPrintKitchenTickets: boolean;
  autoPrintInvoices: boolean;
}

export type PrinterPurpose =
  | "receipts"
  | "kitchen_orders"
  | "drinks_orders"
  | "invoices"
  | "tokens"
  | "refunds";

export interface PrinterFormData {
  name: string;
  type: PrinterType;
  branchId: number | "";
  assignedArea: string;
  connectionType: ConnectionType;
  ipAddress: string;
  port: string;
  usbPort: string;
  paperSize: string;
  status: PrinterStatus;
  autoPrintReceipts: boolean;
  autoPrintKitchenTickets: boolean;
  autoPrintInvoices: boolean;
}
