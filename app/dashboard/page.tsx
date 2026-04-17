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
  PlusCircle,
  Landmark,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Trophy,
  TrendingDown,
  Loader2,
  Store,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Activity,
  Clock3,
} from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";
import { apiFetch, getAuthSession } from "@/lib/auth-client";

function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

/* ── Quick action buttons (no Create Order) ── */
const quickActions = [
  { label: "Branches", icon: <Building2 size={22} />, href: "/branches", color: "text-[#ff5a1f]", bg: "bg-[#ff5a1f]/10" },
  { label: "New Order / POS", icon: <PlusCircle size={22} />, href: "/create-order", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Deals", icon: <BadgePercent size={22} />, href: "/deals", color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Menu Items", icon: <UtensilsCrossed size={22} />, href: "/menu", color: "text-green-600", bg: "bg-green-50" },
  { label: "Orders", icon: <ClipboardList size={22} />, href: "/orders", color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Accounts", icon: <Landmark size={22} />, href: "/users", color: "text-rose-600", bg: "bg-rose-50" },
];

const orderTakerQuickActions = quickActions.filter(
  (x) => x.href === "/create-order" || x.href === "/orders"
);

export default function DashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionBranchId, setSessionBranchId] = useState<number | null>(null);
  const [sessionRole, setSessionRole] = useState<string>("SUPER_ADMIN");
  const [sessionRestaurantHasMultipleBranches, setSessionRestaurantHasMultipleBranches] =
    useState<boolean | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
    } else {
      if (session.role === "ORDER_TAKER") {
        router.replace("/create-order");
        return;
      }
      setSessionBranchId(session.branchId ?? null);
      setSessionRole(session.role);
      setSessionRestaurantHasMultipleBranches(
        session.restaurantHasMultipleBranches ?? null
      );
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const qs =
          sessionBranchId
            ? `?branchId=${sessionBranchId}`
            : "";
        const res = await apiFetch(`/api/stats/dashboard${qs}`);
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
  }, [authorized, sessionBranchId, sessionRole]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (sessionRole === "SUPER_ADMIN") {
    const sa = stats?.superAdmin;
    const overview = sa?.platformOverview;
    const completion = sa?.charts.adminAssignmentCompletion;
    const restaurantCompletion = completion?.totalRestaurants
      ? Math.round((completion.restaurantsWithAdmin / completion.totalRestaurants) * 100)
      : 0;
    const branchCompletion = completion?.totalBranches
      ? Math.round((completion.branchesWithAdmin / completion.totalBranches) * 100)
      : 0;

    const topCards = [
      { label: "Total Restaurants", value: overview?.totalRestaurants ?? 0, icon: <Store size={18} />, tint: "text-slate-700 bg-slate-100" },
      { label: "Active Restaurants", value: overview?.activeRestaurants ?? 0, icon: <CheckCircle2 size={18} />, tint: "text-emerald-700 bg-emerald-100" },
      { label: "Single-Branch Restaurants", value: overview?.singleBranchRestaurants ?? 0, icon: <Building2 size={18} />, tint: "text-blue-700 bg-blue-100" },
      { label: "Multi-Branch Restaurants", value: overview?.multiBranchRestaurants ?? 0, icon: <GitBranch size={18} />, tint: "text-violet-700 bg-violet-100" },
      { label: "Total Branches", value: overview?.totalBranches ?? 0, icon: <Building2 size={18} />, tint: "text-[#ff5a1f] bg-[#ff5a1f]/10" },
      { label: "Restaurant Admins", value: overview?.restaurantAdmins ?? 0, icon: <ShieldCheck size={18} />, tint: "text-indigo-700 bg-indigo-100" },
      { label: "Branch Admins", value: overview?.branchAdmins ?? 0, icon: <ShieldCheck size={18} />, tint: "text-cyan-700 bg-cyan-100" },
      { label: "Pending Setup", value: overview?.pendingSetup ?? 0, icon: <AlertTriangle size={18} />, tint: "text-amber-700 bg-amber-100" },
    ];

    return (
      <DashboardLayout title="Dashboard">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Platform Control Center</h2>
          <p className="text-sm text-gray-500 mt-1">
            SaaS-level visibility across restaurants, branch assignments, and setup health.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {topCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.tint}`}>
                  {card.icon}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-gray-900">
                {statsLoading ? "…" : card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Restaurants Created Over Time</h3>
              <Activity size={16} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {(sa?.charts.restaurantsCreated ?? []).map((point) => {
                const max = Math.max(
                  1,
                  ...(sa?.charts.restaurantsCreated ?? []).map((x) => x.count)
                );
                const width = `${Math.max(8, Math.round((point.count / max) * 100))}%`;
                return (
                  <div key={point.label} className="grid grid-cols-[64px_1fr_32px] items-center gap-3">
                    <span className="text-xs text-gray-500">{point.label}</span>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#ff5a1f]" style={{ width }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-right">{point.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Branch Growth Over Time</h3>
              <GitBranch size={16} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {(sa?.charts.branchesCreated ?? []).map((point) => {
                const max = Math.max(
                  1,
                  ...(sa?.charts.branchesCreated ?? []).map((x) => x.count)
                );
                const width = `${Math.max(8, Math.round((point.count / max) * 100))}%`;
                return (
                  <div key={point.label} className="grid grid-cols-[64px_1fr_32px] items-center gap-3">
                    <span className="text-xs text-gray-500">{point.label}</span>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-violet-500" style={{ width }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-right">{point.count}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              {(sa?.charts.branchTypeDistribution ?? []).map((x) => (
                <div key={x.label} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-gray-500">{x.label}</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">{x.count}</p>
                </div>
              ))}
              {(sa?.charts.restaurantStatusDistribution ?? []).map((x) => (
                <div key={x.label} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <p className="text-gray-500">{x.label} Restaurants</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">{x.count}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-medium text-gray-600">Admin Assignment Completion</p>
              <div className="text-xs text-gray-500">Restaurant Admins: {restaurantCompletion}%</div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${restaurantCompletion}%` }} />
              </div>
              <div className="text-xs text-gray-500">Branch Admins: {branchCompletion}%</div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${branchCompletion}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Restaurant Management Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    {["Restaurant", "Type", "Branches", "Restaurant Admin", "Branch Admins", "Status", "Created"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sa?.restaurantOverview ?? []).map((row) => (
                    <tr key={row.restaurantId} className="border-t border-gray-100 hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.type === "Multi Branch" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.totalBranches}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.restaurantAdminAssigned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {row.restaurantAdminAssigned ? "Assigned" : "Missing"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.branchAdminsAssigned}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Setup / Attention Alerts</h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {(sa?.setupAlerts ?? []).length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                  All restaurants are currently healthy.
                </div>
              ) : (
                (sa?.setupAlerts ?? []).map((alert) => (
                  <div key={alert.id} className={`rounded-xl border px-3 py-3 ${alert.severity === "critical" ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${alert.severity === "critical" ? "text-rose-700" : "text-amber-700"}`}>
                      {alert.title}
                    </p>
                    <p className={`mt-1 text-sm ${alert.severity === "critical" ? "text-rose-700" : "text-amber-700"}`}>
                      {alert.detail}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Branch Assignment Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    {["Restaurant", "Branch", "Code", "Branch Admin", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sa?.branchAssignmentOverview ?? []).map((row) => (
                    <tr key={row.branchId} className="border-t border-gray-100 hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-medium text-gray-700">{row.restaurantName}</td>
                      <td className="px-4 py-3 text-gray-800">{row.branchName}</td>
                      <td className="px-4 py-3 text-gray-600">{row.branchCode}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.branchAdminAssigned ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {row.branchAdminAssigned ? row.branchAdminName ?? "Assigned" : "Missing"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Clock3 size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {(sa?.recentActivity ?? []).map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                  <p className="text-sm text-gray-800">{event.message}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
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

  const visibleQuickActions =
    sessionRole === "ORDER_TAKER"
      ? orderTakerQuickActions
      : sessionRole === "RESTAURANT_ADMIN"
      ? quickActions.filter(
          (x) =>
            x.href !== "/users" &&
            !(
              sessionRestaurantHasMultipleBranches === false &&
              x.href === "/create-order"
            )
        )
      : sessionRole === "BRANCH_ADMIN"
      ? quickActions.filter((x) => x.href !== "/users" && x.href !== "/create-order")
      : sessionRole === "SUPER_ADMIN"
      ? quickActions.filter(
          (x) =>
            x.href === "/restaurants" ||
            x.href === "/users" ||
            x.href === "/advanced-analytics"
        )
      : quickActions;

  return (
    <DashboardLayout title="Dashboard">
      {/* ── Page heading ── */}
      <div className="mb-8">
        {sessionRole === "ORDER_TAKER" && (
          <h2 className="text-2xl font-bold text-gray-800">Order Taker Dashboard</h2>
        )}
        {sessionRole === "RESTAURANT_ADMIN" && (
          <h2 className="text-2xl font-bold text-gray-800">Restaurant Admin Dashboard</h2>
        )}
        {sessionRole === "SUPER_ADMIN" && (
          <h2 className="text-2xl font-bold text-gray-800">Restenzo Dashboard</h2>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {sessionRole === "ORDER_TAKER"
            ? "Take branch orders quickly and accurately"
            : sessionRole === "RESTAURANT_ADMIN"
            ? "Restaurant-level monitoring and analytics"
            : "Platform monitoring, analytics, and restaurant performance"}
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
          {visibleQuickActions.map((a) => (
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
