export type BillingCycle = "monthly" | "yearly";

export interface Plan {
  id: "single" | "multi" | "enterprise";
  name: string;
  tagline: string;
  /** USD per month when billed monthly */
  monthly: number;
  /** USD per month when billed annually (price shown on card) */
  yearly: number;
  currency: "USD";
  cta: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
  /** Feature-set comparison keys for future Stripe wiring. */
  stripeIds?: {
    monthly?: string;
    yearly?: string;
  };
}

export const PLANS: Plan[] = [
  {
    id: "single",
    name: "Single Branch",
    tagline: "For a single restaurant location.",
    monthly: 49,
    yearly: 39,
    currency: "USD",
    cta: "Start free trial",
    features: [
      "1 branch · unlimited staff",
      "Full POS, kitchen and cashier",
      "Menu, categories and deals",
      "Halls, tables and floor plans",
      "Expenses and day end",
      "Sales reports & CSV export",
      "Email support",
    ],
  },
  {
    id: "multi",
    name: "Multi Branch",
    tagline: "For restaurant chains with a head office.",
    monthly: 149,
    yearly: 119,
    currency: "USD",
    cta: "Start free trial",
    highlighted: true,
    badge: "Most popular",
    features: [
      "Up to 10 branches included",
      "Head office dashboard & controls",
      "Centralised menu, deals & roles",
      "Per branch KPIs & reports",
      "Cross branch analytics",
      "Expenses, day end & accounting",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom built for large restaurant groups.",
    monthly: 0,
    yearly: 0,
    currency: "USD",
    cta: "Talk to sales",
    features: [
      "Unlimited branches",
      "Dedicated success manager",
      "SSO / custom integrations",
      "Custom SLAs & uptime guarantees",
      "On prem / VPC deployment options",
      "Custom training & migration",
      "24/7 premium support",
    ],
  },
];

export const YEARLY_DISCOUNT_PERCENT = 20;
