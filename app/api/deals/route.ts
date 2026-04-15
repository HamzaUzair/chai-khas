import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type IncomingDealItem = {
  id?: string;
  name?: string;
  quantity?: number;
};

async function getOrCreateDishFromMenu(
  branchId: number,
  menuId: number,
  fallbackName?: string
) {
  const menu = await prisma.menu.findFirst({
    where: {
      id: menuId,
      branchId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      itemName: true,
      category: true,
      price: true,
    },
  });

  if (!menu) return null;

  const existingDish = await prisma.menuItem.findFirst({
    where: {
      branch_id: branchId,
      name: menu.itemName,
    },
    select: { dish_id: true, name: true },
  });
  if (existingDish) return existingDish;

  const category = await prisma.category.findFirst({
    where: {
      branch_id: branchId,
      name: menu.category,
    },
    select: { category_id: true },
  });
  if (!category) return null;

  const created = await prisma.menuItem.create({
    data: {
      name: fallbackName?.trim() || menu.itemName,
      category_id: category.category_id,
      branch_id: branchId,
      price: menu.price,
      is_available: 1,
      status: "ACTIVE",
    },
    select: { dish_id: true, name: true },
  });

  return created;
}

/* ── GET /api/deals ── */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search")?.trim();

    const where: {
      branch_id?: number;
      status?: "Active" | "Draft";
      OR?: Array<{ name?: { contains: string; mode: "insensitive" } }>;
    } = {};

    if (branchIdParam && branchIdParam !== "all") {
      const branchId = Number(branchIdParam);
      if (!Number.isNaN(branchId)) where.branch_id = branchId;
    }
    if (statusParam === "active" || statusParam === "inactive") {
      where.status = statusParam === "active" ? "Active" : "Draft";
    }
    if (searchParam) {
      where.OR = [{ name: { contains: searchParam, mode: "insensitive" } }];
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        branch: {
          select: { branch_id: true, branch_name: true },
        },
        items: {
          include: {
            menu_item: {
              select: { dish_id: true, name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const serialized = deals.map((d) => ({
      id: String(d.id),
      name: d.name,
      type: d.discount_type,
      description: d.description,
      branchId: d.branch_id ?? 0,
      branchName: d.branch?.branch_name ?? "All Branches",
      price: Number(d.discount_value),
      status: d.status === "Active" ? "active" : "inactive",
      items: d.items.map((item) => ({
        id: String(item.dish_id),
        name: item.menu_item.name,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error("GET /api/deals error:", err);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

/* ── POST /api/deals ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, branchId, price, status, items } = body as {
      name?: string;
      type?: string;
      description?: string;
      branchId?: number | string;
      price?: number | string;
      status?: "active" | "inactive";
      items?: IncomingDealItem[];
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Deal name is required" }, { status: 400 });
    }
    if (!type?.trim()) {
      return NextResponse.json({ error: "Deal type is required" }, { status: 400 });
    }
    if (branchId === undefined || branchId === null || branchId === "") {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }
    const branchIdNum = Number(branchId);
    if (Number.isNaN(branchIdNum)) {
      return NextResponse.json({ error: "Invalid branch" }, { status: 400 });
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json(
        { error: "Valid deal price is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Select at least one included menu item" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findUnique({
      where: { branch_id: branchIdNum },
      select: { branch_id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const normalizedItems = items
      .map((item) => ({
        id: Number(item.id),
        name: item.name?.trim() ?? "",
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter((item) => !Number.isNaN(item.id) && item.name.length > 0);

    if (normalizedItems.length === 0) {
      return NextResponse.json(
        { error: "Invalid deal items payload" },
        { status: 400 }
      );
    }

    const deal = await prisma.$transaction(async (tx) => {
      const created = await tx.deal.create({
        data: {
          branch_id: branchIdNum,
          name: name.trim(),
          description: description?.trim() || null,
          status: status === "inactive" ? "Draft" : "Active",
          discount_type: type.trim(),
          discount_value: priceNum,
        },
      });

      for (const item of normalizedItems) {
        const dish = await getOrCreateDishFromMenu(branchIdNum, item.id, item.name);
        if (!dish) continue;

        await tx.dealItem.create({
          data: {
            deal_id: created.id,
            dish_id: dish.dish_id,
            quantity: item.quantity,
          },
        });
      }

      return created.id;
    });

    const created = await prisma.deal.findUnique({
      where: { id: deal },
      include: {
        branch: { select: { branch_id: true, branch_name: true } },
        items: { include: { menu_item: { select: { dish_id: true, name: true } } } },
      },
    });
    if (!created) {
      return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: String(created.id),
        name: created.name,
        type: created.discount_type,
        description: created.description,
        branchId: created.branch_id ?? 0,
        branchName: created.branch?.branch_name ?? "All Branches",
        price: Number(created.discount_value),
        status: created.status === "Active" ? "active" : "inactive",
        items: created.items.map((item) => ({
          id: String(item.dish_id),
          name: item.menu_item.name,
          quantity: item.quantity,
        })),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/deals error:", err);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}

