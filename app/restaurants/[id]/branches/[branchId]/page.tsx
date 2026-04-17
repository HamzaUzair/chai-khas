"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Package,
  BadgePercent,
  Wallet,
  Building2,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch, getAuthSession } from "@/lib/auth-client";

interface BranchAnalytics {
  level: "branch";
  branch: {
    branch_id: number;
    branch_name: string;
    branch_code: string;
    restaurant: { restaurant_id: number; name: string; slug: string } | null;
  };
  kpis: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    activeMenuItems: number;
    activeDeals: number;
    expenses: number;
  };
  topSellingItems: Array<{
    dish_id: number;
    name: string;
    category: string;
    quantity: number;
    total: number;
  }>;
}

function formatPKR(n: number) {
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

export default function SuperAdminBranchAnalyticsPage() {
  const params = useParams<{ id: string; branchId: string }>();
  const restaurantId = Number(params?.id);
  const branchId = Number(params?.branchId);
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<BranchAnalytics | null>(null);
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
    if (!restaurantId || !branchId) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(
        `/api/analytics/overview?restaurantId=${restaurantId}&branchId=${branchId}&range=30days`
      );
      if (!res.ok) throw new Error("Failed to load branch analytics");
      const body: BranchAnalytics = await res.json();
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, branchId]);

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
    <DashboardLayout title={data ? data.branch.branch_name : "Branch"}>
      <div className="mb-4">
        <Link
          href={`/restaurants/${restaurantId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#ff5a1f] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Restaurant
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-[#ff5a1f]" />
        </div>
      ) : error || !data ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error || "Branch analytics not available"}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#ff5a1f]/10 flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-[#ff5a1f]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {data.branch.branch_name}
                </h2>
                <p className="text-sm text-gray-500">
                  Tenant: {data.branch.restaurant?.name ?? "—"} · Code:{" "}
                  {data.branch.branch_code}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <KpiCard label="Sales" value={formatPKR(data.kpis.totalSales)} icon={<DollarSign size={20} />} tone="text-green-600 bg-green-50" />
            <KpiCard label="Orders" value={String(data.kpis.totalOrders)} icon={<ShoppingCart size={20} />} tone="text-blue-600 bg-blue-50" />
            <KpiCard label="Avg Order" value={formatPKR(data.kpis.avgOrderValue)} icon={<BarChart3 size={20} />} tone="text-purple-600 bg-purple-50" />
            <KpiCard label="Active Menu" value={String(data.kpis.activeMenuItems)} icon={<Package size={20} />} tone="text-indigo-600 bg-indigo-50" />
            <KpiCard label="Active Deals" value={String(data.kpis.activeDeals)} icon={<BadgePercent size={20} />} tone="text-amber-600 bg-amber-50" />
            <KpiCard label="Expenses" value={formatPKR(data.kpis.expenses)} icon={<Wallet size={20} />} tone="text-rose-600 bg-rose-50" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4">
              Top Selling Items
            </h3>
            {data.topSellingItems.length === 0 ? (
              <p className="text-sm text-gray-400">No sales data yet</p>
            ) : (
              <ul className="space-y-2">
                {data.topSellingItems.map((item, i) => (
                  <li
                    key={item.dish_id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center text-xs font-bold text-[#ff5a1f]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {Math.round(item.quantity)} sold
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPKR(item.total)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
