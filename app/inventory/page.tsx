"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  ArrowDownCircle,
  ClipboardList,
  Download,
  Package,
  Loader2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import InventoryStats from "@/components/inventory/InventoryStats";
import InventoryTable from "@/components/inventory/InventoryTable";
import InventoryCardList from "@/components/inventory/InventoryCardList";
import InventoryDrawer from "@/components/inventory/InventoryDrawer";
import AddItemModal from "@/components/inventory/AddItemModal";
import StockInModal from "@/components/inventory/StockInModal";
import AdjustStockModal from "@/components/inventory/AdjustStockModal";
import UsageLogModal from "@/components/inventory/UsageLogModal";
import SimulateOrderModal from "@/components/inventory/SimulateOrderModal";

import type {
  InventoryItem,
  ActivityEntry,
  InvBranch,
  InvCategory,
  QuickFilter,
  AddItemFormData,
  StockInFormData,
  AdjustFormData,
} from "@/types/inventory";
import type { Branch } from "@/types/branch";
import {
  loadItems,
  saveItems,
  loadLog,
  saveLog,
  generateMockItems,
  generateMockLog,
  MOCK_RECIPES,
} from "@/lib/inventoryData";
import { apiFetch } from "@/lib/auth-client";

/* ═══════════ uid helper ═══════════ */
let _pc = 0;
function uid(): string {
  _pc += 1;
  return `inv_${Date.now()}_${_pc}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ═══════════ Toast ═══════════ */
interface Toast { id: number; message: string; type: "success" | "error" | "info"; }

/* ═══════════ Page ═══════════ */
export default function InventoryPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<InvBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Data ── */
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [actLog, setActLog] = useState<ActivityEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranch, setFilterBranch] = useState<number | "all">("all");
  const [filterCategory, setFilterCategory] = useState<InvCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  /* ── Modals / drawer ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<InventoryItem | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const [stockInOpen, setStockInOpen] = useState(false);

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);

  const [usageLogOpen, setUsageLogOpen] = useState(false);
  const [simulateOpen, setSimulateOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ══════════════ Auth ══════════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") router.replace("/login");
    else setAuthorized(true);
  }, [router]);

  /* ══════════════ Fetch branches ══════════════ */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await apiFetch("/api/branches");
      if (!res.ok) throw new Error();
      const all: Branch[] = await res.json();
      setBranches(all.filter((b) => b.status === "Active").map((b) => ({ id: b.branch_id, name: b.branch_name })));
    } catch { /* silent */ } finally { setBranchesLoading(false); }
  }, []);

  useEffect(() => { if (authorized) fetchBranches(); }, [authorized, fetchBranches]);

  /* ══════════════ Load / generate data ══════════════ */
  useEffect(() => {
    if (!authorized || branchesLoading) return;
    let stored = loadItems();
    let storedLog = loadLog();
    if (stored.length === 0 && branches.length > 0) {
      stored = generateMockItems(branches);
      saveItems(stored);
      storedLog = generateMockLog(stored);
      saveLog(storedLog);
    }
    setItems(stored);
    setActLog(storedLog);
    setDataLoading(false);
  }, [authorized, branchesLoading, branches]);

  /* ── Persist helpers ── */
  const persistItems = useCallback((upd: InventoryItem[]) => { setItems(upd); saveItems(upd); }, []);
  const persistLog = useCallback((upd: ActivityEntry[]) => { setActLog(upd); saveLog(upd); }, []);

  /* ══════════════ Filtered list ══════════════ */
  const filtered = useMemo(() => {
    let list = [...items];
    if (filterBranch !== "all") list = list.filter((i) => i.branchId === filterBranch);
    if (filterCategory !== "all") list = list.filter((i) => i.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q));
    }
    switch (quickFilter) {
      case "low": list = list.filter((i) => i.inStock > 0 && i.inStock <= i.minStock); break;
      case "out": list = list.filter((i) => i.inStock === 0); break;
      case "active": list = list.filter((i) => i.status === "Active"); break;
      case "inactive": list = list.filter((i) => i.status === "Inactive"); break;
    }
    return list;
  }, [items, filterBranch, filterCategory, search, quickFilter]);

  /* ══════════════ Handlers ══════════════ */

  // --- Add / Edit ---
  const handleAddEdit = (data: AddItemFormData) => {
    const branch = branches.find((b) => b.id === Number(data.branchId));
    if (!branch) return;
    const now = Date.now();

    if (editItem) {
      const updated = items.map((it) =>
        it.id === editItem.id
          ? { ...it, name: data.name, sku: data.sku || it.sku, category: data.category as InventoryItem["category"], branchId: branch.id, branchName: branch.name, unit: data.unit as InventoryItem["unit"], inStock: Number(data.inStock), minStock: Number(data.minStock), costPerUnit: Number(data.costPerUnit), supplier: data.supplier, notes: data.notes, status: data.status, lastUpdated: now }
          : it
      );
      persistItems(updated);
      toast("Item updated successfully!", "success");
    } else {
      const newItem: InventoryItem = {
        id: uid(),
        name: data.name,
        sku: data.sku || `${(data.category || "OTH").slice(0, 3).toUpperCase()}-${String(items.length + 1).padStart(4, "0")}`,
        category: data.category as InventoryItem["category"],
        branchId: branch.id,
        branchName: branch.name,
        unit: data.unit as InventoryItem["unit"],
        inStock: Number(data.inStock),
        minStock: Number(data.minStock),
        costPerUnit: Number(data.costPerUnit),
        supplier: data.supplier,
        notes: data.notes,
        status: data.status,
        lastUpdated: now,
        createdAt: now,
      };
      persistItems([newItem, ...items]);
      toast("Item added successfully!", "success");
    }
    setAddModalOpen(false);
    setEditItem(null);
  };

  // --- Stock In ---
  const handleStockIn = (data: StockInFormData) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return;
    const now = Date.now();
    const qty = Number(data.qty);

    const updated = items.map((i) => i.id === item.id ? { ...i, inStock: i.inStock + qty, lastUpdated: now } : i);
    persistItems(updated);

    const entry: ActivityEntry = { id: uid(), itemId: item.id, itemName: item.name, branchId: item.branchId, branchName: item.branchName, type: "Stock In", qty, unit: item.unit, notes: data.invoiceNo ? `Invoice: ${data.invoiceNo}` : "", timestamp: now };
    persistLog([entry, ...actLog]);

    toast(`Received ${qty} ${item.unit} of ${item.name}`, "success");
    setStockInOpen(false);
  };

  // --- Adjust ---
  const handleAdjust = (data: AdjustFormData) => {
    if (!adjustItem) return;
    const now = Date.now();
    const qty = Number(data.qty);
    const delta = data.type === "Increase" ? qty : -qty;

    const updated = items.map((i) => i.id === adjustItem.id ? { ...i, inStock: Math.max(0, i.inStock + delta), lastUpdated: now } : i);
    persistItems(updated);

    const entry: ActivityEntry = { id: uid(), itemId: adjustItem.id, itemName: adjustItem.name, branchId: adjustItem.branchId, branchName: adjustItem.branchName, type: "Adjustment", qty, unit: adjustItem.unit, reason: data.reason || undefined, notes: `${data.type}: ${data.notes}`, timestamp: now };
    persistLog([entry, ...actLog]);

    toast(`Stock adjusted for ${adjustItem.name}`, "success");
    setAdjustOpen(false);
    setAdjustItem(null);
  };

  // --- Delete ---
  const confirmDel = () => {
    if (!deleteConfirm) return;
    persistItems(items.filter((i) => i.id !== deleteConfirm.id));
    toast("Item deleted.", "success");
    setDeleteConfirm(null);
  };

  // --- Simulate usage (from drawer) ---
  const handleSimUsage = (itemId: string, qty: number) => {
    const now = Date.now();
    const updated = items.map((i) => i.id === itemId ? { ...i, inStock: Math.max(0, i.inStock - qty), lastUpdated: now } : i);
    persistItems(updated);
    const item = items.find((i) => i.id === itemId)!;
    const entry: ActivityEntry = { id: uid(), itemId, itemName: item.name, branchId: item.branchId, branchName: item.branchName, type: "Usage", qty, unit: item.unit, notes: "Manual simulation", timestamp: now };
    persistLog([entry, ...actLog]);
    // refresh drawer item
    setDrawerItem(updated.find((i) => i.id === itemId) ?? null);
    toast(`Used ${qty} ${item.unit} of ${item.name}`, "info");
  };

  // --- Simulate Order Deduction ---
  const handleSimOrder = (branchId: number, menuItemName: string, qty: number) => {
    const recipe = MOCK_RECIPES.find((r) => r.menuItemName === menuItemName);
    if (!recipe) { toast("Recipe not found!", "error"); return; }

    const now = Date.now();
    let updatedItems = [...items];
    const newEntries: ActivityEntry[] = [];
    const warnings: string[] = [];

    for (const ing of recipe.ingredients) {
      const totalNeeded = ing.qtyPerServing * qty;
      const match = updatedItems.find((i) => i.name === ing.itemName && i.branchId === branchId && i.status === "Active");
      if (!match) { warnings.push(`${ing.itemName} not found for this branch`); continue; }
      if (match.inStock < totalNeeded) { warnings.push(`${ing.itemName}: insufficient (need ${totalNeeded.toFixed(3)}, have ${match.inStock})`); }
      const deducted = Math.min(match.inStock, totalNeeded);
      updatedItems = updatedItems.map((i) => i.id === match.id ? { ...i, inStock: Math.max(0, i.inStock - totalNeeded), lastUpdated: now } : i);
      newEntries.push({ id: uid(), itemId: match.id, itemName: match.name, branchId: match.branchId, branchName: match.branchName, type: "Order Deduction", qty: Number(deducted.toFixed(3)), unit: ing.unit, linkedOrderId: `SIM-${Date.now()}`, notes: `${menuItemName} x${qty}`, timestamp: now });
    }

    persistItems(updatedItems);
    persistLog([...newEntries, ...actLog]);

    if (warnings.length) toast(`Order deducted with warnings: ${warnings.join("; ")}`, "info");
    else toast(`Stock deducted for ${qty}x ${menuItemName}`, "success");

    setSimulateOpen(false);
  };

  // --- Export CSV ---
  const handleExport = () => {
    if (filtered.length === 0) { toast("No data to export.", "info"); return; }
    const header = "Name,SKU,Category,Branch,Unit,In Stock,Min Stock,Cost/Unit,Supplier,Status\n";
    const rows = filtered.map((i) => [
      `"${i.name}"`, i.sku, i.category, `"${i.branchName}"`, i.unit, i.inStock, i.minStock, i.costPerUnit, `"${i.supplier}"`, i.status,
    ].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "inventory_export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Exported to CSV!", "success");
  };

  /* ══════════════ Auth spinner ══════════════ */
  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
    </div>
  );

  /* ══════════════ Render ══════════════ */
  return (
    <DashboardLayout title="Inventory">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/10 flex items-center justify-center">
            <Package size={22} className="text-[#ff5a1f]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Inventory Management</h1>
            <p className="text-sm text-gray-500">Track ingredient stock, usage, and low-stock alerts across branches</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { setEditItem(null); setAddModalOpen(true); }} disabled={branches.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <PlusCircle size={15} /> Add Item
          </button>
          <button onClick={() => setStockInOpen(true)} disabled={items.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer disabled:opacity-50 transition-colors">
            <ArrowDownCircle size={15} className="rotate-180" /> Stock In
          </button>
          <button onClick={() => setUsageLogOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
            <ClipboardList size={15} /> Usage Log
          </button>
          <button onClick={() => setSimulateOpen(true)} disabled={branches.length === 0 || items.length === 0} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 cursor-pointer disabled:opacity-50 transition-colors">
            <Zap size={15} /> Simulate Order
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* No branches warning */}
      {!branchesLoading && branches.length === 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm text-amber-700">
          <AlertTriangle size={16} className="shrink-0" />
          No active branches found. Create a branch first before adding inventory items.
        </div>
      )}

      {/* ── Filters ── */}
      <InventoryFilters
        branches={branches}
        branchesLoading={branchesLoading}
        branchId={filterBranch}
        onBranchChange={setFilterBranch}
        category={filterCategory}
        onCategoryChange={setFilterCategory}
        search={search}
        onSearchChange={setSearch}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
      />

      {/* ── Stats ── */}
      <InventoryStats items={items} filtered={filtered} log={actLog} />

      {/* ── Info line ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "item" : "items"}
          {filterBranch !== "all" && <> in <span className="font-semibold text-gray-600">{branches.find((b) => b.id === filterBranch)?.name}</span></>}
        </p>
        {(filterBranch !== "all" || filterCategory !== "all" || search.trim() || quickFilter !== "all") && (
          <button onClick={() => { setFilterBranch("all"); setFilterCategory("all"); setSearch(""); setQuickFilter("all"); }} className="inline-flex items-center gap-1 text-xs text-[#ff5a1f] font-semibold hover:underline cursor-pointer">
            <XCircle size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {!dataLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={28} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700 mb-1">No inventory items found</p>
            <p className="text-sm text-gray-400">
              {items.length > 0 ? "Try adjusting your filters." : "Click \"Add Item\" to start tracking ingredients."}
            </p>
          </div>
          {items.length === 0 && branches.length > 0 && (
            <button onClick={() => { setEditItem(null); setAddModalOpen(true); }} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] shadow-sm cursor-pointer">
              <PlusCircle size={15} /> Add Item
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <InventoryTable
              items={filtered}
              loading={dataLoading}
              onView={(i) => { setDrawerItem(i); setDrawerOpen(true); }}
              onAdjust={(i) => { setAdjustItem(i); setAdjustOpen(true); }}
              onEdit={(i) => { setEditItem(i); setAddModalOpen(true); }}
              onDelete={(i) => setDeleteConfirm(i)}
            />
          </div>
          {/* Mobile cards */}
          <div className="block md:hidden">
            {dataLoading ? (
              <div className="flex items-center justify-center py-16"><Loader2 size={24} className="text-[#ff5a1f] animate-spin" /></div>
            ) : (
              <InventoryCardList
                items={filtered}
                onView={(i) => { setDrawerItem(i); setDrawerOpen(true); }}
                onAdjust={(i) => { setAdjustItem(i); setAdjustOpen(true); }}
                onEdit={(i) => { setEditItem(i); setAddModalOpen(true); }}
                onDelete={(i) => setDeleteConfirm(i)}
              />
            )}
          </div>
        </>
      )}

      {/* ══════════ Modals / Drawer ══════════ */}

      <InventoryDrawer
        isOpen={drawerOpen}
        item={drawerItem}
        log={actLog}
        onClose={() => { setDrawerOpen(false); setDrawerItem(null); }}
        onSimulateUsage={handleSimUsage}
      />

      <AddItemModal
        isOpen={addModalOpen}
        onClose={() => { setAddModalOpen(false); setEditItem(null); }}
        onSubmit={handleAddEdit}
        editItem={editItem}
        branches={branches}
        branchesLoading={branchesLoading}
      />

      <StockInModal
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
        onSubmit={handleStockIn}
        items={items}
      />

      <AdjustStockModal
        isOpen={adjustOpen}
        item={adjustItem}
        onClose={() => { setAdjustOpen(false); setAdjustItem(null); }}
        onSubmit={handleAdjust}
      />

      <UsageLogModal
        isOpen={usageLogOpen}
        onClose={() => setUsageLogOpen(false)}
        log={actLog}
        branches={branches}
      />

      <SimulateOrderModal
        isOpen={simulateOpen}
        onClose={() => setSimulateOpen(false)}
        branches={branches}
        onSimulate={handleSimOrder}
      />

      {/* ── Delete confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center"><AlertTriangle size={18} className="text-red-500" /></div>
                <h2 className="text-base font-bold text-gray-800">Delete Item</h2>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">Are you sure you want to delete <strong className="text-gray-800">&quot;{deleteConfirm.name}&quot;</strong>?</p>
              <p className="text-xs text-gray-400 mt-1.5">This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={confirmDel} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 cursor-pointer shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-in-right ${
            t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"
          }`}>
            {t.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
