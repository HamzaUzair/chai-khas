"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";

export interface FAQ {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  items: FAQ[];
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-gray-100 dark:divide-white/5 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02]">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
            >
              <span className="font-semibold text-gray-900 dark:text-white">
                {item.q}
              </span>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ff5a1f]/10 text-[#ff5a1f] transition-transform duration-500 ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <div
              className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 -mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
