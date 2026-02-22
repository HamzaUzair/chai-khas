"use client";

import type { KitchenStation, KitchenStaff, StaffRole } from "@/types/kitchen";

const STATIONS_KEY = "pos_kitchens";
const STAFF_KEY = "pos_kitchen_staff";

/* ══════════════ Stations ══════════════ */

export function getStations(): KitchenStation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STATIONS_KEY);
    return raw ? (JSON.parse(raw) as KitchenStation[]) : [];
  } catch {
    return [];
  }
}

export function setStations(data: KitchenStation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATIONS_KEY, JSON.stringify(data));
}

/* ══════════════ Staff ══════════════ */

export function getStaff(): KitchenStaff[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STAFF_KEY);
    return raw ? (JSON.parse(raw) as KitchenStaff[]) : [];
  } catch {
    return [];
  }
}

export function setStaff(data: KitchenStaff[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}

/* ══════════════ Demo data generator ══════════════ */

interface BranchInfo {
  branchId: number;
  branchName: string;
}

const DEMO_STAFF_TEMPLATES: { name: string; role: StaffRole; phone: string }[] = [
  { name: "Ahmad Khan", role: "chef", phone: "0300-1234567" },
  { name: "Bilal Hussain", role: "chef", phone: "0301-2345678" },
  { name: "Usman Ali", role: "kitchen_staff", phone: "0312-3456789" },
  { name: "Faisal Mehmood", role: "runner", phone: "0333-4567890" },
  { name: "Hamza Tariq", role: "manager", phone: "0345-5678901" },
];

export function generateDemoData(branches: BranchInfo[]): {
  stations: KitchenStation[];
  staff: KitchenStaff[];
} {
  const stations: KitchenStation[] = [];
  const staff: KitchenStaff[] = [];
  const now = Date.now();

  branches.forEach((b, bIdx) => {
    // Staff for this branch
    const branchStaff: KitchenStaff[] = DEMO_STAFF_TEMPLATES.map(
      (t, sIdx) => ({
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        branchId: b.branchId,
        branchName: b.branchName,
        name: t.name,
        role: t.role,
        phone: t.phone,
        status: sIdx < 4 ? ("active" as const) : ("inactive" as const),
      })
    );
    staff.push(...branchStaff);

    // Stations for this branch
    const activeStaffIds = branchStaff
      .filter((s) => s.status === "active")
      .map((s) => s.id);

    stations.push(
      {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        branchId: b.branchId,
        branchName: b.branchName,
        title: "Main Kitchen",
        code: "K1",
        printerName: "Kitchen Printer 1",
        status: "active",
        staffIds: activeStaffIds.slice(0, 3),
        createdAt: now - bIdx * 120000,
      },
      {
        id: (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        branchId: b.branchId,
        branchName: b.branchName,
        title: "BBQ Station",
        code: "K2",
        printerName: "BBQ Printer",
        status: "active",
        staffIds: activeStaffIds.slice(2, 4),
        createdAt: now - bIdx * 120000 - 60000,
      }
    );
  });

  return { stations, staff };
}
