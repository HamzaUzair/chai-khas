/* ── Orders Management types ── */

export type OrderType = "Dine In" | "Take Away" | "Delivery";

export type OrderStatus =
  | "Pending"
  | "Running"
  | "Served"
  | "Paid"
  | "Credit"
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
  discountType?: "Fixed Amount" | "Percentage" | null;
  discountValue?: number;
  discountReason?: string | null;
  subtotal?: number;
  serviceChargePercent?: number;
  gstPercent?: number;
  gstAmount?: number;
  serviceCharge: number;
  paid: boolean;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Running",
  "Served",
  "Paid",
  "Credit",
  "Cancelled",
];
