"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SalesTrendChart from "@/components/dashboard/SalesTrendChart";
import SystemAlertsPanel from "@/components/dashboard/SystemAlertsPanel";
import {
  Building2,
  BadgePercent,
  UtensilsCrossed,
  ClipboardList,
  Landmark,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Trophy,
  TrendingDown,
  Loader2,
} from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";

function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/* ── Quick action buttons (no Create Order) ── */
const quickActions = [
  { label: "Branches", icon: <Building2 size={22} />, href: "/branches", color: "text-[#ff5a1f]", bg: "bg-[#ff5a1f]/10" },
  { label: "Deals", icon: <BadgePercent size={22} />, href: "/deals", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Menu Items", icon: <UtensilsCrossed size={22} />, href: "/menu", color: "text-green-600", bg: "bg-green-50" },
  { label: "Orders", icon: <ClipboardList size={22} />, href: "/orders", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Accounts", icon: <Landmark size={22} />, href: "/users", color: "text-rose-600", bg: "bg-rose-50" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (isAuth !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch("/api/stats/dashboard");
        if (res.ok) {
          const data: DashboardStats = await res.json();
          setStats(data);
        }
      } catch {
        // silently fail
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [authorized]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Sales",
      value: statsLoading ? "…" : formatPKR(stats?.todaySales ?? 0),
      icon: <DollarSign size={24} />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Orders Today",
      value: statsLoading ? "…" : String(stats?.ordersToday ?? 0),
      icon: <ShoppingCart size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: statsLoading ? "…" : formatPKR(stats?.avgOrderValue ?? 0),
      icon: <BarChart3 size={24} />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Branches",
      value: statsLoading ? "…" : String(stats?.totalBranches ?? 0),
      icon: <Building2 size={24} />,
      color: "text-[#ff5a1f]",
      bg: "bg-[#ff5a1f]/10",
      href: "/branches#branches-table",
    },
    {
      label: "Menu Items",
      value: statsLoading ? "…" : String(stats?.menuItems ?? 0),
      icon: <Package size={24} />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Active Deals",
      value: statsLoading ? "…" : String(stats?.activeDeals ?? 0),
      icon: <BadgePercent size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const hasData = (stats?.ordersToday ?? 0) > 0 || (stats?.totalBranches ?? 0) > 0;

  return (
    <DashboardLayout title="Dashboard">
      {/* ── Page heading ── */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Monitoring, analytics, and branch performance
        </p>
      </div>

      {/* ── Section 1: Top Business Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {statCards.map((s) => {
          const cardContent = (
            <>
              <div
                className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}
              >
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider truncate">
                  {s.label}
                </p>
                <p className="text-xl font-bold text-gray-800 mt-0.5 truncate">
                  {s.value}
                </p>
              </div>
            </>
          );

          if (s.href) {
            return (
              <Link
                key={s.label}
                href={s.href}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/40 focus:ring-offset-2"
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* ── Section 2: Sales Trend Chart ── */}
      <div className="mb-8">
        <SalesTrendChart
          data={stats?.salesLast7Days ?? []}
          loading={statsLoading}
        />
      </div>

      {/* ── Section 3 & 5 & 6: Branch table + Best/Lowest branch cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Branch Performance Table ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <TrendingUp size={20} className="text-[#ff5a1f]" />
            <h3 className="text-base font-semibold text-gray-800">
              Branch Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "Branch Name",
                    "Today's Sales",
                    "Orders Today",
                    "Running",
                    "Completed",
                    "Avg Order",
                  ].map((col) => (
                    <th
                      key={col}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-[#ff5a1f] mx-auto" />
                    </td>
                  </tr>
                ) : !stats?.branchPerformance?.length ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 size={32} className="text-gray-300" />
                        <span className="text-sm">No data available</span>
                        <span className="text-xs text-gray-300">
                          Add branches and start taking orders to see analytics
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.branchPerformance.map((b) => (
                    <tr key={b.branchId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{b.branchName}</td>
                      <td className="px-6 py-4 text-gray-600">{formatPKR(b.todaySales)}</td>
                      <td className="px-6 py-4 text-gray-600">{b.ordersToday}</td>
                      <td className="px-6 py-4 text-amber-600">{b.runningOrders}</td>
                      <td className="px-6 py-4 text-green-600">{b.completedOrders}</td>
                      <td className="px-6 py-4 text-gray-600">{formatPKR(b.avgOrderValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best & Lowest Branch + Alerts ── */}
        <div className="space-y-6">
          {/* Best Branch ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-gray-800">Top Branch Today</h3>
            </div>
            {statsLoading ? (
              <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : stats?.bestBranch ? (
              <div>
                <p className="font-semibold text-gray-800">{stats.bestBranch.branchName}</p>
                <p className="text-lg font-bold text-[#ff5a1f] mt-1">
                  {formatPKR(stats.bestBranch.todaySales)}
                </p>
                <p className="text-xs text-gray-400">{stats.bestBranch.ordersToday} orders</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No sales data yet</p>
            )}
          </div>

          {/* Lowest Branch ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={18} className="text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800">Lowest Branch Today</h3>
            </div>
            {statsLoading ? (
              <Loader2 size={20} className="animate-spin text-gray-400" />
            ) : stats?.lowestBranch ? (
              <div>
                <p className="font-semibold text-gray-800">{stats.lowestBranch.branchName}</p>
                <p className="text-lg font-bold text-gray-600 mt-1">
                  {formatPKR(stats.lowestBranch.todaySales)}
                </p>
                <p className="text-xs text-gray-400">{stats.lowestBranch.ordersToday} orders</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No sales data yet</p>
            )}
          </div>

          {/* System Alerts ── */}
          <SystemAlertsPanel alerts={stats?.alerts ?? []} />
        </div>
      </div>

      {/* ── Section 4: Top Selling Items ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Top Selling Items Today
        </h3>
        {statsLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 size={24} className="animate-spin text-[#ff5a1f]" />
          </div>
        ) : !stats?.topSellingItems?.length ? (
          <div className="py-8 text-center text-gray-400">
            <UtensilsCrossed size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No sales data available yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.topSellingItems.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center text-xs font-bold text-[#ff5a1f]">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <span className="text-sm text-gray-500">{item.quantity} orders</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 8: Quick Actions (no Create Order) ── */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Navigation</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-[#ff5a1f]/30 transition-all cursor-pointer group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center ${a.color} group-hover:scale-110 transition-transform`}
              >
                {a.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-[#ff5a1f] transition-colors">
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
