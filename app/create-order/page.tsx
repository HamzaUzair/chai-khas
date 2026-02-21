"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCart } from "lucide-react";

export default function CreateOrderPage() {
  const authorized = useAuth();

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#ff5a1f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <DashboardLayout title="Create Order">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create New Order</h2>
        <p className="text-sm text-gray-500 mt-1">Select items and create a new customer order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Menu Items</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingCart size={36} className="text-gray-300 mb-3" />
            <span className="text-sm font-medium">No menu items available</span>
            <span className="text-xs text-gray-300 mt-1">Add menu items to start creating orders</span>
          </div>
        </div>

        {/* Cart Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Order Cart</h3>
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-sm">Cart is empty</span>
          </div>
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex justify-between text-sm font-semibold text-gray-800 mb-4">
              <span>Total</span>
              <span>PKR 0.00</span>
            </div>
            <button className="w-full bg-[#ff5a1f] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#e04e18] transition-colors cursor-pointer disabled:opacity-50" disabled>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
