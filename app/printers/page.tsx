"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Printer as PrinterIcon, Activity, WifiOff, ChefHat } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PrinterToolbar, { type PrinterStatusFilter } from "@/components/printers/PrinterToolbar";
import PrinterTable from "@/components/printers/PrinterTable";
import PrinterModal from "@/components/printers/PrinterModal";
import DeletePrinterModal from "@/components/printers/DeletePrinterModal";
import type { Branch } from "@/types/branch";
import type { Printer, PrinterFormData, PrinterPurpose } from "@/types/printer";
import { MOCK_PRINTERS } from "@/lib/printersData";
import { apiFetch } from "@/lib/auth-client";

function defaultPurposesForType(type: Printer["type"]): PrinterPurpose[] {
  const map: Record<Printer["type"], PrinterPurpose[]> = {
    receipt: ["receipts"],
    kitchen: ["kitchen_orders"],
    bar: ["drinks_orders"],
    invoice: ["invoices"],
    token: ["tokens"],
    refund: ["refunds"],
  };
  return map[type] ?? [];
}

/* ── Toast type for Test Print ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

export default function PrintersPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches from API ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Printers (mock state — replace with API when ready) ── */
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printersLoading, setPrintersLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<PrinterStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ── Modals ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  /* ══════════════ Auth guard ══════════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ══════════════ Fetch branches ══════════════ */
  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await apiFetch("/api/branches");
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

  /* ══════════════ Load printers (mock — replace with API) ══════════════ */
  useEffect(() => {
    if (!authorized) return;
    setPrintersLoading(true);
    // Simulate load; in future: fetch("/api/printers")
    setTimeout(() => {
      setPrinters([...MOCK_PRINTERS]);
      setPrintersLoading(false);
    }, 300);
  }, [authorized]);

  /* ══════════════ Debounce search ══════════════ */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  /* ══════════════ Filtered printers ══════════════ */
  const filteredPrinters = useMemo(() => {
    let result = printers;
    if (filterBranchId !== "all") result = result.filter((p) => p.branchId === filterBranchId);
    if (filterType !== "all") result = result.filter((p) => p.type === filterType);
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.branchName.toLowerCase().includes(q) ||
          p.assignedArea.toLowerCase().includes(q) ||
          (p.ipAddress && p.ipAddress.includes(q))
      );
    }
    return result;
  }, [printers, filterBranchId, filterType, statusFilter, debouncedSearch]);

  /* ══════════════ Stats ══════════════ */
  const stats = useMemo(() => {
    const byBranch =
      filterBranchId === "all"
        ? printers
        : printers.filter((p) => p.branchId === filterBranchId);
    return {
      total: byBranch.length,
      active: byBranch.filter((p) => p.status === "active").length,
      offline: byBranch.filter((p) => p.status === "offline").length,
      kitchen: byBranch.filter((p) => p.type === "kitchen").length,
    };
  }, [printers, filterBranchId]);

  /* ══════════════ CRUD handlers (mock — replace with API) ══════════════ */
  const openAdd = () => {
    setEditingPrinter(null);
    setModalOpen(true);
  };

  const openEdit = (p: Printer) => {
    setEditingPrinter(p);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPrinter(null);
  };

  const handleSave = (data: PrinterFormData) => {
    const branchId = Number(data.branchId);
    const branch = branches.find((b) => b.branch_id === branchId);

    if (editingPrinter) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === editingPrinter.id
            ? {
                ...p,
                name: data.name.trim(),
                type: data.type,
                branchId,
                branchName: branch?.branch_name ?? "",
                assignedArea: data.assignedArea.trim(),
                connectionType: data.connectionType,
                ipAddress: data.ipAddress.trim() || undefined,
                port: data.port ? parseInt(data.port, 10) : undefined,
                usbPort: data.usbPort.trim() || undefined,
                paperSize: data.paperSize,
                status: data.status,
                autoPrintReceipts: data.autoPrintReceipts,
                autoPrintKitchenTickets: data.autoPrintKitchenTickets,
                autoPrintInvoices: data.autoPrintInvoices,
              }
            : p
        )
      );
    } else {
      const newPrinter: Printer = {
        id: `p-${Date.now()}`,
        name: data.name.trim(),
        type: data.type,
        branchId,
        branchName: branch?.branch_name ?? "",
        assignedArea: data.assignedArea.trim(),
        connectionType: data.connectionType,
        ipAddress: data.ipAddress.trim() || undefined,
        port: data.port ? parseInt(data.port, 10) : undefined,
        usbPort: data.usbPort.trim() || undefined,
        paperSize: data.paperSize,
        status: data.status,
        assignedPurposes: defaultPurposesForType(data.type),
        autoPrintReceipts: data.autoPrintReceipts,
        autoPrintKitchenTickets: data.autoPrintKitchenTickets,
        autoPrintInvoices: data.autoPrintInvoices,
      };
      setPrinters((prev) => [newPrinter, ...prev]);
    }
    closeModal();
  };

  const openDelete = (p: Printer) => {
    setPrinterToDelete(p);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!printerToDelete) return;
    setDeleting(true);
    setPrinters((prev) => prev.filter((p) => p.id !== printerToDelete.id));
    setDeleting(false);
    setPrinterToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleTestPrint = (p: Printer) => {
    showToast(`Test print sent to "${p.name}"`, "success");
  };

  /* ══════════════ Loading ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const noBranches = !branchesLoading && branches.length === 0;

  const statCards = [
    { label: "Total Printers", value: stats.total, icon: <PrinterIcon size={20} />, bg: "bg-[#ff5a1f]/10", color: "text-[#ff5a1f]" },
    { label: "Active Printers", value: stats.active, icon: <Activity size={20} />, bg: "bg-green-50", color: "text-green-600" },
    { label: "Offline Printers", value: stats.offline, icon: <WifiOff size={20} />, bg: "bg-amber-50", color: "text-amber-600" },
    { label: "Kitchen Printers", value: stats.kitchen, icon: <ChefHat size={20} />, bg: "bg-blue-50", color: "text-blue-600" },
  ];

  return (
    <DashboardLayout title="Printers">
      {/* ── Header Card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Printers Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage receipt, kitchen, and order printers across branches
            </p>
          </div>
          <button
            onClick={openAdd}
            disabled={noBranches}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={18} />
            + Add Printer
          </button>
        </div>
        {noBranches && (
          <p className="text-xs text-red-500 mt-2">
            Create an active branch first to add printers.
          </p>
        )}

        {/* Stats row */}
        {!branchesLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80"
              >
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <PrinterToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        filterType={filterType}
        onTypeChange={setFilterType}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* ── Table ── */}
      <PrinterTable
        printers={filteredPrinters}
        loading={printersLoading}
        onEdit={openEdit}
        onDelete={openDelete}
        onTestPrint={handleTestPrint}
      />

      {/* ── Add/Edit Modal ── */}
      <PrinterModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        editPrinter={editingPrinter}
        activeBranches={branches}
        branchesLoading={branchesLoading}
      />

      {/* ── Delete Modal ── */}
      <DeletePrinterModal
        isOpen={deleteModalOpen}
        printer={printerToDelete}
        onClose={() => {
          setDeleteModalOpen(false);
          setPrinterToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
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
