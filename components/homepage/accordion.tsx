import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqsAccordion() {
  const faqItems = [
    {
      value: "item-1",
      question: "How do you ensure donation security?",
      answer:
        "We use industry-standard encryption and partner with top-tier payment processors to ensure every transaction is secure and verified.",
    },
    {
      value: "item-2",
      question: "Is there a fee for starting a campaign?",
      answer:
        "Starting a campaign on Chainfundit is completely free! We only charge a small platform fee on donations received to cover transaction costs and keep our service running.",
    },
    {
      value: "item-3",
      question: "How can I withdraw my funds?",
      answer:
        "Once your campaign ends, you can request a withdrawal directly from your dashboard. Funds are typically transferred to your bank account within 3-5 business days.",
    },
    {
      value: "item-4",
      question: "Can I donate anonymously?",
      answer:
        "Yes! When making a donation, you have the option to donate anonymously. Your personal information will not be displayed publicly if you choose this option.",
    },
    {
      value: "item-5",
      question: "Can I edit my campaign?",
      answer:
        "Yes, you can edit your campaign at any time. Simply log in to your account, navigate to your campaign page, and make the necessary changes to keep your supporters updated.",
    },
  ];

  return (
    <Accordion
      type="single"
      collapsible
      className="font-jakarta w-full flex flex-col gap-4"
      defaultValue="item-1"
    >
      {faqItems.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="bg-white border-none p-6 rounded-2xl overflow-hidden data-[state=open]:shadow-sm transition-all duration-300"
        >
          <AccordionTrigger>
            <div className="font-bold text-lg leading-7">{item.question}</div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="font-normal text-base leading-[26px]">
              {item.answer}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
