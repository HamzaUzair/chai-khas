"use client";

import type { Hall } from "@/types/hall";

const STORAGE_KEY = "pos_halls";

/* ══════════════ Read / Write ══════════════ */

export function getHalls(): Hall[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Hall[]) : [];
  } catch {
    return [];
  }
}

export function setHalls(data: Hall[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ══════════════ Next display ID ══════════════ */

export function nextHallId(existing: Hall[]): number {
  if (existing.length === 0) return 1;
  return Math.max(...existing.map((h) => h.hallId)) + 1;
}

/* ══════════════ Demo seed ══════════════ */

interface BranchInfo {
  branchId: number;
  branchName: string;
}

export function generateDemoHalls(branches: BranchInfo[]): Hall[] {
  const now = Date.now();
  const demos = [
    { name: "Outdoor Hall", capacity: 50, terminal: 1 },
    { name: "Hall A", capacity: 0, terminal: 1 },
    { name: "Family Hall", capacity: 30, terminal: 1 },
    { name: "VIP Lounge", capacity: 20, terminal: 1 },
    { name: "Rooftop Section", capacity: 40, terminal: 1 },
    { name: "Private Room", capacity: 12, terminal: 1 },
  ];

  const halls: Hall[] = [];
  const count = Math.min(demos.length, branches.length > 1 ? 6 : 3);

  for (let i = 0; i < count; i++) {
    const branch = branches[i % branches.length];
    const d = demos[i];
    halls.push({
      id: crypto.randomUUID(),
      hallId: i + 1,
      name: d.name,
      capacity: d.capacity,
      terminal: d.terminal,
      branchId: branch.branchId,
      branchName: branch.branchName,
      createdAt: now - (count - i) * 86_400_000,
      updatedAt: now - (count - i) * 86_400_000,
    });
  }

  return halls;
}
