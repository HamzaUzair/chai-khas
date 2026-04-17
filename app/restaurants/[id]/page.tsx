"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  BarChart3,
  Users,
  DollarSign,
  ShoppingCart,
  Trophy,
  TrendingDown,
  Loader2,
  Store,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch, getAuthSession } from "@/lib/auth-client";
import type { RestaurantDetail } from "@/types/restaurant";

interface SaasAnalyticsBranchRow {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  status: string;
  sales: number;
  orders: number;
  avgOrderValue: number;
}

interface SaasRestaurantAnalytics {
  level: "restaurant";
  kpis: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    totalBranches: number;
  };
  topBranch: SaasAnalyticsBranchRow | null;
  lowestBranch: SaasAnalyticsBranchRow | null;
  branches: SaasAnalyticsBranchRow[];
}

function formatPKR(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

export default function RestaurantDetailPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params?.id);
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [detail, setDetail] = useState<RestaurantDetail | null>(null);
  const [analytics, setAnalytics] = useState<SaasRestaurantAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
      return;
    }
    setAuthorized(true);
  }, [router]);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError("");
    try {
      const [d, a] = await Promise.all([
        apiFetch(`/api/restaurants/${restaurantId}`),
        apiFetch(`/api/analytics/overview?restaurantId=${restaurantId}&range=30days`),
      ]);
      if (!d.ok) throw new Error("Restaurant not found");
      const detailData: RestaurantDetail = await d.json();
      setDetail(detailData);
      if (a.ok) {
        const analyticsData: SaasRestaurantAnalytics = await a.json();
        setAnalytics(analyticsData);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load restaurant");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (authorized) load();
  }, [authorized, load]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title={detail ? detail.name : "Restaurant"}>
      <div className="mb-4">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#ff5a1f] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Restaurants
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-[#ff5a1f]" />
        </div>
      ) : error || !detail ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error || "Restaurant not found"}
        </div>
      ) : (
        <>
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                <Store size={22} className="text-[#ff5a1f]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {detail.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      detail.has_multiple_branches
                        ? "bg-[#ff5a1f]/10 text-[#ff5a1f]"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {detail.has_multiple_branches
                      ? "Multi Branch"
                      : "Single Branch"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      detail.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : detail.status === "Suspended"
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {detail.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Code: {detail.slug} · Branches: {detail.branches.length}
                </p>
                {(detail.phone || detail.address) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {[detail.phone, detail.address].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Restaurant-level KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Total Sales"
              value={analytics ? formatPKR(analytics.kpis.totalSales) : "…"}
              icon={<DollarSign size={20} />}
              tone="text-green-600 bg-green-50"
            />
            <KpiCard
              label="Total Orders"
              value={analytics ? String(analytics.kpis.totalOrders) : "…"}
              icon={<ShoppingCart size={20} />}
              tone="text-blue-600 bg-blue-50"
            />
            <KpiCard
              label="Branches"
              value={
                analytics
                  ? String(analytics.kpis.totalBranches)
                  : String(detail.branches.length)
              }
              icon={<Building2 size={20} />}
              tone="text-[#ff5a1f] bg-[#ff5a1f]/10"
            />
            <KpiCard
              label="Avg Order Value"
              value={analytics ? formatPKR(analytics.kpis.avgOrderValue) : "…"}
              icon={<BarChart3 size={20} />}
              tone="text-purple-600 bg-purple-50"
            />
          </div>

          {/* Best + lowest branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <SpotlightCard
              title="Top Branch"
              icon={<Trophy size={18} className="text-amber-500" />}
              name={analytics?.topBranch?.branch_name ?? null}
              subtitle={
                analytics?.topBranch
                  ? formatPKR(analytics.topBranch.sales)
                  : "—"
              }
            />
            <SpotlightCard
              title="Lowest Branch"
              icon={<TrendingDown size={18} className="text-gray-500" />}
              name={analytics?.lowestBranch?.branch_name ?? null}
              subtitle={
                analytics?.lowestBranch
                  ? formatPKR(analytics.lowestBranch.sales)
                  : "—"
              }
            />
          </div>

          {/* Branches table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Building2 size={18} className="text-[#ff5a1f]" />
              <h3 className="text-base font-semibold text-gray-800">Branches</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50">
                    {[
                      "Branch",
                      "Code",
                      "Status",
                      "Sales",
                      "Orders",
                      "AOV",
                      "Actions",
                    ].map((c) => (
                      <th
                        key={c}
                        className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detail.branches.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-10 text-center text-gray-400 text-sm"
                      >
                        This restaurant has no branches yet.
                      </td>
                    </tr>
                  ) : (
                    detail.branches.map((b) => {
                      const stat = analytics?.branches.find(
                        (x) => x.branch_id === b.branch_id
                      );
                      return (
                        <tr
                          key={b.branch_id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {b.branch_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {b.branch_code}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                b.status === "Active"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {stat ? formatPKR(stat.sales) : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {stat ? stat.orders : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {stat ? formatPKR(stat.avgOrderValue) : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/restaurants/${restaurantId}/branches/${b.branch_id}`}
                              className="text-xs font-semibold text-[#ff5a1f] hover:underline"
                            >
                              View analytics →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users size={18} className="text-[#ff5a1f]" />
              <h3 className="text-base font-semibold text-gray-800">
                Restaurant Admins
              </h3>
            </div>
            <div className="p-6">
              {detail.admins.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No Restaurant Admin assigned yet. You can create one from the{" "}
                  <Link href="/users" className="text-[#ff5a1f] hover:underline">
                    Users
                  </Link>{" "}
                  page.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {detail.admins.map((a) => (
                    <li
                      key={a.user_id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {a.full_name || a.username}
                        </p>
                        <p className="text-xs text-gray-500">{a.username}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          a.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {a.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SpotlightCard({
  title,
  icon,
  name,
  subtitle,
}: {
  title: string;
  icon: React.ReactNode;
  name: string | null;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {name ? (
        <>
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-lg font-bold text-[#ff5a1f] mt-0.5">{subtitle}</p>
        </>
      ) : (
        <p className="text-sm text-gray-400">No data</p>
      )}
    </div>
  );
}
