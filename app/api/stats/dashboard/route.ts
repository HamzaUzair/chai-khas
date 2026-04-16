import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { AuthError, getScopedBranchId, requireAuth } from "@/lib/server-auth";

/* ── GET /api/stats/dashboard ── */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const requestedBranchId = searchParams.get("branchId")
      ? Number(searchParams.get("branchId"))
      : null;
    const scopedBranchId = getScopedBranchId(auth, requestedBranchId);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const sevenDaysAgo = subDays(todayStart, 6);

    /* ── 1. Today's orders (for sales, count, AOV) ── */
    const todayOrders = await prisma.order.findMany({
      where: {
        created_at: { gte: todayStart, lte: todayEnd },
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
      select: {
        order_id: true,
        net_total_amount: true,
        order_status: true,
        branch_id: true,
      },
    });

    const todaySales = todayOrders.reduce(
      (sum, o) => sum + Number(o.net_total_amount || 0),
      0
    );
    const ordersToday = todayOrders.length;
    const avgOrderValue = ordersToday > 0 ? Math.round(todaySales / ordersToday) : 0;

    /* ── 2. Total branches, menu items ── */
    const [totalBranches, menuItemsCount] = await Promise.all([
      prisma.branch.count({
        where: scopedBranchId ? { branch_id: scopedBranchId } : undefined,
      }),
      prisma.menuItem.count({
        where: scopedBranchId ? { branch_id: scopedBranchId } : undefined,
      }),
    ]);

    const activeDeals = await prisma.deal.count({
      where: {
        status: "Active",
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
    });

    /* ── 4. Sales last 7 days ── */
    const ordersLast7 = await prisma.order.findMany({
      where: {
        created_at: { gte: sevenDaysAgo, lte: todayEnd },
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
      select: { created_at: true, net_total_amount: true },
    });

    const salesByDate: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = subDays(todayStart, 6 - i);
      const key = format(d, "yyyy-MM-dd");
      salesByDate[key] = 0;
    }
    ordersLast7.forEach((o) => {
      const key = format(new Date(o.created_at), "yyyy-MM-dd");
      if (salesByDate[key] !== undefined) {
        salesByDate[key] += Number(o.net_total_amount || 0);
      }
    });
    const salesLast7Days = Object.entries(salesByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, sales]) => ({
        date: format(new Date(date), "MMM d"),
        sales: Math.round(sales),
      }));

    /* ── 5. Branch performance today ── */
    const branches = await prisma.branch.findMany({
      where: {
        status: "Active",
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
      select: { branch_id: true, branch_name: true },
    });

    const branchStats = await Promise.all(
      branches.map(async (b) => {
        const branchOrders = todayOrders.filter((o) => o.branch_id === b.branch_id);
        const running = branchOrders.filter((o) => o.order_status === "Running").length;
        const completed = branchOrders.filter((o) => o.order_status !== "Running").length;
        const sales = branchOrders.reduce(
          (sum, o) => sum + Number(o.net_total_amount || 0),
          0
        );
        const count = branchOrders.length;
        const aov = count > 0 ? Math.round(sales / count) : 0;
        return {
          branchId: b.branch_id,
          branchName: b.branch_name,
          todaySales: Math.round(sales),
          ordersToday: count,
          runningOrders: running,
          completedOrders: completed,
          avgOrderValue: aov,
        };
      })
    );

    /* ── 6. Top selling items today ── */
    const orderIdsToday = todayOrders.map((o) => o.order_id);
    const orderItemsToday =
      orderIdsToday.length > 0
        ? await prisma.orderItem.findMany({
            where: { order_id: { in: orderIdsToday } },
            include: { menu_item: { select: { name: true } } },
          })
        : [];

    const itemQuantities: Record<string, { name: string; qty: number }> = {};
    orderItemsToday.forEach((oi) => {
      const name = oi.menu_item?.name ?? "Unknown";
      if (!itemQuantities[name]) itemQuantities[name] = { name, qty: 0 };
      itemQuantities[name].qty += Number(oi.quantity);
    });
    const topSellingItems = Object.values(itemQuantities)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
      .map((x) => ({ name: x.name, quantity: x.qty }));

    /* ── 7. Best & lowest branch today ── */
    const withSales = branchStats.filter((b) => b.ordersToday > 0);
    const bestBranch =
      withSales.length > 0
        ? withSales.reduce((a, b) => (a.todaySales >= b.todaySales ? a : b))
        : null;
    const lowestBranch =
      withSales.length > 0
        ? withSales.reduce((a, b) => (a.todaySales <= b.todaySales ? a : b))
        : null;

    /* ── 8. Alerts ── */
    const alerts: { type: string; message: string }[] = [];

    /* Low inventory (menu_items qnty < 10) */
    const lowStock = await prisma.menuItem.findMany({
      where: {
        qnty: { lt: 10 },
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
      select: { name: true },
      take: 5,
    });
    lowStock.forEach((m) => alerts.push({ type: "inventory", message: `${m.name} Stock Low` }));

    /* Offline printers */
    const offlinePrinters = await prisma.printer.findMany({
      where: {
        status: { not: "active" },
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
      include: { branch: { select: { branch_name: true } } },
    });
    offlinePrinters.forEach((p) =>
      alerts.push({
        type: "printer",
        message: `${p.name} Offline — ${p.branch?.branch_name ?? "Unknown"}`,
      })
    );

    /* Orders pending > 20 minutes */
    const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const staleOrders = await prisma.order.count({
      where: {
        order_status: "Running",
        created_at: { lt: twentyMinsAgo },
        ...(scopedBranchId ? { branch_id: scopedBranchId } : {}),
      },
    });
    if (staleOrders > 0) {
      alerts.push({
        type: "orders",
        message: `${staleOrders} Order${staleOrders > 1 ? "s" : ""} Waiting > 20 Minutes`,
      });
    }

    return NextResponse.json({
      todaySales: Math.round(todaySales),
      ordersToday,
      avgOrderValue,
      totalBranches,
      menuItems: menuItemsCount,
      activeDeals,
      salesLast7Days,
      branchPerformance: branchStats,
      topSellingItems,
      bestBranch: bestBranch
        ? {
            branchName: bestBranch.branchName,
            todaySales: bestBranch.todaySales,
            ordersToday: bestBranch.ordersToday,
          }
        : null,
      lowestBranch: lowestBranch
        ? {
            branchName: lowestBranch.branchName,
            todaySales: lowestBranch.todaySales,
            ordersToday: lowestBranch.ordersToday,
          }
        : null,
      alerts,
      totalActiveBranches: branches.length,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/stats/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
