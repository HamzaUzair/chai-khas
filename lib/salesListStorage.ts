"use client";

import type {
  SaleOrder,
  SaleItem,
  SaleStatus,
  PaymentMethod,
  OrderType,
  SaleBranch,
} from "@/types/salesList";

/* ═══════════ Helpers ═══════════ */

function uuid(): string {
  return crypto.randomUUID();
}
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}

/* ═══════════ Item bank ═══════════ */

const ITEM_BANK: { name: string; price: number }[] = [
  { name: "Chicken Tikka", price: 750 },
  { name: "Seekh Kabab", price: 450 },
  { name: "Mutton Karahi", price: 1800 },
  { name: "Chicken Karahi", price: 1400 },
  { name: "Biryani (Full)", price: 850 },
  { name: "Biryani (Half)", price: 450 },
  { name: "Naan", price: 50 },
  { name: "Raita", price: 120 },
  { name: "Pulao", price: 400 },
  { name: "Zinger Burger", price: 550 },
  { name: "Chicken Burger", price: 400 },
  { name: "Cheese Pizza (M)", price: 900 },
  { name: "Pepperoni Pizza (L)", price: 1400 },
  { name: "BBQ Wings (6pc)", price: 650 },
  { name: "Malai Boti", price: 700 },
  { name: "Reshmi Kabab", price: 500 },
  { name: "Chapli Kabab", price: 350 },
  { name: "Daal Mash", price: 250 },
  { name: "Chicken Sandwich", price: 350 },
  { name: "Club Sandwich", price: 450 },
  { name: "Cold Coffee", price: 300 },
  { name: "Kashmiri Chai", price: 180 },
  { name: "Green Tea", price: 120 },
  { name: "Mint Lemonade", price: 200 },
  { name: "Gulab Jamun (2pc)", price: 150 },
  { name: "Kheer", price: 200 },
  { name: "Brownie", price: 350 },
  { name: "French Fries", price: 250 },
  { name: "Chicken Soup", price: 300 },
  { name: "Lassi", price: 150 },
];

function randomItems(): SaleItem[] {
  const count = rnd(1, 6);
  const chosen = new Set<number>();
  while (chosen.size < count) chosen.add(rnd(0, ITEM_BANK.length - 1));
  return [...chosen].map((idx) => ({
    id: uuid(),
    name: ITEM_BANK[idx].name,
    qty: rnd(1, 4),
    price: ITEM_BANK[idx].price,
  }));
}

/* ═══════════ Generate mock orders ═══════════ */

const STATUSES: SaleStatus[] = [
  "Pending",
  "Running",
  "Bill Generated",
  "Complete",
  "Cancelled",
  "Credit",
];
const PAYMENTS: PaymentMethod[] = ["Cash", "Card", "Online", "Credit"];
const TYPES: OrderType[] = ["Dine In", "Take Away", "Delivery"];

/**
 * Generate mock sale orders.
 * Branches MUST come from the real API; if empty, returns [].
 */
export function generateSalesData(branches: SaleBranch[]): SaleOrder[] {
  if (branches.length === 0) return [];

  const now = Date.now();
  const orders: SaleOrder[] = [];

  for (let i = 0; i < 50; i++) {
    const branch = pick(branches);
    const type = pick(TYPES);
    const status = pick(STATUSES);
    const paymentMethod = pick(PAYMENTS);
    const items = randomItems();
    const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
    const discount = rnd(0, 3) === 0 ? rnd(50, 300) : 0;
    const serviceCharge = rnd(0, 2) === 0 ? rnd(50, 200) : 0;
    const total = subtotal - discount + serviceCharge;
    const paid = status === "Complete" || status === "Bill Generated";
    // spread orders across last 14 days + a few today
    const daysAgo = i < 8 ? 0 : i < 15 ? 1 : rnd(2, 14);
    const hoursAgo = rnd(0, 23);
    const minsAgo = rnd(0, 59);
    const createdAt =
      now -
      daysAgo * 86_400_000 -
      hoursAgo * 3_600_000 -
      minsAgo * 60_000;

    orders.push({
      id: uuid(),
      orderNo: `ORD-${String(4900 + i).padStart(4, "0")}`,
      branchId: branch.id,
      branchName: branch.name,
      type,
      table: type === "Dine In" ? `T-${rnd(1, 20)}` : undefined,
      subtotal,
      discount,
      serviceCharge,
      total,
      status,
      paymentMethod,
      paid,
      createdAt,
      items,
    });
  }

  return orders.sort((a, b) => b.createdAt - a.createdAt);
}
