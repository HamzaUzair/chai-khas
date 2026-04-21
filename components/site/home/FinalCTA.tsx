import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <Reveal className="relative overflow-hidden rounded-3xl p-10 lg:p-16 bg-gradient-brand text-white shadow-[0_50px_120px_-30px_rgba(255,90,31,0.55)]">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob"
          />
          <div
            aria-hidden
            className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-blob"
            style={{ animationDelay: "-4s" }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Ready to run your restaurant{" "}
                <span className="underline decoration-white/40 decoration-4 underline-offset-4">
                  the Restenzo way?
                </span>
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-2xl">
                Start your 14 day free trial today. No credit card required. Be
                live in your restaurant tomorrow.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Free setup & onboarding
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Cancel anytime
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  White glove migration
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#ff5a1f] font-semibold hover:-translate-y-0.5 transition-transform shadow-xl"
              >
                Start free trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
};

export default FinalCTA;
