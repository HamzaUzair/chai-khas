"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Moon, Sun } from "lucide-react";
import Logo from "./Logo";
import Container from "./Container";
import { useTheme } from "@/components/theme/ThemeProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`site-scope sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-white/80 dark:bg-[#05070d]/80 border-b border-gray-200/70 dark:border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-[#ff5a1f]"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-brand" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-[#ff5a1f] hover:border-[#ff5a1f]/40 transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-brand text-white shadow-[0_8px_24px_-8px_rgba(255,90,31,0.55)] hover:shadow-[0_14px_40px_-10px_rgba(255,90,31,0.65)] hover:-translate-y-px transition-all duration-300"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          mobileOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <Container>
          <div className="pb-6 pt-2 flex flex-col gap-1 border-t border-gray-200/80 dark:border-white/10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-[#ff5a1f]/10 text-[#ff5a1f]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2 mt-3">
              <Link
                href="/login"
                className="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-brand text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Navbar;
