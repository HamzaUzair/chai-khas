"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  ArrowDownToLine,
  ClipboardList,
  FileDown,
  RefreshCw,
  Zap,
  Package,
  Loader2,
  XCircle,
  AlertTriangle,
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
import DeleteItemModal from "@/components/inventory/DeleteItemModal";
import type {
  InventoryItem,
  InventoryItemFormData,
  InventoryActivity,
  StockInFormData,
  AdjustStockFormData,
  InvBranch,
  InvCategory,
  QuickFilter,
} from "@/types/inventory";
import type { Branch } from "@/types/branch";
import {
  loadItems,
  saveItems,
  loadLog,
  saveLog,
  generateMockItems,
  generateMockLog,
  getStockStatus,
  RECIPES,
} from "@/lib/inventoryData";

/* ═══════ Toast ═══════ */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

/* ═══════ uid helper ═══════ */
let _ctr = 0;
function uid() {
  _ctr += 1;
  return `inv_p_${Date.now()}_${_ctr}_${Math.floor(Math.random() * 10000)}`;
}

export default function InventoryPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<InvBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Data ── */
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [actLog, setActLog] = useState<InventoryActivity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [filterCategory, setFilterCategory] = useState<InvCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");

  /* ── Modals & drawers ── */
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [usageLogOpen, setUsageLogOpen] = useState(false);
  const [simulateOpen, setSimulateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerItem, setDrawerItem] = useState<InventoryItem | null>(null);

  /* ── Toasts ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  /* ═══════ Persist helpers ═══════ */
  const persistItems = useCallback((updated: InventoryItem[]) => {
    setItems(updated);
    saveItems(updated);
  }, []);

  const persistLog = useCallback((updated: InventoryActivity[]) => {
    setActLog(updated);
    saveLog(updated);
  }, []);

  /* ═══════ Auth guard ═══════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ═══════ Fetch branches ═══════ */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await fetch("/api/branches");
      if (!res.ok) throw new Error();
      const all: Branch[] = await res.json();
      const active = all
        .filter((b) => b.status === "Active")
        .map((b) => ({ id: b.branch_id, name: b.branch_name }));
      setBranches(active);
    } catch {
      // silent
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) fetchBranches();
  }, [authorized, fetchBranches]);

  /* ═══════ Load / generate data ═══════ */
  useEffect(() => {
    if (!authorized || branchesLoading) return;

    let storedItems = loadItems();
    let storedLog = loadLog();

    if (storedItems.length === 0 && branches.length > 0) {
      storedItems = generateMockItems(branches);
      saveItems(storedItems);
    }
    if (storedLog.length === 0 && storedItems.length > 0) {
      storedLog = generateMockLog(storedItems);
      saveLog(storedLog);
    }

    setItems(storedItems);
    setActLog(storedLog);
    setDataLoading(false);
  }, [authorized, branchesLoading, branches]);

  /* ═══════ Filtered items ═══════ */
  const filtered = useMemo(() => {
    let list = [...items];

    if (filterBranchId !== "all") list = list.filter((i) => i.branchId === filterBranchId);
    if (filterCategory !== "all") list = list.filter((i) => i.category === filterCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.supplier.toLowerCase().includes(q) ||
          i.branchName.toLowerCase().includes(q)
      );
    }

    switch (quickFilter) {
      case "low":
        list = list.filter((i) => getStockStatus(i) === "low");
        break;
      case "out":
        list = list.filter((i) => getStockStatus(i) === "out");
        break;
      case "active":
        list = list.filter((i) => i.status === "Active");
        break;
      case "inactive":
        list = list.filter((i) => i.status === "Inactive");
        break;
    }

    return list;
  }, [items, filterBranchId, filterCategory, search, quickFilter]);

  /* ═══════ Auto-SKU ═══════ */
  const autoSku = useMemo(() => `SKU-${items.length + 1}`.padStart(8, "0"), [items.length]);

  /* ═══════ Handlers ═══════ */

  const handleRefresh = () => {
    setDataLoading(true);
    setTimeout(() => {
      setItems(loadItems());
      setActLog(loadLog());
      setDataLoading(false);
      pushToast("Inventory refreshed!", "info");
    }, 300);
  };

  /* ── Add / Edit item ── */
  const openAdd = () => { setEditItem(null); setAddEditOpen(true); };
  const openEdit = (item: InventoryItem) => { setEditItem(item); setAddEditOpen(true); };

  const handleAddEditSubmit = (data: InventoryItemFormData) => {
    const branch = branches.find((b) => b.id === Number(data.branchId));
    if (!branch) return;

    if (editItem) {
      const updated = items.map((i) =>
        i.id === editItem.id
          ? {
              ...i,
              name: data.name,
              sku: data.sku || i.sku,
              category: data.category as InventoryItem["category"],
              branchId: branch.id,
              branchName: branch.name,
              unit: data.unit as InventoryItem["unit"],
              stock: Number(data.stock),
              minStock: Number(data.minStock),
              costPerUnit: Number(data.costPerUnit),
              supplier: data.supplier,
              notes: data.notes,
              status: data.status,
              updatedAt: Date.now(),
            }
          : i
      );
      persistItems(updated);
      pushToast("Item updated!", "success");
    } else {
      const newItem: InventoryItem = {
        id: uid(),
        name: data.name,
        sku: data.sku || autoSku,
        category: data.category as InventoryItem["category"],
        branchId: branch.id,
        branchName: branch.name,
        unit: data.unit as InventoryItem["unit"],
        stock: Number(data.stock),
        minStock: Number(data.minStock),
        costPerUnit: Number(data.costPerUnit),
        supplier: data.supplier,
        notes: data.notes,
        status: data.status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      persistItems([newItem, ...items]);
      pushToast("Item added!", "success");
    }
    setAddEditOpen(false);
    setEditItem(null);
  };

  /* ── Stock In ── */
  const handleStockIn = (data: StockInFormData) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return;

    const qty = Number(data.qty);
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, stock: i.stock + qty, updatedAt: Date.now() } : i
    );
    persistItems(updated);

    const entry: InventoryActivity = {
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      branchId: item.branchId,
      branchName: item.branchName,
      type: "Stock In",
      qty,
      unit: item.unit,
      notes: data.supplier ? `Supplier: ${data.supplier}` : "",
      createdAt: Date.now(),
    };
    persistLog([entry, ...actLog]);
    pushToast(`+${qty} ${item.unit} of ${item.name} received!`, "success");
    setStockInOpen(false);
  };

  /* ── Adjust stock ── */
  const openAdjust = (item: InventoryItem) => { setAdjustItem(item); setAdjustOpen(true); };
  const handleAdjust = (item: InventoryItem, data: AdjustStockFormData) => {
    const qty = Number(data.qty);
    const delta = data.type === "Increase" ? qty : -qty;
    const updated = items.map((i) =>
      i.id === item.id
        ? { ...i, stock: Math.max(0, i.stock + delta), updatedAt: Date.now() }
        : i
    );
    persistItems(updated);

    const entry: InventoryActivity = {
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      branchId: item.branchId,
      branchName: item.branchName,
      type: "Adjustment",
      qty: delta,
      unit: item.unit,
      notes: `${data.reason}${data.notes ? ": " + data.notes : ""}`,
      createdAt: Date.now(),
    };
    persistLog([entry, ...actLog]);
    pushToast(`Stock adjusted for ${item.name}`, "success");
    setAdjustOpen(false);
    setAdjustItem(null);
  };

  /* ── View drawer ── */
  const openView = (item: InventoryItem) => { setDrawerItem(item); setDrawerOpen(true); };
  const handleSimulateUsageDrawer = (item: InventoryItem, qty: number) => {
    const updated = items.map((i) =>
      i.id === item.id ? { ...i, stock: Math.max(0, i.stock - qty), updatedAt: Date.now() } : i
    );
    persistItems(updated);

    const entry: InventoryActivity = {
      id: uid(),
      itemId: item.id,
      itemName: item.name,
      branchId: item.branchId,
      branchName: item.branchName,
      type: "Simulated Usage",
      qty: -qty,
      unit: item.unit,
      notes: "Simulated from drawer",
      createdAt: Date.now(),
    };
    persistLog([entry, ...actLog]);

    // Update drawer item reference
    const refreshed = updated.find((i) => i.id === item.id);
    if (refreshed) setDrawerItem(refreshed);
    pushToast(`Simulated usage: -${qty} ${item.unit} of ${item.name}`, "info");
  };

  /* ── Delete ── */
  const openDelete = (item: InventoryItem) => { setDeleteItem(item); setDeleteOpen(true); };
  const confirmDelete = () => {
    if (!deleteItem) return;
    persistItems(items.filter((i) => i.id !== deleteItem.id));
    persistLog(actLog.filter((l) => l.itemId !== deleteItem.id));
    pushToast(`${deleteItem.name} deleted.`, "success");
    setDeleteOpen(false);
    setDeleteItem(null);
  };

  /* ── Simulate order deduction ── */
  const handleSimulateOrder = (branchId: number, recipeName: string, qty: number) => {
    const recipe = RECIPES.find((r) => r.menuItemName === recipeName);
    if (!recipe) return;

    const updatedItems = [...items];
    const newLogEntries: InventoryActivity[] = [];

    for (const ing of recipe.ingredients) {
      const deductQty = ing.qty * qty;
      // Find matching item in that branch
      const idx = updatedItems.findIndex(
        (i) => i.branchId === branchId && i.name.toLowerCase() === ing.itemName.toLowerCase()
      );
      if (idx !== -1) {
        updatedItems[idx] = {
          ...updatedItems[idx],
          stock: Math.max(0, updatedItems[idx].stock - deductQty),
          updatedAt: Date.now(),
        };
        newLogEntries.push({
          id: uid(),
          itemId: updatedItems[idx].id,
          itemName: updatedItems[idx].name,
          branchId: updatedItems[idx].branchId,
          branchName: updatedItems[idx].branchName,
          type: "Order Usage",
          qty: -deductQty,
          unit: ing.unit,
          orderId: `SIM-${Math.floor(Math.random() * 10000)}`,
          notes: `Simulated: ${qty}x ${recipeName}`,
          createdAt: Date.now(),
        });
      }
    }

    persistItems(updatedItems);
    persistLog([...newLogEntries, ...actLog]);
    pushToast(`Deducted stock for ${qty}x ${recipeName}!`, "success");
    setSimulateOpen(false);
  };

  /* ── Export CSV ── */
  const handleExport = () => {
    if (filtered.length === 0) { pushToast("No data to export.", "info"); return; }
    const rows = [
      ["Name", "SKU", "Category", "Branch", "Unit", "Stock", "Min Stock", "Cost/Unit", "Status", "Supplier"].join(","),
      ...filtered.map((i) =>
        [
          `"${i.name}"`, `"${i.sku}"`, `"${i.category}"`, `"${i.branchName}"`,
          i.unit, i.stock, i.minStock, i.costPerUnit, `"${i.status}"`, `"${i.supplier}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory_export.csv";
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Inventory exported to CSV!", "success");
  };

  /* ═══════ Auth spinner ═══════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

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
            <p className="text-sm text-gray-500">
              Track ingredient stock, usage, and low-stock alerts across branches
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAdd}
            disabled={branches.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} /> Add Item
          </button>
          <button
            onClick={() => setStockInOpen(true)}
            disabled={items.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine size={15} /> Stock In
          </button>
          <button
            onClick={() => setUsageLogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ClipboardList size={15} /> Usage Log
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FileDown size={15} /> Export
          </button>
          <button
            onClick={() => setSimulateOpen(true)}
            disabled={branches.length === 0 || items.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Simulate an order to demo auto-deduction"
          >
            <Zap size={15} /> Simulate Order
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ── No branches warning ── */}
      {!branchesLoading && branches.length === 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm text-amber-700">
          <AlertTriangle size={16} className="shrink-0" />
          No active branches found. Please create an active branch first to manage inventory.
        </div>
      )}

      {/* ── Filters ── */}
      <InventoryFilters
        branches={branches}
        branchesLoading={branchesLoading}
        branchId={filterBranchId}
        onBranchChange={setFilterBranchId}
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
          Showing{" "}
          <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "item" : "items"}
          {filterBranchId !== "all" && (
            <> in <span className="font-semibold text-gray-600">{branches.find((b) => b.id === filterBranchId)?.name}</span></>
          )}
          {filterCategory !== "all" && (
            <> · <span className="font-semibold text-gray-600">{filterCategory}</span></>
          )}
        </p>
        {(filterBranchId !== "all" || filterCategory !== "all" || search.trim() || quickFilter !== "all") && (
          <button
            onClick={() => {
              setFilterBranchId("all");
              setFilterCategory("all");
              setSearch("");
              setQuickFilter("all");
            }}
            className="inline-flex items-center gap-1 text-xs text-[#ff5a1f] font-semibold hover:underline cursor-pointer"
          >
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
              {items.length > 0
                ? "Try adjusting your filters or search term."
                : "Click \"Add Item\" to start tracking stock."}
            </p>
          </div>
          {items.length === 0 && branches.length > 0 && (
            <button
              onClick={openAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle size={15} /> Add Item
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block">
            <InventoryTable
              items={filtered}
              loading={dataLoading}
              onView={openView}
              onAdjust={openAdjust}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>
          {/* Mobile/Tablet card list */}
          <div className="block lg:hidden">
            {dataLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="text-[#ff5a1f] animate-spin" />
              </div>
            ) : (
              <InventoryCardList
                items={filtered}
                onView={openView}
                onAdjust={openAdjust}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            )}
          </div>
        </>
      )}

      {/* ═══════ Modals / Drawer ═══════ */}

      <AddItemModal
        isOpen={addEditOpen}
        onClose={() => { setAddEditOpen(false); setEditItem(null); }}
        onSubmit={handleAddEditSubmit}
        editItem={editItem}
        branches={branches}
        branchesLoading={branchesLoading}
        autoSku={autoSku}
      />

      <StockInModal
        isOpen={stockInOpen}
        onClose={() => setStockInOpen(false)}
        onSubmit={handleStockIn}
        items={items}
        branches={branches}
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
        onSubmit={handleSimulateOrder}
        branches={branches}
      />

      <DeleteItemModal
        isOpen={deleteOpen}
        item={deleteItem}
        onClose={() => { setDeleteOpen(false); setDeleteItem(null); }}
        onConfirm={confirmDelete}
      />

      <InventoryDrawer
        isOpen={drawerOpen}
        item={drawerItem}
        log={actLog}
        onClose={() => { setDrawerOpen(false); setDrawerItem(null); }}
        onSimulateUsage={handleSimulateUsageDrawer}
      />

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-slide-in-right ${
              t.type === "success"
                ? "bg-green-600"
                : t.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
