"use client";

import type { AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "auth_session";

export const BRANCH_ADMIN_ALLOWED_PATHS = new Set([
  "/dashboard",
  "/roles",
  "/categories",
  "/menu",
  "/deals",
  "/kitchen",
  "/orders",
  "/sales-list",
  "/sales-report",
  "/menu-sales",
  "/expenses",
  "/dayend",
  "/halls",
  "/analytics",
]);

export const STAFF_ALLOWED_PATHS = new Set(["/dashboard"]);
export const ORDER_TAKER_ALLOWED_PATHS = new Set(["/dashboard", "/create-order", "/orders"]);

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userRole", session.role.toLowerCase());
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("userRole");
}

export function isBranchAdmin(session: AuthSession | null) {
  return session?.role === "BRANCH_ADMIN";
}

export function getEffectiveBranchId(session: AuthSession | null): number | "all" {
  if (session?.role === "BRANCH_ADMIN" && session.branchId) return session.branchId;
  return "all";
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const session = getAuthSession();
  const headers = new Headers(init.headers ?? {});
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }
  return fetch(input, { ...init, headers });
}

