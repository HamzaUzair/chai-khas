"use client";

import type { BranchCategoryData, Category, CategoryMenuItem } from "@/types/category";

const STORAGE_KEY = "pos_categories";

/* ── Helpers ── */

export function getCategoryData(): BranchCategoryData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BranchCategoryData[];
  } catch {
    return [];
  }
}

export function setCategoryData(data: BranchCategoryData[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ── Generate initial demo data for a set of active branches ── */

const DEMO_CATEGORIES: { name: string; items: { name: string; price: number }[] }[] = [
  {
    name: "BBQ",
    items: [
      { name: "Chicken Tikka", price: 850 },
      { name: "Seekh Kabab", price: 650 },
      { name: "Malai Boti", price: 950 },
      { name: "BBQ Platter", price: 2500 },
      { name: "Reshmi Kabab", price: 750 },
    ],
  },
  {
    name: "Karahi",
    items: [
      { name: "Chicken Karahi", price: 1800 },
      { name: "Mutton Karahi", price: 2800 },
      { name: "Prawn Karahi", price: 2200 },
      { name: "Daal Karahi", price: 900 },
    ],
  },
  {
    name: "Burgers",
    items: [
      { name: "Classic Burger", price: 550 },
      { name: "Cheese Burger", price: 650 },
      { name: "Zinger Burger", price: 700 },
      { name: "Double Patty Burger", price: 900 },
      { name: "BBQ Burger", price: 750 },
      { name: "Mushroom Burger", price: 800 },
    ],
  },
  {
    name: "Pizza",
    items: [
      { name: "Margherita Pizza", price: 1200 },
      { name: "Pepperoni Pizza", price: 1400 },
      { name: "Chicken Fajita Pizza", price: 1500 },
      { name: "BBQ Chicken Pizza", price: 1500 },
    ],
  },
  {
    name: "Drinks",
    items: [
      { name: "Chai Khas Special", price: 200 },
      { name: "Green Tea", price: 250 },
      { name: "Fresh Lime", price: 300 },
      { name: "Mango Shake", price: 450 },
      { name: "Cold Coffee", price: 400 },
    ],
  },
  {
    name: "Desserts",
    items: [
      { name: "Gulab Jamun", price: 350 },
      { name: "Kheer", price: 400 },
      { name: "Brownie", price: 500 },
    ],
  },
  {
    name: "Rice",
    items: [
      { name: "Chicken Biryani", price: 600 },
      { name: "Mutton Pulao", price: 800 },
      { name: "Egg Fried Rice", price: 450 },
      { name: "Vegetable Rice", price: 400 },
    ],
  },
  {
    name: "Sandwiches",
    items: [
      { name: "Club Sandwich", price: 550 },
      { name: "Grilled Chicken Sandwich", price: 600 },
      { name: "Egg Mayo Sandwich", price: 400 },
    ],
  },
];

function generateId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function buildCategories(): Category[] {
  return DEMO_CATEGORIES.map((dc) => {
    const items: CategoryMenuItem[] = dc.items.map((i) => ({
      id: generateId(),
      name: i.name,
      price: i.price,
      isActive: true,
    }));
    return {
      id: generateId(),
      name: dc.name,
      itemCount: items.length,
      isActive: true,
      items,
    };
  });
}

export function generateInitialData(
  activeBranches: { branchId: number; branchName: string }[]
): BranchCategoryData[] {
  return activeBranches.map((b) => ({
    branchId: b.branchId,
    branchName: b.branchName,
    categories: buildCategories(),
  }));
}
