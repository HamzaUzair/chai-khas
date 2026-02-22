/* ══════════════ Inventory Management types ══════════════ */

export type InvCategory = "Meat" | "Veg" | "Dairy" | "Spices" | "Drinks" | "Packaging" | "Other";
export const INV_CATEGORIES: InvCategory[] = ["Meat", "Veg", "Dairy", "Spices", "Drinks", "Packaging", "Other"];

export type InvUnit = "kg" | "g" | "L" | "ml" | "pcs";
export const INV_UNITS: InvUnit[] = ["kg", "g", "L", "ml", "pcs"];

export type AdjustReason = "Waste" | "Spoilage" | "Audit Correction" | "Staff Meal" | "Return" | "Other";
export const ADJUST_REASONS: AdjustReason[] = ["Waste", "Spoilage", "Audit Correction", "Staff Meal", "Return", "Other"];

export type ActivityType = "Stock In" | "Usage" | "Adjustment" | "Order Deduction";

/* ── Branch (lightweight, same source as branch management) ── */
export interface InvBranch {
  id: number;
  name: string;
}

/* ── Inventory Item ── */
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InvCategory;
  branchId: number;
  branchName: string;
  unit: InvUnit;
  inStock: number;
  minStock: number;
  costPerUnit: number;
  supplier: string;
  notes: string;
  status: "Active" | "Inactive";
  lastUpdated: number; // epoch ms
  createdAt: number;
}

/* ── Activity log entry ── */
export interface ActivityEntry {
  id: string;
  itemId: string;
  itemName: string;
  branchId: number;
  branchName: string;
  type: ActivityType;
  qty: number;
  unit: InvUnit;
  reason?: string;
  notes?: string;
  linkedOrderId?: string;
  timestamp: number;
}

/* ── Recipe mapping for mock order deduction ── */
export interface RecipeIngredient {
  itemName: string;    // matches InventoryItem.name loosely
  category: InvCategory;
  qtyPerServing: number;
  unit: InvUnit;
}

export interface Recipe {
  menuItemName: string;
  ingredients: RecipeIngredient[];
}

/* ── Form types ── */
export interface AddItemFormData {
  name: string;
  sku: string;
  category: InvCategory | "";
  branchId: number | "";
  unit: InvUnit | "";
  inStock: string;
  minStock: string;
  costPerUnit: string;
  supplier: string;
  notes: string;
  status: "Active" | "Inactive";
}

export interface StockInFormData {
  itemId: string;
  qty: string;
  purchaseCost: string;
  supplier: string;
  invoiceNo: string;
  dateReceived: string;
}

export interface AdjustFormData {
  type: "Increase" | "Decrease";
  qty: string;
  reason: AdjustReason | "";
  notes: string;
}

/* ── Filter quick-toggle ── */
export type QuickFilter = "all" | "low" | "out" | "active" | "inactive";
