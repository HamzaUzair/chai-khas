"use client";

import { useEffect } from "react";

/**
 * Adds the `site-body` class to <body> while the marketing site is mounted,
 * so the cleaner white/dark surfaces apply on the marketing pages without
 * affecting the internal POS app styling.
 */
const SiteBodyClass: React.FC = () => {
  useEffect(() => {
    document.body.classList.add("site-body", "site-scope");
    return () => {
      document.body.classList.remove("site-body", "site-scope");
    };
  }, []);
  return null;
};

export default SiteBodyClass;
