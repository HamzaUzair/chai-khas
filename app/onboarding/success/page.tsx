"use client";

/**
 * /onboarding/success
 *
 * Shown after Stripe confirms the SetupIntent (card saved, trial live).
 * We clear the session-scoped onboarding context, then surface a clean
 * confirmation + CTA to sign in to the new portal.
 */
import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "@/components/site/Logo";
import SiteBodyClass from "@/components/site/SiteBodyClass";
import ThemeToggle from "@/components/theme/ThemeToggle";

const STORAGE_KEY = "restenzo_onboarding_ctx";

interface StoredContext {
  email?: string;
  planId?: string;
  cycle?: "monthly" | "yearly";
  trialEnd?: string | null;
}

function readStored(): StoredContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredContext;
  } catch {
    return null;
  }
}

function SuccessInner() {
  const params = useSearchParams();
  const [ctx, setCtx] = useState<StoredContext | null>(null);

  useEffect(() => {
    const stored = readStored();
    if (stored) setCtx(stored);
    // Clear once we've shown the confirmation — any refresh bounces to /login.
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const trialDateLabel = useMemo(() => {
    if (!ctx?.trialEnd) return null;
    try {
      return new Date(ctx.trialEnd).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [ctx?.trialEnd]);

  const loginHref = ctx?.email
    ? `/login?email=${encodeURIComponent(ctx.email)}`
    : "/login";

  const setupIntentStatus = params.get("setup_intent_client_secret")
    ? "Stripe confirmed your payment method"
    : null;

  return (
    <main className="site-scope min-h-screen bg-white dark:bg-[#05070d] text-gray-900 dark:text-gray-100">
      <SiteBodyClass />

      <header className="flex items-center justify-between p-6 sm:p-10">
        <Logo size="md" />
        <ThemeToggle />
      </header>

      <section className="flex items-start justify-center px-6 pb-20">
        <div className="w-full max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
            <div
              aria-hidden
              className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#ff5a1f]/15 blur-3xl"
            />

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-xs font-semibold tracking-wide dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Trial activated
            </span>

            <h1 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight">
              You&apos;re all set. Welcome to Restenzo.
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Your 14 day free trial is live and your payment method is saved.
              {trialDateLabel
                ? ` Billing will automatically start on ${trialDateLabel}.`
                : " Billing starts once your trial ends."}
            </p>

            {setupIntentStatus && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="inline h-4 w-4 mr-1" />
                {setupIntentStatus}
              </p>
            )}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                  Due today
                </p>
                <p className="mt-1 text-lg font-bold">$0.00</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                  Trial ends
                </p>
                <p className="mt-1 text-lg font-bold">
                  {trialDateLabel ?? "In 14 days"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-500 dark:text-gray-400">
                  Billing starts
                </p>
                <p className="mt-1 text-lg font-bold">
                  {trialDateLabel ?? "After trial"}
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={loginHref}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-brand text-white font-semibold shadow-[0_20px_40px_-15px_rgba(255,90,31,0.65)] hover:-translate-y-0.5 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Sign in to your portal
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:border-[#ff5a1f]/40 hover:text-[#ff5a1f] transition-all dark:border-white/10 dark:text-gray-300"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
              Cancel anytime before your trial ends from inside your portal to
              avoid being charged.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function OnboardingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Confirming your trial…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
