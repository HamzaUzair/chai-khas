"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  RefreshCw,
  Wallet,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExpenseFilters from "@/components/expenses/ExpenseFilters";
import ExpenseSummaryCards from "@/components/expenses/ExpenseSummaryCards";
import ExpenseTable from "@/components/expenses/ExpenseTable";
import ExpenseCardList from "@/components/expenses/ExpenseCardList";
import ExpenseModal from "@/components/expenses/ExpenseModal";
import DeleteExpenseModal from "@/components/expenses/DeleteExpenseModal";
import type { Expense, ExpenseFormData, ExpenseBranch } from "@/types/expense";
import type { Branch } from "@/types/branch";
import { generateMockExpenses, nextExpenseId } from "@/lib/expensesData";

/* ═══════════ localStorage persistence ═══════════ */
const LS_KEY = "pos_expenses";

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExpenses(data: Expense[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

/* ═══════════ Toast helper type ═══════════ */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

/* ═══════════ Page component ═══════════ */
export default function ExpensesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<ExpenseBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Expenses ── */
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  /* ── Modals ── */
  const [addEditOpen, setAddEditOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);

  /* ── Toasts ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
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

  /* ══════════════ Load / generate mock expenses ══════════════ */
  useEffect(() => {
    if (!authorized || branchesLoading) return;

    let stored = loadExpenses();
    if (stored.length === 0 && branches.length > 0) {
      stored = generateMockExpenses(branches);
      saveExpenses(stored);
    }
    setExpenses(stored);
    setDataLoading(false);
  }, [authorized, branchesLoading, branches]);

  /* ── Persist helper ── */
  const persist = useCallback((updated: Expense[]) => {
    setExpenses(updated);
    saveExpenses(updated);
  }, []);

  /* ══════════════ Filtered expenses ══════════════ */
  const filtered = useMemo(() => {
    let list = [...expenses];

    if (filterBranchId !== "all") {
      list = list.filter((e) => e.branchId === filterBranchId);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          String(e.id).includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.branchName.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [expenses, filterBranchId, search]);

  /* ══════════════ Handlers ══════════════ */

  const handleRefresh = () => {
    setDataLoading(true);
    setTimeout(() => {
      const stored = loadExpenses();
      setExpenses(stored);
      setDataLoading(false);
      pushToast("Expenses refreshed!", "info");
    }, 300);
  };

  /* ── Add / Edit ── */
  const openAdd = () => {
    setEditExpense(null);
    setAddEditOpen(true);
  };

  const openEdit = (exp: Expense) => {
    setEditExpense(exp);
    setAddEditOpen(true);
  };

  const handleSubmit = (data: ExpenseFormData) => {
    const branch = branches.find((b) => b.id === Number(data.branchId));
    if (!branch) return;

    if (editExpense) {
      // Update
      const updated = expenses.map((e) =>
        e.id === editExpense.id
          ? {
              ...e,
              title: data.title,
              description: data.description,
              category: data.category as Expense["category"],
              branchId: branch.id,
              branchName: branch.name,
              amount: Number(data.amount),
              paymentMethod: data.paymentMethod as Expense["paymentMethod"],
              date: data.date,
              status: data.status,
            }
          : e
      );
      persist(updated);
      pushToast("Expense updated successfully!", "success");
    } else {
      // Create
      const newExp: Expense = {
        id: nextExpenseId(expenses),
        title: data.title,
        description: data.description,
        category: data.category as Expense["category"],
        branchId: branch.id,
        branchName: branch.name,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod as Expense["paymentMethod"],
        date: data.date,
        addedBy: "Admin",
        status: data.status,
        createdAt: Date.now(),
      };
      persist([newExp, ...expenses]);
      pushToast("Expense created successfully!", "success");
    }

    setAddEditOpen(false);
    setEditExpense(null);
  };

  /* ── Delete ── */
  const openDelete = (exp: Expense) => {
    setDeleteExpense(exp);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteExpense) return;
    persist(expenses.filter((e) => e.id !== deleteExpense.id));
    pushToast("Expense deleted.", "success");
    setDeleteOpen(false);
    setDeleteExpense(null);
  };

  /* ══════════════ Auth spinner ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Expenses">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff5a1f]/10 flex items-center justify-center">
            <Wallet size={22} className="text-[#ff5a1f]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Expense Management</h1>
            <p className="text-sm text-gray-500">
              Manage and track operational expenses across branches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
          <button
            onClick={openAdd}
            disabled={branches.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle size={15} />
            Add Expense
          </button>
        </div>
      </div>

      {/* ── No branches warning ── */}
      {!branchesLoading && branches.length === 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 mb-6 text-sm text-amber-700">
          <AlertTriangle size={16} className="shrink-0" />
          No active branches found. Please create an active branch first to add expenses.
        </div>
      )}

      {/* ── Filters ── */}
      <ExpenseFilters
        branches={branches}
        branchesLoading={branchesLoading}
        branchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        search={search}
        onSearchChange={setSearch}
      />

      {/* ── Summary cards ── */}
      <ExpenseSummaryCards allExpenses={expenses} filteredExpenses={filtered} />

      {/* ── Info line ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "expense" : "expenses"}
          {filterBranchId !== "all" && (
            <>
              {" "}
              in{" "}
              <span className="font-semibold text-gray-600">
                {branches.find((b) => b.id === filterBranchId)?.name}
              </span>
            </>
          )}
          {search.trim() && (
            <>
              {" "}
              matching{" "}
              <span className="font-semibold text-gray-600">&quot;{search}&quot;</span>
            </>
          )}
        </p>
        {(filterBranchId !== "all" || search.trim()) && (
          <button
            onClick={() => {
              setFilterBranchId("all");
              setSearch("");
            }}
            className="inline-flex items-center gap-1 text-xs text-[#ff5a1f] font-semibold hover:underline cursor-pointer"
          >
            <XCircle size={13} />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Empty state ── */}
      {!dataLoading && filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Wallet size={28} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700 mb-1">No expenses found</p>
            <p className="text-sm text-gray-400">
              {expenses.length > 0
                ? "Try adjusting your filters or search term."
                : "Click \"Add Expense\" to create your first entry."}
            </p>
          </div>
          {expenses.length === 0 && branches.length > 0 && (
            <button
              onClick={openAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle size={15} />
              Add Expense
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <ExpenseTable
              expenses={filtered}
              loading={dataLoading}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>
          {/* Mobile card list */}
          <div className="block md:hidden">
            {dataLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="text-[#ff5a1f] animate-spin" />
              </div>
            ) : (
              <ExpenseCardList
                expenses={filtered}
                onEdit={openEdit}
                onDelete={openDelete}
              />
            )}
          </div>
        </>
      )}

      {/* ── Add/Edit modal ── */}
      <ExpenseModal
        isOpen={addEditOpen}
        onClose={() => {
          setAddEditOpen(false);
          setEditExpense(null);
        }}
        onSubmit={handleSubmit}
        editExpense={editExpense}
        branches={branches}
        branchesLoading={branchesLoading}
      />

      {/* ── Delete modal ── */}
      <DeleteExpenseModal
        isOpen={deleteOpen}
        expense={deleteExpense}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteExpense(null);
        }}
        onConfirm={confirmDelete}
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
