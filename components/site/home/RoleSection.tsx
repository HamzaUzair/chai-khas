import React from "react";
import {
  Crown,
  Building2,
  ClipboardList,
  Wallet,
  ChefHat,
  Calculator,
} from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const roles = [
  {
    icon: Crown,
    name: "Restaurant Admin",
    desc: "The owner cockpit full control over branches, menus, roles and deep analytics.",
  },
  {
    icon: Building2,
    name: "Branch Admin",
    desc: "Manage a single branch: staff, menu overrides, seating, expenses and daily reports.",
  },
  {
    icon: ClipboardList,
    name: "Order Taker",
    desc: "A fast, focused screen for taking orders at the table or the counter without friction.",
  },
  {
    icon: Wallet,
    name: "Cashier",
    desc: "Dedicated billing view with split bills, discounts and instant receipts.",
  },
  {
    icon: ChefHat,
    name: "Live Kitchen",
    desc: "Real time ticket stream with statuses, timers and prep priority cues.",
  },
  {
    icon: Calculator,
    name: "Accountant",
    desc: "Expenses, day end, sales reports and exports everything the finance team needs.",
  },
];

const RoleSection: React.FC = () => {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
                Role based operations
              </p>
              <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                The right view for{" "}
                <span className="text-gradient-brand">every role.</span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Your team sees exactly what they need nothing more, nothing
                less. Permissions, workflows and UI adapt automatically to each
                role.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  Fine grained, scope based permissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  Optimised workflows per role
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ff5a1f]" />
                  Full audit trail of every action
                </li>
              </ul>
            </Reveal>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((r, i) => (
              <Reveal
                key={r.name}
                delay={(i % 2) * 80}
                className="group rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#ff5a1f]/10 text-[#ff5a1f] flex items-center justify-center ring-1 ring-[#ff5a1f]/15 transition-colors group-hover:bg-[#ff5a1f] group-hover:text-white">
                    <r.icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {r.name}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {r.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default RoleSection;
