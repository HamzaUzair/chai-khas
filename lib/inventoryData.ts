"use client";

import type {
  InventoryItem,
  ActivityEntry,
  InvBranch,
  InvCategory,
  InvUnit,
  Recipe,
} from "@/types/inventory";

/* ════════════════ localStorage keys ════════════════ */
const LS_ITEMS = "pos_inventory_items";
const LS_LOG   = "pos_inventory_log";

/* ════════════════ Helpers ════════════════ */
let _counter = 0;
function uid(): string {
  _counter += 1;
  return `inv_${Date.now()}_${_counter}_${Math.random().toString(36).slice(2, 7)}`;
}
function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rnd(0, arr.length - 1)];
}
function genSku(cat: string, idx: number): string {
  return `${cat.slice(0, 3).toUpperCase()}-${String(idx).padStart(4, "0")}`;
}

/* ════════════════ Load / save ════════════════ */
export function loadItems(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_ITEMS) || "[]"); } catch { return []; }
}
export function saveItems(d: InventoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_ITEMS, JSON.stringify(d));
}
export function loadLog(): ActivityEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_LOG) || "[]"); } catch { return []; }
}
export function saveLog(d: ActivityEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_LOG, JSON.stringify(d));
}

/* ════════════════ Mock ingredient templates ════════════════ */
interface Template { name: string; category: InvCategory; unit: InvUnit; costRange: [number, number]; stockRange: [number, number]; minStock: number; supplier: string; }

const TEMPLATES: Template[] = [
  { name: "Chicken Breast",  category: "Meat",   unit: "kg",  costRange: [600, 900],  stockRange: [20, 80],  minStock: 10, supplier: "PK Meats" },
  { name: "Mutton",          category: "Meat",   unit: "kg",  costRange: [1800, 2500], stockRange: [10, 40], minStock: 5,  supplier: "PK Meats" },
  { name: "Beef Mince",      category: "Meat",   unit: "kg",  costRange: [800, 1200], stockRange: [15, 50], minStock: 8,  supplier: "PK Meats" },
  { name: "Seekh Kabab Mix", category: "Meat",   unit: "kg",  costRange: [700, 1000], stockRange: [10, 30], minStock: 5,  supplier: "PK Meats" },
  { name: "Onions",          category: "Veg",    unit: "kg",  costRange: [80, 160],   stockRange: [30, 100], minStock: 15, supplier: "Green Farm" },
  { name: "Tomatoes",        category: "Veg",    unit: "kg",  costRange: [100, 200],  stockRange: [25, 80],  minStock: 10, supplier: "Green Farm" },
  { name: "Capsicum",        category: "Veg",    unit: "kg",  costRange: [150, 300],  stockRange: [10, 40],  minStock: 5,  supplier: "Green Farm" },
  { name: "Potatoes",        category: "Veg",    unit: "kg",  costRange: [60, 120],   stockRange: [40, 120], minStock: 20, supplier: "Green Farm" },
  { name: "Lettuce",         category: "Veg",    unit: "kg",  costRange: [200, 350],  stockRange: [5, 20],   minStock: 3,  supplier: "Green Farm" },
  { name: "Milk",            category: "Dairy",  unit: "L",   costRange: [180, 280],  stockRange: [20, 60],  minStock: 10, supplier: "Dairy Pure" },
  { name: "Cheese Slices",   category: "Dairy",  unit: "pcs", costRange: [15, 30],    stockRange: [50, 200], minStock: 20, supplier: "Dairy Pure" },
  { name: "Butter",          category: "Dairy",  unit: "kg",  costRange: [900, 1400], stockRange: [5, 20],   minStock: 3,  supplier: "Dairy Pure" },
  { name: "Yogurt",          category: "Dairy",  unit: "kg",  costRange: [200, 350],  stockRange: [10, 40],  minStock: 5,  supplier: "Dairy Pure" },
  { name: "Red Chili Powder",category: "Spices", unit: "kg",  costRange: [400, 700],  stockRange: [5, 20],   minStock: 2,  supplier: "Spice World" },
  { name: "Turmeric Powder", category: "Spices", unit: "kg",  costRange: [300, 500],  stockRange: [5, 15],   minStock: 2,  supplier: "Spice World" },
  { name: "Cumin Seeds",     category: "Spices", unit: "kg",  costRange: [600, 900],  stockRange: [3, 12],   minStock: 2,  supplier: "Spice World" },
  { name: "Garam Masala",    category: "Spices", unit: "kg",  costRange: [500, 800],  stockRange: [3, 10],   minStock: 2,  supplier: "Spice World" },
  { name: "Salt",            category: "Spices", unit: "kg",  costRange: [40, 80],    stockRange: [10, 40],  minStock: 5,  supplier: "Spice World" },
  { name: "Pepsi 1.5L",      category: "Drinks", unit: "pcs", costRange: [120, 180],  stockRange: [20, 100], minStock: 10, supplier: "PepsiCo" },
  { name: "Mineral Water",   category: "Drinks", unit: "pcs", costRange: [30, 60],    stockRange: [50, 200], minStock: 20, supplier: "Nestle" },
  { name: "Tea Leaves",      category: "Drinks", unit: "kg",  costRange: [800, 1500], stockRange: [5, 20],   minStock: 3,  supplier: "Tapal" },
  { name: "Sugar",           category: "Drinks", unit: "kg",  costRange: [120, 200],  stockRange: [20, 60],  minStock: 10, supplier: "JDW Sugar" },
  { name: "Takeaway Box S",  category: "Packaging", unit: "pcs", costRange: [8, 15],  stockRange: [100, 500], minStock: 50, supplier: "PackMate" },
  { name: "Takeaway Box L",  category: "Packaging", unit: "pcs", costRange: [12, 25], stockRange: [100, 400], minStock: 50, supplier: "PackMate" },
  { name: "Paper Bags",      category: "Packaging", unit: "pcs", costRange: [5, 12],  stockRange: [100, 500], minStock: 50, supplier: "PackMate" },
  { name: "Foil Roll",       category: "Packaging", unit: "pcs", costRange: [250, 450], stockRange: [10, 30], minStock: 5,  supplier: "PackMate" },
  { name: "Cooking Oil",     category: "Other",  unit: "L",   costRange: [350, 550],  stockRange: [10, 40],  minStock: 5,  supplier: "Dalda" },
  { name: "Flour (Atta)",    category: "Other",  unit: "kg",  costRange: [80, 150],   stockRange: [30, 100], minStock: 15, supplier: "Sunridge" },
  { name: "Rice Basmati",    category: "Other",  unit: "kg",  costRange: [250, 450],  stockRange: [20, 60],  minStock: 10, supplier: "Guard Rice" },
  { name: "Charcoal",        category: "Other",  unit: "kg",  costRange: [100, 200],  stockRange: [10, 40],  minStock: 5,  supplier: "BBQ Depot" },
];

/* ════════════════ Generate mock items ════════════════ */
export function generateMockItems(branches: InvBranch[]): InventoryItem[] {
  if (branches.length === 0) return [];
  const items: InventoryItem[] = [];
  let idx = 0;
  const now = Date.now();

  for (const t of TEMPLATES) {
    // assign to 1-2 branches
    const branchCount = rnd(1, Math.min(2, branches.length));
    const shuffled = [...branches].sort(() => Math.random() - 0.5).slice(0, branchCount);

    for (const br of shuffled) {
      idx += 1;
      const stock = rnd(t.stockRange[0], t.stockRange[1]);
      // sometimes make low / out of stock
      const roll = rnd(1, 20);
      const finalStock = roll <= 2 ? 0 : roll <= 4 ? rnd(0, t.minStock) : stock;

      items.push({
        id: uid(),
        name: t.name,
        sku: genSku(t.category, idx),
        category: t.category,
        branchId: br.id,
        branchName: br.name,
        unit: t.unit,
        inStock: finalStock,
        minStock: t.minStock,
        costPerUnit: rnd(t.costRange[0], t.costRange[1]),
        supplier: t.supplier,
        notes: "",
        status: rnd(1, 12) <= 11 ? "Active" : "Inactive",
        lastUpdated: now - rnd(0, 7) * 86_400_000,
        createdAt: now - rnd(7, 30) * 86_400_000,
      });
    }
  }

  return items;
}

/* ════════════════ Generate initial log entries ════════════════ */
export function generateMockLog(items: InventoryItem[]): ActivityEntry[] {
  const log: ActivityEntry[] = [];
  const now = Date.now();
  const types: ("Stock In" | "Usage" | "Adjustment")[] = ["Stock In", "Usage", "Adjustment"];

  for (let i = 0; i < Math.min(40, items.length * 2); i++) {
    const item = pick(items);
    const type = pick(types);
    log.push({
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      branchId: item.branchId,
      branchName: item.branchName,
      type,
      qty: type === "Stock In" ? rnd(5, 50) : rnd(1, 10),
      unit: item.unit,
      reason: type === "Adjustment" ? pick(["Waste", "Spoilage", "Audit Correction"]) : undefined,
      notes: "",
      timestamp: now - rnd(0, 14) * 86_400_000 - rnd(0, 23) * 3_600_000,
    });
  }

  return log.sort((a, b) => b.timestamp - a.timestamp);
}

/* ════════════════ Mock recipes ════════════════ */
export const MOCK_RECIPES: Recipe[] = [
  {
    menuItemName: "Chicken Tikka",
    ingredients: [
      { itemName: "Chicken Breast", category: "Meat", qtyPerServing: 0.25, unit: "kg" },
      { itemName: "Red Chili Powder", category: "Spices", qtyPerServing: 0.01, unit: "kg" },
      { itemName: "Yogurt", category: "Dairy", qtyPerServing: 0.05, unit: "kg" },
      { itemName: "Charcoal", category: "Other", qtyPerServing: 0.1, unit: "kg" },
    ],
  },
  {
    menuItemName: "Seekh Kabab",
    ingredients: [
      { itemName: "Seekh Kabab Mix", category: "Meat", qtyPerServing: 0.2, unit: "kg" },
      { itemName: "Onions", category: "Veg", qtyPerServing: 0.05, unit: "kg" },
      { itemName: "Garam Masala", category: "Spices", qtyPerServing: 0.005, unit: "kg" },
      { itemName: "Charcoal", category: "Other", qtyPerServing: 0.1, unit: "kg" },
    ],
  },
  {
    menuItemName: "Chicken Burger",
    ingredients: [
      { itemName: "Chicken Breast", category: "Meat", qtyPerServing: 0.15, unit: "kg" },
      { itemName: "Cheese Slices", category: "Dairy", qtyPerServing: 1, unit: "pcs" },
      { itemName: "Lettuce", category: "Veg", qtyPerServing: 0.03, unit: "kg" },
      { itemName: "Flour (Atta)", category: "Other", qtyPerServing: 0.08, unit: "kg" },
    ],
  },
  {
    menuItemName: "Mutton Karahi",
    ingredients: [
      { itemName: "Mutton", category: "Meat", qtyPerServing: 0.3, unit: "kg" },
      { itemName: "Tomatoes", category: "Veg", qtyPerServing: 0.15, unit: "kg" },
      { itemName: "Capsicum", category: "Veg", qtyPerServing: 0.05, unit: "kg" },
      { itemName: "Cooking Oil", category: "Other", qtyPerServing: 0.05, unit: "L" },
      { itemName: "Garam Masala", category: "Spices", qtyPerServing: 0.01, unit: "kg" },
    ],
  },
  {
    menuItemName: "Chai (Tea)",
    ingredients: [
      { itemName: "Tea Leaves", category: "Drinks", qtyPerServing: 0.005, unit: "kg" },
      { itemName: "Milk", category: "Dairy", qtyPerServing: 0.15, unit: "L" },
      { itemName: "Sugar", category: "Drinks", qtyPerServing: 0.015, unit: "kg" },
    ],
  },
];
