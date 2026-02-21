/* ═══════ Inventory Management types ═══════ */

export type InvUnit = "kg" | "g" | "L" | "ml" | "pcs";
export const INV_UNITS: InvUnit[] = ["kg", "g", "L", "ml", "pcs"];

export type InvCategory =
  | "Meat"
  | "Veg"
  | "Dairy"
  | "Spices"
  | "Drinks"
  | "Packaging"
  | "Other";
export const INV_CATEGORIES: InvCategory[] = [
  "Meat",
  "Veg",
  "Dairy",
  "Spices",
  "Drinks",
  "Packaging",
  "Other",
];

export type StockStatus = "ok" | "low" | "out";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InvCategory;
  branchId: number;
  branchName: string;
  unit: InvUnit;
  stock: number;
  minStock: number;
  costPerUnit: number; // PKR
  supplier: string;
  notes: string;
  status: "Active" | "Inactive";
  createdAt: number;
  updatedAt: number;
}

export interface InventoryItemFormData {
  name: string;
  sku: string;
  category: InvCategory | "";
  branchId: number | "";
  unit: InvUnit | "";
  stock: string;
  minStock: string;
  costPerUnit: string;
  supplier: string;
  notes: string;
  status: "Active" | "Inactive";
}

/* ── Stock-in ── */
export interface StockInEntry {
  id: string;
  itemId: string;
  itemName: string;
  branchId: number;
  branchName: string;
  qty: number;
  unit: InvUnit;
  purchaseCost: number;
  supplier: string;
  invoiceNo: string;
  dateReceived: string; // YYYY-MM-DD
  createdAt: number;
}

export interface StockInFormData {
  itemId: string;
  qty: string;
  purchaseCost: string;
  supplier: string;
  invoiceNo: string;
  dateReceived: string;
}

/* ── Adjustments ── */
export type AdjustmentType = "Increase" | "Decrease";
export type AdjustmentReason =
  | "Waste"
  | "Spoilage"
  | "Audit Correction"
  | "Staff Meal"
  | "Return"
  | "Other";
export const ADJUSTMENT_REASONS: AdjustmentReason[] = [
  "Waste",
  "Spoilage",
  "Audit Correction",
  "Staff Meal",
  "Return",
  "Other",
];

export interface AdjustStockFormData {
  type: AdjustmentType;
  qty: string;
  reason: AdjustmentReason | "";
  notes: string;
}

/* ── Activity / Usage log ── */
export type ActivityType = "Stock In" | "Adjustment" | "Order Usage" | "Simulated Usage";

export interface InventoryActivity {
  id: string;
  itemId: string;
  itemName: string;
  branchId: number;
  branchName: string;
  type: ActivityType;
  qty: number; // positive = in, negative = out
  unit: InvUnit;
  orderId?: string;
  notes: string;
  createdAt: number;
}

/* ── Recipe mock (for order deduction simulation) ── */
export interface RecipeIngredient {
  itemName: string; // maps to InventoryItem.name (loose match)
  qty: number;
  unit: InvUnit;
}

export interface MenuItemRecipe {
  menuItemName: string;
  ingredients: RecipeIngredient[];
}

/* ── Branch reference ── */
export interface InvBranch {
  id: number;
  name: string;
}

/* ── Quick-filter toggle ── */
export type QuickFilter = "all" | "low" | "out" | "active" | "inactive";
