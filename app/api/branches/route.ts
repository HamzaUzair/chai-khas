import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ── GET /api/branches ── */
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json(branches);
  } catch (err) {
    console.error("GET /api/branches error:", err);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}

/* ── POST /api/branches ── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { branch_name, branch_code, address, phone, email, status } = body;

    // Validate required fields
    if (!branch_name?.trim()) {
      return NextResponse.json(
        { error: "Branch name is required" },
        { status: 400 }
      );
    }
    if (!branch_code?.trim()) {
      return NextResponse.json(
        { error: "Branch code is required" },
        { status: 400 }
      );
    }

    // Check for duplicate branch_code
    const existing = await prisma.branch.findUnique({
      where: { branch_code: branch_code.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Branch code "${branch_code}" already exists` },
        { status: 409 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        branch_name: branch_name.trim(),
        branch_code: branch_code.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        status: status === "Inactive" ? "Inactive" : "Active",
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err) {
    console.error("POST /api/branches error:", err);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 }
    );
  }
}
