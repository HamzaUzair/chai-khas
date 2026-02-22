"use client";

import type { MenuItem } from "@/types/menu";

const STORAGE_KEY = "pos_menu_items";

/* ── Read / Write helpers ── */

export function getMenuItems(): MenuItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MenuItem[];
  } catch {
    return [];
  }
}

export function setMenuItems(items: MenuItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ── Demo data generator ── */

interface BranchInfo {
  branchId: number;
  branchName: string;
}

const DEMO_ITEMS: { name: string; description: string; category: string; price: number; status: "active" | "inactive" }[] = [
  { name: "Chicken Tikka", description: "Tender charcoal-grilled chicken pieces", category: "BBQ", price: 850, status: "active" },
  { name: "Seekh Kabab", description: "Spiced minced meat skewers", category: "BBQ", price: 650, status: "active" },
  { name: "Malai Boti", description: "Creamy marinated chicken cubes", category: "BBQ", price: 950, status: "active" },
  { name: "Chicken Karahi", description: "Traditional wok-cooked chicken curry", category: "Karahi", price: 1800, status: "active" },
  { name: "Mutton Karahi", description: "Slow-cooked mutton in rich gravy", category: "Karahi", price: 2800, status: "active" },
  { name: "Classic Burger", description: "Beef patty with fresh vegetables", category: "Burgers", price: 550, status: "active" },
  { name: "Zinger Burger", description: "Crispy fried chicken burger", category: "Burgers", price: 700, status: "inactive" },
  { name: "Margherita Pizza", description: "Classic tomato and mozzarella", category: "Pizza", price: 1200, status: "active" },
  { name: "Pepperoni Pizza", description: "Loaded with spicy pepperoni slices", category: "Pizza", price: 1400, status: "active" },
  { name: "Chai Khas Special", description: "Signature aromatic tea blend", category: "Drinks", price: 200, status: "active" },
  { name: "Cold Coffee", description: "Iced coffee with whipped cream", category: "Drinks", price: 400, status: "active" },
  { name: "Gulab Jamun", description: "Deep-fried milk dumplings in syrup", category: "Desserts", price: 350, status: "active" },
  { name: "Chicken Biryani", description: "Aromatic rice with spiced chicken", category: "Rice", price: 600, status: "active" },
  { name: "Club Sandwich", description: "Triple-layer toasted sandwich", category: "Sandwiches", price: 550, status: "inactive" },
  { name: "Grilled Chicken Sandwich", description: "Smoked chicken with honey mustard", category: "Sandwiches", price: 600, status: "active" },
];

export function generateDemoMenuItems(branches: BranchInfo[]): MenuItem[] {
  if (branches.length === 0) return [];

  const items: MenuItem[] = [];
  const now = Date.now();

  // Distribute items across branches
  DEMO_ITEMS.forEach((demo, idx) => {
    const branch = branches[idx % branches.length];
    items.push({
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      name: demo.name,
      description: demo.description,
      branchId: branch.branchId,
      branchName: branch.branchName,
      category: demo.category,
      price: demo.price,
      status: demo.status,
      createdAt: now - idx * 60000, // stagger creation times
    });
  });

  return items;
}

/* ── Category list for dropdowns ── */
export const DEFAULT_CATEGORIES = [
  "BBQ",
  "Karahi",
  "Burgers",
  "Pizza",
  "Drinks",
  "Desserts",
  "Rice",
  "Sandwiches",
];
