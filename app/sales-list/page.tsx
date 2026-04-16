"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Download,
  FileText,
  Receipt,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SalesSummaryCards from "@/components/sales-list/SalesSummaryCards";
import SalesToolbar, { type QuickFilter } from "@/components/sales-list/SalesToolbar";
import SalesTable from "@/components/sales-list/SalesTable";
import SalesCardList from "@/components/sales-list/SalesCardList";
import SalesOrderModal from "@/components/sales-list/SalesOrderModal";
import SalesReceiptModal from "@/components/sales-list/SalesReceiptModal";
import { generateSalesData } from "@/lib/salesListStorage";
import { downloadCsv } from "@/lib/exportCsv";
import type { SaleOrder, SaleStatus, PaymentMethod, SortField, SortDir, SaleBranch } from "@/types/salesList";
import type { Branch } from "@/types/branch";
import { apiFetch } from "@/lib/auth-client";

/* ── toast ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

/* ── date helpers ── */
function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function startOfDay(dateStr: string) {
  return new Date(dateStr + "T00:00:00").getTime();
}
function endOfDay(dateStr: string) {
  return new Date(dateStr + "T23:59:59.999").getTime();
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default function SalesListPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches (from API) ── */
  const [branches, setBranches] = useState<SaleBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Data ── */
  const [orders, setOrders] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<number | "all">("all");
  const [status, setStatus] = useState<SaleStatus | "all">("all");
  const [payment, setPayment] = useState<PaymentMethod | "all">("all");
  const [dateFrom, setDateFrom] = useState(toISODate(daysAgo(7)));
  const [dateTo, setDateTo] = useState(toISODate(new Date()));
  const [quickFilter, setQuickFilter] = useState<QuickFilter | null>(null);

  /* ── Sort ── */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* ── Modals ── */
  const [viewOrder, setViewOrder] = useState<SaleOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<SaleOrder | null>(null);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, message, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
    },
    []
  );

  /* ══════════ Auth ══════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ══════════ Fetch branches from API + generate data ══════════ */
  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;

    const fetchAndGenerate = async () => {
      setLoading(true);
      setBranchesLoading(true);

      let activeBranches: SaleBranch[] = [];
      try {
        const res = await apiFetch("/api/branches");
        if (!res.ok) throw new Error();
        const data: Branch[] = await res.json();
        activeBranches = data
          .filter((b) => b.status === "Active")
          .map((b) => ({ id: b.branch_id, name: b.branch_name }));
      } catch {
        // API failed — keep empty
      }

      if (cancelled) return;
      setBranches(activeBranches);
      setBranchesLoading(false);

      // small delay for UX feel
      setTimeout(() => {
        if (!cancelled) {
          setOrders(generateSalesData(activeBranches));
          setLoading(false);
        }
      }, 300);
    };

    fetchAndGenerate();
    return () => { cancelled = true; };
  }, [authorized]);

  /* ══════════ Quick filter logic ══════════ */
  const applyQuickFilter = useCallback(
    (qf: QuickFilter | null) => {
      setQuickFilter(qf);
      const today = new Date();
      const todayStr = toISODate(today);
      const yesterdayStr = toISODate(daysAgo(1));

      // reset dropdown overrides
      switch (qf) {
        case "today":
          setDateFrom(todayStr);
          setDateTo(todayStr);
          setPayment("all");
          setStatus("all");
          break;
        case "yesterday":
          setDateFrom(yesterdayStr);
          setDateTo(yesterdayStr);
          setPayment("all");
          setStatus("all");
          break;
        case "this_week":
          setDateFrom(toISODate(daysAgo(6)));
          setDateTo(todayStr);
          setPayment("all");
          setStatus("all");
          break;
        case "cash_only":
          setPayment("Cash");
          setStatus("all");
          setDateFrom(toISODate(daysAgo(14)));
          setDateTo(todayStr);
          break;
        case "completed_only":
          setStatus("Complete");
          setPayment("all");
          setDateFrom(toISODate(daysAgo(14)));
          setDateTo(todayStr);
          break;
        default:
          break;
      }
    },
    []
  );

  /* ══════════ Clear ══════════ */
  const clearFilters = useCallback(() => {
    setSearch("");
    setBranchId("all");
    setStatus("all");
    setPayment("all");
    setDateFrom(toISODate(daysAgo(7)));
    setDateTo(toISODate(new Date()));
    setQuickFilter(null);
    setSortField(null);
  }, []);

  const hasActiveFilters =
    search !== "" ||
    branchId !== "all" ||
    status !== "all" ||
    payment !== "all" ||
    quickFilter !== null;

  /* ══════════ Filtered + sorted ══════════ */
  const filtered = useMemo(() => {
    let list = orders;

    // branch
    if (branchId !== "all") list = list.filter((o) => o.branchId === branchId);
    // status
    if (status !== "all") list = list.filter((o) => o.status === status);
    // payment
    if (payment !== "all") list = list.filter((o) => o.paymentMethod === payment);
    // search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((o) => o.orderNo.toLowerCase().includes(q));
    }
    // date range
    if (dateFrom) {
      const start = startOfDay(dateFrom);
      list = list.filter((o) => o.createdAt >= start);
    }
    if (dateTo) {
      const end = endOfDay(dateTo);
      list = list.filter((o) => o.createdAt <= end);
    }

    // sort
    if (sortField) {
      const mult = sortDir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (sortField === "time") return (a.createdAt - b.createdAt) * mult;
        return (a.total - b.total) * mult;
      });
    } else {
      // default: newest first
      list = [...list].sort((a, b) => b.createdAt - a.createdAt);
    }

    return list;
  }, [orders, branchId, status, payment, search, dateFrom, dateTo, sortField, sortDir]);

  /* ── Summary stats ── */
  const totalOrders = filtered.length;
  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const cashCount = filtered.filter((o) => o.paymentMethod === "Cash").length;
  const cardOnlineCount = filtered.filter(
    (o) => o.paymentMethod === "Card" || o.paymentMethod === "Online"
  ).length;

  /* ── Sort handler ── */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  /* ── Export handlers ── */
  const handleExportCsv = () => {
    downloadCsv(filtered, `sales-list-${toISODate(new Date())}.csv`);
    pushToast(`Exported ${filtered.length} orders to CSV`, "info");
  };
  const handleExportPdf = () => {
    window.print();
    pushToast("Print dialog opened", "info");
  };

  /* ── Refresh ── */
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setOrders(generateSalesData(branches));
      setLoading(false);
      pushToast("Sales data refreshed", "info");
    }, 300);
  };

  /* ══════════ Auth loading ══════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Sales List">
      {/* ── Toast ── */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.25s_ease-out] ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : t.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : t.type === "error" ? (
              <AlertTriangle size={16} />
            ) : (
              <Receipt size={16} />
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
            <h2 className="text-2xl font-bold text-gray-800">Sales List</h2>
            <p className="text-sm text-gray-500 mt-1">
              Transaction Log — view every individual order (raw database viewer)
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Download size={15} />
              Export CSV
            </button>
            <button
              onClick={handleExportPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <FileText size={15} />
              Export PDF
            </button>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <SalesSummaryCards
        totalOrders={totalOrders}
        totalRevenue={totalRevenue}
        cashCount={cashCount}
        cardOnlineCount={cardOnlineCount}
      />

      {/* ── Filters ── */}
      <SalesToolbar
        branches={branches}
        branchesLoading={branchesLoading}
        search={search}
        onSearchChange={setSearch}
        branchId={branchId}
        onBranchChange={setBranchId}
        status={status}
        onStatusChange={setStatus}
        payment={payment}
        onPaymentChange={setPayment}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        quickFilter={quickFilter}
        onQuickFilter={applyQuickFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* ── Filtered count ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-gray-400">
          Filtered Results:{" "}
          <span className="font-semibold text-gray-600">{filtered.length} orders</span>
        </p>
      </div>

      {/* ── Table / Cards ── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading transactions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Receipt size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              No transactions match your current filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-2 text-xs font-semibold text-[#ff5a1f] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <SalesTable
              orders={filtered}
              loading={false}
              onView={setViewOrder}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          </div>
          <div className="md:hidden">
            <SalesCardList orders={filtered} onView={setViewOrder} />
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <SalesOrderModal
        order={viewOrder}
        onClose={() => setViewOrder(null)}
        onViewReceipt={(o) => {
          setViewOrder(null);
          setReceiptOrder(o);
        }}
      />
      <SalesReceiptModal
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </DashboardLayout>
  );
}
