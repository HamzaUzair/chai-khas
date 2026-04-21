import React from "react";
import Container from "./Container";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  updated,
  children,
}) => {
  return (
    <div>
      <section className="relative overflow-hidden pt-20 pb-6 lg:pt-28">
        <div className="absolute inset-0 bg-gradient-brand-soft -z-10" />
        <Container size="md">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            Legal
          </p>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {updated}
          </p>
        </Container>
      </section>

      <section className="py-10 lg:py-16">
        <Container size="md">
          <article className="prose-legal space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            {children}
          </article>
        </Container>
      </section>
    </div>
  );
};

export default LegalLayout;
