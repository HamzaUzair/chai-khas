import React from "react";
import Container from "../Container";
import Reveal from "../Reveal";

const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "<100ms", label: "Order latency" },
  { value: "40+", label: "Countries served" },
  { value: "2M+", label: "Orders processed" },
];

const Stats: React.FC = () => {
  return (
    <section className="py-20">
      <Container>
        <Reveal className="rounded-3xl p-10 lg:p-14 border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <p className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  <span className="text-gradient-brand">{s.value}</span>
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
};

export default Stats;
