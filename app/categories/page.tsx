"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BranchFilter from "@/components/categories/BranchFilter";
import CategoryGrid from "@/components/categories/CategoryGrid";
import ItemsPanel from "@/components/categories/ItemsPanel";
import CategoryModal from "@/components/categories/CategoryModal";
import ItemModal from "@/components/categories/ItemModal";
import type { Branch } from "@/types/branch";
import type {
  BranchCategoryData,
  Category,
  CategoryMenuItem,
} from "@/types/category";
import {
  getCategoryData,
  setCategoryData,
  generateInitialData,
} from "@/lib/storage";

export default function CategoriesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches from API ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Category data (localStorage) ── */
  const [data, setData] = useState<BranchCategoryData[]>([]);

  /* ── Filter ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");

  /* ── Selected category ── */
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  /* ── Modals ── */
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingCatBranchId, setEditingCatBranchId] = useState<number | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryMenuItem | null>(null);

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

  /* ──────────────── Load / init localStorage ──────────────── */
  useEffect(() => {
    if (!authorized || branchesLoading || branches.length === 0) return;

    let stored = getCategoryData();

    if (stored.length === 0) {
      // First time — generate demo data
      stored = generateInitialData(
        branches.map((b) => ({
          branchId: b.branch_id,
          branchName: b.branch_name,
        }))
      );
      setCategoryData(stored);
    } else {
      // Sync: add entries for any new active branches that aren't in storage yet
      const existingIds = new Set(stored.map((s) => s.branchId));
      const newBranches = branches.filter(
        (b) => !existingIds.has(b.branch_id)
      );
      if (newBranches.length > 0) {
        const newEntries = generateInitialData(
          newBranches.map((b) => ({
            branchId: b.branch_id,
            branchName: b.branch_name,
          }))
        );
        stored = [...stored, ...newEntries];
        setCategoryData(stored);
      }
    }

    setData(stored);
  }, [authorized, branchesLoading, branches]);

  /* ──────────────── Persist helper ──────────────── */
  const persist = useCallback((updated: BranchCategoryData[]) => {
    setData(updated);
    setCategoryData(updated);
  }, []);

  /* ──────────────── Derived groups (for grid) ──────────────── */
  const groups = useMemo(() => {
    if (filterBranchId === "all") {
      return data.map((d) => ({
        branchId: d.branchId,
        branchName: d.branchName,
        categories: d.categories,
      }));
    }
    const found = data.find((d) => d.branchId === filterBranchId);
    if (!found) return [];
    return [
      {
        branchId: found.branchId,
        branchName: found.branchName,
        categories: found.categories,
      },
    ];
  }, [data, filterBranchId]);

  /* ──────────────── Selected category object ──────────────── */
  const selectedCategory = useMemo(() => {
    if (!selectedCatId || selectedBranchId === null) return null;
    const bd = data.find((d) => d.branchId === selectedBranchId);
    return bd?.categories.find((c) => c.id === selectedCatId) ?? null;
  }, [data, selectedCatId, selectedBranchId]);

  const selectedBranchName = useMemo(() => {
    if (selectedBranchId === null) return "";
    return data.find((d) => d.branchId === selectedBranchId)?.branchName ?? "";
  }, [data, selectedBranchId]);

  /* ──────────────── Reset selection on filter change ──────────────── */
  useEffect(() => {
    // check if selectedCat still exists in the current filter view
    if (!selectedCatId) return;
    const exists = groups.some((g) =>
      g.categories.some((c) => c.id === selectedCatId)
    );
    if (!exists) {
      setSelectedCatId(null);
      setSelectedBranchId(null);
    }
  }, [groups, selectedCatId]);

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

  const handleCategorySave = (payload: {
    name: string;
    itemCount: number;
    isActive: boolean;
    branchId: number;
  }) => {
    const updated = data.map((bd) => {
      if (bd.branchId !== payload.branchId) return bd;

      if (editingCat) {
        // Edit existing
        return {
          ...bd,
          categories: bd.categories.map((c) =>
            c.id === editingCat.id
              ? { ...c, name: payload.name, itemCount: payload.itemCount, isActive: payload.isActive }
              : c
          ),
        };
      } else {
        // Add new
        const newCat: Category = {
          id: crypto.randomUUID(),
          name: payload.name,
          itemCount: payload.itemCount,
          isActive: payload.isActive,
          items: [],
        };
        return {
          ...bd,
          categories: [...bd.categories, newCat],
        };
      }
    });

    persist(updated);
    setCatModalOpen(false);
    setEditingCat(null);
  };

  /* ══════════════════════════════════════════════
     ITEM CRUD
  ══════════════════════════════════════════════ */

  const openAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item: CategoryMenuItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleItemSave = (payload: {
    name: string;
    price: number;
    isActive: boolean;
  }) => {
    if (!selectedCatId || selectedBranchId === null) return;

    const updated = data.map((bd) => {
      if (bd.branchId !== selectedBranchId) return bd;
      return {
        ...bd,
        categories: bd.categories.map((cat) => {
          if (cat.id !== selectedCatId) return cat;
          let newItems: CategoryMenuItem[];
          if (editingItem) {
            newItems = cat.items.map((i) =>
              i.id === editingItem.id
                ? { ...i, name: payload.name, price: payload.price, isActive: payload.isActive }
                : i
            );
          } else {
            const newItem: CategoryMenuItem = {
              id: crypto.randomUUID(),
              name: payload.name,
              price: payload.price,
              isActive: payload.isActive,
            };
            newItems = [...cat.items, newItem];
          }
          return { ...cat, items: newItems, itemCount: newItems.length };
        }),
      };
    });

    persist(updated);
    setItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedCatId || selectedBranchId === null) return;
    if (!window.confirm("Delete this item?")) return;

    const updated = data.map((bd) => {
      if (bd.branchId !== selectedBranchId) return bd;
      return {
        ...bd,
        categories: bd.categories.map((cat) => {
          if (cat.id !== selectedCatId) return cat;
          const newItems = cat.items.filter((i) => i.id !== itemId);
          return { ...cat, items: newItems, itemCount: newItems.length };
        }),
      };
    });

    persist(updated);
  };

  const handleToggleItem = (itemId: string) => {
    if (!selectedCatId || selectedBranchId === null) return;

    const updated = data.map((bd) => {
      if (bd.branchId !== selectedBranchId) return bd;
      return {
        ...bd,
        categories: bd.categories.map((cat) => {
          if (cat.id !== selectedCatId) return cat;
          return {
            ...cat,
            items: cat.items.map((i) =>
              i.id === itemId ? { ...i, isActive: !i.isActive } : i
            ),
          };
        }),
      };
    });

    persist(updated);
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
              Manage categories and items across branches
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
      {branchesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
        </div>
      ) : (
        /* ── Two-panel layout ── */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT — Category grid */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Select Category
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Click a card to view &amp; manage its items
            </p>
            <CategoryGrid
              groups={groups}
              selectedCategoryId={selectedCatId}
              onSelectCategory={(catId, branchId) => {
                setSelectedCatId(catId);
                setSelectedBranchId(branchId);
              }}
              onEditCategory={openEditCategory}
            />
          </div>

          {/* RIGHT — Items panel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 min-h-[400px]">
            <ItemsPanel
              category={selectedCategory}
              branchName={selectedBranchName}
              onAddItem={openAddItem}
              onEditItem={openEditItem}
              onDeleteItem={handleDeleteItem}
              onToggleItem={handleToggleItem}
            />
          </div>
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

      {/* ── Item Modal ── */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleItemSave}
        editItem={editingItem}
      />
    </DashboardLayout>
  );
}
