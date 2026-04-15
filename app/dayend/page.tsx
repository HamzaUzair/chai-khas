"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DayEndToolbar, { type DayEndStatusFilter } from "@/components/dayend/DayEndToolbar";
import DayStatusCard from "@/components/dayend/DayStatusCard";
import SummaryStats from "@/components/dayend/SummaryStats";
import PaymentBreakdown from "@/components/dayend/PaymentBreakdown";
import ExpenseSummary from "@/components/dayend/ExpenseSummary";
import NetCalculation from "@/components/dayend/NetCalculation";
import TopSellingItems from "@/components/dayend/TopSellingItems";
import HourlySales from "@/components/dayend/HourlySales";
import CloseDayModal from "@/components/dayend/CloseDayModal";
import DayEndHistoryTable from "@/components/dayend/DayEndHistoryTable";
import type { Branch } from "@/types/branch";
import type {
  DayEndSummary,
  DayEndStats,
  PaymentBreakdown as PaymentBreakdownType,
  ExpenseEntry,
  TopSellingItem,
  HourlySales as HourlySalesType,
  DayEndRecord,
} from "@/types/dayend";
import {
  MOCK_DAY_END_SUMMARY,
  MOCK_DAY_END_STATS,
  MOCK_PAYMENT_BREAKDOWN,
  MOCK_EXPENSE_ENTRIES,
  MOCK_TOP_SELLING_ITEMS,
  MOCK_HOURLY_SALES,
  MOCK_DAY_END_HISTORY,
} from "@/lib/dayendData";

/* ── Toast ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "info" | "error";
}

export default function DayEndPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Day End data (mock — replace with API) ── */
  const [summary, setSummary] = useState<DayEndSummary>(MOCK_DAY_END_SUMMARY);
  const [stats, setStats] = useState<DayEndStats>(MOCK_DAY_END_STATS);
  const [payments, setPayments] = useState<PaymentBreakdownType[]>(MOCK_PAYMENT_BREAKDOWN);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(MOCK_EXPENSE_ENTRIES);
  const [topItems, setTopItems] = useState<TopSellingItem[]>(MOCK_TOP_SELLING_ITEMS);
  const [hourlySales, setHourlySales] = useState<HourlySalesType[]>(MOCK_HOURLY_SALES);
  const [history, setHistory] = useState<DayEndRecord[]>(MOCK_DAY_END_HISTORY);
  const [dataLoading, setDataLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [statusFilter, setStatusFilter] = useState<DayEndStatusFilter>("all");

  /* ── Modals ── */
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  /* ── Toasts ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

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

  /* ══════════════ Load day end data (mock — replace with API) ══════════════ */
  const loadDayEndData = useCallback(() => {
    setDataLoading(true);
    // Simulate API: fetch(`/api/dayend?branch_id=${branchId}&date=${date}`)
    setTimeout(() => {
      const branchId = filterBranchId === "all" ? branches[0]?.branch_id : filterBranchId;
      const branch = branches.find((b) => b.branch_id === branchId);
      if (branch) {
        setSummary({
          ...MOCK_DAY_END_SUMMARY,
          branchId: branch.branch_id,
          branchName: branch.branch_name,
          businessDate: selectedDate,
        });
      }
      setStats(MOCK_DAY_END_STATS);
      setPayments(MOCK_PAYMENT_BREAKDOWN);
      setExpenses(MOCK_EXPENSE_ENTRIES);
      setTopItems(MOCK_TOP_SELLING_ITEMS);
      setHourlySales(MOCK_HOURLY_SALES);
      setDataLoading(false);
    }, 400);
  }, [filterBranchId, selectedDate, branches]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    loadDayEndData();
  }, [authorized, branchesLoading, loadDayEndData]);

  /* ══════════════ Filtered history ══════════════ */
  const filteredHistory = useMemo(() => {
    let result = history;
    if (filterBranchId !== "all") {
      result = result.filter((r) => r.branchId === filterBranchId);
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [history, filterBranchId, statusFilter]);

  /* ══════════════ Handlers ══════════════ */
  const handleCloseDay = () => {
    setCloseModalOpen(true);
  };

  const handleCloseDayConfirm = () => {
    setClosing(true);
    // Mock: update summary to closed
    setTimeout(() => {
      setSummary((p) => ({
        ...p,
        status: "closed",
        closedBy: "Admin",
        closedAt: new Date().toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }),
      }));
      setClosing(false);
      setCloseModalOpen(false);
      showToast("Day closed successfully", "success");
      // Add to history
      setHistory((prev) => [
        {
          id: `de-${Date.now()}`,
          date: selectedDate,
          branchName: summary.branchName,
          branchId: summary.branchId,
          totalSales: stats.totalRevenue,
          totalExpenses: stats.totalExpenses,
          netRevenue: stats.netRevenue,
          status: "closed",
          closedBy: "Admin",
          closedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }, 600);
  };

  const handleExportReport = () => {
    showToast("Export feature coming soon", "info");
  };

  const handleViewHistory = (record: DayEndRecord) => {
    setFilterBranchId(record.branchId);
    setSelectedDate(record.date);
    showToast(`Viewing ${record.branchName} - ${record.date}`, "info");
  };

  const effectiveBranchId = filterBranchId === "all" ? branches[0]?.branch_id : filterBranchId;
  const hasBranch = !!effectiveBranchId;
  const isDayClosed = summary.status === "closed";
  const maxHourlyRevenue = Math.max(...hourlySales.map((h) => h.revenue), 1);

  /* ══════════════ Loading ══════════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Day End">
      {/* ── Header Card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Day End Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review daily sales, expenses, and branch performance before closing the day
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadDayEndData}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={dataLoading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download size={16} />
              Export Report
            </button>
            <button
              onClick={handleCloseDay}
              disabled={!hasBranch || isDayClosed || dataLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarCheck size={18} />
              {isDayClosed ? "Day Already Closed" : "Close Day"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <DayEndToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        filterBranchId={filterBranchId}
        onBranchChange={setFilterBranchId}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* ── Main content ── */}
      {dataLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="text-[#ff5a1f] animate-spin" />
        </div>
      ) : !hasBranch ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <CalendarCheck size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a branch to view day end summary</p>
        </div>
      ) : (
        <>
          {/* Day Status */}
          <div className="mb-6">
            <DayStatusCard summary={summary} />
          </div>

          {/* Summary Stats */}
          <div className="mb-6">
            <SummaryStats stats={stats} />
          </div>

          {/* Payment + Expense + Net row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <PaymentBreakdown payments={payments} />
            <ExpenseSummary totalExpenses={stats.totalExpenses} expenses={expenses} />
            <NetCalculation
              totalSales={stats.totalRevenue}
              totalExpenses={stats.totalExpenses}
              netRevenue={stats.netRevenue}
            />
          </div>

          {/* Top Items + Hourly */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopSellingItems items={topItems} />
            <HourlySales data={hourlySales} maxRevenue={maxHourlyRevenue} />
          </div>

          {/* History */}
          <div className="mb-6">
            <DayEndHistoryTable
              records={filteredHistory}
              loading={false}
              onView={handleViewHistory}
            />
          </div>
        </>
      )}

      {/* ── Close Day Modal ── */}
      <CloseDayModal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        onConfirm={handleCloseDayConfirm}
        closing={closing}
        branchName={summary.branchName}
        businessDate={summary.businessDate}
        netRevenue={stats.netRevenue}
      />

      {/* ── Toasts ── */}
      <div className="fixed bottom-4 right-4 z-[120] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
