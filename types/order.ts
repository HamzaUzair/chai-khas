/* ── Orders Management types ── */

export type OrderType = "Dine In" | "Take Away" | "Delivery";

export type OrderStatus =
  | "Pending"
  | "Running"
  | "Bill Generated"
  | "Credit"
  | "Complete"
  | "Cancelled";

export type PaymentMode = "Cash" | "Card" | "Online" | "Credit";

export interface OrderItem {
  id: string;
  name: string;
  variationName?: string | null;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  orderNo: string;
  branchId: number;
  branchName: string;
  type: OrderType;
  hall?: string;
  table?: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  paymentMode: PaymentMode;
  createdAt: number;
  items: OrderItem[];
  discount: number;
  serviceCharge: number;
  paid: boolean;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Running",
  "Bill Generated",
  "Credit",
  "Complete",
  "Cancelled",
];
