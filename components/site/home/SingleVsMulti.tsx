import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Store, Building2 } from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const plans = [
  {
    tag: "Single branch",
    icon: Store,
    title: "Perfect for your neighbourhood restaurant",
    desc: "One location, one team, one beautifully simple workflow. Get your staff running in minutes no setup complexity, no IT overhead.",
    points: [
      "Full POS, kitchen and reports",
      "Roles for every team member",
      "Halls, tables and floor plan",
      "Day end closings & expenses",
    ],
    cta: { href: "/pricing", label: "See single branch pricing" },
  },
  {
    tag: "Multi branch",
    icon: Building2,
    title: "Built for restaurant chains & head offices",
    desc: "Operate dozens of branches from a single head office dashboard. Centralise menus, roles, deals and reporting while giving each branch its autonomy.",
    points: [
      "Head office + branch admin hierarchy",
      "Centralised menu & deals",
      "Per branch sales & KPIs",
      "Cross branch analytics",
    ],
    cta: { href: "/pricing", label: "See multi branch pricing" },
    highlight: true,
  },
];

const SingleVsMulti: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-gray-50/60 dark:bg-white/[0.02] border-y border-gray-100 dark:border-white/5">
      <Container>
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            Built for every scale
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            From a single café to a{" "}
            <span className="text-gradient-brand">national chain.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Restenzo adapts to how your restaurant is structured without
            forcing you into rigid workflows.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((p, i) => (
            <Reveal
              key={p.tag}
              delay={i * 120}
              className={`relative rounded-3xl p-8 lg:p-10 border card-hover ${
                p.highlight
                  ? "border-[#ff5a1f]/30 bg-white dark:bg-[#0b1220] shadow-[0_30px_80px_-40px_rgba(255,90,31,0.5)]"
                  : "border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-brand text-white shadow-[0_10px_30px_-10px_rgba(255,90,31,0.6)]">
                  <p.icon className="h-5 w-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold tracking-wide">
                  {p.tag}
                </span>
              </div>

              <h3 className="mt-6 text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {p.title}
              </h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
                {p.desc}
              </p>

              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
                {p.points.map((pt) => (
                  <li
                    key={pt}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-[#ff5a1f] shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>

              <Link
                href={p.cta.href}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff5a1f] hover:gap-2.5 transition-all"
              >
                {p.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default SingleVsMulti;
