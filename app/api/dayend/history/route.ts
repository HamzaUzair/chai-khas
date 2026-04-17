import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";
import type { DayEndRecord } from "@/types/dayend";

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (
      auth.role !== "SUPER_ADMIN" &&
      auth.role !== "RESTAURANT_ADMIN" &&
      auth.role !== "BRANCH_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");
    const dateFrom = parseDate(searchParams.get("dateFrom"));
    const dateTo = parseDate(searchParams.get("dateTo"));
    const limitParam = Number(searchParams.get("limit") ?? "50");
    const take = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 50, 1), 200);

    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const scope = await buildBranchScopeFilter(auth, requestedBranchId);

    const where: Prisma.DayEndWhereInput = {
      ...(scope as Prisma.DayEndWhereInput),
    };
    if (dateFrom || dateTo) {
      where.business_date = {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      };
    }

    const rows = await prisma.dayEnd.findMany({
      where,
      orderBy: [{ business_date: "desc" }, { id: "desc" }],
      take,
      include: {
        branch: { select: { branch_name: true } },
        closed_by: { select: { fullname: true, username: true } },
      },
    });

    // Expense totals per (branch, business_date) so the history row reflects
    // the live expense figure even if expenses were added after closure.
    // We still expose the snapshot `expences` column for closure-time truth.
    const records: DayEndRecord[] = rows.map((r) => {
      const totalSales = Number(r.total_sales);
      const totalExpenses = Number(r.expences);
      return {
        id: r.id,
        date: formatDate(r.business_date),
        branchId: r.branch_id,
        branchName: r.branch?.branch_name ?? "—",
        totalSales,
        totalExpenses,
        netRevenue: totalSales - totalExpenses,
        totalOrders: r.total_orders,
        cancelledOrders: r.cancelled_orders,
        status: "closed",
        closedBy:
          r.closed_by?.fullname?.trim() ||
          r.closed_by?.username ||
          "—",
        closedAt: r.closing_date_time.toISOString(),
        note: r.note ?? undefined,
      };
    });

    return NextResponse.json({ records });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/dayend/history error:", err);
    return NextResponse.json({ error: "Failed to fetch day end history" }, { status: 500 });
  }
}
