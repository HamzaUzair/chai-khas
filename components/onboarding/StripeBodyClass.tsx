"use client";

import { useEffect } from "react";

/**
 * Adds the `stripe-active` class to <body> while a page that actually
 * uses Stripe.js (e.g. /onboarding) is mounted. The global CSS in
 * `app/globals.css` uses this class to decide whether Stripe's
 * injected iframes/widgets are allowed to surface in the viewport.
 *
 * When this component unmounts (user navigates back to the marketing
 * site via client-side routing), the class is removed so any Stripe
 * iframes that remain attached to <body> stay hidden instead of
 * appearing as a floating badge across public pages.
 */
const StripeBodyClass: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("stripe-active");
    return () => {
      document.body.classList.remove("stripe-active");
    };
  }, []);
  return null;
};

export default StripeBodyClass;
