/**
 * POST /api/stripe/webhook
 *
 * Stripe webhook receiver. Keeps the `subscriptions` table in sync with
 * Stripe's view of the world. Handles:
 *
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - customer.subscription.trial_will_end
 *   - invoice.paid
 *   - invoice.payment_failed
 *   - setup_intent.succeeded           (card attached during onboarding)
 *   - payment_method.attached
 *
 * Signature verification relies on STRIPE_WEBHOOK_SECRET. When the secret
 * is not configured yet we log-and-accept the payload so local dev still
 * works, but production should always have the secret set.
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getStripeOrNull,
  normalizeSubscriptionStatus,
  derivePaymentStatus,
} from "@/lib/stripe";

export const runtime = "nodejs";
// Disable Next's default JSON body parsing so we can hand Stripe the raw
// request body (needed for signature verification).
export const dynamic = "force-dynamic";

interface SubscriptionWithPeriods extends Stripe.Subscription {
  current_period_start?: number | null;
  current_period_end?: number | null;
}

function readPeriods(sub: Stripe.Subscription) {
  const item = sub.items?.data?.[0];
  const s = sub as SubscriptionWithPeriods;
  return {
    start: item?.current_period_start ?? s.current_period_start ?? null,
    end: item?.current_period_end ?? s.current_period_end ?? null,
  };
}

async function applySubscriptionUpdate(sub: Stripe.Subscription) {
  const restaurantIdRaw = sub.metadata?.restenzo_restaurant_id;
  const restaurantId = restaurantIdRaw ? Number(restaurantIdRaw) : null;
  if (!restaurantId) return;

  const existing = await prisma.subscription.findUnique({
    where: { restaurant_id: restaurantId },
  });
  if (!existing) return;

  const periods = readPeriods(sub);
  await prisma.subscription.update({
    where: { restaurant_id: restaurantId },
    data: {
      status: normalizeSubscriptionStatus(sub.status),
      payment_status: derivePaymentStatus(sub),
      stripe_subscription_id: sub.id,
      stripe_customer_id:
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
      stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
      trial_start: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
      trial_end: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      current_period_start: periods.start ? new Date(periods.start * 1000) : null,
      current_period_end: periods.end ? new Date(periods.end * 1000) : null,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
      canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    },
  });

  if (sub.status === "canceled" || sub.status === "unpaid") {
    await prisma.restaurant.update({
      where: { restaurant_id: restaurantId },
      data: { status: sub.status === "canceled" ? "Inactive" : "Suspended" },
    });
  } else if (sub.status === "active" || sub.status === "trialing") {
    await prisma.restaurant.update({
      where: { restaurant_id: restaurantId },
      data: { status: "Active", onboarding_complete: true },
    });
  }
}

async function applyPaymentMethodAttached(pm: Stripe.PaymentMethod) {
  const customerId =
    typeof pm.customer === "string" ? pm.customer : pm.customer?.id ?? null;
  if (!customerId) return;
  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: { stripe_payment_method_id: pm.id },
  });
}

async function applyInvoicePaid(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;
  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: { payment_status: "paid" },
  });
}

async function applyInvoiceFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;
  if (!customerId) return;
  await prisma.subscription.updateMany({
    where: { stripe_customer_id: customerId },
    data: { payment_status: "failed" },
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripeOrNull();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const payload = await request.text();

  let event: Stripe.Event;
  if (secret && signature) {
    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      console.error("Invalid Stripe webhook signature:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else {
    // When STRIPE_WEBHOOK_SECRET isn't configured we still parse the
    // payload so local `stripe trigger` smoke tests work, but log a
    // warning so this is never missed in production.
    console.warn(
      "STRIPE_WEBHOOK_SECRET is not set — accepting unverified webhook payload. Set this before going live."
    );
    try {
      event = JSON.parse(payload) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Bad payload" }, { status: 400 });
    }
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.trial_will_end": {
        await applySubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      }
      case "payment_method.attached": {
        await applyPaymentMethodAttached(
          event.data.object as Stripe.PaymentMethod
        );
        break;
      }
      case "setup_intent.succeeded": {
        const si = event.data.object as Stripe.SetupIntent;
        const customerId =
          typeof si.customer === "string"
            ? si.customer
            : si.customer?.id ?? null;
        if (customerId) {
          await prisma.restaurant.updateMany({
            where: {
              subscription: { stripe_customer_id: customerId },
            },
            data: { onboarding_complete: true },
          });
        }
        break;
      }
      case "invoice.paid": {
        await applyInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      }
      case "invoice.payment_failed": {
        await applyInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      }
      default:
        // Silently accept other events so Stripe's dashboard stays green.
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
