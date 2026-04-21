/**
 * Stripe server-side helpers.
 *
 * All Stripe API access for the Restenzo SaaS platform flows through
 * this module. It intentionally keeps concerns narrow:
 *
 *   - lazily builds the Stripe client using STRIPE_SECRET_KEY
 *   - exposes a `stripeEnabled()` check so the rest of the app can
 *     degrade gracefully when keys are missing
 *   - owns product / price provisioning (Products & Prices are created
 *     on-demand from `lib/pricing.ts` and cached in Stripe metadata)
 *   - centralizes Customer + Subscription creation for the 14-day trial
 *
 * All Stripe keys are read from env vars — NEVER hardcoded in components:
 *   STRIPE_SECRET_KEY                  (server)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (browser)
 *   STRIPE_WEBHOOK_SECRET              (webhook signature verification)
 */
import Stripe from "stripe";
import { PLANS, type Plan, type BillingCycle } from "@/lib/pricing";

const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
/**
 * Optional Stripe API version override. The SDK infers the version from its
 * own bundled types when this is left unset, which is what we want in
 * production so upgrades stay in lock-step with the SDK.
 */
const API_VERSION = process.env.STRIPE_API_VERSION ?? undefined;

export const TRIAL_DAYS = 14;

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment."
    );
  }
  if (!_stripe) {
    // Cast is intentional: the Stripe SDK uses a very strict union of
    // version strings that changes every release. We pass the env value
    // through verbatim so deployments can pin a specific version at any
    // time without needing a code change.
    const config: Record<string, unknown> = {
      appInfo: {
        name: "Restenzo SaaS",
        version: "0.1.0",
      },
    };
    if (API_VERSION) config.apiVersion = API_VERSION;
    _stripe = new Stripe(SECRET_KEY, config as ConstructorParameters<typeof Stripe>[1]);
  }
  return _stripe;
}

export function stripeEnabled(): boolean {
  return Boolean(SECRET_KEY);
}

/**
 * Shape used by every signup / provisioning call — resolves a plan id +
 * billing cycle to the matching Stripe price. The first time a given
 * plan+cycle is used, the Product and Price are created in Stripe with
 * deterministic metadata so subsequent calls always find the same ones.
 */
export async function ensureStripePriceForPlan(
  planId: Plan["id"],
  cycle: BillingCycle
): Promise<{ plan: Plan; priceId: string; amount: number }> {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan id: ${planId}`);
  if (plan.id === "enterprise") {
    throw new Error("Enterprise plan is contact-sales only");
  }

  const stripe = getStripe();
  const interval: Stripe.Price.Recurring.Interval =
    cycle === "yearly" ? "year" : "month";

  // We express the price as cents; for yearly we bill the whole year up-front,
  // using (yearly per-month price × 12). For monthly we bill `monthly`.
  const unitAmount =
    cycle === "yearly" ? plan.yearly * 12 * 100 : plan.monthly * 100;

  // Look up existing Product by deterministic metadata.key.
  const existingProducts = await stripe.products.search({
    query: `metadata['restenzo_plan']:'${plan.id}'`,
    limit: 1,
  });
  let product = existingProducts.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: `Restenzo · ${plan.name}`,
      description: plan.tagline,
      metadata: {
        restenzo_plan: plan.id,
      },
    });
  }

  const priceKey = `${plan.id}_${cycle}`;
  const existingPrices = await stripe.prices.search({
    query: `metadata['restenzo_price_key']:'${priceKey}'`,
    limit: 1,
  });
  let price = existingPrices.data[0];
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: unitAmount,
      recurring: { interval },
      metadata: {
        restenzo_plan: plan.id,
        restenzo_cycle: cycle,
        restenzo_price_key: priceKey,
      },
    });
  } else if (price.unit_amount !== unitAmount) {
    // If the unit amount has changed (e.g. pricing was updated in
    // `lib/pricing.ts`), create a new price rather than mutating the old
    // one — Stripe prices are immutable once created.
    price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: unitAmount,
      recurring: { interval },
      metadata: {
        restenzo_plan: plan.id,
        restenzo_cycle: cycle,
        restenzo_price_key: priceKey,
        superseded_price_id: price.id,
      },
    });
  }

  return { plan, priceId: price.id, amount: unitAmount };
}

/**
 * Creates (or reuses) a Stripe Customer for a tenant. Idempotent on
 * `metadata.restenzo_restaurant_id`, so subsequent lookups always return
 * the same Customer even if the request retries.
 */
export async function ensureStripeCustomer(params: {
  email: string;
  fullName: string;
  restaurantId: number;
  restaurantName: string;
  planId: string;
}): Promise<Stripe.Customer> {
  const stripe = getStripe();
  const existing = await stripe.customers.search({
    query: `metadata['restenzo_restaurant_id']:'${params.restaurantId}'`,
    limit: 1,
  });
  if (existing.data[0]) return existing.data[0];

  return stripe.customers.create({
    email: params.email,
    name: params.fullName,
    description: `${params.restaurantName} (Restenzo tenant)`,
    metadata: {
      restenzo_restaurant_id: String(params.restaurantId),
      restenzo_restaurant_name: params.restaurantName,
      restenzo_plan: params.planId,
    },
  });
}

/**
 * Creates a Stripe Subscription in trialing state with card-collection
 * deferred via `payment_behavior: 'default_incomplete'`. The returned
 * subscription has `pending_setup_intent` populated so the client can
 * confirm a SetupIntent (save card for future use) without charging
 * today. After the 14-day trial, Stripe automatically attempts the first
 * invoice using the saved default payment method.
 */
export async function createTrialSubscription(params: {
  customerId: string;
  priceId: string;
  restaurantId: number;
  planId: string;
  billingCycle: BillingCycle;
}): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    trial_period_days: TRIAL_DAYS,
    // Defer payment collection: don't attempt the first invoice, surface
    // a SetupIntent instead so we can confirm the card before trial ends.
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
      payment_method_types: ["card"],
    },
    trial_settings: {
      end_behavior: {
        // If the customer never attaches a payment method, pause the
        // subscription at the end of the trial instead of canceling so
        // the tenant can add a card later.
        missing_payment_method: "pause",
      },
    },
    expand: ["pending_setup_intent", "latest_invoice.payment_intent"],
    metadata: {
      restenzo_restaurant_id: String(params.restaurantId),
      restenzo_plan: params.planId,
      restenzo_cycle: params.billingCycle,
    },
  });
}

/** Helper: read the setup intent client secret from a trialing subscription. */
export function clientSecretFromSubscription(
  sub: Stripe.Subscription
): string | null {
  const setupIntent = sub.pending_setup_intent;
  if (setupIntent && typeof setupIntent !== "string") {
    return setupIntent.client_secret ?? null;
  }
  const invoice = sub.latest_invoice;
  if (invoice && typeof invoice !== "string") {
    const pi = (invoice as Stripe.Invoice & { payment_intent?: Stripe.PaymentIntent | string | null }).payment_intent;
    if (pi && typeof pi !== "string") {
      return pi.client_secret ?? null;
    }
  }
  return null;
}

/**
 * Maps a Stripe.Subscription.Status onto the Restenzo-side status we
 * persist in `subscriptions.status`. Keeps the DB enum narrow and
 * UI-friendly so the platform admin can render badges without string
 * gymnastics.
 */
export function normalizeSubscriptionStatus(
  status: Stripe.Subscription.Status
): string {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "paused":
      return "paused";
    default:
      return "inactive";
  }
}

/** Derives the public payment_status we surface in the admin panel. */
export function derivePaymentStatus(
  sub: Stripe.Subscription
): "pending" | "paid" | "failed" | "unpaid" | "n_a" {
  if (sub.status === "trialing") return "n_a";
  if (sub.status === "active") return "paid";
  if (sub.status === "past_due" || sub.status === "unpaid") return "failed";
  if (sub.status === "canceled") return "unpaid";
  if (sub.status === "incomplete" || sub.status === "incomplete_expired")
    return "pending";
  return "n_a";
}

/** Read-only Stripe instance accessor used by the webhook route. */
export function getStripeOrNull(): Stripe | null {
  if (!SECRET_KEY) return null;
  return getStripe();
}
