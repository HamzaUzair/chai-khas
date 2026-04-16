"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Printer, RefreshCw, PieChart, Loader2, XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MenuSalesFilters from "@/components/menu-sales/MenuSalesFilters";
import MenuSalesKPIStrip from "@/components/menu-sales/MenuSalesKPIStrip";
import MenuSalesTable from "@/components/menu-sales/MenuSalesTable";
import MenuSalesCardList from "@/components/menu-sales/MenuSalesCardList";
import MenuSalesItemModal from "@/components/menu-sales/MenuSalesItemModal";
import type { ItemPerformance, MSTimeRange, MSSortField, MSSortDir, MSBranch } from "@/types/menuSales";
import {
  MS_BRANCHES,
  MS_CATEGORIES,
  aggregateItemPerformance,
} from "@/lib/menuSalesData";
import { downloadMenuSalesCsv } from "@/lib/exportMenuSalesCsv";
import type { Branch } from "@/types/branch";
import { apiFetch } from "@/lib/auth-client";

/* ── date helpers ── */
function todayRange(): [string, string] {
  const d = new Date();
  const s = d.toISOString().slice(0, 10);
  return [s, s];
}
function weekRange(): [string, string] {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Mon=1
  const mon = new Date(now);
  mon.setDate(now.getDate() - (dayOfWeek - 1));
  return [mon.toISOString().slice(0, 10), now.toISOString().slice(0, 10)];
}
function monthRange(): [string, string] {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return [first.toISOString().slice(0, 10), now.toISOString().slice(0, 10)];
}
function toEpochStart(dateStr: string) {
  return new Date(dateStr + "T00:00:00").getTime();
}
function toEpochEnd(dateStr: string) {
  return new Date(dateStr + "T23:59:59.999").getTime();
}

export default function MenuSalesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── auth guard ── */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ── branches (try API, fall back to mock) ── */
  const [branches, setBranches] = useState<MSBranch[]>(MS_BRANCHES);
  const [branchesReady, setBranchesReady] = useState(false);

  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch("/api/branches");
        if (!res.ok) throw new Error();
        const data: Branch[] = await res.json();
        const active = data
          .filter((b) => b.status === "Active")
          .map((b) => ({ id: b.branch_id, name: b.branch_name }));
        if (!cancelled && active.length > 0) setBranches(active);
      } catch {
        // keep mock branches
      } finally {
        if (!cancelled) setBranchesReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authorized]);

  /* ── filters ── */
  const [timeRange, setTimeRange] = useState<MSTimeRange>("this_month");
  const [dateFrom, setDateFrom] = useState(() => monthRange()[0]);
  const [dateTo, setDateTo] = useState(() => monthRange()[1]);
  const [branchId, setBranchId] = useState<number | "all">("all");
  const [category, setCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  /* ── sorting ── */
  const [sortField, setSortField] = useState<MSSortField>("soldQty");
  const [sortDir, setSortDir] = useState<MSSortDir>("desc");

  /* ── modal ── */
  const [modalItem, setModalItem] = useState<ItemPerformance | null>(null);

  /* ── toast ── */
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);
  const showToast = useCallback((msg: string, type: "success" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ── time-range shortcut handler ── */
  const handleTimeRange = useCallback(
    (tr: MSTimeRange) => {
      setTimeRange(tr);
      if (tr === "today") {
        const [f, t] = todayRange();
        setDateFrom(f);
        setDateTo(t);
      } else if (tr === "this_week") {
        const [f, t] = weekRange();
        setDateFrom(f);
        setDateTo(t);
      } else if (tr === "this_month") {
        const [f, t] = monthRange();
        setDateFrom(f);
        setDateTo(t);
      }
      // "custom" keeps current dates
    },
    []
  );

  /* ── aggregate ── */
  const rows = useMemo(() => {
    if (!branchesReady && !authorized) return [];
    const res = aggregateItemPerformance({
      branchId,
      category,
      dateFrom: toEpochStart(dateFrom),
      dateTo: toEpochEnd(dateTo),
      search,
      activeOnly,
    });

    // sort
    res.sort((a, b) => {
      const diff = sortDir === "desc" ? b[sortField] - a[sortField] : a[sortField] - b[sortField];
      if (diff !== 0) return diff;
      // secondary sort by the other field
      const sec: MSSortField = sortField === "soldQty" ? "revenue" : "soldQty";
      return b[sec] - a[sec];
    });

    return res;
  }, [branchId, category, dateFrom, dateTo, search, activeOnly, sortField, sortDir, branchesReady, authorized]);

  /* ── sort toggle ── */
  const handleSort = useCallback(
    (f: MSSortField) => {
      if (f === sortField) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortField(f);
        setSortDir("desc");
      }
    },
    [sortField]
  );

  /* ── clear all filters ── */
  const handleClear = useCallback(() => {
    setTimeRange("this_month");
    const [f, t] = monthRange();
    setDateFrom(f);
    setDateTo(t);
    setBranchId("all");
    setCategory("all");
    setSearch("");
    setActiveOnly(true);
    setSortField("soldQty");
    setSortDir("desc");
    showToast("Filters cleared!");
  }, [showToast]);

  /* ── has active filters? ── */
  const hasActiveFilter =
    branchId !== "all" ||
    category !== "all" ||
    search !== "" ||
    !activeOnly ||
    timeRange !== "this_month";

  /* ── filter description line ── */
  const filterDesc = useMemo(() => {
    const parts: string[] = [];
    if (branchId !== "all") parts.push(`Branch: ${branches.find((b) => b.id === branchId)?.name ?? branchId}`);
    if (category !== "all") parts.push(`Category: ${category}`);
    if (search) parts.push(`Search: "${search}"`);
    if (!activeOnly) parts.push("Including Inactive");
    return parts;
  }, [branchId, category, search, activeOnly, branches]);

  /* ── loading guard ── */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Menu Sales">
      {/* ── header card ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Menu Sales</h2>
            <p className="text-sm text-gray-500 mt-1">
              Item Performance — exact quantities and revenue (not charts-only)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                downloadMenuSalesCsv(rows);
                showToast("CSV exported!", "success");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer shadow-sm"
            >
              <FileDown size={16} />
              Export CSV
            </button>
            <button
              onClick={() => {
                window.print();
                showToast("Opening print dialog…");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={16} />
              Export PDF
            </button>
            <button
              onClick={() => showToast("Refreshed!")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── filters ── */}
      <MenuSalesFilters
        branches={branches}
        categories={MS_CATEGORIES}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        branchId={branchId}
        onBranchChange={setBranchId}
        category={category}
        onCategoryChange={setCategory}
        search={search}
        onSearchChange={setSearch}
        activeOnly={activeOnly}
        onActiveOnlyChange={setActiveOnly}
        onClear={handleClear}
        hasActive={hasActiveFilter}
      />

      {/* ── KPI strip ── */}
      <MenuSalesKPIStrip rows={rows} />

      {/* ── info line ── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm text-gray-500 font-medium">
        <span>
          Showing <strong className="text-gray-700">{rows.length}</strong> items
        </span>
        {filterDesc.length > 0 && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400 text-xs">
              Filtered by: {filterDesc.join(" · ")}
            </span>
          </>
        )}
      </div>

      {/* ── table / cards ── */}
      {!branchesReady ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-16 flex items-center justify-center gap-3">
          <Loader2 size={24} className="text-[#ff5a1f] animate-spin" />
          <p className="text-sm text-gray-400">Loading data…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <PieChart size={28} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              No items found matching your filters. Try broadening the date range or clearing filters.
            </p>
            <button
              onClick={handleClear}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <XCircle size={16} />
              Clear all filters
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <MenuSalesTable
              rows={rows}
              loading={false}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onView={setModalItem}
              branchFilter={branchId}
            />
          </div>

          {/* Mobile card list */}
          <div className="md:hidden">
            <MenuSalesCardList rows={rows} onView={setModalItem} />
          </div>
        </>
      )}

      {/* ── item modal ── */}
      <MenuSalesItemModal item={modalItem} onClose={() => setModalItem(null)} />

      {/* ── toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white animate-[slideIn_0.25s_ease-out] ${
            toast.type === "success" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </DashboardLayout>
  );
}
