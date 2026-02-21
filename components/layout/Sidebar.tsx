"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Package,
  TrendingUp,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Branches", href: "/branches", icon: <Building2 size={20} /> },
  { label: "Create Order", href: "/create-order", icon: <ShoppingCart size={20} /> },
  { label: "Categories", href: "/categories", icon: <Layers3 size={20} /> },
  { label: "Menu", href: "/menu", icon: <UtensilsCrossed size={20} /> },
  { label: "Kitchen", href: "/kitchen", icon: <ChefHat size={20} /> },
  { label: "Printers", href: "/printers", icon: <Printer size={20} /> },
  { label: "Orders", href: "/orders", icon: <ClipboardList size={20} /> },
  { label: "Inventory", href: "/inventory", icon: <Package size={20} /> },
  { label: "Sales List", href: "/sales-list", icon: <Receipt size={20} /> },
  { label: "Sales Report", href: "/sales-report", icon: <BarChart3 size={20} /> },
  { label: "Menu Sales", href: "/menu-sales", icon: <PieChart size={20} /> },
  { label: "Advanced Analytics", href: "/advanced-analytics", icon: <TrendingUp size={20} /> },
  { label: "Expenses", href: "/expenses", icon: <Wallet size={20} /> },
  { label: "Day End", href: "/day-end", icon: <CalendarCheck size={20} /> },
  { label: "Halls", href: "/halls", icon: <DoorOpen size={20} /> },
  { label: "Tables", href: "/tables", icon: <Grid3X3 size={20} /> },
  { label: "Customers", href: "/customers", icon: <Users size={20} /> },
  { label: "Users", href: "/users", icon: <UserCog size={20} /> },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

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
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#ff5a1f] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
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
