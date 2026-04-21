import React from "react";
import {
  ChefHat,
  Receipt,
  Layers,
  Users,
  Tags,
  LayoutGrid,
  BarChart3,
  Wallet,
  Building2,
  ShieldCheck,
  ClipboardList,
  CalendarCheck2,
} from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const features = [
  {
    icon: Receipt,
    title: "Smart Order Taking",
    desc: "Fast, keyboard friendly order entry with deals, modifiers and live totals.",
  },
  {
    icon: ChefHat,
    title: "Live Kitchen Display",
    desc: "Real time tickets for the kitchen with status, timers and branch routing.",
  },
  {
    icon: Wallet,
    title: "Cashier & Billing",
    desc: "Split bills, discounts, multiple payment types and instant receipts.",
  },
  {
    icon: Layers,
    title: "Menu & Categories",
    desc: "Organise menu items, categories and images reusable across branches.",
  },
  {
    icon: Tags,
    title: "Deals Management",
    desc: "Build combo deals, promotions and time bound offers in minutes.",
  },
  {
    icon: LayoutGrid,
    title: "Halls & Tables",
    desc: "Design floor plans, manage halls, tables and live occupancy in one view.",
  },
  {
    icon: Building2,
    title: "Multi Branch Control",
    desc: "A head office that sees every branch menus, roles, reports, everything.",
  },
  {
    icon: Users,
    title: "Role Based Access",
    desc: "Owners, admins, order takers, cashiers, kitchen, accountant scoped by role.",
  },
  {
    icon: ClipboardList,
    title: "Expenses Tracking",
    desc: "Log expenses per branch with categories, attachments and approvals.",
  },
  {
    icon: CalendarCheck2,
    title: "Day End Closing",
    desc: "Clean daily closings with cash, card totals and auto generated summaries.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    desc: "Sales, top items, hourly peaks, comparisons export as CSV anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "Encrypted data, audit trails and fine grained permissions by default.",
  },
];

const FeatureGrid: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 relative">
      <Container>
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            Everything you need
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            One platform.{" "}
            <span className="text-gradient-brand">Every operation.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Restenzo replaces your patchwork of tools with a single, elegant
            system built specifically for modern restaurants.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i % 3) * 100}
              className="group relative rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 card-hover"
            >
              <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#ff5a1f]/10 text-[#ff5a1f] ring-1 ring-[#ff5a1f]/15 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#ff5a1f] group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {f.desc}
              </p>
              <div className="absolute inset-x-5 -bottom-px h-px bg-gradient-to-r from-transparent via-[#ff5a1f]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeatureGrid;
