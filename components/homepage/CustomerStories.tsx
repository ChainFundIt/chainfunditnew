"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

type Props = {};

const CustomerStories = (props: Props) => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Regular Donor",
      avatar: "/images/avatar-sarah.png",
      quote:
        "The transparency of ChainFundit is unmatched. I can see exactly where my money goes and the impact it makes.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Campaign Organizer",
      avatar: "/images/avatar-michael.png",
      quote:
        "Setting up a campaign was incredibly easy. The dashboard analytics helped me understand my donor base better.",
      rating: 5,
    },
    {
      id: 3,
      name: "Amara Okeke",
      role: "Non-Profit Director",
      avatar: "/images/avatar-amara.png",
      quote:
        "We've scaled our fundraising efforts by 200% since switching to this platform. The support team is fantastic.",
      rating: 4,
    },
  ];

  return (
    <div className="w-full font-jakarta my-12">
      {/* Testimonials Section */}
      <div className="px-4 md:px-12 py-12 md:py-20 w-full bg-white flex flex-col gap-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-[#59AD4A] rounded-full px-4 py-2">
            <span className="text-[#104901]">★</span>
            <span className="font-jakarta font-bold text-xs md:text-sm text-[#104901] uppercase tracking-wider">
              Trust & Impact
            </span>
          </div>
          <h2 className="font-jakarta font-bold text-3xl md:text-5xl text-black">
            Hear from those who believe
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white border border-[#E8E8E8] rounded-2xl p-6 md:p-8 flex flex-col gap-6"
            >
              {/* Star Rating */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < testimonial.rating
                        ? "fill-[#FFD700] text-[#FFD700]"
                        : "text-[#E8E8E8]"
                    }
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-jakarta font-regular text-base text-[#666666] leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* User Info */}
              <div className="border-t border-[#E8E8E8] pt-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFB366] flex-shrink-0" />
                <div>
                  <p className="font-jakarta font-bold text-sm text-black">
                    {testimonial.name}
                  </p>
                  <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wide">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerStories;
