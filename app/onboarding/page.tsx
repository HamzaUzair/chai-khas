"use client";

/**
 * /onboarding
 *
 * Second step of the self-serve signup flow. After `/signup` creates the
 * tenant and a trialing Stripe Subscription, the user lands here with a
 * client_secret from the SetupIntent in sessionStorage. We mount the
 * Stripe Payment Element, save the card as the default payment method
 * (without charging), and redirect to `/onboarding/success`.
 */
import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Shield } from "lucide-react";
import Logo from "@/components/site/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SiteBodyClass from "@/components/site/SiteBodyClass";
import StripeBodyClass from "@/components/onboarding/StripeBodyClass";
import StripeOnboardingForm, {
  type StripeOnboardingContext,
} from "@/components/onboarding/StripeOnboardingForm";
import { PLANS } from "@/lib/pricing";

const STORAGE_KEY = "restenzo_onboarding_ctx";

export interface StoredOnboardingContext {
  restaurantId: number;
  userId: number;
  email: string;
  planId: string;
  cycle: "monthly" | "yearly";
  trialEnd: string | null;
  clientSecret: string;
  publishableKey: string;
}

function loadStoredContext(): StoredOnboardingContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredOnboardingContext;
  } catch {
    return null;
  }
}

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [ctx, setCtx] = useState<StoredOnboardingContext | null>(null);
  const [missingReason, setMissingReason] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStoredContext();
    if (!stored) {
      setMissingReason(
        "We couldn't find your signup session. Please start again from the signup page."
      );
      return;
    }
    setCtx(stored);
  }, []);

  const stripeCtx: StripeOnboardingContext | null = useMemo(() => {
    if (!ctx) return null;
    if (!ctx.publishableKey) {
      return null;
    }
    const plan = PLANS.find((p) => p.id === ctx.planId);
    const returnUrl = `${window.location.origin}/onboarding/success?rid=${ctx.restaurantId}`;
    return {
      clientSecret: ctx.clientSecret,
      publishableKey: ctx.publishableKey,
      email: ctx.email,
      planName: plan?.name ?? "Restenzo plan",
      cycle: ctx.cycle,
      trialEnd: ctx.trialEnd,
      returnUrl,
    };
  }, [ctx]);

  if (missingReason) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {missingReason}
          </p>
          <Link
            href={`/signup${params.toString() ? `?${params.toString()}` : ""}`}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold"
          >
            Back to signup
          </Link>
        </div>
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading secure checkout…
      </div>
    );
  }

  if (!stripeCtx) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Stripe is not configured on this environment yet. Your account was
            created and you can sign in once billing keys are added.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-brand text-white text-sm font-semibold"
          >
            Continue to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="site-scope min-h-screen grid lg:grid-cols-12 bg-white dark:bg-[#05070d] text-gray-900 dark:text-gray-100">
      <SiteBodyClass />
      <StripeBodyClass />

      {/* Left — Form */}
      <section className="lg:col-span-7 xl:col-span-7 relative flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center py-10">
          <div className="w-full max-w-xl">
            <div className="animate-[fadeInUp_0.6s_ease-out_both]">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#ff5a1f]/25 bg-[#ff5a1f]/10 text-[#ff5a1f] text-xs font-semibold tracking-wide">
                <Clock3 className="h-3 w-3" />
                Step 2 of 2 · Add payment method
              </span>
              <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Add a card to start your trial
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                No charge today. We save your card so billing can start
                automatically after your 14 day free trial.
              </p>
            </div>

            <div
              className="mt-8 animate-[fadeInUp_0.7s_ease-out_both]"
              style={{ animationDelay: "0.1s" }}
            >
              <StripeOnboardingForm ctx={stripeCtx} />
            </div>
          </div>
        </div>
      </section>

      {/* Right — Reassurance panel */}
      <aside className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative flex-col p-10 xl:p-14 bg-gradient-brand text-white overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-white/15 blur-3xl animate-blob"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full bg-white/10 blur-3xl animate-blob"
          style={{ animationDelay: "-4s" }}
        />

        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/80">
            Your 14 day trial
          </p>
          <h2 className="mt-3 text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.1]">
            No charge today, full access from day one.
          </h2>
        </div>

        <div className="relative mt-10 space-y-4 text-sm text-white/90">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <p>
              Add your card now so billing starts automatically{" "}
              {ctx.trialEnd
                ? `on ${new Date(ctx.trialEnd).toLocaleDateString()}`
                : "after your 14 day trial"}
              . Cancel before then for $0.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-0.5" />
            <p>
              Payments are processed in Stripe test mode and tokenised on
              Stripe&apos;s PCI DSS Level 1 infrastructure.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="h-5 w-5 mt-0.5" />
            <p>
              We&apos;ll email you 3 days before the trial ends so there are no
              surprises on your first invoice.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading secure checkout…
        </div>
      }
    >
      <OnboardingInner />
    </Suspense>
  );
}
