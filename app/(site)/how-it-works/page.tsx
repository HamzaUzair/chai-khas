import type { Metadata } from "next";
import Link from "next/link";
import {
  UserPlus,
  Building,
  Settings,
  Rocket,
  ClipboardList,
  ChefHat,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/site/Container";
import Reveal from "@/components/site/Reveal";
import FinalCTA from "@/components/site/home/FinalCTA";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how Restenzo takes your restaurant from signup to live service in under a day.",
};

const onboardingSteps = [
  {
    icon: UserPlus,
    title: "1. Create your Restenzo account",
    desc: "Sign up in under a minute. Pick single branch or multi branch during signup and we’ll tailor the onboarding.",
  },
  {
    icon: Building,
    title: "2. Add your restaurant & branches",
    desc: "Set up your restaurant profile, add branches, create halls and tables, and invite your team.",
  },
  {
    icon: Settings,
    title: "3. Import your menu & deals",
    desc: "Build your menu and categories, create combo deals, and configure per branch overrides.",
  },
  {
    icon: Rocket,
    title: "4. Go live",
    desc: "Roles are scoped, screens are ready, kitchen is connected. Start taking orders it really is that quick.",
  },
];

const serviceSteps = [
  {
    icon: ClipboardList,
    title: "Order taken",
    desc: "Order Taker picks the hall, table and items. Deals and modifiers apply instantly.",
  },
  {
    icon: ChefHat,
    title: "Kitchen fires the ticket",
    desc: "Live Kitchen picks up the ticket in real time with timers and status transitions.",
  },
  {
    icon: Wallet,
    title: "Cashier closes the bill",
    desc: "Split bills, apply discounts, capture tips and print a clean receipt.",
  },
  {
    icon: TrendingUp,
    title: "Day end & analytics",
    desc: "Close the day with auto reconciled totals. Analytics update in real time.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-10 lg:pt-28">
        <div className="absolute inset-0 bg-gradient-brand-soft -z-10" />
        <div className="absolute inset-0 grid-pattern -z-10 opacity-50" />
        <Container>
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff5a1f]/25 bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold tracking-wide">
              How it works
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.07]">
              From signup to{" "}
              <span className="text-gradient-brand">live service.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
              Here’s exactly how Restenzo gets your restaurant up and running
              and how a service flows once you’re live.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Onboarding */}
      <section className="py-16 lg:py-20">
        <Container>
          <Reveal className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
              Onboarding
            </p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Live in under a day.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {onboardingSteps.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 100}
                className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 card-hover"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-brand text-white flex items-center justify-center shadow-[0_12px_30px_-10px_rgba(255,90,31,0.6)]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Service flow */}
      <section className="py-16 lg:py-20 border-t border-gray-100 dark:border-white/5 bg-gray-50/60 dark:bg-white/[0.02]">
        <Container>
          <Reveal className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
              A typical service
            </p>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Order. Cook. Bill. Analyse.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {serviceSteps.map((s, i) => (
              <Reveal
                key={s.title}
                delay={i * 100}
                className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6 card-hover"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff5a1f]/10 text-[#ff5a1f]">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <Reveal className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-brand text-white font-semibold shadow-[0_20px_40px_-15px_rgba(255,90,31,0.65)] hover:-translate-y-0.5 transition-transform"
            >
              Start your free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      <FinalCTA />
    </>
  );
}
