 "use client";

 import React, {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useState,
 } from "react";

 type Theme = "light" | "dark";

 interface ThemeContextValue {
   theme: Theme;
   toggleTheme: () => void;
 }

 const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

 const STORAGE_KEY = "theme";

 function applyTheme(theme: Theme) {
   if (typeof document === "undefined") return;
   const root = document.documentElement;
   root.classList.toggle("theme-dark", theme === "dark");
   root.setAttribute("data-theme", theme);
 }

 export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
   children,
 }) => {
   const [theme, setTheme] = useState<Theme>("light");
   const [mounted, setMounted] = useState(false);

   // Initialize from localStorage or system preference
   useEffect(() => {
     let initial: Theme = "light";
     if (typeof window !== "undefined") {
       const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
       if (stored === "light" || stored === "dark") {
         initial = stored;
       } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
         initial = "dark";
       }
       window.localStorage.setItem(STORAGE_KEY, initial);
     }
     setTheme(initial);
     applyTheme(initial);
     setMounted(true);
   }, []);

   useEffect(() => {
     if (!mounted) return;
     applyTheme(theme);
     if (typeof window !== "undefined") {
       window.localStorage.setItem(STORAGE_KEY, theme);
     }
   }, [theme, mounted]);

   const toggleTheme = useCallback(() => {
     setTheme((prev) => (prev === "dark" ? "light" : "dark"));
   }, []);

   const value: ThemeContextValue = {
     theme,
     toggleTheme,
   };

   return (
     <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
   );
 };

 export function useTheme() {
   const ctx = useContext(ThemeContext);
   if (!ctx) {
     throw new Error("useTheme must be used within ThemeProvider");
   }
   return ctx;
 }

