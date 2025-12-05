import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown } from "lucide-react";

export function FaqsAccordion() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full flex flex-col gap-3"
      defaultValue="item-1"
    >
      <AccordionItem 
        value="item-1" 
        className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden data-[state=open]:border-[#1ABD73] data-[state=open]:shadow-sm transition-all duration-300"
      >
        <AccordionTrigger className="font-jakarta font-bold text-base md:text-lg text-black hover:no-underline px-6 md:px-8 py-4 md:py-5 flex justify-between items-center group">
          <span className="text-left">How do you ensure donation security?</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 md:px-8 py-4 md:py-5 border-t border-[#E8E8E8] bg-white">
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            We use industry-standard encryption and partner with top-tier payment processors to ensure every transaction is secure and verified.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem 
        value="item-2" 
        className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden data-[state=open]:border-[#1ABD73] data-[state=open]:shadow-sm transition-all duration-300"
      >
        <AccordionTrigger className="font-jakarta font-bold text-base md:text-lg text-black hover:no-underline px-6 md:px-8 py-4 md:py-5 flex justify-between items-center group">
          <span className="text-left">Is there a fee for starting a campaign?</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 md:px-8 py-4 md:py-5 border-t border-[#E8E8E8] bg-white">
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            Starting a campaign on Chainfundit is completely free! We only charge a small platform fee on donations received to cover transaction costs and keep our service running.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem 
        value="item-3" 
        className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden data-[state=open]:border-[#1ABD73] data-[state=open]:shadow-sm transition-all duration-300"
      >
        <AccordionTrigger className="font-jakarta font-bold text-base md:text-lg text-black hover:no-underline px-6 md:px-8 py-4 md:py-5 flex justify-between items-center group">
          <span className="text-left">How can I withdraw my funds?</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 md:px-8 py-4 md:py-5 border-t border-[#E8E8E8] bg-white">
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            Once your campaign ends, you can request a withdrawal directly from your dashboard. Funds are typically transferred to your bank account within 3-5 business days.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem 
        value="item-4" 
        className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden data-[state=open]:border-[#1ABD73] data-[state=open]:shadow-sm transition-all duration-300"
      >
        <AccordionTrigger className="font-jakarta font-bold text-base md:text-lg text-black hover:no-underline px-6 md:px-8 py-4 md:py-5 flex justify-between items-center group">
          <span className="text-left">Can I donate anonymously?</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 md:px-8 py-4 md:py-5 border-t border-[#E8E8E8] bg-white">
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            Yes! When making a donation, you have the option to donate anonymously. Your personal information will not be displayed publicly if you choose this option.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem 
        value="item-5" 
        className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden data-[state=open]:border-[#1ABD73] data-[state=open]:shadow-sm transition-all duration-300"
      >
        <AccordionTrigger className="font-jakarta font-bold text-base md:text-lg text-black hover:no-underline px-6 md:px-8 py-4 md:py-5 flex justify-between items-center group">
          <span className="text-left">Can I edit my campaign?</span>
        </AccordionTrigger>
        <AccordionContent className="px-6 md:px-8 py-4 md:py-5 border-t border-[#E8E8E8] bg-white">
          <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
            Yes, you can edit your campaign at any time. Simply log in to your account, navigate to your campaign page, and make the necessary changes to keep your supporters updated.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}