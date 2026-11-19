"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  {
    question: "What is a collection?",
    answer:
      "A shared pot for a group goal — a gift, an event, a class fund, a team. Share the link and people pay by card.",
  },
  {
    question: "Do I need an account to contribute?",
    answer:
      "No. Add your email and pay. You can give without your name showing.",
  },
  {
    question: "Is payment secure?",
    answer:
      "Payments go through Paystack or PayPal. ChainFundIt never stores your full card details.",
  },
];

export function CollectionFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section>
      <h2 className="font-jakarta text-xl font-bold tracking-tight text-[#104109]">
        Questions
      </h2>
      <div className="mt-2">
        {QUESTIONS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={item.question} className="border-b border-[#E7E5E4]">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-6 py-4 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <span className="font-jakarta text-base font-semibold text-[#1C1917]">
                  {item.question}
                </span>
                <Plus
                  className={cn(
                    "h-4 w-4 shrink-0 text-[#78716C] transition-transform duration-200",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
              {isOpen && (
                <p className="max-w-xl pb-4 text-base leading-relaxed text-[#57534E]">
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
