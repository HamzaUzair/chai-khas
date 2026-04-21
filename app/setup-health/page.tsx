"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  GitBranch,
  RefreshCw,
  Building2,
} from "lucide-react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatCard from "@/components/platform/StatCard";
import StatusBadge, {
  type PlatformBadgeTone,
} from "@/components/platform/StatusBadge";
import { usePlatformOverview } from "@/components/platform/usePlatformOverview";
import type { PlatformSetupAlert } from "@/types/platform";

const CATEGORY_LABELS: Record<PlatformSetupAlert["category"], string> = {
  missing_restaurant_admin: "Missing restaurant admin",
  no_branches: "Multi branch restaurant with no branches",
  missing_branch_admin: "Branch without a branch admin",
  inactive_restaurant: "Inactive restaurant",
  suspended_restaurant: "Suspended restaurant",
  trial_ending: "Trial ending soon",
};

const CATEGORY_ICONS: Record<PlatformSetupAlert["category"], React.ReactNode> = {
  missing_restaurant_admin: <UserPlus size={15} />,
  no_branches: <GitBranch size={15} />,
  missing_branch_admin: <UserPlus size={15} />,
  inactive_restaurant: <AlertTriangle size={15} />,
  suspended_restaurant: <ShieldAlert size={15} />,
  trial_ending: <AlertTriangle size={15} />,
};

export default function SetupHealthPage() {
  const { data, loading, refresh } = usePlatformOverview();
  const alerts = data?.setupAlerts ?? [];
  const branches = data?.branchAssignmentOverview ?? [];

  const byCategory = useMemo(() => {
    const m = new Map<PlatformSetupAlert["category"], PlatformSetupAlert[]>();
    for (const a of alerts) {
      const list = m.get(a.category) ?? [];
      list.push(a);
      m.set(a.category, list);
    }
    return m;
  }, [alerts]);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const unassignedBranches = branches.filter((b) => !b.branchAdminAssigned);

  return (
    <PlatformShell
      title="Setup Health"
      subtitle="Find tenants and branches that are not fully configured — missing admins, empty multi branch setups, inactive plans and trials nearing the end."
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
          label="Total Alerts"
          value={alerts.length.toLocaleString()}
          icon={<Activity size={18} />}
          tint="text-indigo-700 bg-indigo-100"
        />
        <StatCard
          label="Critical"
          value={criticalCount.toLocaleString()}
          icon={<ShieldAlert size={18} />}
          tint="text-rose-700 bg-rose-100"
        />
        <StatCard
          label="Warnings"
          value={warningCount.toLocaleString()}
          icon={<AlertTriangle size={18} />}
          tint="text-amber-700 bg-amber-100"
        />
        <StatCard
          label="Branches w/o Admin"
          value={unassignedBranches.length.toLocaleString()}
          icon={<Building2 size={18} />}
          tint="text-slate-700 bg-slate-100"
          hint={`${branches.length} branches total`}
        />
      </div>

      {alerts.length === 0 && !loading ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-lg font-semibold text-emerald-700">
            All tenants are healthy.
          </p>
          <p className="mt-1 text-sm text-emerald-600">
            No unassigned admins, empty branches or trials ending soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(byCategory.entries()).map(([category, list]) => (
            <div
              key={category}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    {CATEGORY_ICONS[category]}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {CATEGORY_LABELS[category]}
                  </h3>
                </div>
                <StatusBadge
                  label={`${list.length} ${list.length === 1 ? "issue" : "issues"}`}
                  tone={toneFor(list[0].severity)}
                />
              </div>
              <ul className="divide-y divide-gray-100">
                {list.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.restaurantName}
                      </p>
                      <p className="text-xs text-gray-500">{alert.detail}</p>
                    </div>
                    <Link
                      href={`/restaurants?status=${encodeURIComponent(
                        "Active"
                      )}`}
                      className="inline-flex w-fit items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      View tenant
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {unassignedBranches.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Branches missing a branch admin
            </h3>
            <p className="text-xs text-gray-500">
              Assign a branch admin so staff can log in and operate this branch.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Restaurant</th>
                  <th className="px-5 py-3 text-left font-semibold">Branch</th>
                  <th className="px-5 py-3 text-left font-semibold">Code</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unassignedBranches.map((b) => (
                  <tr key={b.branchId} className="hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {b.restaurantName}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{b.branchName}</td>
                    <td className="px-5 py-3 text-gray-500">{b.branchCode}</td>
                    <td className="px-5 py-3">
                      <StatusBadge label="No admin" tone="warning" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}

function toneFor(
  severity: PlatformSetupAlert["severity"]
): PlatformBadgeTone {
  return severity === "critical" ? "danger" : "warning";
}
