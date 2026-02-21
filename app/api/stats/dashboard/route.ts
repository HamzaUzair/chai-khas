import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ── GET /api/stats/dashboard ── */
export async function GET() {
  try {
    const [totalBranches, totalActiveBranches] = await Promise.all([
      prisma.branch.count(),
      prisma.branch.count({ where: { status: "Active" } }),
    ]);

    return NextResponse.json({ totalBranches, totalActiveBranches });
  } catch (err) {
    console.error("GET /api/stats/dashboard error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
