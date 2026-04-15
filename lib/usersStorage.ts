"use client";

import type { AppUser, UserRole } from "@/types/user";

const STORAGE_KEY = "pos_users";

/* ══════════════ Read / Write ══════════════ */

export function getUsers(): AppUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppUser[]) : [];
  } catch {
    return [];
  }
}

export function setUsers(data: AppUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function nextUserId(existing: AppUser[]): number {
  if (existing.length === 0) return 1;
  return Math.max(...existing.map((u) => u.userId)) + 1;
}

/* ══════════════ Mock branches (fallback) ══════════════ */

export interface MockBranch {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  status: "Active" | "Inactive";
}

export const FALLBACK_BRANCHES: MockBranch[] = [
  { branch_id: 1, branch_name: "Main Branch", branch_code: "BR001", status: "Active" },
  { branch_id: 2, branch_name: "North Campus", branch_code: "BR002", status: "Active" },
  { branch_id: 3, branch_name: "Downtown", branch_code: "BR003", status: "Active" },
  { branch_id: 4, branch_name: "Gulberg Outlet", branch_code: "BR004", status: "Active" },
];

/* ══════════════ Demo seed ══════════════ */

export function generateDemoUsers(
  branches: { branch_id: number; branch_name: string; branch_code: string }[]
): AppUser[] {
  const now = Date.now();

  const demos: {
    username: string;
    fullName: string;
    role: UserRole;
    branchIdx: number | null; // null → Super Admin (no branch)
    status: "Active" | "Inactive";
    terminal: number;
    daysAgo: number;
  }[] = [
    { username: "sdmain@gmail.com", fullName: "Hamza Badar", role: "SUPER_ADMIN", branchIdx: null, status: "Active", terminal: 1, daysAgo: 90 },
    { username: "admin@mainbranch.com", fullName: "Ali Ahmed", role: "BRANCH_ADMIN", branchIdx: 0, status: "Active", terminal: 1, daysAgo: 60 },
    { username: "admin@north.com", fullName: "Fatima Noor", role: "BRANCH_ADMIN", branchIdx: 1, status: "Active", terminal: 1, daysAgo: 30 },
    { username: "admin@downtown.com", fullName: "Zainab Tariq", role: "BRANCH_ADMIN", branchIdx: 2, status: "Active", terminal: 1, daysAgo: 15 },
    { username: "admin@gulberg.com", fullName: "Sara Khan", role: "BRANCH_ADMIN", branchIdx: 0, status: "Active", terminal: 1, daysAgo: 10 },
    { username: "branch2@mainbranch.com", fullName: "Hassan Raza", role: "BRANCH_ADMIN", branchIdx: 1, status: "Inactive", terminal: 2, daysAgo: 50 },
  ];

  return demos.map((d, i) => {
    const branch =
      d.branchIdx !== null && branches[d.branchIdx]
        ? branches[d.branchIdx]
        : null;
    return {
      id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      userId: i + 1,
      username: d.username,
      fullName: d.fullName,
      role: d.role,
      branchId: branch ? branch.branch_id : null,
      branchName: branch ? branch.branch_name : "No Branch",
      branchCode: branch ? branch.branch_code : "—",
      status: d.status,
      terminal: d.terminal,
      createdAt: now - d.daysAgo * 86_400_000,
    };
  });
}
