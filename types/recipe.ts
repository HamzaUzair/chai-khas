/* ══════════════ Recipe Mapping types ══════════════ */

import type { InvUnit } from "./inventory";

export type RecipeStatus = "has_recipe" | "missing_recipe";

export interface RecipeIngredientRow {
  id: string;
  inventoryItemId: string;
  inventoryName: string;
  quantity: number;
  unit: InvUnit;
  wastagePercent?: number;
  notes?: string;
}

export interface MenuRecipe {
  id: string;
  menuItemId: number;
  menuItemName: string;
  categoryName: string;
  branchId: number;
  branchName: string;
  status: RecipeStatus;
  ingredients: RecipeIngredientRow[];
  createdAt: number;
  updatedAt: number;
}

export interface RecipeFormRow {
  tempId: string;
  inventoryItemId: string | "";
  quantity: string;
  unit: InvUnit;
  wastagePercent: string;
  notes: string;
}

export interface RecipeFormData {
  menuItemId: number | "";
  rows: RecipeFormRow[];
}

