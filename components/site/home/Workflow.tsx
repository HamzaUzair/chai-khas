import React from "react";
import Container from "../Container";
import Reveal from "../Reveal";
import { ClipboardList, ChefHat, Wallet, TrendingUp } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Take orders",
    desc: "Order Takers capture orders at the table or counter with modifiers, deals and live totals.",
  },
  {
    step: "02",
    icon: ChefHat,
    title: "Cook in real time",
    desc: "Live Kitchen instantly receives new tickets, with status updates flowing back to the front.",
  },
  {
    step: "03",
    icon: Wallet,
    title: "Bill & close",
    desc: "Cashier finalises the bill split payments, discounts, tips and prints a crisp receipt.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "Analyse & grow",
    desc: "Day end, sales reports and analytics dashboards turn every service into actionable insight.",
  },
];

const Workflow: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-brand-soft -z-10 opacity-80" />
      <Container>
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            How it works
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            A service, start to finish{" "}
            <span className="text-gradient-brand">in four beats.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* connecting line (hidden on mobile) */}
          <div className="hidden lg:block absolute left-8 right-8 top-10 h-px bg-gradient-to-r from-transparent via-[#ff5a1f]/40 to-transparent" />
          {steps.map((s, i) => (
            <Reveal
              key={s.step}
              delay={i * 120}
              className="relative rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-2xl bg-gradient-brand text-white shadow-[0_12px_30px_-10px_rgba(255,90,31,0.6)] flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-3xl font-extrabold text-[#ff5a1f]/15 tracking-tight">
                  {s.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {s.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Workflow;
