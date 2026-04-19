"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiFetch, getAuthSession } from "@/lib/auth-client";
import {
  clearOrderTakerCart,
  loadOrderTakerCart,
  saveOrderTakerCart,
  type MenuCartLine,
  type OrderTakerCartLine,
} from "@/lib/order-taker-cart";

type OrderType = "Dine In" | "Take Away" | "Delivery";

type ApiCategory = { category_id: number; name: string };
type ApiMenuItem = {
  id: number;
  itemName: string;
  category: string;
  hasVariations: boolean;
  basePrice: number | null;
  price: number;
  variations: Array<{ id: number; name: string; price: number }>;
};
type ApiHall = {
  hallId: number;
  name: string;
  tables: Array<{ tableId: number; name: string; status: string; capacity: number }>;
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionBranchId, setSessionBranchId] = useState<number | null>(null);
  const [sessionRole, setSessionRole] = useState<string>("ORDER_TAKER");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [menuItems, setMenuItems] = useState<ApiMenuItem[]>([]);
  const [halls, setHalls] = useState<ApiHall[]>([]);

  const [orderType, setOrderType] = useState<OrderType>("Dine In");
  const [selectedHallId, setSelectedHallId] = useState<number | "">("");
  const [selectedTableId, setSelectedTableId] = useState<number | "">("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<OrderTakerCartLine[]>([]);
  const [variationPickerFor, setVariationPickerFor] = useState<ApiMenuItem | null>(null);
  const skipNextCartPersist = useRef(true);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!session.branchId) {
      router.replace("/dashboard");
      return;
    }
    if (
      session.role !== "ORDER_TAKER" &&
      session.role !== "BRANCH_ADMIN" &&
      session.role !== "RESTAURANT_ADMIN" &&
      session.role !== "SUPER_ADMIN"
    ) {
      router.replace("/dashboard");
      return;
    }
    if (
      session.role === "BRANCH_ADMIN" ||
      (session.role === "RESTAURANT_ADMIN" &&
        session.restaurantHasMultipleBranches === false)
    ) {
      router.replace("/orders");
      return;
    }
    setSessionRole(session.role);
    setSessionBranchId(session.branchId);
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized || sessionRole !== "ORDER_TAKER") return;
    const loaded = loadOrderTakerCart();
    if (loaded.length > 0) setCart(loaded);
    skipNextCartPersist.current = true;
  }, [authorized, sessionRole]);

  useEffect(() => {
    if (!authorized || sessionRole !== "ORDER_TAKER") return;
    if (skipNextCartPersist.current) {
      skipNextCartPersist.current = false;
      return;
    }
    saveOrderTakerCart(cart);
  }, [authorized, sessionRole, cart]);

  const loadContext = useCallback(async () => {
    if (!sessionBranchId) return;
    setLoading(true);
    setError("");
    try {
      const [categoriesRes, menuRes, hallsRes] = await Promise.all([
        apiFetch(`/api/categories?branch_id=${sessionBranchId}`),
        apiFetch(`/api/menu?branchId=${sessionBranchId}&status=active`),
        apiFetch(`/api/halls?branchId=${sessionBranchId}`),
      ]);
      if (!categoriesRes.ok || !menuRes.ok || !hallsRes.ok) {
        throw new Error("Failed to load order-taking data");
      }
      const [categoriesData, menuData, hallsData] = await Promise.all([
        categoriesRes.json(),
        menuRes.json(),
        hallsRes.json(),
      ]);
      setCategories((categoriesData as ApiCategory[]).sort((a, b) => a.name.localeCompare(b.name)));
      setMenuItems(menuData as ApiMenuItem[]);
      setHalls(hallsData as ApiHall[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load POS data");
    } finally {
      setLoading(false);
    }
  }, [sessionBranchId]);

  useEffect(() => {
    if (!authorized || !sessionBranchId) return;
    void loadContext();
  }, [authorized, sessionBranchId, loadContext]);

  const selectedHall = selectedHallId
    ? halls.find((hall) => hall.hallId === selectedHallId) ?? null
    : null;
  const tables = selectedHall?.tables ?? [];

  const visibleItems = menuItems.filter((item) => {
    const catOk = selectedCategory === "all" || item.category === selectedCategory;
    const searchOk =
      !search.trim() ||
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const addMenuItem = (item: ApiMenuItem, variationName: string | null, unitPrice: number) => {
    const key = `${item.id}::${variationName ?? "base"}`;
    setCart((prev) => {
      const existing = prev.find(
        (row): row is MenuCartLine => row.kind === "menu" && row.key === key
      );
      if (existing) {
        return prev.map((row) =>
          row.kind === "menu" && row.key === key ? { ...row, qty: row.qty + 1 } : row
        );
      }
      const line: MenuCartLine = {
        kind: "menu",
        key,
        menuId: item.id,
        menuName: item.itemName,
        categoryName: item.category,
        variationName,
        unitPrice,
        qty: 1,
      };
      return [...prev, line];
    });
  };

  const handleAddClick = (item: ApiMenuItem) => {
    if (item.hasVariations && item.variations.length > 0) {
      setVariationPickerFor(item);
      return;
    }
    const price = item.basePrice ?? item.price;
    addMenuItem(item, null, Number(price));
  };

  const adjustQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((row) => (row.key === key ? { ...row, qty: Math.max(0, row.qty + delta) } : row))
        .filter((row) => row.qty > 0)
    );
  };

  const removeRow = (key: string) => {
    setCart((prev) => prev.filter((row) => row.key !== key));
  };

  const subtotal = cart.reduce((sum, row) => sum + row.qty * row.unitPrice, 0);

  const placeOrder = async () => {
    setError("");
    setSuccess("");
    if (!sessionBranchId) return;
    const menuLines = cart.filter((r): r is MenuCartLine => r.kind === "menu");
    const dealLines = cart.filter((r) => r.kind === "deal");
    if (menuLines.length === 0 && dealLines.length === 0) {
      setError("Please add at least one menu item or deal.");
      return;
    }
    if (orderType === "Dine In" && (!selectedHallId || !selectedTableId)) {
      setError("Please select hall and table for dine in order.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: sessionBranchId,
          orderType,
          hallId: orderType === "Dine In" ? selectedHallId : null,
          tableId: orderType === "Dine In" ? selectedTableId : null,
          comments: notes,
          items: menuLines.map((row) => ({
            menuId: row.menuId,
            menuName: row.menuName,
            categoryName: row.categoryName,
            variationName: row.variationName,
            quantity: row.qty,
            unitPrice: row.unitPrice,
          })),
          deals: dealLines.map((row) => ({
            dealId: row.dealId,
            quantity: row.qty,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }
      setCart([]);
      if (sessionRole === "ORDER_TAKER") clearOrderTakerCart();
      setNotes("");
      setSuccess(`Order ${data.orderNo ?? ""} placed successfully.`);
      // Drop the table selection and refetch halls so the just-occupied
      // table is reflected immediately in the dropdown (disabled, labeled
      // "(Occupied)") without requiring a manual page refresh.
      if (orderType === "Dine In") {
        setSelectedTableId("");
        void loadContext();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setSaving(false);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title={sessionRole === "ORDER_TAKER" ? "Order Taker POS" : "Create Order"}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={orderType}
            onChange={(e) => {
              const next = e.target.value as OrderType;
              setOrderType(next);
              if (next !== "Dine In") {
                setSelectedHallId("");
                setSelectedTableId("");
              }
            }}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="Dine In">Dine In</option>
            <option value="Take Away">Take Away</option>
            <option value="Delivery">Delivery</option>
          </select>

          <select
            value={selectedHallId}
            onChange={(e) => {
              setSelectedHallId(e.target.value ? Number(e.target.value) : "");
              setSelectedTableId("");
            }}
            disabled={orderType !== "Dine In"}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50"
          >
            <option value="">{orderType === "Dine In" ? "Select Hall" : "Hall N/A"}</option>
            {halls.map((hall) => (
              <option key={hall.hallId} value={hall.hallId}>
                {hall.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTableId}
            onChange={(e) => setSelectedTableId(e.target.value ? Number(e.target.value) : "")}
            disabled={orderType !== "Dine In" || !selectedHallId}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-gray-50"
          >
            <option value="">
              {orderType !== "Dine In" ? "Table N/A" : selectedHallId ? "Select Table" : "Select hall first"}
            </option>
            {tables.map((table) => {
              const isOccupied = table.status === "Occupied";
              return (
                <option
                  key={table.tableId}
                  value={table.tableId}
                  disabled={isOccupied}
                >
                  {isOccupied ? `${table.name} (Occupied)` : table.name}
                </option>
              );
            })}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {loading ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                Loading menu and seating...
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
                No active menu items found for selected filters.
              </div>
            ) : (
              visibleItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="font-semibold text-gray-800">{item.itemName}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  <p className="text-sm text-[#ff5a1f] font-bold mt-2">
                    PKR {Number(item.basePrice ?? item.price).toLocaleString()}
                  </p>
                  {item.hasVariations && (
                    <p className="text-[11px] text-gray-500 mt-1">
                      Variations: {item.variations.map((v) => v.name).join(", ")}
                    </p>
                  )}
                  <button
                    onClick={() => handleAddClick(item)}
                    className="mt-3 w-full rounded-lg bg-[#ff5a1f] text-white text-sm font-semibold py-2 hover:bg-[#e04e18]"
                  >
                    Add to Order
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="lg:sticky lg:top-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">Current Order</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedHall?.name ? `Hall: ${selectedHall.name}` : "Hall: —"} |{" "}
                    {selectedTableId
                      ? `Table: ${tables.find((t) => t.tableId === selectedTableId)?.name ?? selectedTableId}`
                      : "Table: —"}
                  </p>
                </div>
                {sessionRole === "ORDER_TAKER" && (
                  <Link
                    href="/order-deals"
                    className="text-xs font-semibold text-[#ff5a1f] hover:underline shrink-0"
                  >
                    Deals
                  </Link>
                )}
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map((row) =>
                  row.kind === "deal" ? (
                    <div key={row.key} className="border border-amber-100 bg-amber-50/40 rounded-lg p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                        Deal
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{row.dealName}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{row.dealType}</p>
                      <ul className="mt-2 text-[11px] text-gray-600 space-y-0.5 border-t border-amber-100/80 pt-2">
                        {row.components.map((c) => (
                          <li key={`${row.key}-${c.dishId}-${c.name}`}>
                            {c.name} × {c.quantity}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-semibold text-[#ff5a1f]">
                          PKR {row.unitPrice.toLocaleString()} each
                        </p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustQty(row.key, -1)} className="p-1 rounded border">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">{row.qty}</span>
                          <button onClick={() => adjustQty(row.key, 1)} className="p-1 rounded border">
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeRow(row.key)}
                            className="p-1 rounded text-red-500 border border-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={row.key} className="border border-gray-100 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">{row.menuName}</p>
                      {row.variationName && (
                        <p className="text-xs text-gray-500 mt-0.5">Variation: {row.variationName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">PKR {row.unitPrice.toLocaleString()}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => adjustQty(row.key, -1)} className="p-1 rounded border">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center">{row.qty}</span>
                          <button onClick={() => adjustQty(row.key, 1)} className="p-1 rounded border">
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeRow(row.key)}
                            className="p-1 rounded text-red-500 border border-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes (optional)"
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                rows={2}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">PKR {subtotal.toLocaleString()}</span>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              {success && <p className="text-xs text-green-600">{success}</p>}
              <button
                onClick={placeOrder}
                disabled={
                  saving ||
                  !cart.some((r) => r.kind === "menu" || r.kind === "deal")
                }
                className="w-full rounded-lg bg-[#ff5a1f] text-white py-2.5 text-sm font-semibold hover:bg-[#e04e18] disabled:opacity-50"
              >
                {saving ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {variationPickerFor && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVariationPickerFor(null)} />
          <div className="relative bg-white rounded-xl border border-gray-100 shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Select Variation</p>
              <p className="text-sm text-gray-500">{variationPickerFor.itemName}</p>
            </div>
            <div className="p-4 space-y-2">
              {variationPickerFor.variations.map((variation) => (
                <button
                  key={variation.id}
                  onClick={() => {
                    addMenuItem(variationPickerFor, variation.name, Number(variation.price));
                    setVariationPickerFor(null);
                  }}
                  className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 hover:bg-gray-50 text-sm"
                >
                  <span>{variation.name}</span>
                  <span className="font-semibold text-[#ff5a1f]">
                    PKR {Number(variation.price).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

