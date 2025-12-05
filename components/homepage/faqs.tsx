'use client'

import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import React from "react";
import { FaqsAccordion } from "./accordion";

type Props = {};

const FAQs = (props: Props) => {
  return (
    <div className="px-4 md:px-12 py-12 md:py-20 w-full bg-white flex flex-col md:flex-row gap-8 md:gap-16 font-jakarta">
      {/* Left Sidebar */}
      <section className="w-full md:w-1/4 flex flex-col gap-6 md:gap-8 sticky top-20 h-fit">
        <div className="flex flex-col gap-4">
          <h2 className="font-jakarta font-bold text-2xl md:text-3xl text-black">
            Frequently asked questions
          </h2>
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            Can't find the answer you're looking for? Reach out to our customer support team.
          </p>
        </div>

        <Button 
          onClick={() => window.location.href = "mailto:support@chainfundit.com"} 
          className="w-full h-12 md:h-14 flex justify-center items-center gap-2 font-jakarta font-semibold text-base bg-black text-white hover:bg-[#333] rounded-lg transition-all duration-300"
        >
          <Mail size={20} />
          Contact Support
        </Button>
      </section>

      {/* Right Accordion */}
      <section className="w-full md:w-3/4">
        <FaqsAccordion />
      </section>
    </div>
  );
};

export default FAQs;