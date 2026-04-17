import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertBranchWriteAccess,
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";
import type { Prisma } from "@prisma/client";

/* ── GET /api/dishes ── */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const categoryIdParam = searchParams.get("category_id");
    const categoryNameParam = searchParams.get("category_name")?.trim();
    const branchIdParam = searchParams.get("branch_id");
    const statusParam = searchParams.get("status"); // "active" | "inactive" | omit for all
    const searchParam = searchParams.get("search")?.trim();

    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const scope = await buildBranchScopeFilter(auth, requestedBranchId);
    const where: Prisma.MenuItemWhereInput = { ...(scope as Prisma.MenuItemWhereInput) };

    if (categoryIdParam) {
      const categoryId = parseInt(categoryIdParam, 10);
      if (!isNaN(categoryId)) where.category_id = categoryId;
    } else if (categoryNameParam) {
      where.category = { name: categoryNameParam };
    }
    if (statusParam === "active") where.is_available = 1;
    else if (statusParam === "inactive") where.is_available = 0;

    if (searchParam) {
      where.OR = [
        { name: { contains: searchParam, mode: "insensitive" } },
        { description: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const dishes = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            category_id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Serialize dates and format response
    const serialized = dishes.map((dish) => ({
      dish_id: dish.dish_id,
      name: dish.name,
      description: dish.description,
      price: Number(dish.price),
      category_id: dish.category_id,
      category_name: dish.category.name,
      branch_id: dish.branch_id,
      is_available: dish.is_available === 1,
      created_at: dish.created_at.toISOString(),
      updated_at: dish.updated_at.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/dishes error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 }
    );
  }
}

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

/* ── POST /api/dishes ── */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const { name, description, price, category_id, category_name, branch_id, is_available } = body;

    // Validate required fields
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
    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    let categoryId: number;
    if (category_name?.trim()) {
      const cat = await findOrCreateCategory(branch_id, category_name);
      if (!cat) {
        return NextResponse.json(
          { error: "Invalid category name. Use one of the allowed menu categories." },
          { status: 400 }
        );
      }
      categoryId = cat.category_id;
    } else if (category_id) {
      const category = await prisma.category.findUnique({
        where: { category_id: category_id },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      categoryId = category_id;
    } else {
      return NextResponse.json(
        { error: "Category (category_id or category_name) is required" },
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
    await assertBranchWriteAccess(auth, branch.branch_id);

    const dish = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: priceNum,
        category_id: categoryId,
        branch_id: branch_id,
        is_available: is_available === false ? 0 : 1,
        terminal: 1,
        qnty: 0,
        is_frequent: 0,
        discount: 0,
      },
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
      dish_id: dish.dish_id,
      name: dish.name,
      description: dish.description,
      price: Number(dish.price),
      category_id: dish.category_id,
      category_name: dish.category.name,
      branch_id: dish.branch_id,
      is_available: dish.is_available === 1,
      created_at: dish.created_at.toISOString(),
      updated_at: dish.updated_at.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/dishes error:", err);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 }
    );
  }
}
