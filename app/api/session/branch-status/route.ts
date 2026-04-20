import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AuthError,
  requireAuth,
  resolveDefaultBranchForSingleBranch,
} from "@/lib/server-auth";

/**
 * Lightweight endpoint every operational page polls to know whether the
 * signed-in user's **branch and tenant** are currently `Active`. Drives
 * the global inactive banner painted by `DashboardLayout` and disables
 * Place Order / Pay / Mark Running / Mark Served / Add Expense / Close
 * Day on the client.
 *
 * Why a dedicated endpoint and not the login session payload?
 *
 *   - The frontend caches the login response in `localStorage`, so it
 *     can't reflect a branch or tenant being flipped to `Inactive`
 *     mid-session.
 *   - Reusing `/api/branches` works for most roles but is noisier than
 *     necessary, doesn't run for Order Taker / Live Kitchen (who don't
 *     otherwise call it), and requires extra filtering on the client.
 *
 * Resolution rules:
 *   - SUPER_ADMIN with no restaurant     → `scope: "no_tenant"`,
 *     returns `null`s (platform admins don't have a banner to show).
 *   - Branch-scoped staff + Branch Admin → their assigned branch.
 *     Restaurant status comes from that branch's parent.
 *   - Single-branch Restaurant Admin     → resolves the tenant's
 *     internal default branch so head-office copy matches staff copy.
 *   - Multi-branch Restaurant Admin      → `scope: "tenant_only"` —
 *     no single branch in scope, but we still return the tenant's
 *     status so Head Office sees a Restaurant Inactive banner when
 *     the whole tenant is suspended in Restenzo.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    let branchId: number | null = auth.branchId;

    if (
      branchId === null &&
      auth.role === "RESTAURANT_ADMIN" &&
      auth.restaurantHasMultipleBranches === false &&
      auth.restaurantId
    ) {
      try {
        branchId = await resolveDefaultBranchForSingleBranch(auth.restaurantId);
      } catch {
        branchId = null;
      }
    }

    // Head Office of a multi-branch tenant (no specific branch in scope)
    // — still surface the restaurant's activity status so the global
    // banner can paint "Restaurant Inactive" when Restenzo has
    // suspended the tenant.
    if (branchId === null) {
      if (auth.restaurantId) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { restaurant_id: auth.restaurantId },
          select: { restaurant_id: true, name: true, status: true },
        });
        if (restaurant) {
          return NextResponse.json({
            scope: "tenant_only",
            branchId: null,
            branchName: null,
            branchStatus: null,
            restaurantId: restaurant.restaurant_id,
            restaurantName: restaurant.name,
            restaurantStatus: restaurant.status,
          });
        }
      }
      return NextResponse.json({
        scope: "no_tenant",
        branchId: null,
        branchName: null,
        branchStatus: null,
        restaurantId: null,
        restaurantName: null,
        restaurantStatus: null,
      });
    }

    const branch = await prisma.branch.findUnique({
      where: { branch_id: branchId },
      select: {
        branch_id: true,
        branch_name: true,
        status: true,
        restaurant_id: true,
        restaurant: {
          select: { restaurant_id: true, name: true, status: true },
        },
      },
    });

    if (!branch) {
      return NextResponse.json({
        scope: "no_tenant",
        branchId: null,
        branchName: null,
        branchStatus: null,
        restaurantId: null,
        restaurantName: null,
        restaurantStatus: null,
      });
    }

    // Defensive: never leak a branch from a different tenant even if the
    // stored session branch_id was somehow corrupted.
    if (
      auth.role !== "SUPER_ADMIN" &&
      auth.restaurantId &&
      branch.restaurant_id !== auth.restaurantId
    ) {
      return NextResponse.json(
        { error: "Forbidden branch access" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      scope: "branch",
      branchId: branch.branch_id,
      branchName: branch.branch_name,
      branchStatus: branch.status,
      restaurantId: branch.restaurant.restaurant_id,
      restaurantName: branch.restaurant.name,
      restaurantStatus: branch.restaurant.status,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("GET /api/session/branch-status error:", err);
    return NextResponse.json(
      { error: "Failed to resolve branch status" },
      { status: 500 }
    );
  }
}
