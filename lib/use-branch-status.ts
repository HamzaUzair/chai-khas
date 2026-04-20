"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth-client";

export type BranchStatusScope = "branch" | "tenant_only" | "no_tenant";

/** Which entity is the reason we're showing the inactive banner, if any. */
export type InactiveReason = "branch" | "restaurant" | null;

export interface BranchStatusInfo {
  scope: BranchStatusScope;
  branchId: number | null;
  branchName?: string | null;
  /** `"Active"`, `"Inactive"`, or `null` when there is no branch in scope. */
  branchStatus: string | null;
  restaurantId: number | null;
  restaurantName?: string | null;
  /** `"Active"`, `"Inactive"`, or `null` when there is no tenant in scope. */
  restaurantStatus: string | null;
  loading: boolean;
  /**
   * `true` when **either** the branch or its parent restaurant is
   * inactive. Callers use this to disable Place Order / Pay / Mark
   * Running etc. regardless of which entity caused the suspension.
   */
  isInactive: boolean;
  /**
   * What caused `isInactive` — `"restaurant"` takes priority because a
   * tenant suspension also implies the branch is frozen. `null` when
   * everything is active.
   */
  reason: InactiveReason;
  /** Manually refresh — e.g. after a user flips a branch back to Active. */
  refresh: () => void;
}

/**
 * React hook that reads the caller's session branch + tenant status
 * from `/api/session/branch-status`. Refetches on mount, when the
 * window regains focus, and on a slow background interval so branches
 * or restaurants flipped to `Inactive` mid-session propagate to every
 * page without requiring a full reload.
 *
 * `enabled=false` short-circuits the hook (used while the page hasn't
 * finished its auth guard).
 */
export function useBranchStatus(enabled: boolean = true): BranchStatusInfo {
  const [branchStatus, setBranchStatus] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [restaurantStatus, setRestaurantStatus] = useState<string | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [scope, setScope] = useState<BranchStatusScope>("no_tenant");
  const [loading, setLoading] = useState<boolean>(enabled);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiFetch("/api/session/branch-status");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (cancelled) return;
        setScope((data?.scope as BranchStatusScope) ?? "no_tenant");
        setBranchId(typeof data?.branchId === "number" ? data.branchId : null);
        setBranchName(
          typeof data?.branchName === "string" ? data.branchName : null
        );
        setBranchStatus(
          typeof data?.branchStatus === "string" ? data.branchStatus : null
        );
        setRestaurantId(
          typeof data?.restaurantId === "number" ? data.restaurantId : null
        );
        setRestaurantName(
          typeof data?.restaurantName === "string" ? data.restaurantName : null
        );
        setRestaurantStatus(
          typeof data?.restaurantStatus === "string"
            ? data.restaurantStatus
            : null
        );
      } catch {
        if (cancelled) return;
        setScope("no_tenant");
        setBranchId(null);
        setBranchName(null);
        setBranchStatus(null);
        setRestaurantId(null);
        setRestaurantName(null);
        setRestaurantStatus(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    const id = window.setInterval(load, 60_000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(id);
    };
  }, [enabled, nonce]);

  // Restaurant suspension takes priority — if the whole tenant is
  // inactive, we want Head Office and staff both to see the
  // "Restaurant Inactive" copy (not "Branch Inactive") because the
  // freeze is tenant-wide.
  const reason: InactiveReason =
    restaurantStatus === "Inactive"
      ? "restaurant"
      : branchStatus === "Inactive"
      ? "branch"
      : null;

  return {
    scope,
    branchId,
    branchName,
    branchStatus,
    restaurantId,
    restaurantName,
    restaurantStatus,
    loading,
    isInactive: reason !== null,
    reason,
    refresh: () => setNonce((n) => n + 1),
  };
}
