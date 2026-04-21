import React from "react";
import Container from "../Container";

const brands = [
  "Spice Route",
  "Olive Grove",
  "The Tandoor Co.",
  "Crumb Café",
  "Saffron House",
  "Basilico",
  "Grill & Grace",
];

const TrustBar: React.FC = () => {
  return (
    <section className="py-12 lg:py-14 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
      <Container>
        <p className="text-center text-xs font-semibold tracking-[0.22em] uppercase text-gray-500 dark:text-gray-400">
          Trusted by forward-thinking restaurants worldwide
        </p>

        <div className="mt-8 relative overflow-hidden">
          <div className="flex gap-14 animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="text-lg sm:text-xl font-serif italic text-gray-500/90 dark:text-gray-400/80 tracking-wide"
              >
                {b}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50/80 dark:from-[#05070d] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-50/80 dark:from-[#05070d] to-transparent" />
        </div>
      </Container>
    </section>
  );
};

export default TrustBar;
