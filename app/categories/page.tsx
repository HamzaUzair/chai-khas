"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BranchFilter from "@/components/categories/BranchFilter";
import CategoryGrid from "@/components/categories/CategoryGrid";
import CategoryTable from "@/components/categories/CategoryTable";
import CategoryModal from "@/components/categories/CategoryModal";
import ViewToggle, { type ViewMode } from "@/components/menu/ViewToggle";
import type { Branch } from "@/types/branch";
import type {
  BranchCategoryData,
  Category,
  ApiCategory,
} from "@/types/category";

// Transform API response to frontend format (category-only, no items)
function transformApiCategory(apiCat: ApiCategory): Category {
  return {
    id: apiCat.category_id,
    name: apiCat.name,
    itemCount: apiCat.item_count,
    isActive: apiCat.is_active,
    branchId: apiCat.branch_id,
    branchName: apiCat.branch_name,
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches from API ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Category data from API ── */
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  /* ── Filter ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [view, setView] = useState<ViewMode>("grid");

  /* ── Modals ── */
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingCatBranchId, setEditingCatBranchId] = useState<number | null>(null);

  /* ──────────────── Auth guard ──────────────── */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ──────────────── Fetch active branches ──────────────── */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error();
      const all: Branch[] = await res.json();
      setBranches(all.filter((b) => b.status === "Active"));
    } catch {
      // silent
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  /* ──────────────── Fetch categories from API ──────────────── */
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      const url =
        filterBranchId === "all"
          ? "/api/categories"
          : `/api/categories?branch_id=${filterBranchId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data: ApiCategory[] = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategoriesError("Failed to load categories. Please try again.");
    } finally {
      setCategoriesLoading(false);
    }
  }, [filterBranchId]);

  useEffect(() => {
    if (authorized && !branchesLoading) {
      fetchCategories();
    }
  }, [authorized, branchesLoading, fetchCategories]);

  /* ──────────────── Transform API data to frontend format ──────────────── */
  const data: BranchCategoryData[] = useMemo(() => {
    const branchMap = new Map<number, { branchName: string; categories: Category[] }>();

    categories.forEach((apiCat) => {
      const cat = transformApiCategory(apiCat);
      if (!branchMap.has(apiCat.branch_id)) {
        branchMap.set(apiCat.branch_id, {
          branchName: apiCat.branch_name,
          categories: [],
        });
      }
      branchMap.get(apiCat.branch_id)!.categories.push(cat);
    });

    return Array.from(branchMap.entries()).map(([branchId, data]) => ({
      branchId,
      branchName: data.branchName,
      categories: data.categories,
    }));
  }, [categories]);

  /* ──────────────── Derived groups (for grid) ──────────────── */
  const groups = useMemo(() => {
    const sortCategories = (items: Category[]) =>
      [...items].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

    if (filterBranchId === "all") {
      return data.map((d) => ({
        branchId: d.branchId,
        branchName: d.branchName,
        categories: sortCategories(d.categories),
      }));
    }
    const found = data.find((d) => d.branchId === filterBranchId);
    if (!found) return [];
    return [
      {
        branchId: found.branchId,
        branchName: found.branchName,
        categories: sortCategories(found.categories),
      },
    ];
  }, [data, filterBranchId]);

  const flatCategories = useMemo(
    () => groups.flatMap((g) => g.categories),
    [groups]
  );

  /* ══════════════════════════════════════════════
     CATEGORY CRUD
  ══════════════════════════════════════════════ */

  const openAddCategory = () => {
    setEditingCat(null);
    setEditingCatBranchId(
      filterBranchId === "all" ? null : filterBranchId
    );
    setCatModalOpen(true);
  };

  const openEditCategory = (cat: Category, branchId: number) => {
    setEditingCat(cat);
    setEditingCatBranchId(branchId);
    setCatModalOpen(true);
  };

  const handleCategorySave = async (payload: {
    name: string;
    isActive: boolean;
    branchId: number;
  }) => {
    try {
      if (editingCat) {
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            description: null,
            is_active: payload.isActive,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update category");
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            description: null,
            branch_id: payload.branchId,
            is_active: payload.isActive,
          }),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to create category");
        }
      }
      await fetchCategories();
      setCatModalOpen(false);
      setEditingCat(null);
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error instanceof Error ? error.message : "Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId: number, branchId: number, categoryName: string) => {
    const category = data
      .find((d) => d.branchId === branchId)
      ?.categories.find((c) => c.id === categoryId);

    const itemCount = category?.itemCount || 0;
    const confirmMessage = itemCount > 0
      ? `Delete "${categoryName}"? This will permanently delete the category and all ${itemCount} menu item(s) in it. This action cannot be undone.`
      : `Delete "${categoryName}"? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete category");
      }
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error instanceof Error ? error.message : "Failed to delete category");
    }
  };

  /* ──────────────── Loading states ──────────────── */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const noBranches = !branchesLoading && branches.length === 0;

  return (
    <DashboardLayout title="Categories">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage categories across branches. Menu items are managed in the Menu section.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={openAddCategory}
              disabled={noBranches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle size={18} />
              + Add Category
            </button>
            {noBranches && (
              <p className="text-xs text-red-500">
                Create an active branch first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {categoriesError && (
        <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {categoriesError}
          <button
            onClick={fetchCategories}
            className="ml-auto text-xs font-medium underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Filter ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <BranchFilter
          branches={branches}
          loading={branchesLoading}
          value={filterBranchId}
          onChange={(v) => setFilterBranchId(v)}
        />
      </div>

      {/* ── Loading state ── */}
      {branchesLoading || categoriesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
        </div>
      ) : (
        /* ── Category grid (single column, no item panel) ── */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-1">
                Categories
              </h3>
              <p className="text-xs text-gray-400">
                Add, edit, or delete categories. Item count is shown for reference.
              </p>
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>

          {view === "grid" ? (
            <CategoryGrid
              groups={groups}
              onEditCategory={openEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          ) : (
            <CategoryTable
              items={flatCategories}
              onEditCategory={openEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </div>
      )}

      {/* ── Category Modal ── */}
      <CategoryModal
        isOpen={catModalOpen}
        onClose={() => {
          setCatModalOpen(false);
          setEditingCat(null);
        }}
        onSave={handleCategorySave}
        editCategory={editingCat}
        editBranchId={editingCatBranchId}
        activeBranches={branches}
        showBranchSelect={filterBranchId === "all"}
      />
    </DashboardLayout>
  );
}
