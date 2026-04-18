import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertBranchWriteAccess,
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";

/* ── GET /api/categories ── */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branch_id");
    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const where = await buildBranchScopeFilter(auth, requestedBranchId);

    const categories = await prisma.category.findMany({
      where,
      include: {
        branch: {
          select: {
            branch_id: true,
            branch_name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Item counts: menu items that are visible in the Menu module (synthetic
    // variant rows are excluded).
    const menuCountRows = await prisma.menuItem.groupBy({
      by: ["category_id"],
      where: { show_in_menu: true },
      _count: { _all: true },
    });
    const menuCountMap = new Map(
      menuCountRows.map((row) => [row.category_id, row._count._all])
    );

    const serialized = categories.map((cat) => ({
      category_id: cat.category_id,
      name: cat.name,
      description: cat.description,
      branch_id: cat.branch_id,
      branch_name: cat.branch.branch_name,
      is_active: cat.kid === 0,
      item_count: menuCountMap.get(cat.category_id) ?? 0,
      created_at: cat.created_at.toISOString(),
      updated_at: cat.updated_at.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/* ── POST /api/categories ── */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role === "ORDER_TAKER") {
      return NextResponse.json(
        { error: "Order Taker cannot manage categories" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { name, description, branch_id, is_active } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    let scopedBranchId: number;
    if (
      auth.role === "BRANCH_ADMIN" ||
      auth.role === "CASHIER" ||
      auth.role === "ACCOUNTANT"
    ) {
      if (!auth.branchId) {
        return NextResponse.json({ error: "Branch missing" }, { status: 403 });
      }
      scopedBranchId = auth.branchId;
    } else {
      if (!branch_id) {
        return NextResponse.json(
          { error: "Branch ID is required" },
          { status: 400 }
        );
      }
      scopedBranchId = Number(branch_id);
    }

    const branch = await prisma.branch.findUnique({
      where: { branch_id: scopedBranchId },
    });
    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }
    await assertBranchWriteAccess(auth, scopedBranchId);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        branch_id: scopedBranchId,
        kid: is_active === false ? 1 : 0, // 0 = active, 1 = inactive
        terminal: 1,
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

    const itemCount = await prisma.menuItem.count({
      where: {
        branch_id: category.branch_id,
        category_id: category.category_id,
        show_in_menu: true,
      },
    });

    // Serialize response (category-only, no items)
    const serialized = {
      category_id: category.category_id,
      name: category.name,
      description: category.description,
      branch_id: category.branch_id,
      branch_name: category.branch.branch_name,
      is_active: category.kid === 0,
      item_count: itemCount,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/categories error:", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
