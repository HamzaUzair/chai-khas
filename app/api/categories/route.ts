import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ── GET /api/categories ── */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branch_id");

    const where: { branch_id?: number } = {};
    if (branchIdParam && branchIdParam !== "all") {
      const branchId = parseInt(branchIdParam, 10);
      if (!isNaN(branchId)) {
        where.branch_id = branchId;
      }
    }

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

    // Menu module uses dedicated `menu` table (not legacy `dishes`),
    // so category item counts must be computed from menu rows per branch/category.
    const menuCountRows = await prisma.menu.groupBy({
      by: ["branchId", "category"],
      _count: { _all: true },
    });
    const menuCountMap = new Map(
      menuCountRows.map((row) => [`${row.branchId}::${row.category}`, row._count._all])
    );

    // Serialize dates and format response (category-only, no items)
    const serialized = categories.map((cat) => ({
      category_id: cat.category_id,
      name: cat.name,
      description: cat.description,
      branch_id: cat.branch_id,
      branch_name: cat.branch.branch_name,
      is_active: cat.kid === 0,
      item_count: menuCountMap.get(`${cat.branch_id}::${cat.name}`) ?? 0,
      created_at: cat.created_at.toISOString(),
      updated_at: cat.updated_at.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
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
    const body = await request.json();
    const { name, description, branch_id, is_active } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { branch_id: branch_id },
    });
    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        branch_id: branch_id,
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

    const itemCount = await prisma.menu.count({
      where: {
        branchId: category.branch_id,
        category: category.name,
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
    console.error("POST /api/categories error:", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
