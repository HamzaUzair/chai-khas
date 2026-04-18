"use client";

import type { AuthSession } from "@/types/auth";

const AUTH_STORAGE_KEY = "auth_session";

/** Routes visible in the Super Admin platform panel. */
export const SUPER_ADMIN_ALLOWED_PATHS = new Set([
  "/dashboard",
  "/restaurants",
  "/users",
  "/analytics",
]);

/** Routes visible in the Restaurant Admin operational panel. */
export const RESTAURANT_ADMIN_ALLOWED_PATHS = new Set([
  "/dashboard",
  "/branches",
  "/categories",
  "/menu",
  "/deals",
  "/kitchen",
  "/orders",
  "/create-order",
  "/sales-list",
  "/sales-report",
  "/menu-sales",
  "/expenses",
  "/dayend",
  "/halls",
  "/roles",
  "/analytics",
  "/seating",
]);

/**
 * Routes visible in the Branch Admin operational panel. Branch Admins get the
 * full per-branch operational toolkit minus restaurant-wide concerns such as
 * multi-branch management or the Branches list.
 */
export const BRANCH_ADMIN_ALLOWED_PATHS = new Set([
  "/dashboard",
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
  "/roles",
  "/analytics",
  "/seating",
]);

/**
 * Build the allowed-paths set for the Restaurant Admin, honoring the
 * tenant's "has multiple branches" flag. Single-branch tenants have the
 * `/branches` route hidden *and* blocked, so typing the URL directly
 * redirects to the dashboard instead of exposing branch management.
 */
export function getRestaurantAdminAllowedPaths(
  session: AuthSession | null
): Set<string> {
  const paths = new Set(RESTAURANT_ADMIN_ALLOWED_PATHS);
  if (session?.restaurantHasMultipleBranches === false) {
    paths.delete("/branches");
    paths.delete("/create-order");
  }
  return paths;
}

export const STAFF_ALLOWED_PATHS = new Set(["/dashboard"]);
export const ORDER_TAKER_ALLOWED_PATHS = new Set(["/create-order", "/order-deals"]);
export const LIVE_KITCHEN_ALLOWED_PATHS = new Set(["/kitchen"]);
export const CASHIER_ALLOWED_PATHS = new Set(["/orders"]);

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

export function isSuperAdmin(session: AuthSession | null) {
  return session?.role === "SUPER_ADMIN";
}

export function isRestaurantAdmin(session: AuthSession | null) {
  return session?.role === "RESTAURANT_ADMIN";
}

export function isBranchAdmin(session: AuthSession | null) {
  return session?.role === "BRANCH_ADMIN";
}

/**
 * Single source of truth for "can this session edit branch-scoped operational
 * data?". Mirrors the server-side `assertBranchWriteAccess`.
 *
 *   - Super Admin                           → editable
 *   - Restaurant Admin (single-branch)      → editable
 *   - Restaurant Admin (multi-branch)       → read-only (head-office view)
 *   - Branch Admin / Order Taker / Cashier /
 *     Accountant                            → editable within their branch
 */
export function isOperationalReadOnly(session: AuthSession | null): boolean {
  if (!session) return true;
  if (session.role === "RESTAURANT_ADMIN") {
    return session.restaurantHasMultipleBranches === true;
  }
  return false;
}

/** Convenience inverse of {@link isOperationalReadOnly}. */
export function canEditOperational(session: AuthSession | null): boolean {
  return !isOperationalReadOnly(session);
}

/**
 * Best-effort inference of the "effective" branch filter value for UI selects.
 * Super Admin and (multi-branch) Restaurant Admin default to "all" while
 * branch-pinned roles are locked to their assigned branch.
 */
export function getEffectiveBranchId(session: AuthSession | null): number | "all" {
  if (!session) return "all";
  if (
    session.role === "BRANCH_ADMIN" ||
    session.role === "ORDER_TAKER" ||
    session.role === "CASHIER" ||
    session.role === "ACCOUNTANT" ||
    session.role === "LIVE_KITCHEN"
  ) {
    return session.branchId ?? "all";
  }
  return "all";
}

/** Branch-scoped roles: UI must not offer "All branches" (mirrors server `isBranchScopedRole`). */
export function isBranchFilterLocked(session: AuthSession | null): boolean {
  if (!session) return false;
  return (
    session.role === "BRANCH_ADMIN" ||
    session.role === "ORDER_TAKER" ||
    session.role === "CASHIER" ||
    session.role === "ACCOUNTANT" ||
    session.role === "LIVE_KITCHEN"
  );
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
