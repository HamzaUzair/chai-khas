import React from "react";
import { Check, Minus } from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const rows: Array<{
  section: string;
  items: Array<{
    label: string;
    single: boolean | string;
    multi: boolean | string;
    enterprise: boolean | string;
  }>;
}> = [
  {
    section: "Core POS",
    items: [
      { label: "Order taking", single: true, multi: true, enterprise: true },
      { label: "Live kitchen display", single: true, multi: true, enterprise: true },
      { label: "Cashier & split bills", single: true, multi: true, enterprise: true },
      { label: "Halls & tables", single: true, multi: true, enterprise: true },
    ],
  },
  {
    section: "Menu & catalog",
    items: [
      { label: "Menu & categories", single: true, multi: true, enterprise: true },
      { label: "Combo deals & offers", single: true, multi: true, enterprise: true },
      {
        label: "Centralised menu across branches",
        single: false,
        multi: true,
        enterprise: true,
      },
    ],
  },
  {
    section: "Multi branch",
    items: [
      { label: "Branches included", single: "1", multi: "Up to 10", enterprise: "Unlimited" },
      { label: "Head office dashboard", single: false, multi: true, enterprise: true },
      { label: "Cross branch analytics", single: false, multi: true, enterprise: true },
      { label: "Custom integrations / SSO", single: false, multi: false, enterprise: true },
    ],
  },
  {
    section: "Support",
    items: [
      { label: "Email support", single: true, multi: true, enterprise: true },
      { label: "Priority support", single: false, multi: true, enterprise: true },
      { label: "Dedicated success manager", single: false, multi: false, enterprise: true },
      { label: "24/7 premium support", single: false, multi: false, enterprise: true },
    ],
  },
];

const Cell: React.FC<{ value: boolean | string }> = ({ value }) => {
  if (typeof value === "string") {
    return (
      <span className="text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    );
  }
  return value ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f]">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-400">
      <Minus className="h-3 w-3" />
    </span>
  );
};

const ComparisonTable: React.FC = () => {
  return (
    <section className="py-20 lg:py-24 border-t border-gray-100 dark:border-white/5">
      <Container>
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            Compare
          </p>
          <h2 className="mt-3 text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Find the plan that fits.
          </h2>
        </Reveal>

        <Reveal className="mt-12 overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-gray-50/80 dark:bg-white/[0.03]">
              <tr className="text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400">
                <th className="py-4 px-6">Feature</th>
                <th className="py-4 px-6 text-center">Single</th>
                <th className="py-4 px-6 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    Multi
                    <span className="px-1.5 py-0.5 rounded-md bg-[#ff5a1f]/15 text-[#ff5a1f] text-[10px] font-bold">
                      POPULAR
                    </span>
                  </span>
                </th>
                <th className="py-4 px-6 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <React.Fragment key={row.section}>
                  <tr className="border-t border-gray-100 dark:border-white/5 bg-gray-50/40 dark:bg-white/[0.02]">
                    <td
                      colSpan={4}
                      className="py-2.5 px-6 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#ff5a1f]"
                    >
                      {row.section}
                    </td>
                  </tr>
                  {row.items.map((item) => (
                    <tr
                      key={item.label}
                      className="border-t border-gray-100 dark:border-white/5"
                    >
                      <td className="py-3.5 px-6 text-sm text-gray-800 dark:text-gray-200">
                        {item.label}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <Cell value={item.single} />
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <Cell value={item.multi} />
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <Cell value={item.enterprise} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </Reveal>
      </Container>
    </section>
  );
};

export default ComparisonTable;
