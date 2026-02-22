"use client";

import type {
  MSBranch,
  MSMenuItem,
  MSOrderItem,
  ItemPerformance,
} from "@/types/menuSales";

/* ═══════════ Constants ═══════════ */

export const MS_BRANCHES: MSBranch[] = [
  { id: 1, name: "Main Branch" },
  { id: 2, name: "North Campus" },
  { id: 3, name: "Downtown" },
  { id: 4, name: "Gulberg Outlet" },
];

export const MS_CATEGORIES = [
  "BBQ",
  "Karahi",
  "Burgers",
  "Pizza",
  "Drinks",
  "Desserts",
  "Rice",
  "Sandwiches",
  "Starters",
  "Soups",
];

/* ═══════════ Helpers ═══════════ */

function uuid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}

/* ═══════════ Menu-item bank (60 items) ═══════════ */

const ITEM_DEFS: { name: string; category: string; price: number }[] = [
  // BBQ
  { name: "Chicken Tikka", category: "BBQ", price: 750 },
  { name: "Seekh Kabab", category: "BBQ", price: 450 },
  { name: "Malai Boti", category: "BBQ", price: 700 },
  { name: "Reshmi Kabab", category: "BBQ", price: 500 },
  { name: "BBQ Wings (6pc)", category: "BBQ", price: 650 },
  { name: "Chapli Kabab", category: "BBQ", price: 350 },
  { name: "Lamb Chops", category: "BBQ", price: 1200 },
  // Karahi
  { name: "Chicken Karahi", category: "Karahi", price: 1400 },
  { name: "Mutton Karahi", category: "Karahi", price: 1800 },
  { name: "Prawn Karahi", category: "Karahi", price: 2200 },
  { name: "Egg Karahi", category: "Karahi", price: 600 },
  // Burgers
  { name: "Zinger Burger", category: "Burgers", price: 550 },
  { name: "Chicken Burger", category: "Burgers", price: 400 },
  { name: "Beef Burger", category: "Burgers", price: 650 },
  { name: "Double Patty Burger", category: "Burgers", price: 800 },
  { name: "Veggie Burger", category: "Burgers", price: 350 },
  // Pizza
  { name: "Cheese Pizza (M)", category: "Pizza", price: 900 },
  { name: "Pepperoni Pizza (L)", category: "Pizza", price: 1400 },
  { name: "BBQ Chicken Pizza", category: "Pizza", price: 1200 },
  { name: "Margherita Pizza", category: "Pizza", price: 800 },
  { name: "Fajita Pizza (L)", category: "Pizza", price: 1350 },
  // Drinks
  { name: "Cold Coffee", category: "Drinks", price: 300 },
  { name: "Kashmiri Chai", category: "Drinks", price: 180 },
  { name: "Green Tea", category: "Drinks", price: 120 },
  { name: "Mint Lemonade", category: "Drinks", price: 200 },
  { name: "Lassi", category: "Drinks", price: 150 },
  { name: "Mango Shake", category: "Drinks", price: 280 },
  { name: "Fresh Juice", category: "Drinks", price: 250 },
  // Desserts
  { name: "Gulab Jamun (2pc)", category: "Desserts", price: 150 },
  { name: "Kheer", category: "Desserts", price: 200 },
  { name: "Brownie", category: "Desserts", price: 350 },
  { name: "Ice Cream Sundae", category: "Desserts", price: 400 },
  { name: "Ras Malai", category: "Desserts", price: 250 },
  // Rice
  { name: "Biryani (Full)", category: "Rice", price: 850 },
  { name: "Biryani (Half)", category: "Rice", price: 450 },
  { name: "Pulao", category: "Rice", price: 400 },
  { name: "Fried Rice", category: "Rice", price: 500 },
  { name: "Egg Fried Rice", category: "Rice", price: 550 },
  // Sandwiches
  { name: "Club Sandwich", category: "Sandwiches", price: 450 },
  { name: "Chicken Sandwich", category: "Sandwiches", price: 350 },
  { name: "Grilled Cheese", category: "Sandwiches", price: 300 },
  { name: "BLT Sandwich", category: "Sandwiches", price: 380 },
  // Starters
  { name: "French Fries", category: "Starters", price: 250 },
  { name: "Chicken Nuggets (8pc)", category: "Starters", price: 450 },
  { name: "Spring Rolls (4pc)", category: "Starters", price: 300 },
  { name: "Garlic Bread", category: "Starters", price: 200 },
  { name: "Loaded Fries", category: "Starters", price: 400 },
  { name: "Onion Rings", category: "Starters", price: 280 },
  // Soups
  { name: "Chicken Corn Soup", category: "Soups", price: 300 },
  { name: "Hot & Sour Soup", category: "Soups", price: 280 },
  { name: "Tomato Soup", category: "Soups", price: 200 },
  { name: "Mushroom Soup", category: "Soups", price: 250 },
];

/* ═══════════ Generate stable data ═══════════ */

let _items: MSMenuItem[] | null = null;
let _orderItems: MSOrderItem[] | null = null;

export function getMenuItems(): MSMenuItem[] {
  if (_items) return _items;
  _items = ITEM_DEFS.map((d, i) => ({
    id: `item-${i}`,
    name: d.name,
    category: d.category,
    price: d.price,
    isActive: i < 46, // ~46 active, rest inactive
  }));
  return _items;
}

export function getOrderItems(): MSOrderItem[] {
  if (_orderItems) return _orderItems;

  const items = getMenuItems();
  const now = Date.now();
  const result: MSOrderItem[] = [];

  // Generate ~400 order-item rows across 35 days
  for (let i = 0; i < 400; i++) {
    const item = pick(items.filter((it) => it.isActive));
    const branch = pick(MS_BRANCHES);
    const daysAgo = rnd(0, 35);
    const hoursAgo = rnd(0, 23);
    const minsAgo = rnd(0, 59);
    const createdAt = now - daysAgo * 86_400_000 - hoursAgo * 3_600_000 - minsAgo * 60_000;

    result.push({
      itemId: item.id,
      branchId: branch.id,
      qty: rnd(1, 5),
      price: item.price,
      createdAt,
    });
  }

  _orderItems = result;
  return result;
}

/* ═══════════ Aggregation ═══════════ */

interface AggregateOpts {
  branchId: number | "all";
  category: string | "all";
  dateFrom: number; // epoch start of day
  dateTo: number;   // epoch end of day
  search: string;
  activeOnly: boolean;
}

export function aggregateItemPerformance(opts: AggregateOpts): ItemPerformance[] {
  const items = getMenuItems();
  const orderItems = getOrderItems();

  // filter order items by date + branch
  let filtered = orderItems.filter(
    (oi) => oi.createdAt >= opts.dateFrom && oi.createdAt <= opts.dateTo
  );
  if (opts.branchId !== "all") {
    filtered = filtered.filter((oi) => oi.branchId === opts.branchId);
  }

  // Also gather "previous period" for trend calculation
  const rangeDuration = opts.dateTo - opts.dateFrom;
  const prevFrom = opts.dateFrom - rangeDuration;
  const prevTo = opts.dateFrom - 1;
  let prevFiltered = orderItems.filter(
    (oi) => oi.createdAt >= prevFrom && oi.createdAt <= prevTo
  );
  if (opts.branchId !== "all") {
    prevFiltered = prevFiltered.filter((oi) => oi.branchId === opts.branchId);
  }

  // Build current-period map
  const currentMap = new Map<string, { qty: number; revenue: number; byBranch: Map<number, { qty: number; revenue: number }> }>();
  for (const oi of filtered) {
    let entry = currentMap.get(oi.itemId);
    if (!entry) {
      entry = { qty: 0, revenue: 0, byBranch: new Map() };
      currentMap.set(oi.itemId, entry);
    }
    entry.qty += oi.qty;
    entry.revenue += oi.qty * oi.price;

    let br = entry.byBranch.get(oi.branchId);
    if (!br) {
      br = { qty: 0, revenue: 0 };
      entry.byBranch.set(oi.branchId, br);
    }
    br.qty += oi.qty;
    br.revenue += oi.qty * oi.price;
  }

  // Build previous-period map (for trend)
  const prevMap = new Map<string, number>(); // itemId → qty
  for (const oi of prevFiltered) {
    prevMap.set(oi.itemId, (prevMap.get(oi.itemId) || 0) + oi.qty);
  }

  // Build results
  const branchLookup = new Map(MS_BRANCHES.map((b) => [b.id, b.name]));
  const results: ItemPerformance[] = [];

  for (const item of items) {
    // active filter
    if (opts.activeOnly && !item.isActive) continue;
    // category filter
    if (opts.category !== "all" && item.category !== opts.category) continue;
    // search filter
    if (opts.search) {
      const q = opts.search.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q))
        continue;
    }

    const cur = currentMap.get(item.id);
    const soldQty = cur?.qty ?? 0;
    const revenue = cur?.revenue ?? 0;
    const prevQty = prevMap.get(item.id) ?? 0;

    // trend: % change
    let trendPct = 0;
    if (prevQty > 0) {
      trendPct = Math.round(((soldQty - prevQty) / prevQty) * 100);
    } else if (soldQty > 0) {
      trendPct = 100; // new
    }

    const branchBreakdown: ItemPerformance["branchBreakdown"] = [];
    if (cur) {
      for (const [bid, bd] of cur.byBranch) {
        branchBreakdown.push({
          branchId: bid,
          branchName: branchLookup.get(bid) ?? "Unknown",
          qty: bd.qty,
          revenue: bd.revenue,
        });
      }
      branchBreakdown.sort((a, b) => b.qty - a.qty);
    }

    results.push({
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      soldQty,
      revenue,
      avgPrice: soldQty > 0 ? Math.round(revenue / soldQty) : item.price,
      branchBreakdown,
      trendPct,
      isActive: item.isActive,
    });
  }

  return results;
}
