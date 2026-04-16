import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertBranchAccess, AuthError, getScopedBranchId, requireAuth } from "@/lib/server-auth";

type CreateOrderItem = {
  menuId?: number | string;
  menuName?: string;
  categoryName?: string;
  variationName?: string | null;
  quantity?: number | string;
  unitPrice?: number | string;
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isNaN(n) ? fallback : n;
}

async function findOrCreateDishForMenuItem({
  branchId,
  menuName,
  categoryName,
  price,
}: {
  branchId: number;
  menuName: string;
  categoryName: string;
  price: number;
}) {
  const existingDish = await prisma.menuItem.findFirst({
    where: {
      branch_id: branchId,
      name: { equals: menuName, mode: "insensitive" },
    },
    select: { dish_id: true },
  });
  if (existingDish) return existingDish.dish_id;

  let category = await prisma.category.findFirst({
    where: {
      branch_id: branchId,
      name: { equals: categoryName, mode: "insensitive" },
    },
    select: { category_id: true },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
        branch_id: branchId,
        terminal: 1,
        kid: 0,
      },
      select: { category_id: true },
    });
  }

  const created = await prisma.menuItem.create({
    data: {
      name: menuName,
      description: null,
      price,
      category_id: category.category_id,
      branch_id: branchId,
      is_available: 1,
      terminal: 1,
      qnty: 0,
      is_frequent: 0,
      discount: 0,
    },
    select: { dish_id: true },
  });

  return created.dish_id;
}

function serializeOrder(order: {
  order_id: number;
  order_type: string;
  order_status: string;
  comments: string | null;
  payment_mode: string;
  discount_amount: unknown;
  service_charge: unknown;
  net_total_amount: unknown;
  created_at: Date;
  branch_id: number;
  branch: { branch_name: string };
  hall: { name: string } | null;
  table: { table_number: string } | null;
  order_items: Array<{
    item_id: number;
    quantity: unknown;
    price: unknown;
    total_amount: unknown;
    menu_item: { name: string };
  }>;
}) {
  const itemRows = order.order_items.map((item) => {
    const menuName = item.menu_item.name;
    const variationMatch = menuName.match(/\(([^)]+)\)$/);
    const variationName = variationMatch ? variationMatch[1] : null;
    const cleanName = variationMatch ? menuName.replace(/\s*\([^)]+\)\s*$/, "") : menuName;
    return {
      id: String(item.item_id),
      name: cleanName,
      variationName,
      qty: Number(item.quantity),
      price: Number(item.price),
    };
  });

  return {
    id: String(order.order_id),
    orderNo: `ORD-${order.order_id}`,
    branchId: order.branch_id,
    branchName: order.branch.branch_name,
    type: order.order_type as "Dine In" | "Take Away" | "Delivery",
    hall: order.hall?.name ?? undefined,
    table: order.table?.table_number ?? undefined,
    total: Number(order.net_total_amount),
    status:
      order.order_status === "Pending" ||
      order.order_status === "Running" ||
      order.order_status === "Bill Generated" ||
      order.order_status === "Credit" ||
      order.order_status === "Complete" ||
      order.order_status === "Cancelled"
        ? order.order_status
        : "Pending",
    paymentMode:
      order.payment_mode === "Cash" ||
      order.payment_mode === "Card" ||
      order.payment_mode === "Online" ||
      order.payment_mode === "Credit"
        ? order.payment_mode
        : "Cash",
    createdAt: new Date(order.created_at).getTime(),
    items: itemRows,
    discount: Number(order.discount_amount),
    serviceCharge: Number(order.service_charge),
    paid: false,
    notes: order.comments ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search")?.trim();

    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const scopedBranchId = getScopedBranchId(auth, requestedBranchId);

    const where: {
      branch_id?: number;
      order_status?: string;
      OR?: Array<{ comments: { contains: string; mode: "insensitive" } }>;
      order_taker_id?: number;
    } = {};

    if (scopedBranchId) where.branch_id = scopedBranchId;
    if (statusParam && statusParam !== "all") where.order_status = statusParam;
    if (searchParam) {
      const maybeId = Number(searchParam.replace(/^ORD-/i, "").trim());
      if (!Number.isNaN(maybeId)) {
        where.OR = [{ comments: { contains: searchParam, mode: "insensitive" } }];
      } else {
        where.OR = [{ comments: { contains: searchParam, mode: "insensitive" } }];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        branch: { select: { branch_name: true } },
        hall: { select: { name: true } },
        table: { select: { table_number: true } },
        order_items: {
          include: { menu_item: { select: { name: true } } },
          orderBy: { item_id: "asc" },
        },
      },
      orderBy: { created_at: "desc" },
      take: 200,
    });

    const filtered = orders.filter((order) => {
      if (!searchParam) return true;
      const q = searchParam.toLowerCase();
      return (
        `ord-${order.order_id}`.toLowerCase().includes(q) ||
        String(order.order_id).includes(q) ||
        order.order_items.some((i) => i.menu_item.name.toLowerCase().includes(q))
      );
    });

    return NextResponse.json(filtered.map(serializeOrder));
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== "SUPER_ADMIN" && auth.role !== "BRANCH_ADMIN" && auth.role !== "ORDER_TAKER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const orderType = String(body.orderType ?? "Dine In");
    const comments = typeof body.comments === "string" ? body.comments.trim() : "";
    const hallId = body.hallId ? Number(body.hallId) : null;
    const tableId = body.tableId ? Number(body.tableId) : null;
    const branchId = Number(body.branchId ?? auth.branchId);
    const rows = Array.isArray(body.items) ? (body.items as CreateOrderItem[]) : [];

    if (!branchId || Number.isNaN(branchId)) {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }
    assertBranchAccess(auth, branchId);

    if (rows.length === 0) {
      return NextResponse.json({ error: "At least one order item is required" }, { status: 400 });
    }

    if (orderType === "Dine In") {
      if (!hallId || !tableId) {
        return NextResponse.json({ error: "Hall and table are required for dine in orders" }, { status: 400 });
      }
      const hall = await prisma.hall.findUnique({
        where: { hall_id: hallId },
        select: { hall_id: true, branch_id: true },
      });
      const table = await prisma.table.findUnique({
        where: { table_id: tableId },
        select: { table_id: true, branch_id: true, hall_id: true },
      });
      if (!hall || !table || hall.branch_id !== branchId || table.branch_id !== branchId || table.hall_id !== hallId) {
        return NextResponse.json({ error: "Invalid hall/table selection" }, { status: 400 });
      }
    }

    const parsedItems = rows.map((row) => {
      const qty = Math.max(1, toNumber(row.quantity, 1));
      const unitPrice = Math.max(0, toNumber(row.unitPrice, 0));
      return {
        menuId: Number(row.menuId),
        menuName: String(row.menuName ?? "").trim(),
        categoryName: String(row.categoryName ?? "").trim() || "General",
        variationName: row.variationName ? String(row.variationName).trim() : null,
        quantity: qty,
        unitPrice,
        lineTotal: qty * unitPrice,
      };
    });

    const subtotal = parsedItems.reduce((sum, row) => sum + row.lineTotal, 0);
    const serviceCharge = 0;
    const discountAmount = 0;
    const netTotal = subtotal + serviceCharge - discountAmount;

    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          order_type: orderType,
          order_status: "Pending",
          hall_id: orderType === "Dine In" ? hallId : null,
          table_id: orderType === "Dine In" ? tableId : null,
          comments: comments || null,
          order_taker_id: auth.id,
          branch_id: branchId,
          g_total_amount: subtotal,
          service_charge: serviceCharge,
          discount_amount: discountAmount,
          net_total_amount: netTotal,
          payment_mode: "Cash",
          terminal: 1,
        },
      });

      for (const row of parsedItems) {
        const menu = await tx.menu.findUnique({
          where: { id: row.menuId },
          select: { id: true, itemName: true, category: true, branchId: true },
        });
        if (!menu || menu.branchId !== branchId) {
          throw new AuthError(`Menu item not found for branch: ${row.menuName}`, 400);
        }

        const dishId = await findOrCreateDishForMenuItem({
          branchId,
          menuName: row.variationName ? `${menu.itemName} (${row.variationName})` : menu.itemName,
          categoryName: menu.category || row.categoryName || "General",
          price: row.unitPrice,
        });

        await tx.orderItem.create({
          data: {
            order_id: order.order_id,
            dish_id: dishId,
            quantity: row.quantity,
            price: row.unitPrice,
            total_amount: row.lineTotal,
            branch_id: branchId,
          },
        });
      }

      const withItems = await tx.order.findUniqueOrThrow({
        where: { order_id: order.order_id },
        include: {
          branch: { select: { branch_name: true } },
          hall: { select: { name: true } },
          table: { select: { table_number: true } },
          order_items: {
            include: { menu_item: { select: { name: true } } },
            orderBy: { item_id: "asc" },
          },
        },
      });

      return withItems;
    });

    return NextResponse.json(serializeOrder(created), { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/orders error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

