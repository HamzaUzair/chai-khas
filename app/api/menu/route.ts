import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  assertBranchWriteAccess,
  AuthError,
  buildBranchScopeFilter,
  requireAuth,
} from "@/lib/server-auth";

type IncomingVariation = { name?: string; price?: number | string };

function normalizeVariations(input: unknown) {
  if (!Array.isArray(input)) return [];

  const normalized = input
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

  return normalized;
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

/* ── GET /api/menu ── */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");
    const statusParam = searchParams.get("status"); // "active" | "inactive" | omit for all
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search")?.trim();

    const requestedBranchId =
      branchIdParam && branchIdParam !== "all" ? Number(branchIdParam) : null;
    const scopeFilter = await buildBranchScopeFilter(
      auth,
      requestedBranchId,
      "branchId"
    );
    const where: Prisma.MenuWhereInput = { ...(scopeFilter as Prisma.MenuWhereInput) };
    if (statusParam === "active" || statusParam === "inactive") {
      where.status = statusParam === "active" ? "ACTIVE" : "INACTIVE";
    }
    if (categoryParam && categoryParam !== "all") {
      where.category = categoryParam;
    }
    if (searchParam) {
      where.OR = [
        { itemName: { contains: searchParam, mode: "insensitive" } },
        { description: { contains: searchParam, mode: "insensitive" } },
        { category: { contains: searchParam, mode: "insensitive" } },
      ];
    }

    const items = await prisma.menu.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    const serialized = items.map((m) => ({
      id: m.id,
      itemName: m.itemName,
      description: m.description,
      price: Number(m.price),
      branchId: m.branchId,
      branchName: m.branch.branch_name,
      category: m.category,
      hasVariations: m.hasVariations,
      basePrice: m.basePrice === null ? null : Number(m.basePrice),
      variations: m.variations.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        sortOrder: v.sortOrder,
      })),
      status: m.status === "ACTIVE" ? "active" : "inactive",
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/menu error:", err);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

/* ── POST /api/menu ── */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.role === "ORDER_TAKER") {
      return NextResponse.json(
        { error: "Order Taker cannot manage menu items" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      itemName,
      description,
      branchId,
      category,
      status,
      hasVariations,
      basePrice,
      variations,
    } = body as {
      itemName?: string;
      description?: string | null;
      branchId?: number | string;
      category?: string;
      status?: string;
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
    if (status !== "active" && status !== "inactive") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }
    if (!branchId) {
      return NextResponse.json(
        { error: "Branch is required" },
        { status: 400 }
      );
    }
    if (!category?.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

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

    const branch = await prisma.branch.findUnique({
      where: { branch_id: Number(branchId) },
    });
    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }
    await assertBranchWriteAccess(auth, branch.branch_id);

    const categoryExists = await prisma.category.findFirst({
      where: {
        branch_id: Number(branchId),
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

    const created = await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: {
          itemName: itemName.trim(),
          description: description?.trim() || null,
          branchId: Number(branchId),
          category: category?.trim() || "",
          hasVariations: hasVars,
          basePrice: hasVars ? null : basePriceNum,
          // Keep price column compatible; for variable items use min variation price
          price: hasVars
            ? Math.min(...normalizedRows.map((r) => r.price))
            : (basePriceNum ?? 0),
          status: status === "inactive" ? "INACTIVE" : "ACTIVE",
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
      id: created.id,
      itemName: created.itemName,
      description: created.description,
      price: Number(created.price),
      branchId: created.branchId,
      branchName: created.branch.branch_name,
      category: created.category,
      hasVariations: created.hasVariations,
      basePrice: created.basePrice === null ? null : Number(created.basePrice),
      variations: created.variations.map((v) => ({
        id: v.id,
        name: v.name,
        price: Number(v.price),
        sortOrder: v.sortOrder,
      })),
      status: created.status === "ACTIVE" ? "active" : "inactive",
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/menu error:", err);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

