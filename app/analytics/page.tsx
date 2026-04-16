"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  Download,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  X,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AnalyticsKpiCards from "@/components/analytics/AnalyticsKpiCards";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import WeeklyPerformanceChart from "@/components/analytics/WeeklyPerformanceChart";
import BranchComparisonTable from "@/components/analytics/BranchComparisonTable";
import BestSellersList from "@/components/analytics/BestSellersList";
import PeakHoursChart from "@/components/analytics/PeakHoursChart";
import type { Branch } from "@/types/branch";
import type { DateRange } from "@/lib/analyticsService";
import { apiFetch } from "@/lib/auth-client";
import {
  getKpis,
  getRevenueTrend,
  getWeeklyPerformance,
  getBranchComparison,
  getBestSellers,
  getPeakHours,
} from "@/lib/analyticsService";
import type {
  KpiData,
  RevenueTrendPoint,
  WeeklyPoint,
  BranchCompRow,
  BestSellerRow,
  PeakHourPoint,
} from "@/lib/analyticsService";

/* ── tiny toast ── */
interface Toast {
  id: number;
  message: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  /* ── Branches ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  /* ── Filters ── */
  const [filterBranchId, setFilterBranchId] = useState<number | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  /* ── Export dropdown ── */
  const [exportOpen, setExportOpen] = useState(false);

  /* ── Fake loading ── */
  const [loading, setLoading] = useState(true);

  /* ── Data ── */
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyPoint[]>([]);
  const [branchComp, setBranchComp] = useState<BranchCompRow[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerRow[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHourPoint[]>([]);

  /* ── Toast ── */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  /* ══════════ Auth ══════════ */
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  /* ══════════ Fetch branches ══════════ */
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      setBranchesLoading(true);
      try {
        const res = await apiFetch("/api/branches");
        if (!res.ok) throw new Error();
        const data: Branch[] = await res.json();
        setBranches(data.filter((b) => b.status === "Active"));
      } catch {
        /* silent */
      } finally {
        setBranchesLoading(false);
      }
    })();
  }, [authorized]);

  /* ══════════ Load analytics data (fake 800ms) ══════════ */
  const loadData = useCallback(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setKpis(getKpis(filterBranchId, dateRange));
      setRevenueTrend(getRevenueTrend(filterBranchId, dateRange));
      setWeeklyData(getWeeklyPerformance(filterBranchId, dateRange));
      setBranchComp(getBranchComparison(dateRange));
      setBestSellers(getBestSellers(filterBranchId, dateRange));
      setPeakHours(getPeakHours(filterBranchId, dateRange));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [filterBranchId, dateRange]);

  useEffect(() => {
    if (!authorized || branchesLoading) return;
    const cleanup = loadData();
    return cleanup;
  }, [authorized, branchesLoading, loadData]);

  /* ══════════ Handlers ══════════ */
  const handleExport = (type: "pdf" | "csv") => {
    setExportOpen(false);
    pushToast(`Export ${type.toUpperCase()} coming soon`);
  };

  const handleDateRange = (r: DateRange) => {
    if (r === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      setDateRange(r);
    }
  };

  /* ══════════ Auth guard ══════════ */
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const dateLabels: Record<string, string> = {
    today: "Today",
    "7days": "Last 7 days",
    "30days": "Last 30 days",
    custom: "Custom",
  };

  return (
    <DashboardLayout title="Advanced Analytics">
      {/* ── Toast ── */}
      <div className="fixed top-5 right-5 z-[200] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200 animate-[slideIn_0.25s_ease-out]"
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

      {/* ═══════════ HEADER CARD ═══════════ */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={22} className="text-[#ff5a1f]" />
              <h2 className="text-2xl font-bold text-gray-800">
                Advanced Analytics
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Sales insights, best sellers, peak hours &amp; branch performance
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Branch dropdown */}
            <div className="relative">
              <Building2
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                className="border border-gray-200 rounded-lg pl-8 pr-3.5 py-2 text-sm text-gray-700 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
                value={filterBranchId}
                onChange={(e) =>
                  setFilterBranchId(
                    e.target.value === "all" ? "all" : Number(e.target.value)
                  )
                }
                disabled={branchesLoading}
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                className="border border-gray-200 rounded-lg pl-8 pr-3.5 py-2 text-sm text-gray-700 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all"
                value={showCustom ? "custom" : dateRange}
                onChange={(e) => handleDateRange(e.target.value as DateRange)}
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setExportOpen((p) => !p)}
                className="inline-flex items-center gap-1.5 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Download size={14} />
                Export
                <ChevronDown size={12} />
              </button>
              {exportOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setExportOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg border border-gray-100 shadow-lg z-40 py-1">
                    <button
                      onClick={() => handleExport("pdf")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      Export PDF
                    </button>
                    <button
                      onClick={() => handleExport("csv")}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      Export CSV
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Custom range inputs */}
        {showCustom && (
          <div className="flex flex-wrap items-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                From
              </label>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                To
              </label>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f]"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setDateRange("30days"); // custom uses 30-day mock
                pushToast("Custom date range applied (mock data)");
              }}
              className="px-4 py-2 rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold hover:bg-[#e04e18] transition-colors cursor-pointer"
            >
              Apply
            </button>
          </div>
        )}

        {/* Active filter badge */}
        {!showCustom && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold">
              <Calendar size={12} />
              {dateLabels[dateRange]}
              {filterBranchId !== "all" && (
                <>
                  {" · "}
                  {branches.find((b) => b.branch_id === filterBranchId)?.branch_name}
                </>
              )}
            </span>
          </div>
        )}
      </div>

      {/* ═══════════ KPI CARDS ═══════════ */}
      <AnalyticsKpiCards data={kpis} loading={loading} />

      {/* ═══════════ CHARTS ROW ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueTrendChart data={revenueTrend} loading={loading} />
        <WeeklyPerformanceChart data={weeklyData} loading={loading} />
      </div>

      {/* ═══════════ BRANCH COMPARISON ═══════════ */}
      <div className="mb-6">
        <BranchComparisonTable data={branchComp} loading={loading} />
      </div>

      {/* ═══════════ BEST SELLERS + PEAK HOURS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BestSellersList data={bestSellers} loading={loading} />
        <PeakHoursChart data={peakHours} loading={loading} />
      </div>
    </DashboardLayout>
  );
}
