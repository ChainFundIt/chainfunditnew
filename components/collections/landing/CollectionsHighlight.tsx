"use client";

import Image from "next/image";
import { CircleCheck, Shield, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "Add a closing date so everyone knows when to pay",
  "Show who has already chipped in, and how much is in",
  "Set a target and tell the group what the money is for",
];

const CollectionsHighlight = () => {
  return (
    <div className="font-jakarta bg-[#59AD4A] py-12 px-8 flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-12 items-center w-full max-w-[80rem] justify-between">
        <div className="w-full md:w-[36rem] flex flex-col gap-6 px-4 md:px-0">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="px-4 py-2 rounded-full flex gap-2 bg-white/10 w-fit items-center"
          >
            <Wallet color="#FDE047" size={16} />
            <div className="font-bold text-sm leading-5 text-white">
              Keep money separate from your bank
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-extrabold text-5xl leading-[48px] text-white"
          >
            Customise your collection
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-normal text-lg leading-[30px] text-white"
          >
            Don&apos;t mix group money in with your personal account. Set a
            closing date, show who has paid, add a fundraising target, and keep
            every contribution in one place.
          </motion.div>

          <motion.div
            className="flex flex-col gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature}
                variants={{
                  hidden: { opacity: 0, x: -25 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.5 }}
                className="flex gap-4"
              >
                <CircleCheck color="#86EFAC" size={20} className="shrink-0 mt-0.5" />
                <div className="font-medium text-base leading-6 text-white">
                  {feature}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-6 md:p-0 w-full md:w-auto"
        >
          <div className="relative w-full md:w-[36rem]">
            <div className="relative w-full overflow-hidden rounded-[40px] h-[420px] md:h-[600px]">
              <Image
                src="/images/piggy-bank-finance-savings.jpg"
                alt="A shared collection pot"
                fill
                sizes="(min-width: 768px) 36rem, 100vw"
                className="object-cover"
              />
            </div>

            <div className="absolute top-8 left-4 md:left-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DCFCE7] flex items-center justify-center rounded-xl p-3 shrink-0">
                <Wallet size={20} color="#16A34A" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm leading-5">One shared pot</p>
                <p className="font-normal text-xs leading-4">
                  Group money stays separate from your bank.
                </p>
              </div>
            </div>

            <div className="absolute bottom-8 right-4 md:right-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DBEAFE] flex items-center justify-center rounded-xl p-3 shrink-0">
                <Shield size={20} color="#2563EB" />
              </div>
              <div className="flex flex-col">
                <p className="font-bold text-sm leading-5">Paid in seconds</p>
                <p className="font-normal text-xs leading-4">
                  Card or PayPal. No sign-up required.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionsHighlight;
