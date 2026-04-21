"use client";

import React from "react";
import {
  Package,
  Users,
  Check,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import PlatformShell from "@/components/platform/PlatformShell";
import StatCard from "@/components/platform/StatCard";
import StatusBadge from "@/components/platform/StatusBadge";
import { usePlatformOverview } from "@/components/platform/usePlatformOverview";
import { PLANS, YEARLY_DISCOUNT_PERCENT, type Plan } from "@/lib/pricing";
import { formatUSD } from "@/lib/platform";

export default function PlansPage() {
  const { data, loading, refresh } = usePlatformOverview();
  const billing = data?.billing;

  const planMetrics = (plan: Plan) => {
    const entry = billing?.byPlan.find((p) => p.planId === plan.id);
    return {
      customers: entry?.customers ?? 0,
      mrr: entry?.mrr ?? 0,
    };
  };

  const totalSubs = data?.subscriptions.length ?? 0;

  return (
    <PlatformShell
      title="Plans"
      subtitle="All SaaS plans the Restenzo platform offers today, with live tenant and revenue counts derived from your database."
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
          label="Total Plans"
          value={PLANS.length.toString()}
          icon={<Package size={18} />}
          tint="text-indigo-700 bg-indigo-100"
        />
        <StatCard
          label="Active Plans"
          value={PLANS.filter((p) => p.id !== "enterprise").length.toString()}
          icon={<Sparkles size={18} />}
          tint="text-emerald-700 bg-emerald-100"
          hint="Single + Multi"
        />
        <StatCard
          label="Paying Tenants"
          value={(billing?.activePayingCustomers ?? 0).toLocaleString()}
          icon={<Users size={18} />}
          tint="text-[#ff5a1f] bg-[#ff5a1f]/10"
          hint={`${totalSubs} total`}
        />
        <StatCard
          label="Yearly Discount"
          value={`${YEARLY_DISCOUNT_PERCENT}%`}
          icon={<TrendingUp size={18} />}
          tint="text-amber-700 bg-amber-100"
          hint="Applied to yearly"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const metrics = planMetrics(plan);
          const isEnterprise = plan.id === "enterprise";
          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ${
                plan.highlighted
                  ? "border-[#ff5a1f] ring-1 ring-[#ff5a1f]/30"
                  : "border-gray-100"
              }`}
            >
              {plan.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-[#ff5a1f]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ff5a1f]">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </h3>
                <StatusBadge
                  label={isEnterprise ? "Custom" : "Active"}
                  tone={isEnterprise ? "info" : "active"}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

              <div className="mt-5 flex items-baseline gap-2">
                {isEnterprise ? (
                  <span className="text-2xl font-bold text-gray-900">
                    Contact sales
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.monthly}
                    </span>
                    <span className="text-sm text-gray-500">/mo</span>
                  </>
                )}
              </div>
              {!isEnterprise && (
                <p className="text-xs text-gray-500">
                  or{" "}
                  <span className="font-semibold text-gray-700">
                    ${plan.yearly}/mo
                  </span>{" "}
                  billed yearly
                </p>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Customers
                  </dt>
                  <dd className="mt-0.5 text-lg font-bold text-gray-900">
                    {metrics.customers}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    MRR
                  </dt>
                  <dd className="mt-0.5 text-lg font-bold text-gray-900">
                    {formatUSD(metrics.mrr)}
                  </dd>
                </div>
              </dl>

              <ul className="mt-5 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <Check
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center gap-2">
                <button
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  title="Editing plans will open when Stripe price management is wired"
                  disabled
                >
                  Edit plan
                </button>
                <button
                  className="flex-1 rounded-lg bg-[#ff5a1f] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#e04e18] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isEnterprise}
                >
                  {isEnterprise ? "Via sales" : "Manage tenants"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-xs text-gray-500">
        <p>
          <span className="font-semibold text-gray-700">Stripe integration:</span>{" "}
          Plan prices and feature limits live in <code>lib/pricing.ts</code>
          today. When the Stripe billing module lands, this page will source
          products directly from Stripe — UI components are already shaped for
          that upgrade path (see <code>stripeIds</code> on each plan).
        </p>
      </div>
    </PlatformShell>
  );
}
