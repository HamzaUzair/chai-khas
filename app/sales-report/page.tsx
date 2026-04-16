"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Download,
  FileText,
  BarChart3,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ReportFilters from "@/components/sales-report/ReportFilters";
import KPICards from "@/components/sales-report/KPICards";
import AccountingBreakdown from "@/components/sales-report/AccountingBreakdown";
import DailySummaryTable from "@/components/sales-report/DailySummaryTable";
import DailySummaryCards from "@/components/sales-report/DailySummaryCards";
import {
  generateReportOrders,
  computeKPIs,
  buildDailySummary,
} from "@/lib/salesReportData";
import { downloadReportCsv } from "@/lib/exportReportCsv";
import type {
  ReportOrder,
  ReportBranch,
  TimeRange,
  SortField,
  SortDir,
} from "@/types/salesReport";
import type { Branch } from "@/types/branch";
import { apiFetch } from "@/lib/auth-client";

/* ── toast ── */
interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

/* ── date utils ── */
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function startOfDay(s: string) {
  return new Date(s + "T00:00:00").getTime();
}
function endOfDay(s: string) {
  return new Date(s + "T23:59:59.999").getTime();
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function startOfWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 = Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1)); // Mon
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  return d;
}

function fmtPkr(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}

export default function SalesReportPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches (from API) ── */
  const [branches, setBranches] = useState<ReportBranch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Data ── */
  const [allOrders, setAllOrders] = useState<ReportOrder[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Filters ── */
  const [timeRange, setTimeRange] = useState<TimeRange>("this_month");
  const [dateFrom, setDateFrom] = useState(toISO(startOfMonth()));
  const [dateTo, setDateTo] = useState(toISO(new Date()));
  const [branchId, setBranchId] = useState<number | "all">("all");
  const [includeCancelled, setIncludeCancelled] = useState(false);

  /* ── Sort ── */
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback(
    (message: string, type: "success" | "info" = "info") => {
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

      let activeBranches: ReportBranch[] = [];
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

      setTimeout(() => {
        if (!cancelled) {
          setAllOrders(generateReportOrders(activeBranches));
          setLoading(false);
        }
      }, 300);
    };

    fetchAndGenerate();
    return () => { cancelled = true; };
  }, [authorized]);

  /* ══════════ Time range → dates ══════════ */
  const handleTimeRange = useCallback(
    (tr: TimeRange) => {
      setTimeRange(tr);
      const today = toISO(new Date());
      switch (tr) {
        case "today":
          setDateFrom(today);
          setDateTo(today);
          break;
        case "this_week":
          setDateFrom(toISO(startOfWeek()));
          setDateTo(today);
          break;
        case "this_month":
          setDateFrom(toISO(startOfMonth()));
          setDateTo(today);
          break;
        case "custom":
          // keep existing dates
          break;
      }
    },
    []
  );

  /* ══════════ Clear ══════════ */
  const clearFilters = useCallback(() => {
    handleTimeRange("this_month");
    setBranchId("all");
    setIncludeCancelled(false);
    setSortField(null);
  }, [handleTimeRange]);

  const hasActive = branchId !== "all" || includeCancelled || timeRange !== "this_month";

  /* ══════════ Filtered orders ══════════ */
  const filtered = useMemo(() => {
    let list = allOrders;

    // date range
    if (dateFrom) list = list.filter((o) => o.createdAt >= startOfDay(dateFrom));
    if (dateTo) list = list.filter((o) => o.createdAt <= endOfDay(dateTo));

    // branch
    if (branchId !== "all") list = list.filter((o) => o.branchId === branchId);

    // cancelled
    if (!includeCancelled) list = list.filter((o) => o.status !== "Cancelled");

    return list;
  }, [allOrders, dateFrom, dateTo, branchId, includeCancelled]);

  /* ══════════ KPIs ══════════ */
  const kpis = useMemo(() => computeKPIs(filtered), [filtered]);

  /* ══════════ Daily summary (sorted) ══════════ */
  const dailyRows = useMemo(() => {
    const rows = buildDailySummary(filtered);

    if (sortField) {
      const mult = sortDir === "asc" ? 1 : -1;
      rows.sort((a, b) => {
        if (sortField === "date") return a.date.localeCompare(b.date) * mult;
        return (a.net - b.net) * mult;
      });
    }

    return rows;
  }, [filtered, sortField, sortDir]);

  /* ── Sort handler ── */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  /* ── Export ── */
  const handleExportCsv = () => {
    downloadReportCsv(kpis, dailyRows, `sales-report-${toISO(new Date())}.csv`);
    pushToast(`Exported ${dailyRows.length} daily rows to CSV`);
  };
  const handleExportPdf = () => {
    window.print();
    pushToast("Print dialog opened");
  };
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setAllOrders(generateReportOrders(branches));
      setLoading(false);
      pushToast("Report data refreshed");
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
    <DashboardLayout title="Sales Report">
      {/* ── Toast ── */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.25s_ease-out] ${
              t.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <CheckCircle2 size={16} />
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
            <h2 className="text-2xl font-bold text-gray-800">Sales Report</h2>
            <p className="text-sm text-gray-500 mt-1">
              Financial Summary — accounting report for totals and payments
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

      {/* ── Filters ── */}
      <ReportFilters
        branches={branches}
        branchesLoading={branchesLoading}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        branchId={branchId}
        onBranchChange={setBranchId}
        includeCancelled={includeCancelled}
        onIncludeCancelledChange={setIncludeCancelled}
        onClear={clearFilters}
        hasActive={hasActive}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-20 flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Generating report…</p>
        </div>
      ) : (
        <>
          {/* ── Filtered count ── */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <p className="text-xs text-gray-400">
              Filtered results:{" "}
              <span className="font-semibold text-gray-600">
                {filtered.length} orders, {fmtPkr(kpis.grossSales)} gross
              </span>
            </p>
          </div>

          {/* ── KPI Cards ── */}
          <KPICards kpis={kpis} />

          {/* ── Accounting Breakdown ── */}
          <AccountingBreakdown kpis={kpis} />

          {/* ── Daily Summary Table ── */}
          <div className="mb-3 flex items-center gap-2 px-1">
            <BarChart3 size={15} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700">Daily Summary</h3>
          </div>

          {dailyRows.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <BarChart3 size={28} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 max-w-xs">
                  No data matches your current filters.
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
                <DailySummaryTable
                  rows={dailyRows}
                  loading={false}
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </div>
              <div className="md:hidden">
                <DailySummaryCards rows={dailyRows} />
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
