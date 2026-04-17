import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  AuthError,
  assertBranchAccess,
  assertRestaurantAccess,
  requireAuth,
} from "@/lib/server-auth";

/**
 * SaaS drilldown analytics endpoint.
 *
 * Scope resolution by role:
 *   - SUPER_ADMIN:
 *       · no filters          → level="platform"   (all restaurants, all branches)
 *       · ?restaurantId=X     → level="restaurant" (one tenant, all its branches)
 *       · ?restaurantId=X&branchId=Y → level="branch" (single branch inside tenant)
 *   - RESTAURANT_ADMIN:
 *       · always pinned to their own restaurant; `restaurantId` is ignored.
 *       · ?branchId=Y (inside their restaurant) → level="branch"
 *       · otherwise                              → level="restaurant"
 *   - Branch staff (ORDER_TAKER/CASHIER/ACCOUNTANT):
 *       · always level="branch" for their assigned branch.
 *
 * Date range:
 *   · ?range=today|7days|30days  (default 7days)
 */

type Level = "platform" | "restaurant" | "branch";

function parseIntParam(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function resolveDateRange(range: string | null) {
  const now = new Date();
  const to = now;
  const from = new Date(now);
  switch (range) {
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
  return { from, to, label: range ?? "7days" };
}

function toNumber(v: Prisma.Decimal | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v.toString());
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const requestedRestaurantId = parseIntParam(searchParams.get("restaurantId"));
    const requestedBranchId = parseIntParam(searchParams.get("branchId"));
    const { from, to, label: rangeLabel } = resolveDateRange(
      searchParams.get("range")
    );

    let level: Level;
    let scopedRestaurantId: number | null = null;
    let scopedBranchId: number | null = null;

    if (auth.role === "SUPER_ADMIN") {
      scopedRestaurantId = requestedRestaurantId;
      scopedBranchId = requestedBranchId;
      if (scopedBranchId) {
        level = "branch";
      } else if (scopedRestaurantId) {
        level = "restaurant";
      } else {
        level = "platform";
      }
    } else if (auth.role === "RESTAURANT_ADMIN") {
      if (!auth.restaurantId) throw new AuthError("Restaurant assignment missing", 403);
      scopedRestaurantId = auth.restaurantId;
      if (requestedBranchId) {
        await assertBranchAccess(auth, requestedBranchId);
        scopedBranchId = requestedBranchId;
        level = "branch";
      } else {
        level = "restaurant";
      }
    } else {
      if (!auth.branchId) throw new AuthError("Branch assignment missing", 403);
      scopedBranchId = auth.branchId;
      const staffBranch = await prisma.branch.findUnique({
        where: { branch_id: auth.branchId },
        select: { restaurant_id: true },
      });
      scopedRestaurantId = staffBranch?.restaurant_id ?? null;
      level = "branch";
    }

    if (scopedRestaurantId !== null) {
      assertRestaurantAccess(auth, scopedRestaurantId);
    }
    if (scopedBranchId !== null) {
      await assertBranchAccess(auth, scopedBranchId);
    }

    const orderWhere: Prisma.OrderWhereInput = {
      created_at: { gte: from, lte: to },
    };
    if (scopedBranchId) {
      orderWhere.branch_id = scopedBranchId;
    } else if (scopedRestaurantId) {
      orderWhere.restaurant_id = scopedRestaurantId;
    }

    const [orderAgg, orderCount] = await Promise.all([
      prisma.order.aggregate({
        where: orderWhere,
        _sum: { net_total_amount: true },
        _avg: { net_total_amount: true },
      }),
      prisma.order.count({ where: orderWhere }),
    ]);

    const kpis = {
      totalSales: toNumber(orderAgg._sum.net_total_amount),
      totalOrders: orderCount,
      avgOrderValue: toNumber(orderAgg._avg.net_total_amount),
    };

    if (level === "platform") {
      const [restaurants, totalBranches, totalRestaurants] = await Promise.all([
        prisma.restaurant.findMany({
          select: {
            restaurant_id: true,
            name: true,
            slug: true,
            status: true,
            _count: { select: { branches: true } },
          },
          orderBy: { name: "asc" },
        }),
        prisma.branch.count(),
        prisma.restaurant.count(),
      ]);

      const restaurantStats = await prisma.order.groupBy({
        by: ["restaurant_id"],
        where: { created_at: { gte: from, lte: to } },
        _sum: { net_total_amount: true },
        _count: { _all: true },
      });
      const statsMap = new Map<number, { sales: number; orders: number }>();
      for (const row of restaurantStats) {
        statsMap.set(row.restaurant_id, {
          sales: toNumber(row._sum.net_total_amount),
          orders: row._count._all,
        });
      }
      const restaurantList = restaurants.map((r) => ({
        restaurant_id: r.restaurant_id,
        name: r.name,
        slug: r.slug,
        status: r.status,
        branchCount: r._count.branches,
        sales: statsMap.get(r.restaurant_id)?.sales ?? 0,
        orders: statsMap.get(r.restaurant_id)?.orders ?? 0,
      }));
      const topRestaurants = [...restaurantList]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return NextResponse.json({
        level,
        range: rangeLabel,
        from,
        to,
        kpis: { ...kpis, totalRestaurants, totalBranches },
        restaurants: restaurantList,
        topRestaurants,
      });
    }

    if (level === "restaurant") {
      if (!scopedRestaurantId) throw new AuthError("Restaurant scope missing", 400);
      const restaurant = await prisma.restaurant.findUnique({
        where: { restaurant_id: scopedRestaurantId },
        select: {
          restaurant_id: true,
          name: true,
          slug: true,
          status: true,
          phone: true,
          address: true,
          _count: { select: { branches: true, users: true } },
        },
      });
      if (!restaurant) throw new AuthError("Restaurant not found", 404);

      const branches = await prisma.branch.findMany({
        where: { restaurant_id: scopedRestaurantId },
        select: {
          branch_id: true,
          branch_name: true,
          branch_code: true,
          status: true,
        },
        orderBy: { branch_name: "asc" },
      });

      const branchStats = await prisma.order.groupBy({
        by: ["branch_id"],
        where: {
          restaurant_id: scopedRestaurantId,
          created_at: { gte: from, lte: to },
        },
        _sum: { net_total_amount: true },
        _count: { _all: true },
        _avg: { net_total_amount: true },
      });
      const statsMap = new Map<
        number,
        { sales: number; orders: number; avg: number }
      >();
      for (const row of branchStats) {
        statsMap.set(row.branch_id, {
          sales: toNumber(row._sum.net_total_amount),
          orders: row._count._all,
          avg: toNumber(row._avg.net_total_amount),
        });
      }
      const branchList = branches.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_code: b.branch_code,
        status: b.status,
        sales: statsMap.get(b.branch_id)?.sales ?? 0,
        orders: statsMap.get(b.branch_id)?.orders ?? 0,
        avgOrderValue: statsMap.get(b.branch_id)?.avg ?? 0,
      }));
      const sortedBySales = [...branchList].sort((a, b) => b.sales - a.sales);
      const topBranch = sortedBySales[0] ?? null;
      const lowestBranch =
        sortedBySales.length > 1 ? sortedBySales[sortedBySales.length - 1] : null;

      return NextResponse.json({
        level,
        range: rangeLabel,
        from,
        to,
        restaurant: {
          restaurant_id: restaurant.restaurant_id,
          name: restaurant.name,
          slug: restaurant.slug,
          status: restaurant.status,
          phone: restaurant.phone,
          address: restaurant.address,
          branchCount: restaurant._count.branches,
          userCount: restaurant._count.users,
        },
        kpis: {
          ...kpis,
          totalBranches: restaurant._count.branches,
        },
        branches: branchList,
        topBranch,
        lowestBranch,
      });
    }

    if (!scopedBranchId) throw new AuthError("Branch scope missing", 400);
    const branch = await prisma.branch.findUnique({
      where: { branch_id: scopedBranchId },
      select: {
        branch_id: true,
        branch_name: true,
        branch_code: true,
        status: true,
        restaurant: {
          select: { restaurant_id: true, name: true, slug: true },
        },
      },
    });
    if (!branch) throw new AuthError("Branch not found", 404);

    const [activeMenuCount, activeDealCount, expensesAgg, topItems] =
      await Promise.all([
        prisma.menuItem.count({
          where: { branch_id: scopedBranchId, status: "ACTIVE" },
        }),
        prisma.deal.count({
          where: { branch_id: scopedBranchId, status: "Active" },
        }),
        prisma.expense.aggregate({
          where: {
            branch_id: scopedBranchId,
            created_at: { gte: from, lte: to },
          },
          _sum: { amount: true },
        }),
        prisma.orderItem.groupBy({
          by: ["dish_id"],
          where: {
            branch_id: scopedBranchId,
            order: { created_at: { gte: from, lte: to } },
          },
          _sum: { quantity: true, total_amount: true },
          orderBy: { _sum: { total_amount: "desc" } },
          take: 5,
        }),
      ]);

    const dishIds = topItems.map((t) => t.dish_id);
    const dishes = dishIds.length
      ? await prisma.menuItem.findMany({
          where: { dish_id: { in: dishIds } },
          select: { dish_id: true, name: true, category: { select: { name: true } } },
        })
      : [];
    const dishMap = new Map(dishes.map((d) => [d.dish_id, d]));
    const topSellingItems = topItems.map((t) => {
      const d = dishMap.get(t.dish_id);
      return {
        dish_id: t.dish_id,
        name: d?.name ?? `Item #${t.dish_id}`,
        category: d?.category?.name ?? "—",
        quantity: toNumber(t._sum.quantity),
        total: toNumber(t._sum.total_amount),
      };
    });

    return NextResponse.json({
      level,
      range: rangeLabel,
      from,
      to,
      branch: {
        branch_id: branch.branch_id,
        branch_name: branch.branch_name,
        branch_code: branch.branch_code,
        status: branch.status,
        restaurant: branch.restaurant,
      },
      kpis: {
        ...kpis,
        activeMenuItems: activeMenuCount,
        activeDeals: activeDealCount,
        expenses: toNumber(expensesAgg._sum.amount),
      },
      topSellingItems,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("analytics overview failed", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
