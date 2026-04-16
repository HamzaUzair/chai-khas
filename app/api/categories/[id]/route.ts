import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertBranchAccess, AuthError, requireAuth } from "@/lib/server-auth";

/* ── PUT /api/categories/[id] ── */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, is_active } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    assertBranchAccess(auth, existing.branch_id);

    const updated = await prisma.category.update({
      where: { category_id: categoryId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        kid: is_active === false ? 1 : 0, // 0 = active, 1 = inactive
      },
      include: {
        branch: {
          select: {
            branch_id: true,
            branch_name: true,
          },
        },
      },
    });

    // Keep Menu module category labels in sync on category rename.
    // Menu rows are branch-scoped and store category as text.
    if (existing.name !== updated.name) {
      await prisma.menu.updateMany({
        where: {
          branchId: existing.branch_id,
          category: existing.name,
        },
        data: {
          category: updated.name,
        },
      });
    }

    const itemCount = await prisma.menu.count({
      where: {
        branchId: updated.branch_id,
        category: updated.name,
      },
    });

    // Serialize response (category-only, no items)
    const serialized = {
      category_id: updated.category_id,
      name: updated.name,
      description: updated.description,
      branch_id: updated.branch_id,
      branch_name: updated.branch.branch_name,
      is_active: updated.kid === 0,
      item_count: itemCount,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
    };

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("PUT /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/categories/[id] ── */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    const { id } = await params;
    const categoryId = parseInt(id, 10);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { category_id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    assertBranchAccess(auth, category.branch_id);

    // Menu module stores items in `menu` table by category name (text).
    // Delete those rows together with category to keep counts/data consistent.
    await prisma.$transaction(async (tx) => {
      await tx.menu.deleteMany({
        where: {
          branchId: category.branch_id,
          category: category.name,
        },
      });

      await tx.category.delete({
        where: { category_id: categoryId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("DELETE /api/categories/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
