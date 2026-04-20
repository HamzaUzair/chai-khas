"use client";

import React from "react";
import { Ban } from "lucide-react";

import type { InactiveReason } from "@/lib/use-branch-status";

interface BranchInactiveBannerProps {
  /**
   * What operational action is being blocked on this page
   * (e.g. "Place Order", "Pay", "Mark Running / Served", "Add Expense",
   * "Close Day"). Rendered in the body copy so the notice is specific
   * to the module the user is currently looking at. Omit for a generic
   * tenant-wide banner painted by the layout.
   */
  action?: string;
  /**
   * Whether the banner should speak about the branch or the owning
   * restaurant. Driven by `useBranchStatus().reason` so the copy
   * matches whichever entity was flipped to `Inactive` in Restenzo.
   */
  reason?: Exclude<InactiveReason, null>;
  /** Human-readable branch name, when available. */
  branchName?: string;
  /** Human-readable restaurant / tenant name, when available. */
  restaurantName?: string;
}

/**
 * Top-of-page notice shown whenever the signed-in user's branch **or
 * owning restaurant** has been flipped to `Inactive` (either by the
 * Restaurant Admin from the Branches page, or by the Super Admin from
 * the Restenzo panel). Goes hand-in-hand with the backend's
 * `assertBranchActive` / `assertRestaurantActive` /
 * `assertBranchWriteAccess` checks — the UI disables the action
 * buttons and this banner explains why.
 */
const BranchInactiveBanner: React.FC<BranchInactiveBannerProps> = ({
  action,
  reason = "branch",
  branchName,
  restaurantName,
}) => {
  const isTenant = reason === "restaurant";
  const title = isTenant ? "Restaurant Inactive" : "Branch Inactive";
  const name = isTenant ? restaurantName : branchName;
  const subject = isTenant ? "restaurant" : "branch";
  const reactivateHint = isTenant
    ? "Contact the Restenzo platform admin to reactivate the restaurant."
    : "A Restaurant Admin can reactivate the branch from the Branches page to resume work.";

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <Ban size={18} className="mt-0.5 shrink-0 text-rose-600" />
      <div>
        <p className="font-semibold">
          {title}
          {name ? ` · ${name}` : ""}
        </p>
        <p className="mt-0.5 text-rose-700">
          This {subject} is currently inactive. Operational actions are disabled
          {action ? ` — ${action} is blocked` : ""}. {reactivateHint}
        </p>
      </div>
    </div>
  );
};

export default BranchInactiveBanner;
