import type { Metadata } from "next";
import LegalLayout from "@/components/site/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Restenzo restaurant management platform.",
};

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    <div className="mt-3 space-y-3 text-sm">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="April 21, 2026">
      <p className="text-base">
        These Terms of Service (“Terms”) govern your access to and use of
        Restenzo. By signing up or using the platform you agree to these Terms.
      </p>

      <Section title="Your account">
        <p>
          You are responsible for keeping your account credentials secure and
          for any activity that happens under your account. Let us know
          immediately if you suspect any unauthorised access.
        </p>
      </Section>

      <Section title="Subscription & billing">
        <p>
          Paid plans are billed monthly or annually depending on your choice.
          Yearly plans are billed up front. You can upgrade, downgrade or
          cancel at any time; changes take effect at the end of the current
          billing period unless stated otherwise.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          You agree not to misuse Restenzo including attempting to break its
          security, using it to process illegal transactions, or reverse
          engineering the service. We may suspend accounts that violate these
          rules.
        </p>
      </Section>

      <Section title="Data ownership">
        <p>
          Your restaurant data belongs to you. We store and process it only to
          provide and improve the service. You can export your data from
          Restenzo at any time.
        </p>
      </Section>

      <Section title="Service availability">
        <p>
          We work hard to keep Restenzo available around the clock, but we
          cannot guarantee uninterrupted service. Enterprise customers receive
          contractual SLAs.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Restenzo and its affiliates
          are not liable for any indirect, incidental or consequential damages
          arising from your use of the platform.
        </p>
      </Section>

      <Section title="Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material
          changes we’ll notify you by email or inside the product.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms? Reach us at{" "}
          <a href="mailto:legal@restenzo.com" className="text-[#ff5a1f] hover:underline">
            legal@restenzo.com
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  );
}
