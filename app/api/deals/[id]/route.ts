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

  return prisma.menuItem.create({
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
}

/* ── PUT /api/deals/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealId = Number(id);
    if (Number.isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

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

    if (!name?.trim() || !type?.trim()) {
      return NextResponse.json(
        { error: "Deal name and type are required" },
        { status: 400 }
      );
    }
    const branchIdNum = Number(branchId);
    if (Number.isNaN(branchIdNum)) {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: "Invalid deal price" }, { status: 400 });
    }

    const existing = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const normalizedItems = (items ?? [])
      .map((item) => ({
        id: Number(item.id),
        name: item.name?.trim() ?? "",
        quantity: Math.max(1, Number(item.quantity) || 1),
      }))
      .filter((item) => !Number.isNaN(item.id) && item.name.length > 0);

    const updatedId = await prisma.$transaction(async (tx) => {
      await tx.deal.update({
        where: { id: dealId },
        data: {
          branch_id: branchIdNum,
          name: name.trim(),
          description: description?.trim() || null,
          status: status === "inactive" ? "Draft" : "Active",
          discount_type: type.trim(),
          discount_value: priceNum,
        },
      });

      await tx.dealItem.deleteMany({ where: { deal_id: dealId } });

      for (const item of normalizedItems) {
        const dish = await getOrCreateDishFromMenu(branchIdNum, item.id, item.name);
        if (!dish) continue;

        await tx.dealItem.create({
          data: {
            deal_id: dealId,
            dish_id: dish.dish_id,
            quantity: item.quantity,
          },
        });
      }

      return dealId;
    });

    const updated = await prisma.deal.findUnique({
      where: { id: updatedId },
      include: {
        branch: { select: { branch_name: true } },
        items: { include: { menu_item: { select: { name: true } } } },
      },
    });
    if (!updated) {
      return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
    }

    return NextResponse.json({
      id: String(updated.id),
      name: updated.name,
      type: updated.discount_type,
      description: updated.description,
      branchId: updated.branch_id ?? 0,
      branchName: updated.branch?.branch_name ?? "All Branches",
      price: Number(updated.discount_value),
      status: updated.status === "Active" ? "active" : "inactive",
      items: updated.items.map((item) => ({
        id: String(item.dish_id),
        name: item.menu_item.name,
        quantity: item.quantity,
      })),
    });
  } catch (err) {
    console.error("PUT /api/deals/[id] error:", err);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

/* ── DELETE /api/deals/[id] ── */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealId = Number(id);
    if (Number.isNaN(dealId)) {
      return NextResponse.json({ error: "Invalid deal ID" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.dealItem.deleteMany({ where: { deal_id: dealId } });
      await tx.deal.delete({ where: { id: dealId } });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/deals/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}

