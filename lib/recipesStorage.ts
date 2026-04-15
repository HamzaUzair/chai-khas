"use client";

import type { MenuItem } from "@/types/menu";
import type { InventoryItem } from "@/types/inventory";
import type { MenuRecipe, RecipeIngredientRow } from "@/types/recipe";
import { MOCK_RECIPES } from "@/lib/inventoryData";

const LS_KEY = "pos_recipes";

export function loadRecipes(): MenuRecipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MenuRecipe[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipes(data: MenuRecipe[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function uid(): string {
  return `rcp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface RecipeSummary {
  recipes: MenuRecipe[];
  totalIngredientsMapped: number;
  menuItemsWithRecipes: number;
}

export function generateDemoRecipes(
  menuItems: MenuItem[],
  inventoryItems: InventoryItem[]
): RecipeSummary {
  const now = Date.now();

  const invByName = new Map<string, InventoryItem>();
  inventoryItems.forEach((i) => {
    invByName.set(i.name.toLowerCase(), i);
  });

  const recipes: MenuRecipe[] = [];
  let totalIngredients = 0;

  for (const mock of MOCK_RECIPES) {
    const menu = menuItems.find(
      (m) => m.name.toLowerCase() === mock.menuItemName.toLowerCase()
    );
    if (!menu) continue;

    const ingRows: RecipeIngredientRow[] = mock.ingredients
      .map((ing) => {
        const inv = invByName.get(ing.itemName.toLowerCase());
        if (!inv) return null;
        return {
          id: uid(),
          inventoryItemId: inv.id,
          inventoryName: inv.name,
          quantity: ing.qtyPerServing,
          unit: ing.unit,
          wastagePercent: undefined,
          notes: "",
        } as RecipeIngredientRow;
      })
      .filter((r): r is RecipeIngredientRow => !!r);

    if (ingRows.length === 0) continue;

    totalIngredients += ingRows.length;

    recipes.push({
      id: uid(),
      menuItemId: menu.id,
      menuItemName: menu.name,
      categoryName: menu.categoryName,
      branchId: menu.branchId,
      branchName: menu.branchName,
      status: "has_recipe",
      ingredients: ingRows,
      createdAt: now,
      updatedAt: now,
    });
  }

  return {
    recipes,
    totalIngredientsMapped: totalIngredients,
    menuItemsWithRecipes: recipes.length,
  };
}

