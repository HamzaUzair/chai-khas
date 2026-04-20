/**
 * Bill number format for Cashier → Paid receipts.
 *
 * Format: `BILL-YYYYMMDD-NNNNNN`
 *   - `YYYYMMDD` is the payment's business date in **server-local** time
 *     (same timezone Day End uses — see `parseBusinessDate` in
 *     `app/api/dayend/route.ts`) so a bill printed and a day-end report
 *     closed in the same shift agree on the date.
 *   - `NNNNNN` is the zero-padded `orders.order_id`. Because the order id
 *     is an auto-incrementing primary key, this guarantees uniqueness
 *     across the whole restaurant group without an extra sequence table
 *     and without risking duplicate bill numbers on concurrent payments.
 *
 * Uniqueness is intentionally **global**, not per-branch / per-tenant:
 * it makes audit / refund lookups trivial and works identically for
 * single-branch and multi-branch restaurants. If a branch-scoped prefix
 * is needed later, we can migrate by storing `BILL-{branchCode}-…` and
 * keep the legacy form as a fallback in `isLegacyReference`.
 */
export function formatBillNo(orderId: number, when: Date = new Date()): string {
  const y = when.getFullYear();
  const m = String(when.getMonth() + 1).padStart(2, "0");
  const d = String(when.getDate()).padStart(2, "0");
  const id = String(orderId).padStart(6, "0");
  return `BILL-${y}${m}${d}-${id}`;
}

/**
 * Returns `true` for legacy `Payment.reference` values that predate the
 * new bill number format (e.g. `ORD-42`). Used by the serializers so
 * historical paid orders still display a canonical `BILL-…` id instead
 * of the old reference.
 */
export function isLegacyReference(reference: string | null | undefined): boolean {
  if (!reference) return true;
  return !/^BILL-\d{8}-\d{6}$/.test(reference);
}
