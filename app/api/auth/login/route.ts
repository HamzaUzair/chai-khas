import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_SUPER_ADMIN_USERNAME = "sdmain@gmail.com";
const DEFAULT_SUPER_ADMIN_PASSWORD = "Asdf0010";

function normalizeRole(
  role?: string
): "SUPER_ADMIN" | "BRANCH_ADMIN" | "ORDER_TAKER" | "CASHIER" | "ACCOUNTANT" {
  const normalized = role?.toUpperCase();
  if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (normalized === "ORDER_TAKER") return "ORDER_TAKER";
  if (normalized === "CASHIER") return "CASHIER";
  if (normalized === "ACCOUNTANT") return "ACCOUNTANT";
  return "BRANCH_ADMIN";
}

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
        branch: { select: { branch_id: true, branch_name: true } },
      },
    });

    if (!user && identifier === DEFAULT_SUPER_ADMIN_USERNAME && password === DEFAULT_SUPER_ADMIN_PASSWORD) {
      user = await prisma.user.create({
        data: {
          username: DEFAULT_SUPER_ADMIN_USERNAME,
          password: DEFAULT_SUPER_ADMIN_PASSWORD,
          fullname: "Super Admin",
          role: "SUPER_ADMIN",
          status: "Active",
          terminal: 1,
        },
        include: {
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
    if (role !== "SUPER_ADMIN" && !user.branch_id) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 403 }
      );
    }

    const token = randomUUID();
    await prisma.user.update({
      where: { id: user.id },
      data: { token },
    });

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      fullName: user.fullname ?? user.username,
      role,
      branchId: user.branch_id ?? null,
      branchName: user.branch?.branch_name ?? null,
      terminal: user.terminal,
      token,
    });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

