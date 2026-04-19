import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";

/**
 * GET /api/stats/order-status
 *
 * Returns order status counts for the caller's branch scope. Used by the
 * Branch Admin Dashboard "Order Status Overview" section. Branch-scoped
 * roles (BRANCH_ADMIN / ORDER_TAKER / CASHIER / ACCOUNTANT / LIVE_KITCHEN)
 * are pinned to their assigned branch server-side via
 * `buildBranchScopeFilter` — the `branchId` query parameter is ignored for
 * them, so a Branch Admin can never pull combined multi-branch counts
 * from this endpoint.
 *
 * Query params:
 *   - range = "today" | "7days" | "30days"   (default "7days")
 *   - branchId (only honored for SUPER_ADMIN / RESTAURANT_ADMIN)
 *
 * Response:
 *   {
 *     range, from, to,
 *     counts: {
 *       pending, running, served, paid, cancelled, credit, total
 *     }
 *   }
 *
 * Status mapping notes:
 *   - "Paid" also absorbs the legacy `Complete` / `Bill Generated` rows
 *     written by older installs (mirrors the normalisation used by the
 *     orders list and sales-list/sales-report modules).
 *   - `total` is the sum of every status in the selected date range for
 *     the scoped branch — it is NOT filtered by status and so includes
 *     statuses that might not be surfaced as their own card (defensive).
 */

type RangeKey = "today" | "7days" | "30days";

function parseIntParam(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function resolveDateRange(range: string | null) {
  const to = new Date();
  const from = new Date(to);
  const label: RangeKey =
    range === "today" || range === "30days" || range === "7days"
      ? (range as RangeKey)
      : "7days";
  switch (label) {
    case "today":
      from.setHours(0, 0, 0, 0);
      break;
    case "30days":
      from.setDate(from.getDate() - 30);
      break;
    case "7days":
    default:
      from.setDate(from.getDate() - 7);
      break;
  }
  return { from, to, label };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const requestedBranchId = parseIntParam(searchParams.get("branchId"));
    const { from, to, label } = resolveDateRange(searchParams.get("range"));

    const scope = await buildBranchScopeFilter(auth, requestedBranchId);
    const whereBase: Prisma.OrderWhereInput = {
      ...(scope as Prisma.OrderWhereInput),
      created_at: { gte: from, lte: to },
    };

    const grouped = await prisma.order.groupBy({
      by: ["order_status"],
      where: whereBase,
      _count: { _all: true },
    });

    const byStatus: Record<string, number> = {};
    for (const row of grouped) {
      byStatus[row.order_status] = row._count._all;
    }
    const pick = (s: string) => byStatus[s] ?? 0;

    const counts = {
      pending: pick("Pending"),
      running: pick("Running"),
      served: pick("Served"),
      // Legacy rows (`Complete`, `Bill Generated`) are normalised to Paid
      // in the orders list view — mirror that here so the dashboard count
      // matches what the user sees when they drill in.
      paid: pick("Paid") + pick("Complete") + pick("Bill Generated"),
      cancelled: pick("Cancelled"),
      credit: pick("Credit"),
      total: grouped.reduce((sum, row) => sum + row._count._all, 0),
    };

    return NextResponse.json({
      range: label,
      from,
      to,
      counts,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("order-status stats failed", err);
    return NextResponse.json(
      { error: "Failed to load order status counts" },
      { status: 500 }
    );
  }
}
