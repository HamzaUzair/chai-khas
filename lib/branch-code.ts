import { prisma } from "@/lib/prisma";

/**
 * Generates an internal, globally unique branch_code without ever surfacing
 * the value to the end user. The code is only needed because `branches.branch_code`
 * is a NOT NULL UNIQUE column that downstream modules (users list, analytics,
 * dashboard) render verbatim — the multi-branch admin UI no longer asks for
 * it and cross-restaurant collisions (Restaurant A's "001" vs Restaurant X's
 * "001") can't happen because the code is derived from the tenant slug.
 *
 * Shape: `<SLUG>-<SUFFIX>[-<n>]`  (uppercased, sanitized)
 *
 *   MAIN       → reserved for the hidden default branch of a single-branch
 *                tenant (see `resolveDefaultBranchForSingleBranch`).
 *   B<seq>     → used for regular multi-branch creates. `seq` is the next
 *                branch number for the restaurant, so a fresh head office
 *                gets `<SLUG>-B1`, `<SLUG>-B2`, etc.
 *
 * Collision-safe: if the slug-derived candidate is somehow taken (rare, only
 * happens with legacy rows), we append `-2`, `-3`, … until we find a free
 * code, capped at 1000 tries to avoid pathological loops.
 */
export async function generateUniqueBranchCode(
  restaurantSlug: string | null | undefined,
  opts: { suffix?: string; restaurantId?: number } = {}
): Promise<string> {
  const base =
    ((restaurantSlug ?? "").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16) ||
      "REST");

  let suffix = (opts.suffix ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!suffix) {
    if (typeof opts.restaurantId === "number") {
      const count = await prisma.branch.count({
        where: { restaurant_id: opts.restaurantId },
      });
      suffix = `B${count + 1}`;
    } else {
      suffix = "MAIN";
    }
  }

  const desired = `${base}-${suffix}`;
  let candidate = desired;
  for (let i = 2; i < 1000; i += 1) {
    const clash = await prisma.branch.findUnique({
      where: { branch_code: candidate },
    });
    if (!clash) return candidate;
    candidate = `${desired}-${i}`;
  }
  // Extremely unlikely final fallback — guarantees uniqueness without ever
  // throwing to the caller.
  return `${desired}-${Date.now()}`;
}
