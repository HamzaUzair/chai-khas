"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, UtensilsCrossed } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuToolbar, { type StatusFilter } from "@/components/menu/MenuToolbar";
import MenuItemCard from "@/components/menu/MenuItemCard";
import MenuTable from "@/components/menu/MenuTable";
import MenuItemModal from "@/components/menu/MenuItemModal";
import type { ViewMode } from "@/components/menu/ViewToggle";
import type { Branch } from "@/types/branch";
import type { MenuItem, MenuItemFormData } from "@/types/menu";
import {
  getMenuItems,
  setMenuItems as persistMenuItems,
  generateDemoMenuItems,
} from "@/lib/menuStorage";

export default function MenuPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches from API ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Menu items (localStorage-backed) ── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [view, setView] = useState<ViewMode>("grid");

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
      const data: Branch[] = await res.json();
      setBranches(data.filter((b) => b.status === "Active"));
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
    if (!authorized || branchesLoading) return;

    let stored = getMenuItems();
    if (stored.length === 0 && branches.length > 0) {
      stored = generateDemoMenuItems(
        branches.map((b) => ({
          branchId: b.branch_id,
          branchName: b.branch_name,
        }))
      );
      persistMenuItems(stored);
    }
    setMenuItems(stored);
  }, [authorized, branchesLoading, branches]);

  /* ──────────────── Persist helper ──────────────── */
  const persist = useCallback((updated: MenuItem[]) => {
    setMenuItems(updated);
    persistMenuItems(updated);
  }, []);

  /* ──────────────── Derived: unique categories from items ──────────────── */
  const uniqueCategories = useMemo(() => {
    const cats = new Set(menuItems.map((m) => m.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  /* ──────────────── Filtered items ──────────────── */
  const filteredItems = useMemo(() => {
    let result = menuItems;

    // Branch
    if (filterBranchId !== "all") {
      result = result.filter((m) => m.branchId === filterBranchId);
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Category
    if (filterCategory !== "all") {
      result = result.filter((m) => m.category === filterCategory);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.branchName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [menuItems, filterBranchId, statusFilter, filterCategory, search]);

  /* ──────────────── CRUD handlers ──────────────── */
  const openCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = (data: MenuItemFormData) => {
    const branch = branches.find(
      (b) => b.branch_id === Number(data.branchId)
    );

    if (editingItem) {
      const updated = menuItems.map((m) =>
        m.id === editingItem.id
          ? {
              ...m,
              name: data.name.trim(),
              description: data.description.trim() || undefined,
              branchId: Number(data.branchId),
              branchName: branch?.branch_name ?? "",
              category: data.category,
              price: parseFloat(data.price) || 0,
              status: data.status,
            }
          : m
      );
      persist(updated);
    } else {
      const newItem: MenuItem = {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        branchId: Number(data.branchId),
        branchName: branch?.branch_name ?? "",
        category: data.category,
        price: parseFloat(data.price) || 0,
        status: data.status,
        createdAt: Date.now(),
      };
      persist([newItem, ...menuItems]);
    }
    closeModal();
  };

  const handleDelete = (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    persist(menuItems.filter((m) => m.id !== item.id));
  };

  /* ──────────────── Loading ──────────────── */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const noBranches = !branchesLoading && branches.length === 0;

  /* ──────────────── Count badges ──────────────── */
  const activeCount = menuItems.filter((m) => m.status === "active").length;
  const inactiveCount = menuItems.filter((m) => m.status === "inactive").length;

  return (
    <DashboardLayout title="Menu">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Menu Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage menu items, prices, and categories across all branches
            </p>
            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <UtensilsCrossed size={13} className="text-gray-400" />
                {menuItems.length} total items
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
                ● {activeCount} active
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                ○ {inactiveCount} inactive
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={openCreate}
              disabled={noBranches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle size={18} />
              + Add Menu Item
            </button>
            {noBranches && (
              <p className="text-xs text-red-500">
                Create an active branch first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <MenuToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
        categories={uniqueCategories}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        view={view}
        onViewChange={setView}
      />

      {/* ── Content ── */}
      {branchesLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
        </div>
      ) : view === "grid" ? (
        /* Grid view */
        filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <UtensilsCrossed size={28} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 max-w-xs">
                No menu items found matching your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )
      ) : (
        /* Table view */
        <MenuTable
          items={filteredItems}
          loading={false}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ── Modal ── */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editItem={editingItem}
        activeBranches={branches}
        branchesLoading={branchesLoading}
        extraCategories={uniqueCategories}
      />
    </DashboardLayout>
  );
}
