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
  /**
   * Real kitchen timing stamped by the backend when an order moves to
   * "Running" / "Served". Null while the order is still Pending (no chef
   * has picked it up yet). All values are epoch milliseconds.
   */
  kitchenStartedAt?: number | null;
  kitchenServedAt?: number | null;
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
