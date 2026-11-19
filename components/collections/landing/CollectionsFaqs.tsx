"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    value: "cost",
    question: "How much does it cost?",
    answer:
      "Starting a collection is free. Payment partners charge a processing fee on contributions, and ChainFundIt may apply a small platform fee, the same way it does for campaigns.",
  },
  {
    value: "safe",
    question: "How do I know the money is safe?",
    answer:
      "Payments go through Paystack or PayPal. ChainFundIt does not store full card details, and contributors can pay without creating an account.",
  },
  {
    value: "account",
    question: "Does everyone need an account?",
    answer:
      "People chipping in only need the link, an email, and a card or PayPal. You need an account to start a collection and withdraw the money.",
  },
  {
    value: "who-paid",
    question: "Can I see who has paid?",
    answer:
      "Yes. The collection shows the running total and who has chipped in, so you are not left chasing bank transfers or keeping a separate list.",
  },
  {
    value: "what-for",
    question: "What can I collect for?",
    answer:
      "Weddings, birthdays, group gifts, reunions, graduations, trips, send-offs, and other occasions you share with people you care about.",
  },
  {
    value: "withdraw",
    question: "How do I get the money?",
    answer:
      "Withdraw from your dashboard once contributions are in. Group money stays in the collection until you are ready to spend it, separate from your personal account.",
  },
];

const CollectionsFaqs = () => {
  return (
    <div className="font-jakarta bg-[#FAFAF9] py-24 px-4 flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-16">
        <section className="w-full md:w-[24rem] flex flex-col gap-4">
          <div className="font-bold text-4xl leading-10 text-[#1C1917]">
            Frequently asked questions
          </div>
          <div className="text-base leading-6 text-[#78716C] mb-4">
            Can&apos;t find the answer you&apos;re looking for? Reach out to our
            customer support team.
          </div>
          <Button
            onClick={() =>
              (window.location.href = "mailto:campaigns@chainfundit.com")
            }
            className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none w-fit"
          >
            <Mail size={20} />
            Contact Support
          </Button>
          <Link
            href="/pricing"
            className="font-semibold text-[#104109] text-base w-fit"
          >
            See pricing
          </Link>
        </section>

        <section className="w-full md:w-[48rem]">
          <Accordion
            type="single"
            collapsible
            className="font-jakarta w-full flex flex-col gap-4"
            defaultValue="cost"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.value}
                value={item.value}
                className="bg-white border-none p-6 rounded-2xl overflow-hidden data-[state=open]:shadow-sm transition-all duration-300"
              >
                <AccordionTrigger>
                  <div className="font-bold text-lg leading-7 text-left">
                    {item.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="font-normal text-base leading-[26px] text-[#57534E]">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
};

export default CollectionsFaqs;
