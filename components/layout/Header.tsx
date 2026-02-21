"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, User } from "lucide-react";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuToggle }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ff5a1f]/10 flex items-center justify-center">
            <User size={18} className="text-[#ff5a1f]" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            Super Admin
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
