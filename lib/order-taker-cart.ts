/**
 * Shared cart for Order Taker between New Order / POS and Order Deals.
 * Uses sessionStorage so the same tab session keeps cart in sync across routes.
 */

export const ORDER_TAKER_CART_STORAGE_KEY = "chai_order_taker_cart_v1";

export type MenuCartLine = {
  kind: "menu";
  key: string;
  menuId: number;
  menuName: string;
  categoryName: string;
  variationName: string | null;
  unitPrice: number;
  qty: number;
};

export type DealCartLine = {
  kind: "deal";
  key: string;
  dealId: number;
  dealName: string;
  dealType: string;
  branchName?: string;
  unitPrice: number;
  qty: number;
  components: Array<{ dishId: number; name: string; quantity: number }>;
};

export type OrderTakerCartLine = MenuCartLine | DealCartLine;

function migrateLine(row: unknown): OrderTakerCartLine | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  if (r.kind === "menu" || r.kind === "deal") {
    return row as OrderTakerCartLine;
  }
  if (typeof r.key === "string" && typeof r.menuId === "number") {
    return {
      kind: "menu",
      key: r.key,
      menuId: r.menuId,
      menuName: String(r.menuName ?? ""),
      categoryName: String(r.categoryName ?? "General"),
      variationName: (r.variationName as string | null) ?? null,
      unitPrice: Number(r.unitPrice) || 0,
      qty: Math.max(1, Number(r.qty) || 1),
    };
  }
  return null;
}

export function loadOrderTakerCart(): OrderTakerCartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(ORDER_TAKER_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateLine).filter((row): row is OrderTakerCartLine => row !== null);
  } catch {
    return [];
  }
}

export function saveOrderTakerCart(lines: OrderTakerCartLine[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ORDER_TAKER_CART_STORAGE_KEY, JSON.stringify(lines));
}

export function clearOrderTakerCart() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ORDER_TAKER_CART_STORAGE_KEY);
}
