"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  RefreshCw,
  DoorOpen,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HallsToolbar from "@/components/halls/HallsToolbar";
import HallsStats from "@/components/halls/HallsStats";
import HallsTable from "@/components/halls/HallsTable";
import HallCardList from "@/components/halls/HallCardList";
import HallModal from "@/components/halls/HallModal";
import type { Branch } from "@/types/branch";
import type { Hall, HallFormData } from "@/types/hall";
import {
  getHalls,
  setHalls,
  nextHallId,
  generateDemoHalls,
} from "@/lib/hallsStorage";

/* ── tiny toast ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function HallsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Halls ── */
  const [halls, setHallsState] = useState<Hall[]>([]);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  /* ── Modal ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /* ══════════════ Persist helper ══════════════ */
  const persist = useCallback(
    (updated: Hall[]) => {
      setHallsState(updated);
      setHalls(updated);
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

  /* ══════════════ Load / seed localStorage ══════════════ */
  const loadHalls = useCallback(() => {
    let stored = getHalls();
    if (stored.length === 0) {
      const seedBranches =
        branches.length > 0
          ? branches.map((b) => ({ branchId: b.branch_id, branchName: b.branch_name }))
          : [{ branchId: 0, branchName: "Main Branch" }];
      stored = generateDemoHalls(seedBranches);
      setHalls(stored);
    }
    setHallsState(stored);
  }, [branches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadHalls();
  }, [authorized, branchesLoading, loadHalls]);

  /* ══════════════ Filtered halls ══════════════ */
  const filtered = useMemo(() => {
    let list = halls;
    if (filterBranchId !== "all") {
      list = list.filter((h) => h.branchId === filterBranchId);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          String(h.hallId).includes(q) ||
          String(h.capacity).includes(q)
      );
    }
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [halls, filterBranchId, search]);

  /* ══════════════ CRUD handlers ══════════════ */
  const openCreate = () => {
    setEditingHall(null);
    setModalOpen(true);
  };

  const openEdit = (hall: Hall) => {
    setEditingHall(hall);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingHall(null);
  };

  const handleSubmit = (data: HallFormData) => {
    const branch = branches.find((b) => b.branch_id === Number(data.branchId));
    const branchName = branch ? branch.branch_name : "Main Branch";
    const now = Date.now();

    if (editingHall) {
      const updated = halls.map((h) =>
        h.id === editingHall.id
          ? {
              ...h,
              name: data.name.trim(),
              capacity: Math.max(0, Number(data.capacity) || 0),
              terminal: Math.max(1, Number(data.terminal) || 1),
              branchId: Number(data.branchId),
              branchName,
              updatedAt: now,
            }
          : h
      );
      persist(updated);
      pushToast(`Hall "${data.name.trim()}" updated successfully.`);
    } else {
      const newHall: Hall = {
        id: crypto.randomUUID(),
        hallId: nextHallId(halls),
        name: data.name.trim(),
        capacity: Math.max(0, Number(data.capacity) || 0),
        terminal: Math.max(1, Number(data.terminal) || 1),
        branchId: Number(data.branchId),
        branchName,
        createdAt: now,
        updatedAt: now,
      };
      persist([newHall, ...halls]);
      pushToast(`Hall "${data.name.trim()}" created successfully.`);
    }
    closeModal();
  };

  const handleDelete = (hall: Hall) => {
    if (!window.confirm(`Delete hall "${hall.name}"? This cannot be undone.`)) return;
    persist(halls.filter((h) => h.id !== hall.id));
    pushToast(`Hall "${hall.name}" deleted.`, "error");
  };

  /* ══════════════ Auth loading ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const noBranches = !branchesLoading && branches.length === 0;

  return (
    <DashboardLayout title="Halls">
      {/* ── Toast container ── */}
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
            {t.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {t.message}
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="ml-1 p-0.5 rounded hover:bg-black/5 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Hall Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage restaurant halls and their capacity across all branches
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadHalls}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              onClick={openCreate}
              disabled={noBranches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle size={16} />
              + Add Hall
            </button>
          </div>
        </div>
      </div>

      {/* ── No-branch warning ── */}
      {noBranches && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-5 py-3.5 mb-6 text-sm">
          <AlertTriangle size={18} className="shrink-0" />
          <p>
            <span className="font-semibold">No branches available.</span> Please
            create a branch first before adding halls.
          </p>
        </div>
      )}

      {/* ── Toolbar ── */}
      <HallsToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        search={search}
        onSearchChange={setSearch}
      />

      {/* ── Stats ── */}
      <HallsStats
        totalHalls={halls.length}
        filteredCount={filtered.length}
        terminalMode={1}
      />

      {/* ── Content ── */}
      {!branchesLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <DoorOpen size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              {halls.length === 0
                ? "No halls yet. Start by adding your first hall."
                : "No halls match your current filters."}
            </p>
            {halls.length === 0 && !noBranches && (
              <button
                onClick={openCreate}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
              >
                <PlusCircle size={16} />
                Add your first hall
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <HallsTable
              halls={filtered}
              loading={branchesLoading}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
          {/* Mobile cards */}
          <div className="md:hidden">
            <HallCardList
              halls={filtered}
              loading={branchesLoading}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {/* ── Modal ── */}
      <HallModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editHall={editingHall}
        activeBranches={branches}
        branchesLoading={branchesLoading}
        preSelectedBranchId={filterBranchId}
      />
    </DashboardLayout>
  );
}
