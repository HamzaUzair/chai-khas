"use client";

import type {
  InventoryItem,
  InventoryActivity,
  InvBranch,
  InvCategory,
  InvUnit,
  MenuItemRecipe,
} from "@/types/inventory";

/* ═══════ localStorage keys ═══════ */
const LS_ITEMS = "pos_inventory_items";
const LS_LOG = "pos_inventory_log";

/* ═══════ Helpers ═══════ */
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}
let _ctr = 0;
function uid() {
  _ctr += 1;
  return `inv_${Date.now()}_${_ctr}_${rnd(1000, 9999)}`;
}

/* ═══════ CRUD wrappers ═══════ */
export function loadItems(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_ITEMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function saveItems(items: InventoryItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_ITEMS, JSON.stringify(items));
}

export function loadLog(): InventoryActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_LOG);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
export function saveLog(log: InventoryActivity[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_LOG, JSON.stringify(log));
}

/* ═══════ Mock inventory templates ═══════ */
interface Template {
  name: string;
  category: InvCategory;
  unit: InvUnit;
  costRange: [number, number];
  stockRange: [number, number];
  minStock: number;
}

const TEMPLATES: Template[] = [
  { name: "Chicken", category: "Meat", unit: "kg", costRange: [400, 700], stockRange: [10, 80], minStock: 10 },
  { name: "Mutton", category: "Meat", unit: "kg", costRange: [1200, 1800], stockRange: [5, 40], minStock: 5 },
  { name: "Beef", category: "Meat", unit: "kg", costRange: [800, 1200], stockRange: [8, 50], minStock: 8 },
  { name: "Fish (Tilapia)", category: "Meat", unit: "kg", costRange: [500, 900], stockRange: [5, 30], minStock: 5 },
  { name: "Prawns", category: "Meat", unit: "kg", costRange: [1500, 2500], stockRange: [2, 15], minStock: 3 },
  { name: "Onions", category: "Veg", unit: "kg", costRange: [80, 200], stockRange: [20, 100], minStock: 15 },
  { name: "Tomatoes", category: "Veg", unit: "kg", costRange: [60, 180], stockRange: [15, 80], minStock: 10 },
  { name: "Potatoes", category: "Veg", unit: "kg", costRange: [50, 120], stockRange: [20, 100], minStock: 15 },
  { name: "Capsicum", category: "Veg", unit: "kg", costRange: [150, 350], stockRange: [5, 25], minStock: 5 },
  { name: "Ginger", category: "Veg", unit: "kg", costRange: [300, 600], stockRange: [3, 15], minStock: 3 },
  { name: "Garlic", category: "Veg", unit: "kg", costRange: [250, 500], stockRange: [3, 15], minStock: 3 },
  { name: "Lettuce", category: "Veg", unit: "kg", costRange: [100, 250], stockRange: [5, 20], minStock: 5 },
  { name: "Milk", category: "Dairy", unit: "L", costRange: [150, 280], stockRange: [10, 60], minStock: 10 },
  { name: "Cheese", category: "Dairy", unit: "kg", costRange: [800, 1400], stockRange: [3, 20], minStock: 3 },
  { name: "Butter", category: "Dairy", unit: "kg", costRange: [600, 1100], stockRange: [3, 15], minStock: 3 },
  { name: "Yogurt", category: "Dairy", unit: "kg", costRange: [120, 250], stockRange: [5, 30], minStock: 5 },
  { name: "Cream", category: "Dairy", unit: "L", costRange: [300, 600], stockRange: [3, 15], minStock: 3 },
  { name: "Red Chili Powder", category: "Spices", unit: "kg", costRange: [400, 900], stockRange: [2, 15], minStock: 2 },
  { name: "Turmeric", category: "Spices", unit: "kg", costRange: [300, 700], stockRange: [2, 10], minStock: 2 },
  { name: "Cumin Seeds", category: "Spices", unit: "kg", costRange: [500, 1000], stockRange: [1, 8], minStock: 1 },
  { name: "Coriander Powder", category: "Spices", unit: "kg", costRange: [350, 750], stockRange: [2, 10], minStock: 2 },
  { name: "Garam Masala", category: "Spices", unit: "kg", costRange: [600, 1200], stockRange: [1, 8], minStock: 1 },
  { name: "Black Pepper", category: "Spices", unit: "kg", costRange: [800, 1500], stockRange: [1, 5], minStock: 1 },
  { name: "Salt", category: "Spices", unit: "kg", costRange: [30, 80], stockRange: [10, 50], minStock: 10 },
  { name: "Cooking Oil", category: "Other", unit: "L", costRange: [350, 600], stockRange: [10, 60], minStock: 10 },
  { name: "Rice (Basmati)", category: "Other", unit: "kg", costRange: [200, 400], stockRange: [20, 100], minStock: 15 },
  { name: "Flour (Atta)", category: "Other", unit: "kg", costRange: [80, 180], stockRange: [20, 80], minStock: 15 },
  { name: "Sugar", category: "Other", unit: "kg", costRange: [100, 200], stockRange: [10, 50], minStock: 10 },
  { name: "Pepsi 1.5L", category: "Drinks", unit: "pcs", costRange: [100, 160], stockRange: [10, 80], minStock: 10 },
  { name: "Mineral Water 500ml", category: "Drinks", unit: "pcs", costRange: [25, 50], stockRange: [20, 150], minStock: 20 },
  { name: "Fresh Juice Mix", category: "Drinks", unit: "L", costRange: [200, 450], stockRange: [5, 25], minStock: 5 },
  { name: "Tea Leaves", category: "Drinks", unit: "kg", costRange: [600, 1200], stockRange: [3, 15], minStock: 3 },
  { name: "Takeaway Boxes (Large)", category: "Packaging", unit: "pcs", costRange: [8, 20], stockRange: [50, 500], minStock: 50 },
  { name: "Takeaway Bags", category: "Packaging", unit: "pcs", costRange: [3, 10], stockRange: [50, 500], minStock: 50 },
  { name: "Cling Wrap Roll", category: "Packaging", unit: "pcs", costRange: [200, 400], stockRange: [5, 20], minStock: 3 },
  { name: "Aluminium Foil", category: "Packaging", unit: "pcs", costRange: [250, 500], stockRange: [3, 15], minStock: 3 },
  { name: "Paper Napkins", category: "Packaging", unit: "pcs", costRange: [2, 8], stockRange: [100, 1000], minStock: 100 },
];

const SUPPLIERS = [
  "Metro Cash & Carry",
  "Al-Fatah Store",
  "Wholesale Market",
  "Direct Farm Supply",
  "Lahore Spice Co.",
  "PakBev Distributors",
  "City Packaging",
  "",
];

/* ═══════ Generate mock items ═══════ */
export function generateMockItems(branches: InvBranch[]): InventoryItem[] {
  if (branches.length === 0) return [];
  const items: InventoryItem[] = [];
  const now = Date.now();

  // give each branch most templates
  for (const branch of branches) {
    const subset = TEMPLATES.filter(() => Math.random() < 0.7); // ~70 %
    for (const t of subset) {
      const stock = rnd(0, t.stockRange[1]); // allow 0 for out-of-stock demo
      items.push({
        id: uid(),
        name: t.name,
        sku: `SKU-${branch.id}-${items.length + 1}`.padStart(4, "0"),
        category: t.category,
        branchId: branch.id,
        branchName: branch.name,
        unit: t.unit,
        stock,
        minStock: t.minStock,
        costPerUnit: rnd(t.costRange[0], t.costRange[1]),
        supplier: pick(SUPPLIERS),
        notes: "",
        status: rnd(1, 20) <= 18 ? "Active" : "Inactive",
        createdAt: now - rnd(0, 30) * 86_400_000,
        updatedAt: now - rnd(0, 7) * 86_400_000,
      });
    }
  }
  return items;
}

/* ═══════ Generate mock activity log ═══════ */
export function generateMockLog(items: InventoryItem[]): InventoryActivity[] {
  const log: InventoryActivity[] = [];
  const now = Date.now();
  const count = Math.min(items.length * 2, 60);

  for (let i = 0; i < count; i++) {
    const item = pick(items);
    const isIn = Math.random() < 0.4;
    log.push({
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      branchId: item.branchId,
      branchName: item.branchName,
      type: isIn ? "Stock In" : pick(["Adjustment", "Order Usage", "Simulated Usage"]),
      qty: isIn ? rnd(5, 40) : -rnd(1, 10),
      unit: item.unit,
      orderId: !isIn && Math.random() < 0.3 ? `ORD-${rnd(1000, 9999)}` : undefined,
      notes: "",
      createdAt: now - rnd(0, 14) * 86_400_000 - rnd(0, 86_400_000),
    });
  }

  return log.sort((a, b) => b.createdAt - a.createdAt);
}

/* ═══════ Recipe mapping for order deduction ═══════ */
export const RECIPES: MenuItemRecipe[] = [
  {
    menuItemName: "Chicken Tikka",
    ingredients: [
      { itemName: "Chicken", qty: 0.25, unit: "kg" },
      { itemName: "Red Chili Powder", qty: 0.01, unit: "kg" },
      { itemName: "Yogurt", qty: 0.05, unit: "kg" },
      { itemName: "Cooking Oil", qty: 0.03, unit: "L" },
    ],
  },
  {
    menuItemName: "Mutton Karahi",
    ingredients: [
      { itemName: "Mutton", qty: 0.3, unit: "kg" },
      { itemName: "Tomatoes", qty: 0.15, unit: "kg" },
      { itemName: "Ginger", qty: 0.02, unit: "kg" },
      { itemName: "Cooking Oil", qty: 0.05, unit: "L" },
      { itemName: "Garam Masala", qty: 0.005, unit: "kg" },
    ],
  },
  {
    menuItemName: "Beef Biryani",
    ingredients: [
      { itemName: "Beef", qty: 0.25, unit: "kg" },
      { itemName: "Rice (Basmati)", qty: 0.2, unit: "kg" },
      { itemName: "Onions", qty: 0.1, unit: "kg" },
      { itemName: "Cooking Oil", qty: 0.04, unit: "L" },
      { itemName: "Garam Masala", qty: 0.005, unit: "kg" },
    ],
  },
  {
    menuItemName: "Chicken Burger",
    ingredients: [
      { itemName: "Chicken", qty: 0.15, unit: "kg" },
      { itemName: "Lettuce", qty: 0.03, unit: "kg" },
      { itemName: "Cheese", qty: 0.02, unit: "kg" },
    ],
  },
  {
    menuItemName: "Chai (Tea)",
    ingredients: [
      { itemName: "Tea Leaves", qty: 0.005, unit: "kg" },
      { itemName: "Milk", qty: 0.15, unit: "L" },
      { itemName: "Sugar", qty: 0.015, unit: "kg" },
    ],
  },
];

/* ═══════ Stock status helper ═══════ */
export function getStockStatus(item: InventoryItem): "ok" | "low" | "out" {
  if (item.stock <= 0) return "out";
  if (item.stock <= item.minStock) return "low";
  return "ok";
}
