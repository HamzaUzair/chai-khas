"use client";

import React, { useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
  RefreshCw,
} from "lucide-react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatCard from "@/components/platform/StatCard";
import StatusBadge, {
  type PlatformBadgeTone,
} from "@/components/platform/StatusBadge";
import { usePlatformOverview } from "@/components/platform/usePlatformOverview";
import { formatUSD } from "@/lib/platform";
import type { DerivedSubscription } from "@/lib/platform";

export default function BillingPage() {
  const { data, loading, error, refresh } = usePlatformOverview();

  const subs: DerivedSubscription[] = data?.subscriptions ?? [];
  const billing = data?.billing;

  const paid = useMemo(
    () => subs.filter((s) => s.paymentStatus === "Paid"),
    [subs]
  );
  const failed = useMemo(
    () => subs.filter((s) => s.paymentStatus === "Failed"),
    [subs]
  );
  const pending = useMemo(
    () => subs.filter((s) => s.paymentStatus === "Pending" || s.status === "Trial"),
    [subs]
  );

  const recentPayments = useMemo(() => {
    // Most recent active / paying tenants by renewal date. When a real
    // payments table exists, swap this for invoice rows.
    return [...paid]
      .sort(
        (a, b) =>
          new Date(b.renewalDate).getTime() - new Date(a.renewalDate).getTime()
      )
      .slice(0, 10);
  }, [paid]);

  const paymentTone = (
    status: DerivedSubscription["paymentStatus"]
  ): PlatformBadgeTone => {
    switch (status) {
      case "Paid":
        return "success";
      case "Failed":
        return "danger";
      case "Pending":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <PlatformShell
      title="Billing"
      subtitle="Revenue visibility for the Restenzo SaaS platform. All numbers are computed live from active tenants and their derived subscription state."
      headerExtra={
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="MRR"
          value={formatUSD(billing?.mrr ?? 0)}
          icon={<Wallet size={18} />}
          tint="text-[#ff5a1f] bg-[#ff5a1f]/10"
          hint={`${billing?.activePayingCustomers ?? 0} paying`}
        />
        <StatCard
          label="ARR"
          value={formatUSD(billing?.arr ?? 0)}
          icon={<TrendingUp size={18} />}
          tint="text-emerald-700 bg-emerald-100"
          hint="MRR × 12"
        />
        <StatCard
          label="Failed / Suspended"
          value={(billing?.pastDueCustomers ?? 0) + (billing?.canceledOrSuspendedCustomers ?? 0)}
          icon={<AlertTriangle size={18} />}
          tint="text-rose-700 bg-rose-100"
        />
        <StatCard
          label="On Trial"
          value={(billing?.trialingCustomers ?? 0).toLocaleString()}
          icon={<Clock3 size={18} />}
          tint="text-sky-700 bg-sky-100"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">
            Customer split by cycle
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Yearly vs monthly billing mix.
          </p>
          <div className="mt-4 space-y-3">
            <MixBar
              label="Monthly"
              value={billing?.monthlyCustomers ?? 0}
              total={
                (billing?.monthlyCustomers ?? 0) +
                (billing?.yearlyCustomers ?? 0)
              }
              color="bg-indigo-500"
            />
            <MixBar
              label="Yearly"
              value={billing?.yearlyCustomers ?? 0}
              total={
                (billing?.monthlyCustomers ?? 0) +
                (billing?.yearlyCustomers ?? 0)
              }
              color="bg-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Revenue by plan</h3>
          <p className="mt-1 text-xs text-gray-500">
            MRR distributed across active SaaS plans.
          </p>
          <div className="mt-4 space-y-3">
            {(billing?.byPlan ?? []).length === 0 ? (
              <p className="text-xs text-gray-400">
                No paying tenants yet — revenue will appear once trials convert.
              </p>
            ) : (
              (billing?.byPlan ?? []).map((p) => (
                <MixBar
                  key={p.planId}
                  label={p.planName}
                  value={p.mrr}
                  total={billing?.mrr ?? 0}
                  color={
                    p.planId === "multi" ? "bg-[#ff5a1f]" : "bg-sky-500"
                  }
                  formatValue={formatUSD}
                />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Payment health</h3>
          <p className="mt-1 text-xs text-gray-500">
            Snapshot of paid, pending and failed statuses.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <HealthRow
              label="Paid"
              value={paid.length}
              tone="success"
              icon={<CheckCircle2 size={14} />}
            />
            <HealthRow
              label="Pending / Trial"
              value={pending.length}
              tone="warning"
              icon={<Clock3 size={14} />}
            />
            <HealthRow
              label="Failed / Suspended"
              value={failed.length}
              tone="danger"
              icon={<XCircle size={14} />}
            />
          </dl>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Recent paying tenants
          </h3>
          <p className="text-xs text-gray-400">
            Sorted by most recent renewal date
          </p>
        </div>
        {loading && !data ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : recentPayments.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No paid subscriptions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Restaurant</th>
                  <th className="px-5 py-3 text-left font-semibold">Plan</th>
                  <th className="px-5 py-3 text-left font-semibold">Cycle</th>
                  <th className="px-5 py-3 text-left font-semibold">Payment</th>
                  <th className="px-5 py-3 text-left font-semibold">Renewal</th>
                  <th className="px-5 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((p) => (
                  <tr key={p.restaurantId} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {p.restaurantName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{p.planName}</td>
                    <td className="px-5 py-4 text-gray-700 capitalize">
                      {p.billingCycle}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={p.paymentStatus}
                        tone={paymentTone(p.paymentStatus)}
                      />
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {new Date(p.renewalDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">
                      {formatUSD(p.cyclePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PlatformShell>
  );
}

function MixBar({
  label,
  value,
  total,
  color,
  formatValue,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  formatValue?: (n: number) => string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  const display = formatValue ? formatValue(value) : value.toLocaleString();
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {display}{" "}
          <span className="text-gray-400">({pct.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function HealthRow({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: PlatformBadgeTone;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-700">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
            tone === "success"
              ? "bg-emerald-50 text-emerald-600"
              : tone === "warning"
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
