"use client";

import type {
  Order,
  OrderType,
  OrderStatus,
  PaymentMode,
  OrderItem,
} from "@/types/order";

const STORAGE_KEY = "pos_orders";

/* ══════════════ Read / Write ══════════════ */

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function setOrders(data: Order[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ══════════════ Demo Data ══════════════ */

interface BranchInfo {
  branchId: number;
  branchName: string;
}

const DEMO_ITEMS: { name: string; price: number }[] = [
  { name: "Chicken Tikka", price: 850 },
  { name: "Seekh Kabab", price: 650 },
  { name: "Chicken Karahi", price: 1749 },
  { name: "Mutton Karahi", price: 2800 },
  { name: "Chicken Biryani", price: 600 },
  { name: "Classic Burger", price: 550 },
  { name: "Zinger Burger", price: 700 },
  { name: "Margherita Pizza", price: 1200 },
  { name: "Pepperoni Pizza", price: 1499 },
  { name: "Club Sandwich", price: 550 },
  { name: "Cold Coffee", price: 400 },
  { name: "Chai Khas Special", price: 199 },
  { name: "Gulab Jamun", price: 350 },
  { name: "Naan", price: 50 },
  { name: "Raita", price: 120 },
  { name: "Mineral Water", price: 80 },
  { name: "Soft Drink", price: 150 },
  { name: "Malai Boti", price: 1449 },
  { name: "BBQ Platter", price: 2500 },
  { name: "Grilled Sandwich", price: 600 },
];

const TYPES: OrderType[] = ["Dine In", "Take Away", "Delivery"];
const STATUSES: OrderStatus[] = [
  "Pending",
  "Running",
  "Bill Generated",
  "Credit",
  "Complete",
  "Cancelled",
];
const PAYMENTS: PaymentMode[] = ["Cash", "Card", "Online", "Credit"];
const TABLES = ["T-1", "T-2", "T-3", "T-4", "T-5", "T-6", "T-7", "T-8"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOrderNo(index: number): string {
  return `ORD-${(4900 + index).toString()}`;
}

export function generateDemoOrders(branches: BranchInfo[]): Order[] {
  const orders: Order[] = [];
  const now = Date.now();
  const count = randInt(18, 25);

  for (let i = 0; i < count; i++) {
    const branch = pick(branches);
    const type = pick(TYPES);
    const status = pick(STATUSES);

    // Generate 2-6 items
    const itemCount = randInt(2, 6);
    const selectedItems: Set<number> = new Set();
    while (selectedItems.size < itemCount) {
      selectedItems.add(randInt(0, DEMO_ITEMS.length - 1));
    }
    const items: OrderItem[] = Array.from(selectedItems).map((idx) => {
      const demo = DEMO_ITEMS[idx];
      return {
        id: crypto.randomUUID(),
        name: demo.name,
        qty: randInt(1, 3),
        price: demo.price,
      };
    });

    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = Math.random() > 0.6 ? Math.round(subtotal * (randInt(5, 35) / 100)) : 0;
    const serviceCharge = Math.random() > 0.7 ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal - discount + serviceCharge;

    const isPaid =
      status === "Complete" || (status === "Bill Generated" && Math.random() > 0.5);

    const payment: PaymentMode =
      status === "Credit" ? "Credit" : pick(PAYMENTS.filter((p) => p !== "Credit"));

    orders.push({
      id: crypto.randomUUID(),
      orderNo: generateOrderNo(count - i),
      branchId: branch.branchId,
      branchName: branch.branchName,
      type,
      table: type === "Dine In" ? pick(TABLES) : undefined,
      total,
      status,
      paymentMode: payment,
      createdAt: now - i * randInt(600_000, 3_600_000),
      items,
      discount,
      serviceCharge,
      paid: isPaid,
    });
  }

  // Sort newest first
  orders.sort((a, b) => b.createdAt - a.createdAt);
  return orders;
}
