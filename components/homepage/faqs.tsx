"use client";

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import React from "react";
import { FaqsAccordion } from "./accordion";

const FAQs = () => {
  return (
    <div className="font-jakarta bg-[#FAFAF9] py-24 px-4 flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Left Sidebar */}
        <section className="w-full md:w-[24rem] flex flex-col gap-4">
          <div className="font-bold text-4xl leading-10 text-[#1C1917]">
            Frequently asked questions
          </div>
          <div className="text-base leading-6 text-[#78716C] mb-4">
            Can't find the answer you're looking for? Reach out to our customer
            support team.
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
        </section>

        {/* Right Accordion */}
        <section className="w-full md:w-[48rem]">
          <FaqsAccordion />
        </section>
      </div>
    </div>
  );
};

export default FAQs;
