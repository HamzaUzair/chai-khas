"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BadgePercent,
  UtensilsCrossed,
  Tag,
  ChefHat,
  Printer,
  ClipboardList,
  Receipt,
  BarChart3,
  PieChart,
  Wallet,
  CalendarCheck,
  Grid3X3,
  Users,
  UserCog,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import { getAuthSession } from "@/lib/auth-client";

interface SidebarItem {
  label: string;
  icon: React.ReactNode;
  href?: string; // only items with href will navigate
}

const allMenuItems: SidebarItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
  { label: "Branches", icon: <Building2 size={20} />, href: "/branches" },
  { label: "Categories", icon: <Tag size={20} />, href: "/categories" },
  { label: "Menu", icon: <UtensilsCrossed size={20} />, href: "/menu" },
  { label: "Deals", icon: <BadgePercent size={20} />, href: "/deals" },
  { label: "Kitchen", icon: <ChefHat size={20} />, href: "/kitchen" },
  { label: "Printers", icon: <Printer size={20} />, href: "/printers" },
  { label: "Orders", icon: <ClipboardList size={20} />, href: "/orders" },
  { label: "New Order / POS", icon: <ClipboardList size={20} />, href: "/create-order" },
  { label: "Sales List", icon: <Receipt size={20} />, href: "/sales-list" },
  { label: "Sales Report", icon: <BarChart3 size={20} />, href: "/sales-report" },
  { label: "Menu Sales", icon: <PieChart size={20} />, href: "/menu-sales" },
  { label: "Expenses", icon: <Wallet size={20} />, href: "/expenses" },
  { label: "Day End", icon: <CalendarCheck size={20} />, href: "/dayend" },
  { label: "Halls", icon: <Grid3X3 size={20} />, href: "/halls" },
  { label: "Roles", icon: <ShieldCheck size={20} />, href: "/roles" },
  { label: "Customers", icon: <Users size={20} /> },
  { label: "Users", icon: <UserCog size={20} />, href: "/users" },
  { label: "Advanced Analytics", icon: <TrendingUp size={20} />, href: "/analytics" },
];

const branchAdminAllowedLabels = new Set([
  "Dashboard",
  "Categories",
  "Menu",
  "Deals",
  "Kitchen",
  "Orders",
  "Sales List",
  "Sales Report",
  "Menu Sales",
  "Expenses",
  "Day End",
  "Halls",
  "Roles",
  "Advanced Analytics",
]);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const session = getAuthSession();
  const isBranchAdmin = session?.role === "BRANCH_ADMIN";
  const isOrderTaker = session?.role === "ORDER_TAKER";
  const isStaffRole =
    isOrderTaker || session?.role === "CASHIER" || session?.role === "ACCOUNTANT";

  const menuItems = isOrderTaker
    ? allMenuItems.filter((item) =>
        ["Dashboard", "New Order / POS", "Orders"].includes(item.label)
      )
    : isStaffRole
    ? allMenuItems.filter((item) => item.label === "Dashboard")
    : isBranchAdmin
    ? allMenuItems.filter((item) => branchAdminAllowedLabels.has(item.label))
    : allMenuItems;

  const baseClasses =
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer";
  const activeClasses = "bg-[#ff5a1f] text-white shadow-sm";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

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
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ff5a1f] flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-[#ff5a1f] tracking-wide">
              {isBranchAdmin ? "Branch Admin" : isStaffRole ? "Staff Panel" : "Super Admin"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Menu ── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.href ? pathname === item.href : false;
            const classes = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={classes}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }

            return (
              <button key={item.label} className={classes}>
                {item.icon}
                {item.label}
              </button>
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
