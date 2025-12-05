"use client";
import React from "react";
import Image from "next/image";
import { Zap, Check, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";

type Props = {};

const BenefitsCarousel = (props: Props) => {
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

  return (
    <div className="w-full bg-[#59AD4A] px-4 md:px-12 py-16 md:py-24">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-stretch lg:items-center">
        {/* =======================
            LEFT CONTENT
        ======================= */}
        <div className="flex-1 text-white flex flex-col gap-8 justify-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 w-fit bg-white/20 rounded-full px-4 py-2"
          >
            <Zap className="w-5 h-5" />
            <span className="font-jakarta font-bold text-xs md:text-sm uppercase tracking-wide">
              Powering Next-Gen Fundraising
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-jakarta font-bold text-3xl md:text-4xl lg:text-5xl leading-tight"
          >
            Discover the Impact of Transparent Giving
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-jakarta font-regular text-base md:text-lg leading-relaxed opacity-90"
          >
            We've built a platform that removes the barriers to kindness.
            Connect directly with causes, track every dollar, and see the change
            you create in real-time.
          </motion.p>

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
                className="flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="font-jakarta font-medium text-base md:text-lg text-white">
                  {feature.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* =======================
            RIGHT IMAGE + FLOATING CARDS
        ======================= */}
        <motion.div
          className="flex-1 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full">
            {/* Main Image */}
            <Image
              src="/images/Volunteers helping.png"
              alt="Transparent Giving Impact"
              width={600}
              height={380}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              priority
              className="w-full h-auto object-cover"
            />

            {/* Floating Card - Top Left */}
            <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 w-52">
              <div className="w-8 h-8 bg-[#E6FCEB] text-[#1A8F3A] flex items-center justify-center rounded-full">
                <Globe size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Global Reach
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Support causes in 14+ countries instantly.
                </p>
              </div>
            </div>

            {/* Floating Card - Bottom Right */}
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 flex items-start gap-3 w-52">
              <div className="w-8 h-8 bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center rounded-full">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  100% Secure
                </p>
                <p className="text-[10px] text-gray-500 leading-tight">
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
