"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  BadgePercent,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  Package,
  ShoppingCart,
  Store,
  Trophy,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch, getAuthSession } from "@/lib/auth-client";

type Level = "platform" | "restaurant" | "branch";
type DateRange = "today" | "7days" | "30days";

interface KpiBase {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
}

interface PlatformResponse {
  level: "platform";
  range: DateRange;
  kpis: KpiBase & { totalRestaurants: number; totalBranches: number };
  restaurants: Array<{
    restaurant_id: number;
    name: string;
    slug: string;
    status: string;
    branchCount: number;
    sales: number;
    orders: number;
  }>;
  topRestaurants: Array<{
    restaurant_id: number;
    name: string;
    sales: number;
    orders: number;
  }>;
}

interface RestaurantResponse {
  level: "restaurant";
  range: DateRange;
  restaurant: {
    restaurant_id: number;
    name: string;
    slug: string;
    status: string;
    branchCount: number;
    userCount: number;
  };
  kpis: KpiBase & { totalBranches: number };
  branches: Array<{
    branch_id: number;
    branch_name: string;
    branch_code: string;
    status: string;
    sales: number;
    orders: number;
    avgOrderValue: number;
  }>;
  topBranch: { branch_name: string; sales: number } | null;
  lowestBranch: { branch_name: string; sales: number } | null;
}

interface BranchResponse {
  level: "branch";
  range: DateRange;
  branch: {
    branch_id: number;
    branch_name: string;
    branch_code: string;
    status: string;
    restaurant: { restaurant_id: number; name: string; slug: string } | null;
  };
  kpis: KpiBase & {
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

type OverviewResponse = PlatformResponse | RestaurantResponse | BranchResponse;

function formatPKR(n: number) {
  return `PKR ${Math.round(n).toLocaleString("en-PK")}`;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>("");

  const [range, setRange] = useState<DateRange>("7days");
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);

  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setRole(session.role);
    setAuthorized(true);
  }, [router]);

  const load = useCallback(async () => {
    if (!authorized) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("range", range);
      if (restaurantId) params.set("restaurantId", String(restaurantId));
      if (branchId) params.set("branchId", String(branchId));
      const res = await apiFetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const body: OverviewResponse = await res.json();
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [authorized, range, restaurantId, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentLevel: Level = data?.level ?? "platform";
  const breadcrumb: Array<{ label: string; onClick?: () => void }> = [];
  breadcrumb.push({
    label: role === "SUPER_ADMIN" ? "Platform" : "Restaurant",
    onClick:
      role === "SUPER_ADMIN"
        ? () => {
            setRestaurantId(null);
            setBranchId(null);
          }
        : undefined,
  });
  if (data && data.level === "restaurant") {
    breadcrumb.push({ label: data.restaurant.name });
  } else if (data && data.level === "branch") {
    if (data.branch.restaurant) {
      breadcrumb.push({
        label: data.branch.restaurant.name,
        onClick:
          role === "SUPER_ADMIN"
            ? () => {
                setBranchId(null);
              }
            : undefined,
      });
    }
    breadcrumb.push({ label: data.branch.branch_name });
  }

  return (
    <DashboardLayout title="Advanced Analytics">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={22} className="text-[#ff5a1f]" />
              <h2 className="text-2xl font-bold text-gray-800">
                {role === "SUPER_ADMIN"
                  ? "SaaS Analytics"
                  : "Restaurant Analytics"}
              </h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {role === "SUPER_ADMIN"
                ? "Platform, restaurant, and branch performance drilldown"
                : "Monitor your restaurant performance across all branches"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(restaurantId || branchId) && (
              <button
                onClick={() => {
                  if (branchId) {
                    setBranchId(null);
                  } else {
                    setRestaurantId(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 border border-[#ff5a1f]/40 text-[#ff5a1f] bg-[#ff5a1f]/5 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-[#ff5a1f]/10 transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                {branchId && data?.level === "branch" && data.branch.restaurant
                  ? `Back to ${data.branch.restaurant.name}`
                  : "Back to Platform"}
              </button>
            )}
            <div className="relative">
              <Calendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                className="border border-gray-200 rounded-lg pl-8 pr-3.5 py-2 text-sm text-gray-700 bg-white cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30"
                value={range}
                onChange={(e) => setRange(e.target.value as DateRange)}
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="mt-4 flex items-center gap-1.5 text-sm">
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-gray-400">/</span>}
              {b.onClick ? (
                <button
                  onClick={b.onClick}
                  className="inline-flex items-center gap-1 text-[#ff5a1f] hover:bg-[#ff5a1f]/10 px-2 py-0.5 rounded-md cursor-pointer font-semibold"
                  title={`Go back to ${b.label}`}
                >
                  {b.label}
                </button>
              ) : (
                <span className="text-gray-700 font-medium px-2">{b.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-[#ff5a1f]" />
        </div>
      ) : error || !data ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          {error || "No data"}
        </div>
      ) : data.level === "platform" ? (
        <PlatformView
          data={data}
          onRestaurantClick={(rid) => {
            setRestaurantId(rid);
            setBranchId(null);
          }}
        />
      ) : data.level === "restaurant" ? (
        <RestaurantView
          data={data}
          canDrillToBranch
          onBranchClick={(bid) => setBranchId(bid)}
          onDrillUp={
            role === "SUPER_ADMIN" && restaurantId
              ? () => setRestaurantId(null)
              : undefined
          }
        />
      ) : (
        <BranchView
          data={data}
          onDrillUpToRestaurant={() => setBranchId(null)}
          onDrillUpToPlatform={
            role === "SUPER_ADMIN" && restaurantId
              ? () => {
                  setBranchId(null);
                  setRestaurantId(null);
                }
              : undefined
          }
        />
      )}
      {currentLevel /* referenced to keep the var used */ ? null : null}
    </DashboardLayout>
  );
}

/* ─────────────── Platform view ─────────────── */

function PlatformView({
  data,
  onRestaurantClick,
}: {
  data: PlatformResponse;
  onRestaurantClick: (restaurantId: number) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard
          label="Restaurants"
          value={String(data.kpis.totalRestaurants)}
          icon={<Store size={20} />}
          tone="text-[#ff5a1f] bg-[#ff5a1f]/10"
        />
        <KpiCard
          label="Branches"
          value={String(data.kpis.totalBranches)}
          icon={<Building2 size={20} />}
          tone="text-indigo-600 bg-indigo-50"
        />
        <KpiCard
          label="Total Sales"
          value={formatPKR(data.kpis.totalSales)}
          icon={<DollarSign size={20} />}
          tone="text-green-600 bg-green-50"
        />
        <KpiCard
          label="Total Orders"
          value={String(data.kpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
          tone="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="Avg Order"
          value={formatPKR(data.kpis.avgOrderValue)}
          icon={<BarChart3 size={20} />}
          tone="text-purple-600 bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">Top Restaurants</h3>
          </div>
          {data.topRestaurants.length === 0 ? (
            <p className="text-sm text-gray-400">No sales yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topRestaurants.map((r, i) => (
                <li
                  key={r.restaurant_id}
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center text-xs font-bold text-[#ff5a1f]">
                      {i + 1}
                    </span>
                    <span className="font-medium text-gray-800">{r.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-700">
                      {formatPKR(r.sales)}
                    </p>
                    <p className="text-xs text-gray-400">{r.orders} orders</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Store size={18} className="text-[#ff5a1f]" />
            <h3 className="text-sm font-bold text-gray-800">Active Tenants</h3>
          </div>
          <p className="text-sm text-gray-500">
            {data.restaurants.filter((r) => r.status === "Active").length} of{" "}
            {data.restaurants.length} restaurants are currently active on the
            platform.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            All Restaurants
          </h3>
          <Link
            href="/restaurants"
            className="text-xs font-semibold text-[#ff5a1f] hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                {["Restaurant", "Status", "Branches", "Sales", "Orders", ""].map(
                  (c) => (
                    <th
                      key={c}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {c}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.restaurants.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    No restaurants on the platform yet.
                  </td>
                </tr>
              ) : (
                data.restaurants.map((r) => (
                  <tr
                    key={r.restaurant_id}
                    className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => onRestaurantClick(r.restaurant_id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {r.name}
                      <p className="text-xs text-gray-400 mt-0.5">{r.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          r.status === "Active"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{r.branchCount}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatPKR(r.sales)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{r.orders}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-[#ff5a1f]">
                        Drill down →
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ─────────────── Restaurant view ─────────────── */

function RestaurantView({
  data,
  canDrillToBranch,
  onBranchClick,
  onDrillUp,
}: {
  data: RestaurantResponse;
  canDrillToBranch: boolean;
  onBranchClick: (branchId: number) => void;
  onDrillUp?: () => void;
}) {
  return (
    <>
      {onDrillUp && (
        <DrillUpBar
          label="Back to Platform"
          description={`Viewing ${data.restaurant.name} · ${data.kpis.totalBranches} branches`}
          onClick={onDrillUp}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Sales"
          value={formatPKR(data.kpis.totalSales)}
          icon={<DollarSign size={20} />}
          tone="text-green-600 bg-green-50"
        />
        <KpiCard
          label="Total Orders"
          value={String(data.kpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
          tone="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="Avg Order"
          value={formatPKR(data.kpis.avgOrderValue)}
          icon={<BarChart3 size={20} />}
          tone="text-purple-600 bg-purple-50"
        />
        <KpiCard
          label="Branches"
          value={String(data.kpis.totalBranches)}
          icon={<Building2 size={20} />}
          tone="text-[#ff5a1f] bg-[#ff5a1f]/10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SpotlightCard
          title="Top Branch"
          icon={<Trophy size={18} className="text-amber-500" />}
          name={data.topBranch?.branch_name ?? null}
          subtitle={data.topBranch ? formatPKR(data.topBranch.sales) : "—"}
        />
        <SpotlightCard
          title="Lowest Branch"
          icon={<TrendingDown size={18} className="text-gray-500" />}
          name={data.lowestBranch?.branch_name ?? null}
          subtitle={
            data.lowestBranch ? formatPKR(data.lowestBranch.sales) : "—"
          }
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            Branch Performance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                {["Branch", "Code", "Status", "Sales", "Orders", "AOV", ""].map(
                  (c) => (
                    <th
                      key={c}
                      className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {c}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.branches.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    No branches yet for this restaurant.
                  </td>
                </tr>
              ) : (
                data.branches.map((b) => (
                  <tr
                    key={b.branch_id}
                    className={`transition-colors ${
                      canDrillToBranch
                        ? "hover:bg-gray-50/60 cursor-pointer"
                        : ""
                    }`}
                    onClick={() =>
                      canDrillToBranch ? onBranchClick(b.branch_id) : undefined
                    }
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {b.branch_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{b.branch_code}</td>
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
                      {formatPKR(b.sales)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{b.orders}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatPKR(b.avgOrderValue)}
                    </td>
                    <td className="px-6 py-4">
                      {canDrillToBranch && (
                        <span className="text-xs font-semibold text-[#ff5a1f]">
                          Drill down →
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ─────────────── Branch view ─────────────── */

function BranchView({
  data,
  onDrillUpToRestaurant,
  onDrillUpToPlatform,
}: {
  data: BranchResponse;
  onDrillUpToRestaurant?: () => void;
  onDrillUpToPlatform?: () => void;
}) {
  const restaurantName = data.branch.restaurant?.name;
  return (
    <>
      {(onDrillUpToRestaurant || onDrillUpToPlatform) && (
        <DrillUpBar
          label={
            restaurantName && onDrillUpToRestaurant
              ? `Back to ${restaurantName}`
              : "Back to Platform"
          }
          description={`Viewing ${data.branch.branch_name} (${data.branch.branch_code})`}
          onClick={onDrillUpToRestaurant ?? onDrillUpToPlatform!}
          secondaryLabel={
            onDrillUpToRestaurant && onDrillUpToPlatform
              ? "Back to Platform"
              : undefined
          }
          onSecondaryClick={
            onDrillUpToRestaurant && onDrillUpToPlatform
              ? onDrillUpToPlatform
              : undefined
          }
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          label="Sales"
          value={formatPKR(data.kpis.totalSales)}
          icon={<DollarSign size={20} />}
          tone="text-green-600 bg-green-50"
        />
        <KpiCard
          label="Orders"
          value={String(data.kpis.totalOrders)}
          icon={<ShoppingCart size={20} />}
          tone="text-blue-600 bg-blue-50"
        />
        <KpiCard
          label="Avg Order"
          value={formatPKR(data.kpis.avgOrderValue)}
          icon={<BarChart3 size={20} />}
          tone="text-purple-600 bg-purple-50"
        />
        <KpiCard
          label="Active Menu"
          value={String(data.kpis.activeMenuItems)}
          icon={<Package size={20} />}
          tone="text-indigo-600 bg-indigo-50"
        />
        <KpiCard
          label="Active Deals"
          value={String(data.kpis.activeDeals)}
          icon={<BadgePercent size={20} />}
          tone="text-amber-600 bg-amber-50"
        />
        <KpiCard
          label="Expenses"
          value={formatPKR(data.kpis.expenses)}
          icon={<Wallet size={20} />}
          tone="text-rose-600 bg-rose-50"
        />
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
  );
}

/* ─────────────── Shared ─────────────── */

function DrillUpBar({
  label,
  description,
  onClick,
  secondaryLabel,
  onSecondaryClick,
}: {
  label: string;
  description?: string;
  onClick: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-[#ff5a1f]/30 shadow-sm px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ff5a1f]/10 text-[#ff5a1f] shrink-0">
          <ArrowUpLeft size={16} />
        </span>
        {description && (
          <p className="text-sm text-gray-600 truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {secondaryLabel && onSecondaryClick && (
          <button
            onClick={onSecondaryClick}
            className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-700 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            {secondaryLabel}
          </button>
        )}
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white bg-[#ff5a1f] hover:bg-[#ff4e0e] transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft size={13} />
          {label}
        </button>
      </div>
    </div>
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
