import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AuthError, requireAuth, requireSuperAdmin } from "@/lib/server-auth";

/**
 * POST /api/restaurants/[id]/status
 *
 * Platform-owner action endpoint for toggling a tenant's status between
 * Active / Inactive / Suspended. Only SUPER_ADMIN can call this route.
 *
 * Body: { status: "Active" | "Inactive" | "Suspended" }
 *
 * The tenant's status is the single source of truth for the frozen
 * operational surface — when the restaurant is Inactive or Suspended,
 * every branch-scoped write is rejected server-side (see
 * `assertRestaurantActive` / `assertBranchActive`).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    requireSuperAdmin(auth);

    const { id } = await params;
    const restaurantId = Number(id);
    if (Number.isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant id" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const raw = String(body?.status ?? "").trim();
    const nextStatus =
      raw === "Active"
        ? "Active"
        : raw === "Inactive"
        ? "Inactive"
        : raw === "Suspended"
        ? "Suspended"
        : null;
    if (!nextStatus) {
      return NextResponse.json(
        {
          error:
            "status must be one of: Active, Inactive, Suspended",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.restaurant.findUnique({
      where: { restaurant_id: restaurantId },
      select: { restaurant_id: true, status: true, name: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.restaurant.update({
      where: { restaurant_id: restaurantId },
      data: { status: nextStatus },
      select: {
        restaurant_id: true,
        name: true,
        status: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      restaurant_id: updated.restaurant_id,
      name: updated.name,
      status: updated.status,
      updated_at: updated.updated_at.toISOString(),
      previousStatus: existing.status,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/restaurants/[id]/status error:", err);
    return NextResponse.json(
      { error: "Failed to update restaurant status" },
      { status: 500 }
    );
  }
}
