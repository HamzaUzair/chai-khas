import React from "react";
import { Quote, Star } from "lucide-react";
import Container from "../Container";
import Reveal from "../Reveal";

const testimonials = [
  {
    quote:
      "We switched from three separate tools to Restenzo and cut service time by 22%. Our head office finally has real visibility across all 14 branches.",
    name: "Aisha Rahman",
    role: "COO · Saffron House Group",
  },
  {
    quote:
      "The live kitchen screen is a game-changer. Our chefs love it, and our tickets never fall through the cracks anymore.",
    name: "Daniyal Khan",
    role: "Owner · The Tandoor Co.",
  },
  {
    quote:
      "The day end and reporting alone saved our accountant 10+ hours every week. Restenzo paid for itself in the first month.",
    name: "Maria Gomez",
    role: "Finance Lead · Basilico",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-[#ff5a1f]">
            What operators say
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Loved by restaurants{" "}
            <span className="text-gradient-brand">of every size.</span>
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 100}
              className="relative rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-7 card-hover"
            >
              <Quote className="absolute top-5 right-5 h-8 w-8 text-[#ff5a1f]/15" />
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[#ff5a1f] text-[#ff5a1f]"
                  />
                ))}
              </div>
              <p className="mt-5 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                “{t.quote}”
              </p>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-brand text-white font-bold flex items-center justify-center">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
