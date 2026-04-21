import type { Metadata } from "next";
import Container from "@/components/site/Container";
import Reveal from "@/components/site/Reveal";
import FAQAccordion from "@/components/site/FAQAccordion";
import FinalCTA from "@/components/site/home/FinalCTA";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to the most common questions about Restenzo — product, pricing, onboarding, security and more.",
};

const groups = [
  {
    title: "Product",
    items: [
      {
        q: "What exactly is Restenzo?",
        a: "Restenzo is an all in one restaurant management SaaS POS, live kitchen display, cashier, multi branch head office, expenses, day end and analytics, all in one product.",
      },
      {
        q: "Does it support both single branch and multi branch restaurants?",
        a: "Yes. Single branch owners use a streamlined setup. Multi branch chains get a head office dashboard to manage menus, deals, roles and reports across locations.",
      },
      {
        q: "Which roles are supported out of the box?",
        a: "Restaurant Admin, Branch Admin, Order Taker, Cashier, Live Kitchen, and Accountant. Each role has a workflow and permissions tuned for its job.",
      },
      {
        q: "Can I use Restenzo on a tablet?",
        a: "Yes Restenzo is fully responsive and works beautifully on tablets for order taking and kitchen displays, as well as desktops for admin work.",
      },
    ],
  },
  {
    title: "Pricing & billing",
    items: [
      {
        q: "Is there a free trial?",
        a: "Every plan includes a 14 day free trial with full access. No credit card is required to start.",
      },
      {
        q: "How does yearly billing save me money?",
        a: "Yearly billing saves you 20% compared to monthly billing. You can switch between monthly and yearly at any time.",
      },
      {
        q: "What happens if I exceed 10 branches on the Multi Branch plan?",
        a: "We’ll reach out to help you transition to the Enterprise plan, which supports unlimited branches and additional features.",
      },
    ],
  },
  {
    title: "Onboarding & migration",
    items: [
      {
        q: "How long does setup take?",
        a: "Most restaurants are live in under a day single branch setups are often complete in under an hour.",
      },
      {
        q: "Can you migrate my data?",
        a: "Absolutely. We provide guided migration from common POS systems and spreadsheets. Enterprise customers get white glove migration.",
      },
      {
        q: "Do you offer training?",
        a: "Yes every plan includes onboarding sessions, and Enterprise customers get customised training for every role.",
      },
    ],
  },
  {
    title: "Security & reliability",
    items: [
      {
        q: "Is my data secure?",
        a: "Restenzo uses encryption in transit and at rest, role based access and full audit logs. We take security and privacy very seriously.",
      },
      {
        q: "What’s your uptime?",
        a: "We target 99.99% uptime and publish incident reports transparently. Enterprise plans come with custom SLAs.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-20 pb-10 lg:pt-28">
        <div className="absolute inset-0 bg-gradient-brand-soft -z-10" />
        <div className="absolute inset-0 grid-pattern -z-10 opacity-50" />
        <Container>
          <Reveal className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff5a1f]/25 bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold tracking-wide">
              FAQ
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.07]">
              Frequently asked{" "}
              <span className="text-gradient-brand">questions.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about Restenzo. Still have questions?{" "}
              <a href="/contact" className="text-[#ff5a1f] font-semibold hover:underline">
                Get in touch
              </a>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 lg:py-20">
        <Container size="md">
          <div className="space-y-12">
            {groups.map((group) => (
              <Reveal key={group.title}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {group.title}
                </h2>
                <div className="mt-4">
                  <FAQAccordion items={group.items} />
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <FinalCTA />
    </>
  );
}
