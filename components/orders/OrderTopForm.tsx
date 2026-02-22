"use client";

import React from "react";

export type OrderType = "Dine In" | "Take Away" | "Delivery";

interface Hall {
  id: string;
  name: string;
}

interface TableItem {
  id: string;
  label: string;
}

interface OrderTopFormProps {
  orderType: OrderType;
  onOrderTypeChange: (v: OrderType) => void;
  halls: Hall[];
  selectedHall: string;
  onHallChange: (v: string) => void;
  tables: TableItem[];
  selectedTable: string;
  onTableChange: (v: string) => void;
}

const selectBase =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff5a1f]/30 focus:border-[#ff5a1f] transition-all";

const OrderTopForm: React.FC<OrderTopFormProps> = ({
  orderType,
  onOrderTypeChange,
  halls,
  selectedHall,
  onHallChange,
  tables,
  selectedTable,
  onTableChange,
}) => {
  const isDineIn = orderType === "Dine In";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Order Type <span className="text-red-500">*</span>
          </label>
          <select
            className={selectBase}
            value={orderType}
            onChange={(e) => onOrderTypeChange(e.target.value as OrderType)}
          >
            <option value="Dine In">Dine In</option>
            <option value="Take Away">Take Away</option>
            <option value="Delivery">Delivery</option>
          </select>
        </div>

        {/* Hall */}
        {isDineIn ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Hall <span className="text-red-500">*</span>
            </label>
            <select
              className={selectBase}
              value={selectedHall}
              onChange={(e) => onHallChange(e.target.value)}
            >
              <option value="">-- Select Hall --</option>
              {halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-end">
            <p className="text-xs text-gray-400 italic pb-1">
              Hall not required for {orderType}
            </p>
          </div>
        )}

        {/* Table */}
        {isDineIn ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Table <span className="text-red-500">*</span>
            </label>
            <select
              className={selectBase}
              value={selectedTable}
              onChange={(e) => onTableChange(e.target.value)}
              disabled={!selectedHall}
            >
              <option value="">
                {selectedHall ? "-- Select Table --" : "Select a hall first"}
              </option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-end">
            <p className="text-xs text-gray-400 italic pb-1">
              Table not required for {orderType}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTopForm;
