"use client";

import { Star, StarIcon } from "lucide-react";
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
      avatar: "/images/avatar_sarah.png",
      quote:
        "The transparency of ChainFundit is unmatched. I can see exactly where my money goes and the impact it makes.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Campaign Organizer",
      avatar: "/images/avatar_michael.png",
      quote:
        "Setting up a campaign was incredibly easy. The dashboard analytics helped me understand my donor base better.",
      rating: 5,
    },
    {
      id: 3,
      name: "Amara Okeke",
      role: "Non-Profit Director",
      avatar: "/images/avatar_amara.png",
      quote:
        "We've scaled our fundraising efforts by 200% since switching to this platform. The support team is fantastic.",
      rating: 4,
    },
  ];

  return (
    <div className="font-jakarta flex items-center justify-center bg-white py-20 px-4">
      <div className="flex flex-col gap-16 md:max-w-[80rem] w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="px-4 py-2 rounded-full bg-[#DCFCE7] flex gap-2 w-fit items-center">
            <StarIcon color="#104109" size={16} />
            <div className="font-bold text-sm leading-5 text-[#104109]">
              Trust & Impact
            </div>
          </div>
          <div className="font-bold text-5xl leading-[48px]">
            Hear from those who believe
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="flex flex-col md:flex-row gap-8 items-stretch">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-[#FDFBF7] rounded-[32px] p-8 flex flex-col gap-6"
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
              <p className="font-medium text-lg leading-[30px] text-[#1C1917]">
                "{testimonial.quote}"
              </p>
              
              {/* Spacer to push user info to bottom */}
              <div className="flex-grow" />
              
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Image 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0" 
                />
                <div>
                  <p className="font-bold text-base leading-6 text-[#1C1917]">
                    {testimonial.name}
                  </p>
                  <p className="font-bold text-xs leading-4 text-[#A8A29E]">
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
