"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  Coins,
  Hourglass,
  Loader2,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { apiFetch } from "@/lib/auth-client";

/* ──────────────────────────────────────────────────────────────────────
 * Branch Order Status Overview
 *
 * A drop-in dashboard section that renders 7 status cards (Pending,
 * Running, Served, Paid, Cancelled, Credit, Total Orders) for the
 * caller's branch scope. Counts are fetched from /api/stats/order-status
 * which pins BRANCH_ADMIN (and other branch-scoped roles) to their
 * assigned branch server-side — so this component cannot accidentally
 * leak cross-branch data even if a wrong prop is passed.
 *
 * Real-time behaviour:
 *   - silently polls every 25s (configurable via `pollIntervalMs`)
 *   - background refreshes do not clear existing data, so the grid never
 *     "flashes back to skeletons" while polling
 *   - a manual Refresh button is exposed in the section header
 *
 * Click-through:
 *   - every card (including Total) links to /orders?status=<status>
 *   - the Orders page honors the ?status= URL param and auto-scopes
 *     the branch filter via the session for Branch Admins
 * ────────────────────────────────────────────────────────────────────── */

export type OrderStatusRange = "today" | "7days" | "30days";

interface Counts {
  pending: number;
  running: number;
  served: number;
  paid: number;
  cancelled: number;
  credit: number;
  total: number;
}

interface ApiResponse {
  range: OrderStatusRange;
  from: string;
  to: string;
  counts: Counts;
}

interface Props {
  range?: OrderStatusRange;
  pollIntervalMs?: number;
  className?: string;
}

interface CardConfig {
  key: keyof Counts;
  label: string;
  helper: string;
  icon: React.ReactNode;
  tone: string;
  href: string;
  borderTone: string;
}

const CARD_CONFIG: CardConfig[] = [
  {
    key: "pending",
    label: "Pending",
    helper: "Awaiting action",
    icon: <Hourglass size={18} />,
    tone: "text-amber-600 bg-amber-50",
    borderTone: "hover:border-amber-300",
    href: "/orders?status=Pending",
  },
  {
    key: "running",
    label: "Running",
    helper: "In kitchen · processing",
    icon: <ChefHat size={18} />,
    tone: "text-orange-600 bg-orange-50",
    borderTone: "hover:border-orange-300",
    href: "/orders?status=Running",
  },
  {
    key: "served",
    label: "Served",
    helper: "Delivered successfully",
    icon: <Utensils size={18} />,
    tone: "text-indigo-600 bg-indigo-50",
    borderTone: "hover:border-indigo-300",
    href: "/orders?status=Served",
  },
  {
    key: "paid",
    label: "Paid",
    helper: "Payment completed",
    icon: <CheckCircle2 size={18} />,
    tone: "text-emerald-600 bg-emerald-50",
    borderTone: "hover:border-emerald-300",
    href: "/orders?status=Paid",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    helper: "Removed orders",
    icon: <Ban size={18} />,
    tone: "text-rose-600 bg-rose-50",
    borderTone: "hover:border-rose-300",
    href: "/orders?status=Cancelled",
  },
  {
    key: "credit",
    label: "Credit",
    helper: "Unpaid credit orders",
    icon: <Coins size={18} />,
    tone: "text-purple-600 bg-purple-50",
    borderTone: "hover:border-purple-300",
    href: "/orders?status=Credit",
  },
  {
    key: "total",
    label: "Total Orders",
    helper: "All branch orders",
    icon: <ClipboardList size={18} />,
    tone: "text-[#ff5a1f] bg-[#ff5a1f]/10",
    borderTone: "hover:border-[#ff5a1f]/40",
    href: "/orders",
  },
];

const rangeLabel = (r: OrderStatusRange) =>
  r === "today" ? "Today" : r === "30days" ? "Last 30 days" : "Last 7 days";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-100" />
      </div>
      <div className="mt-3 h-7 w-12 rounded bg-gray-200" />
      <div className="mt-2 h-2.5 w-24 rounded bg-gray-100" />
    </div>
  );
}

const BranchOrderStatusOverview: React.FC<Props> = ({
  range = "7days",
  pollIntervalMs = 25_000,
  className,
}) => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  const load = useCallback(
    async (mode: "initial" | "background" | "manual") => {
      if (mode === "initial") {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      try {
        const res = await apiFetch(
          `/api/stats/order-status?range=${encodeURIComponent(range)}`
        );
        if (!res.ok) {
          const payload = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "Failed to load order status");
        }
        const body = (await res.json()) as ApiResponse;
        if (!mountedRef.current) return;
        setCounts(body.counts);
        setError("");
      } catch (e) {
        if (!mountedRef.current) return;
        // On a background refresh we keep the previously rendered counts so
        // transient network hiccups don't blank the section — the error is
        // surfaced only when we have nothing to show yet.
        if (mode === "initial" || counts === null) {
          setError(e instanceof Error ? e.message : "Failed to load");
        }
      } finally {
        if (!mountedRef.current) return;
        if (mode === "initial") setLoading(false);
        setRefreshing(false);
      }
    },
    // `counts === null` decision is evaluated inside the handler above; we
    // intentionally do not depend on `counts` here to avoid re-creating
    // the callback on every successful refresh (which would restart the
    // polling interval).
    [range] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    mountedRef.current = true;
    load("initial");
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    const id = setInterval(() => load("background"), pollIntervalMs);
    return () => clearInterval(id);
  }, [load, pollIntervalMs]);

  const grid = useMemo(
    () => (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {loading
          ? CARD_CONFIG.map((c) => <SkeletonCard key={c.key} />)
          : CARD_CONFIG.map((c) => {
              const value = counts ? counts[c.key] : 0;
              return (
                <Link
                  key={c.key}
                  href={c.href}
                  className={`group relative bg-white rounded-xl border border-gray-100 shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${c.borderTone} focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/40 focus:ring-offset-2`}
                  aria-label={`Open orders filtered by ${c.label}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 leading-tight">
                      {c.label}
                    </p>
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110 ${c.tone}`}
                    >
                      {c.icon}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900 leading-none tabular-nums">
                    {value.toLocaleString("en-PK")}
                  </p>
                  <p className="mt-1.5 text-[11px] text-gray-400 truncate">
                    {c.helper}
                  </p>
                </Link>
              );
            })}
      </div>
    ),
    [counts, loading]
  );

  return (
    <section
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 ${
        className ?? ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="text-[#ff5a1f]" />
            <h3 className="text-sm font-bold text-gray-800">
              Order Status Overview
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time branch order tracking · {rangeLabel(range)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load("manual")}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#ff5a1f] hover:border-[#ff5a1f]/40 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Refresh order status counts"
        >
          {refreshing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
          Refresh
        </button>
      </div>

      {error && !counts ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle
            size={16}
            className="text-red-500 mt-0.5 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-700">
              Unable to load order status
            </p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => load("manual")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 shrink-0"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : (
        <>
          {grid}
          {!loading && counts && counts.total === 0 && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              No orders recorded for this branch in the selected range yet.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default BranchOrderStatusOverview;
