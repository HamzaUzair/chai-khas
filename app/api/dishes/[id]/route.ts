import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertBranchWriteAccess,
  AuthError,
  requireAuth,
} from "@/lib/server-auth";

/* ── Helper: find or create category by name for branch ── */
async function findOrCreateCategory(
  branchId: number,
  categoryName: string
): Promise<{ category_id: number } | null> {
  if (!categoryName?.trim()) return null;
  const name = categoryName.trim();
  let category = await prisma.category.findFirst({
    where: { branch_id: branchId, name },
  });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        description: null,
        branch_id: branchId,
        kid: 0,
        terminal: 1,
      },
    });
  }
  return { category_id: category.category_id };
}

/* ── PUT /api/dishes/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const dishId = parseInt(id, 10);

    if (isNaN(dishId)) {
      return NextResponse.json(
        { error: "Invalid dish ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, is_available, category_name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Dish name is required" },
        { status: 400 }
      );
    }
    const priceNum = Number(price);
    if (price === undefined || price === null || isNaN(priceNum)) {
      return NextResponse.json(
        { error: "Price is required and must be a valid number" },
        { status: 400 }
      );
    }
    if (priceNum < 0) {
      return NextResponse.json(
        { error: "Price must be zero or greater" },
        { status: 400 }
      );
    }

    // Check if dish exists
    const existing = await prisma.menuItem.findUnique({
      where: { dish_id: dishId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    await assertBranchWriteAccess(auth, existing.branch_id);

    const updateData: {
      name: string;
      description: string | null;
      price: number;
      is_available: number;
      category_id?: number;
    } = {
      name: name.trim(),
      description: description?.trim() || null,
      price: priceNum,
      is_available: is_available === false ? 0 : 1,
    };

    if (category_name?.trim()) {
      const cat = await findOrCreateCategory(existing.branch_id, category_name);
      if (!cat) {
        return NextResponse.json(
          { error: "Invalid category name. Use one of the allowed menu categories." },
          { status: 400 }
        );
      }
      updateData.category_id = cat.category_id;
    }

    const updated = await prisma.menuItem.update({
      where: { dish_id: dishId },
      data: updateData,
      include: {
        category: {
          select: {
            category_id: true,
            name: true,
          },
        },
      },
    });

    // Serialize response
    const serialized = {
      dish_id: updated.dish_id,
      name: updated.name,
      description: updated.description,
      price: Number(updated.price),
      category_id: updated.category_id,
      category_name: updated.category.name,
      branch_id: updated.branch_id,
      is_available: updated.is_available === 1,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/dishes/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update dish" },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/dishes/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const dishId = parseInt(id, 10);

    if (isNaN(dishId)) {
      return NextResponse.json(
        { error: "Invalid dish ID" },
        { status: 400 }
      );
    }

    // Check if dish exists
    const dish = await prisma.menuItem.findUnique({
      where: { dish_id: dishId },
    });
    if (!dish) {
      return NextResponse.json(
        { error: "Dish not found" },
        { status: 404 }
      );
    }
    await assertBranchWriteAccess(auth, dish.branch_id);

    await prisma.menuItem.delete({
      where: { dish_id: dishId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/dishes/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
