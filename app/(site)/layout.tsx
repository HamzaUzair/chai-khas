import React from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import SiteBodyClass from "@/components/site/SiteBodyClass";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-scope min-h-screen flex flex-col bg-white dark:bg-[#05070d] text-gray-900 dark:text-gray-100">
      <SiteBodyClass />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
