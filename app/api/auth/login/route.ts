import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  normalizeRole,
  resolveDefaultBranchForSingleBranch,
} from "@/lib/server-auth";

const DEFAULT_SUPER_ADMIN_USERNAME = "sdmain@gmail.com";
const DEFAULT_SUPER_ADMIN_PASSWORD = "Asdf0010";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier ?? "").trim();
    const password = String(body.password ?? "");

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Username/email and password are required" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findFirst({
      where: {
        username: { equals: identifier, mode: "insensitive" },
      },
      include: {
        restaurant: {
          select: {
            restaurant_id: true,
            name: true,
            has_multiple_branches: true,
          },
        },
        branch: { select: { branch_id: true, branch_name: true } },
      },
    });

    if (
      !user &&
      identifier === DEFAULT_SUPER_ADMIN_USERNAME &&
      password === DEFAULT_SUPER_ADMIN_PASSWORD
    ) {
      user = await prisma.user.create({
        data: {
          username: DEFAULT_SUPER_ADMIN_USERNAME,
          password: DEFAULT_SUPER_ADMIN_PASSWORD,
          fullname: "Platform Admin",
          role: "SUPER_ADMIN",
          status: "Active",
          terminal: 1,
        },
        include: {
          restaurant: {
            select: {
              restaurant_id: true,
              name: true,
              has_multiple_branches: true,
            },
          },
          branch: { select: { branch_id: true, branch_name: true } },
        },
      });
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (user.status !== "Active") {
      return NextResponse.json({ error: "User is inactive" }, { status: 403 });
    }

    const role = normalizeRole(user.role);
    if (role === "RESTAURANT_ADMIN" && !user.restaurant_id) {
      return NextResponse.json(
        { error: "User has no assigned restaurant" },
        { status: 403 }
      );
    }
    if (
      (role === "BRANCH_ADMIN" ||
        role === "ORDER_TAKER" ||
        role === "CASHIER" ||
        role === "ACCOUNTANT" ||
        role === "LIVE_KITCHEN") &&
      !user.branch_id
    ) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 403 }
      );
    }
    if (role === "BRANCH_ADMIN" && !user.restaurant_id) {
      return NextResponse.json(
        { error: "User has no assigned restaurant" },
        { status: 403 }
      );
    }

    const token = randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    // ── Resolve effective branch for the session payload ─────────────────
    // Single-branch Restaurant Admins live in a UI where branches are not
    // user-visible. We still auto-scope all branch-owned modules (categories,
    // menu, deals, orders, …) to the tenant's one real/internal branch so the
    // UI doesn't show awkward "All Branches" dropdowns. The user's stored
    // `branch_id` in the DB stays null — this is purely a session-level hint
    // that downstream screens already honor via `isBranchFilterLocked` and
    // `getEffectiveBranchId`.
    let effectiveBranchId: number | null = user.branch_id ?? null;
    let effectiveBranchName: string | null = user.branch?.branch_name ?? null;
    if (
      role === "RESTAURANT_ADMIN" &&
      user.restaurant?.has_multiple_branches === false &&
      user.restaurant_id &&
      effectiveBranchId === null
    ) {
      try {
        const defaultBranchId = await resolveDefaultBranchForSingleBranch(
          user.restaurant_id
        );
        const defaultBranch = await prisma.branch.findUnique({
          where: { branch_id: defaultBranchId },
          select: { branch_id: true, branch_name: true },
        });
        if (defaultBranch) {
          effectiveBranchId = defaultBranch.branch_id;
          effectiveBranchName = defaultBranch.branch_name;
        }
      } catch {
        // fall through: keep branch null, UI will still work via fallback
      }
    }

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      fullName: user.fullname ?? user.username,
      role,
      restaurantId: user.restaurant_id ?? null,
      restaurantName: user.restaurant?.name ?? null,
      restaurantHasMultipleBranches:
        user.restaurant?.has_multiple_branches ?? null,
      branchId: effectiveBranchId,
      branchName: effectiveBranchName,
      terminal: user.terminal,
      token,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
