import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  ChefHat,
  Wallet,
  Layers,
  Tags,
  LayoutGrid,
  Building2,
  Users,
  Banknote,
  CalendarCheck2,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Container from "@/components/site/Container";
import Reveal from "@/components/site/Reveal";
import FinalCTA from "@/components/site/home/FinalCTA";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every tool a modern restaurant needs — order taking, live kitchen, cashier, menu, deals, halls, multi branch, expenses, day end and deep analytics.",
};

const groups = [
  {
    title: "Front of house",
    desc: "Everything your service team needs to take, cook, and complete orders without friction.",
    items: [
      {
        icon: ClipboardList,
        title: "Smart order taking",
        desc: "Blazing fast order entry with modifiers, deals, discounts and live totals.",
        points: ["Dine in, takeaway & delivery", "Table & hall picker", "Combo deals"],
      },
      {
        icon: ChefHat,
        title: "Live kitchen display",
        desc: "Tickets stream to the right kitchen station with status, timers and audio cues.",
        points: ["Status transitions", "Ticket timers", "Branch aware routing"],
      },
      {
        icon: Wallet,
        title: "Cashier & billing",
        desc: "Finalize bills, split payments and print receipts fast enough for peak hour.",
        points: ["Split bills", "Multiple tenders", "Tips & discounts"],
      },
      {
        icon: LayoutGrid,
        title: "Halls & tables",
        desc: "Design floor plans for each branch and manage occupancy at a glance.",
        points: ["Drag & drop layout", "Live occupancy", "Per branch halls"],
      },
    ],
  },
  {
    title: "Menu & catalog",
    desc: "A beautiful, centralised catalog that powers every screen in every branch.",
    items: [
      {
        icon: Layers,
        title: "Menu & categories",
        desc: "Organise items and categories centrally roll out to branches instantly.",
        points: ["Category groups", "Item variations", "Per branch overrides"],
      },
      {
        icon: Tags,
        title: "Deals management",
        desc: "Create combo deals and time based offers without writing a single line of code.",
        points: ["Combo builder", "Scheduled offers", "Auto apply rules"],
      },
    ],
  },
  {
    title: "Multi branch",
    desc: "Restenzo grows with you from your first branch to your hundredth.",
    items: [
      {
        icon: Building2,
        title: "Head office control",
        desc: "A command center that sees every branch menus, roles, deals, reports, everything.",
        points: ["Centralised config", "Per branch KPIs", "Cross branch analytics"],
      },
      {
        icon: Users,
        title: "Role based access",
        desc: "Scope users to branches and roles admins, order takers, cashiers, kitchen and more.",
        points: ["6+ built in roles", "Branch scoping", "Audit trail"],
      },
    ],
  },
  {
    title: "Finance & operations",
    desc: "Stay on top of the numbers with tools built by people who’ve run restaurants.",
    items: [
      {
        icon: Banknote,
        title: "Expenses",
        desc: "Capture expenses per branch with categories, notes and attachments.",
        points: ["Category tagging", "Per branch ledgers", "Exports"],
      },
      {
        icon: CalendarCheck2,
        title: "Day end",
        desc: "Close out every day with confidence cash, card, discounts, tips, all reconciled.",
        points: ["Auto summaries", "Shift handovers", "Printable closings"],
      },
      {
        icon: BarChart3,
        title: "Analytics & reports",
        desc: "See what’s working and what isn’t from top items to peak hours to branch comparisons.",
        points: ["Sales & items reports", "Hourly heatmaps", "CSV exports"],
      },
      {
        icon: ShieldCheck,
        title: "Security & compliance",
        desc: "Encrypted data, fine grained permissions and a full audit log enterprise grade by default.",
        points: ["Encrypted at rest", "Role based access", "Audit log"],
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-brand-soft -z-10" />
        <div className="absolute inset-0 grid-pattern -z-10 opacity-50" />
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff5a1f]/25 bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold tracking-wide">
                Features
              </span>
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.07]">
                Every tool your restaurant needs,{" "}
                <span className="text-gradient-brand">in one place.</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
                Restenzo is deliberately end to end front of house, kitchen,
                finance and insights all working as one system, not bolted-on
                integrations.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Groups */}
      {groups.map((group) => (
        <section
          key={group.title}
          className="py-20 lg:py-24 border-t border-gray-100 dark:border-white/5"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              <div className="lg:col-span-4 lg:sticky lg:top-28">
                <Reveal>
                  <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
                    {group.title}
                  </p>
                  <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {group.title}
                  </h2>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {group.desc}
                  </p>
                </Reveal>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.items.map((item, i) => (
                  <Reveal
                    key={item.title}
                    delay={(i % 2) * 80}
                    className="group rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-6 card-hover"
                  >
                    <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#ff5a1f]/10 text-[#ff5a1f] ring-1 ring-[#ff5a1f]/15 transition-all group-hover:bg-[#ff5a1f] group-hover:text-white">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.desc}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {item.points.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-[13px] text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#ff5a1f]" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ))}

      {/* CTA */}
      <section className="pb-6">
        <Container>
          <Reveal className="text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-brand text-white font-semibold shadow-[0_20px_40px_-15px_rgba(255,90,31,0.65)] hover:-translate-y-0.5 transition-transform"
            >
              See pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      <FinalCTA />
    </>
  );
}
