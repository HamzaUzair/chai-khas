 "use client";

 import React from "react";
 import { Moon, Sun } from "lucide-react";
 import { useTheme } from "./ThemeProvider";

 const ThemeToggle: React.FC = () => {
   const { theme, toggleTheme } = useTheme();
   const isDark = theme === "dark";

   return (
     <button
       type="button"
       onClick={toggleTheme}
       aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
       className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-500 hover:text-[#ff5a1f] hover:border-[#ff5a1f]/40 bg-white/80 shadow-sm transition-colors cursor-pointer"
     >
       {isDark ? (
         <Sun size={18} className="text-yellow-300" />
       ) : (
         <Moon size={18} className="text-gray-500" />
       )}
     </button>
   );
 };

 export default ThemeToggle;

