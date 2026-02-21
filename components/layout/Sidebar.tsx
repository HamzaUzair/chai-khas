"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  Layers3,
  UtensilsCrossed,
  ChefHat,
  Printer,
  ClipboardList,
  Receipt,
  BarChart3,
  PieChart,
  Wallet,
  CalendarCheck,
  DoorOpen,
  Grid3X3,
  Users,
  UserCog,
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const menuItems: SidebarItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, active: true },
  { label: "Branches", icon: <Building2 size={20} /> },
  { label: "Create Order", icon: <ShoppingCart size={20} /> },
  { label: "Categories", icon: <Layers3 size={20} /> },
  { label: "Menu", icon: <UtensilsCrossed size={20} /> },
  { label: "Kitchen", icon: <ChefHat size={20} /> },
  { label: "Printers", icon: <Printer size={20} /> },
  { label: "Orders", icon: <ClipboardList size={20} /> },
  { label: "Sales List", icon: <Receipt size={20} /> },
  { label: "Sales Report", icon: <BarChart3 size={20} /> },
  { label: "Menu Sales", icon: <PieChart size={20} /> },
  { label: "Expenses", icon: <Wallet size={20} /> },
  { label: "Day End", icon: <CalendarCheck size={20} /> },
  { label: "Halls", icon: <DoorOpen size={20} /> },
  { label: "Tables", icon: <Grid3X3 size={20} /> },
  { label: "Customers", icon: <Users size={20} /> },
  { label: "Users", icon: <UserCog size={20} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ── Brand ── */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#ff5a1f] flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-wide">
            Super Admin
          </span>
        </div>

        {/* ── Menu ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                item.active
                  ? "bg-[#ff5a1f] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          <p className="text-[11px] text-gray-400 text-center">
            © 2024 Chai Khas POS
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
