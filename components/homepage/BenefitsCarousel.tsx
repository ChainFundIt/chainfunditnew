"use client";
import React from "react";
import Image from "next/image";
import { Zap, Globe, Shield, CircleCheck } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Multi-currency support",
    desc: "Raise donations in any currency. Explore crypto options to reach more donors worldwide",
    isHighlighted: true,
  },
  {
    title: "Influencer network",
    desc: "Get amplified reach through our creator network to accelerate your fundraising goals",
    isHighlighted: false,
  },
  {
    title: "Secure payments",
    desc: "Industry-leading security protects your funds and payouts with enterprise-grade encryption",
    isHighlighted: false,
  },
];

const BenefitsCarousel = () => {
  return (
    <div className="font-jakarta bg-[#59AD4A] py-24 px-4 flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-16 items-center">
        {/* Left Text Content */}
        <div className="w-full md:w-[36rem] flex flex-col gap-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="px-4 py-2 rounded-full flex gap-2 bg-white/10 w-fit items-center"
          >
            <Zap color="#FDE047" size={16} />
            <div className="font-bold text-sm leading-5 text-white">
              Powering Next-Gen Fundraising
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-extrabold text-5xl leading-[48px] text-white"
          >
            Discover the Impact of Transparent Giving
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-normal text-lg leading-[30px] text-white"
          >
            We've built a platform that removes the barriers to kindness.
            Connect directly with causes, track every dollar, and see the change
            you create in real-time.
          </motion.div>

          {/* Features List */}
          <motion.div
            className="flex flex-col gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -25 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.5 }}
                className="flex gap-4"
              >
                <CircleCheck color="#86EFAC" size={20} />
                <div className="font-medium text-base leading-6 text-white">
                  {feature.title}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Image Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-6 md:p-0 w-full md:w-auto"
        >
          <div className="relative ">
            {/* Main Image */}
            <Image
              src="/images/volunteersHelping.png"
              alt="Transparent Giving Impact"
              width={570}
              height={600}
              className="md:w-[36rem] w-full h-auto object-cover rounded-[40px]"
            />

            {/* Floating Card - Top Left */}
            <div className="absolute top-8 left-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DCFCE7] flex items-center justify-center rounded-xl p-3">
                <Globe size={20} color="#16A34A" />
              </div>
              <div className="flex flex-col g-1">
                <p className="font-bold text-sm leading-5">Global Reach</p>
                <p className="font-normal text-xs leading-4">
                  Support causes in 14+ countries instantly.
                </p>
              </div>
            </div>

            {/* Floating Card - Bottom Right */}
            <div className="absolute bottom-8 right-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DBEAFE] flex items-center justify-center rounded-xl p-3">
                <Shield size={20} color="#2563EB" />
              </div>
              <div className="flex flex-col g-1">
                <p className="font-bold text-sm leading-5">100% Secure</p>
                <p className="font-normal text-xs leading-4">
                  Bank-grade encryption for every donation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BenefitsCarousel;
