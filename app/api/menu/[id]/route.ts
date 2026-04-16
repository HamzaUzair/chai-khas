import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertBranchAccess, AuthError, requireAuth } from "@/lib/server-auth";

type IncomingVariation = { name?: string; price?: number | string };

function normalizeVariations(input: unknown) {
  if (!Array.isArray(input)) return [];

  return input
    .map((row) => ({
      name: typeof row?.name === "string" ? row.name.trim() : "",
      price:
        typeof row?.price === "number"
          ? row.price
          : typeof row?.price === "string"
          ? Number(row.price)
          : NaN,
    }))
    .filter((row) => row.name.length > 0 || !Number.isNaN(row.price));
}

function validateVariationRows(rows: Array<{ name: string; price: number }>) {
  if (rows.length === 0) return "At least one variation is required";

  for (const row of rows) {
    if (!row.name) return "Variation name is required";
    if (Number.isNaN(row.price)) return "Variation price is required";
    if (row.price < 0) return "Variation price must be zero or greater";
  }

  const unique = new Set(rows.map((r) => r.name.toLowerCase()));
  if (unique.size !== rows.length) {
    return "Duplicate variation names are not allowed";
  }

  return null;
}

/* ── PUT /api/menu/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const menuId = parseInt(id, 10);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      itemName,
      description,
      status,
      category,
      hasVariations,
      basePrice,
      variations,
    } = body as {
      itemName?: string;
      description?: string | null;
      status?: string;
      category?: string;
      hasVariations?: boolean;
      basePrice?: number | string | null;
      variations?: IncomingVariation[];
    };

    if (!itemName?.trim()) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }
    if (!category?.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }
    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const existing = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        branch: {
          select: {
            branch_id: true,
            branch_name: true,
          },
        },
        variations: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    assertBranchAccess(auth, existing.branchId);

    const hasVars = Boolean(hasVariations);
    const normalizedRows = normalizeVariations(variations);

    let basePriceNum: number | null = null;
    if (!hasVars) {
      basePriceNum = Number(basePrice);
      if (basePrice === undefined || basePrice === null || isNaN(basePriceNum)) {
        return NextResponse.json(
          { error: "Price is required and must be a valid number" },
          { status: 400 }
        );
      }
      if (basePriceNum < 0) {
        return NextResponse.json(
          { error: "Price must be zero or greater" },
          { status: 400 }
        );
      }
    } else {
      const castRows = normalizedRows.map((r) => ({ name: r.name, price: r.price }));
      const variationErr = validateVariationRows(castRows);
      if (variationErr) {
        return NextResponse.json({ error: variationErr }, { status: 400 });
      }
    }

    const categoryExists = await prisma.category.findFirst({
      where: {
        branch_id: existing.branchId,
        name: category.trim(),
      },
      select: { category_id: true },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category is not available for this branch" },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.menuVariation.deleteMany({
        where: { menuId },
      });

      const menu = await tx.menu.update({
        where: { id: menuId },
        data: {
          itemName: itemName.trim(),
          description: description?.trim() || null,
          hasVariations: hasVars,
          basePrice: hasVars ? null : basePriceNum,
          price: hasVars
            ? Math.min(...normalizedRows.map((r) => r.price))
            : (basePriceNum ?? 0),
          status: status === "inactive" ? "INACTIVE" : "ACTIVE",
          category: category?.trim() ?? existing.category,
          variations: hasVars
            ? {
                create: normalizedRows.map((row, idx) => ({
                  name: row.name,
                  price: row.price,
                  sortOrder: idx,
                })),
              }
            : undefined,
        },
        include: {
          branch: {
            select: {
              branch_id: true,
              branch_name: true,
            },
          },
          variations: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      return menu;
    });

    const serialized = {
      id: updated.id,
      itemName: updated.itemName,
      description: updated.description,
      price: Number(updated.price),
      branchId: updated.branchId,
      branchName: updated.branch.branch_name,
      category: updated.category,
      hasVariations: updated.hasVariations,
      basePrice: updated.basePrice === null ? null : Number(updated.basePrice),
      variations: updated.variations.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        sortOrder: v.sortOrder,
      })),
      status: updated.status === "ACTIVE" ? "active" : "inactive",
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/menu/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/menu/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const menuId = parseInt(id, 10);

    if (isNaN(menuId)) {
      return NextResponse.json(
        { error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const existing = await prisma.menu.findUnique({
      where: { id: menuId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }
    assertBranchAccess(auth, existing.branchId);

    await prisma.menu.delete({
      where: { id: menuId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/menu/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

