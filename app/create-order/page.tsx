"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderTopForm, {
  type OrderType,
} from "@/components/orders/OrderTopForm";
import CategoryGrid from "@/components/orders/CategoryGrid";
import ItemsPanel, { type MockItem } from "@/components/orders/ItemsPanel";
import CartPanel, { type CartItem } from "@/components/orders/CartPanel";

/* ── Mock hall & table data ── */
const mockHalls = [
  { id: "hall-a", name: "Hall A" },
  { id: "hall-b", name: "Hall B" },
  { id: "hall-c", name: "Hall C" },
];

const mockTablesByHall: Record<string, { id: string; label: string }[]> = {
  "hall-a": [
    { id: "a1", label: "A-1" },
    { id: "a2", label: "A-2" },
    { id: "a3", label: "A-3" },
    { id: "a4", label: "A-4" },
  ],
  "hall-b": [
    { id: "b1", label: "B-1" },
    { id: "b2", label: "B-2" },
    { id: "b3", label: "B-3" },
  ],
  "hall-c": [
    { id: "c1", label: "C-1" },
    { id: "c2", label: "C-2" },
  ],
};

export default function CreateOrderPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  // ── Top form state ──
  const [orderType, setOrderType] = useState<OrderType>("Dine In");
  const [selectedHall, setSelectedHall] = useState("");
  const [selectedTable, setSelectedTable] = useState("");

  // ── Category & cart state ──
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Auth guard ──
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Clear hall/table when switching away from Dine In
  const handleOrderTypeChange = useCallback((type: OrderType) => {
    setOrderType(type);
    if (type !== "Dine In") {
      setSelectedHall("");
      setSelectedTable("");
    }
  }, []);

  const handleHallChange = useCallback((id: string) => {
    setSelectedHall(id);
    setSelectedTable("");
  }, []);

  // ── Cart helpers ──
  const addToCart = useCallback((item: MockItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }, []);

  const increaseQty = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
    );
  }, []);

  const decreaseQty = useCallback((id: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const tables = selectedHall ? mockTablesByHall[selectedHall] ?? [] : [];

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Create Order">
      {/* ── Page heading ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Order</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select hall, table, and dishes to create a new order
        </p>
      </div>

      {/* ── Top form (order type / hall / table) ── */}
      <OrderTopForm
        orderType={orderType}
        onOrderTypeChange={handleOrderTypeChange}
        halls={mockHalls}
        selectedHall={selectedHall}
        onHallChange={handleHallChange}
        tables={tables}
        selectedTable={selectedTable}
        onTableChange={setSelectedTable}
      />

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT — categories + items */}
        <div className="flex-1 min-w-0">
          {/* Category selector */}
          <div className="mb-2">
            <h3 className="text-base font-semibold text-gray-800">
              Select Category
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 mb-3">
              Browse food categories to add items to the order
            </p>
            <CategoryGrid
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>

          {/* Items panel */}
          <ItemsPanel
            selectedCategory={selectedCategory}
            onAddItem={addToCart}
          />
        </div>

        {/* RIGHT — cart */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="lg:sticky lg:top-20">
            <CartPanel
              items={cart}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onRemove={removeFromCart}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
