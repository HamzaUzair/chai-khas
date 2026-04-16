"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Info, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RecipesToolbar, {
  type RecipeStatusFilter,
} from "@/components/recipes/RecipesToolbar";
import RecipesStats from "@/components/recipes/RecipesStats";
import RecipesTable, { type RecipeRow } from "@/components/recipes/RecipesTable";
import RecipeModal from "@/components/recipes/RecipeModal";
import RecipeDrawer from "@/components/recipes/RecipeDrawer";
import type { Branch } from "@/types/branch";
import type { MenuItem } from "@/types/menu";
import type { InventoryItem } from "@/types/inventory";
import type { MenuRecipe, RecipeFormData } from "@/types/recipe";
import {
  loadRecipes,
  saveRecipes,
  generateDemoRecipes,
} from "@/lib/recipesStorage";
import { loadItems, generateMockItems } from "@/lib/inventoryData";
import { apiFetch } from "@/lib/auth-client";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

type ApiMenuVariation = {
  id?: number;
  name: string;
  price: number;
  sortOrder?: number;
};

type ApiMenuRow = {
  id: number;
  itemName: string;
  description?: string | null;
  branchId: number;
  branchName?: string;
  category: string;
  hasVariations: boolean;
  basePrice: number | null;
  variations: ApiMenuVariation[];
  price: number;
  status: "active" | "inactive";
};

function apiMenuToMenuItem(d: ApiMenuRow, branchMap: Map<number, string>): MenuItem {
  return {
    id: d.id,
    name: d.itemName,
    description: d.description ?? undefined,
    branchId: d.branchId,
    branchName: d.branchName ?? branchMap.get(d.branchId) ?? "",
    categoryName: d.category,
    hasVariations: d.hasVariations,
    basePrice: d.basePrice,
    variations: d.variations.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sortOrder: v.sortOrder,
    })),
    displayPrice: Number(d.price),
    status: d.status,
  };
}

export default function RecipesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const [recipes, setRecipes] = useState<MenuRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [filterCategoryName, setFilterCategoryName] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RecipeStatusFilter>("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<MenuRecipe | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | undefined>(
    undefined
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecipe, setDrawerRecipe] = useState<MenuRecipe | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<MenuRecipe | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ───────────── Auth guard ───────────── */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ───────────── Fetch branches ───────────── */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await apiFetch("/api/branches");
      if (!res.ok) throw new Error();
      const data: Branch[] = await res.json();
      setBranches(data.filter((b) => b.status === "Active"));
    } catch {
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  /* ───────────── Load inventory items (localStorage) ───────────── */
  useEffect(() => {
    if (!authorized) return;
    let items = loadItems();
    if (items.length === 0) {
      const fallbackBranches =
        branches.length > 0
          ? branches.map((b) => ({ id: b.branch_id, name: b.branch_name }))
          : [
              { id: 1, name: "Main Branch" },
              { id: 2, name: "North Campus" },
            ];
      items = generateMockItems(fallbackBranches);
    }
    setInventoryItems(items);
  }, [authorized, branches]);

  /* ───────────── Fetch menu items ───────────── */
  const fetchMenuItems = useCallback(async () => {
    setMenuLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterBranchId !== "all") params.set("branchId", String(filterBranchId));
      const url = `/api/menu${params.toString() ? `?${params}` : ""}`;
      const res = await apiFetch(url);
      if (!res.ok) throw new Error();
      const data: ApiMenuRow[] = await res.json();
      const branchMap = new Map(branches.map((b) => [b.branch_id, b.branch_name]));
      const items = data.map((d) => apiMenuToMenuItem(d, branchMap));
      setMenuItems(items);
    } catch {
      setMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  }, [filterBranchId, branches]);

  useEffect(() => {
    if (authorized && !branchesLoading) {
      fetchMenuItems();
    }
  }, [authorized, branchesLoading, fetchMenuItems]);

  /* ───────────── Load / seed recipes ───────────── */
  useEffect(() => {
    if (!authorized || menuLoading) return;
    setRecipesLoading(true);
    let stored = loadRecipes();
    if (stored.length === 0 && menuItems.length > 0 && inventoryItems.length > 0) {
      const { recipes: demoRecipes } = generateDemoRecipes(menuItems, inventoryItems);
      stored = demoRecipes;
      saveRecipes(stored);
    }
    setRecipes(stored);
    setRecipesLoading(false);
  }, [authorized, menuLoading, menuItems, inventoryItems]);

  /* ───────────── Derived rows ───────────── */
  const rows: RecipeRow[] = useMemo(() => {
    const byMenuId = new Map<number, MenuRecipe>();
    recipes.forEach((r) => byMenuId.set(r.menuItemId, r));

    const baseMenu = menuItems.filter((m) => {
      if (filterCategoryName !== "all" && m.categoryName !== filterCategoryName) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!m.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const list: RecipeRow[] = baseMenu.map((m) => {
      const r = byMenuId.get(m.id);
      return {
        id: r ? String(r.id) : `missing-${m.id}`,
        menuItemId: m.id,
        menuItemName: m.name,
        categoryName: m.categoryName,
        branchName: m.branchName,
        ingredientCount: r?.ingredients.length ?? 0,
        hasRecipe: !!r && r.ingredients.length > 0,
      };
    });

    return list.filter((row) => {
      if (statusFilter === "has") return row.hasRecipe;
      if (statusFilter === "missing") return !row.hasRecipe;
      return true;
    });
  }, [recipes, menuItems, filterCategoryName, search, statusFilter]);

  const totalIngredientsMapped = useMemo(
    () => recipes.reduce((sum, r) => sum + r.ingredients.length, 0),
    [recipes]
  );
  const menuItemsWithRecipes = useMemo(
    () => recipes.filter((r) => r.ingredients.length > 0).length,
    [recipes]
  );
  const menuItemsMissingRecipes = Math.max(
    menuItems.length - menuItemsWithRecipes,
    0
  );

  /* ───────────── Handlers ───────────── */
  const openCreate = () => {
    setEditingRecipe(null);
    setSelectedMenuItemId(undefined);
    setModalOpen(true);
  };

  const handleEdit = (row: RecipeRow) => {
    const existing = recipes.find((r) => r.menuItemId === row.menuItemId) ?? null;
    setEditingRecipe(existing);
    setSelectedMenuItemId(row.menuItemId);
    setModalOpen(true);
  };

  const handleView = (row: RecipeRow) => {
    const existing = recipes.find((r) => r.menuItemId === row.menuItemId);
    if (!existing) return;
    setDrawerRecipe(existing);
    setDrawerOpen(true);
  };

  const handleDelete = (row: RecipeRow) => {
    const existing = recipes.find((r) => r.menuItemId === row.menuItemId);
    if (!existing) return;
    setDeleteTarget(existing);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const next = recipes.filter((r) => r.menuItemId !== deleteTarget.menuItemId);
    setRecipes(next);
    saveRecipes(next);
    pushToast("Recipe mapping deleted.", "success");
    setDeleteTarget(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecipe(null);
    setSelectedMenuItemId(undefined);
  };

  const handleSave = (data: RecipeFormData) => {
    const menu = menuItems.find((m) => m.id === data.menuItemId);
    if (!menu) return;
    const now = Date.now();

    const ingredients = data.rows
      .filter((r) => r.inventoryItemId && r.quantity && Number(r.quantity) > 0)
      .map((r) => {
        const inv = inventoryItems.find((i) => i.id === r.inventoryItemId);
        return {
          id: r.tempId,
          inventoryItemId: r.inventoryItemId,
          inventoryName: inv?.name ?? "",
          quantity: Number(r.quantity),
          unit: inv?.unit ?? r.unit,
          wastagePercent: r.wastagePercent ? Number(r.wastagePercent) : undefined,
          notes: r.notes || "",
        };
      });

    let next: MenuRecipe[];
    const existing = recipes.find((r) => r.menuItemId === menu.id);
    if (existing) {
      next = recipes.map((r) =>
        r.menuItemId === menu.id
          ? {
              ...r,
              menuItemName: menu.name,
              categoryName: menu.categoryName,
              branchId: menu.branchId,
              branchName: menu.branchName,
              ingredients,
              status: ingredients.length > 0 ? "has_recipe" : "missing_recipe",
              updatedAt: now,
            }
          : r
      );
    } else {
      const newRecipe: MenuRecipe = {
        id: String(now),
        menuItemId: menu.id,
        menuItemName: menu.name,
        categoryName: menu.categoryName,
        branchId: menu.branchId,
        branchName: menu.branchName,
        status: ingredients.length > 0 ? "has_recipe" : "missing_recipe",
        ingredients,
        createdAt: now,
        updatedAt: now,
      };
      next = [newRecipe, ...recipes];
    }

    setRecipes(next);
    saveRecipes(next);
    pushToast("Recipe mapping saved.", "success");
    closeModal();
  };

  /* ───────────── Render ───────────── */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Recipes">
      {/* Toasts */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.25s_ease-out] ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {t.type === "success" ? "✓" : "!"}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/10 flex items-center justify-center">
              <Info size={22} className="text-[#ff5a1f]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                Recipe Mapping Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Map inventory ingredients to menu items for automatic stock deduction and
                accurate food cost tracking.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setRecipes(loadRecipes());
                pushToast("Recipe list refreshed.", "success");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              <PlusCircle size={16} />
              + Add Recipe Mapping
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <RecipesToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        filterCategoryName={filterCategoryName}
        onCategoryChange={setFilterCategoryName}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Stats */}
      <RecipesStats
        totalRecipes={recipes.length}
        totalIngredientsMapped={totalIngredientsMapped}
        menuItemsWithRecipes={menuItemsWithRecipes}
        menuItemsMissingRecipes={menuItemsMissingRecipes}
      />

      {/* Table */}
      <RecipesTable
        rows={rows}
        loading={recipesLoading || menuLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Drawer */}
      <RecipeDrawer isOpen={drawerOpen} recipe={drawerRecipe} onClose={() => setDrawerOpen(false)} />

      {/* Add / Edit modal */}
      <RecipeModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        menuItems={menuItems}
        inventoryItems={inventoryItems}
        initialMenuItemId={selectedMenuItemId}
        existing={
          editingRecipe
            ? {
                menuItemId: editingRecipe.menuItemId,
                rows: editingRecipe.ingredients.map((ing) => ({
                  tempId: ing.id,
                  inventoryItemId: ing.inventoryItemId,
                  quantity: String(ing.quantity),
                  unit: ing.unit,
                  wastagePercent:
                    typeof ing.wastagePercent === "number"
                      ? String(ing.wastagePercent)
                      : "",
                  notes: ing.notes ?? "",
                })),
              }
            : null
        }
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">Delete Recipe Mapping</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the recipe for{" "}
                <span className="font-semibold">{deleteTarget.menuItemName}</span>?
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                This will not affect existing inventory levels but future automatic stock
                deduction for this item will be disabled until you add a new recipe.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

