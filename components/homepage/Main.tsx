"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationsList } from "@/components/homepage/notifications-list";
import BenefitsCarousel from "./BenefitsCarousel";
import { useCharities } from "@/hooks/use-charities";
import { ShieldCheck, Search } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {};

const Main = (props: Props) => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    charities,
    loading: charitiesLoading,
    error: charitiesError,
  } = useCharities({
    verified: true,
    active: true,
    limit: 12,
  });

  const filteredCharities = charities.filter((charity) => {
    const category = charity.category?.toLowerCase() ?? "";
    if (selectedFilter === "all") return true;

    switch (selectedFilter) {
      case "education":
        return (
          category.includes("education") ||
          category.includes("youth") ||
          category.includes("children")
        );
      case "medical":
        return category.includes("health") || category.includes("medical");
      case "community":
        return (
          category.includes("community") || category.includes("development")
        );
      case "nature":
        return (
          category.includes("environment") ||
          category.includes("climate") ||
          category.includes("wildlife")
        );
      default:
        return true;
    }
  });

  const displayCharities = filteredCharities.slice(0, 6);

  const cardDetails = displayCharities.map((charity) => {
    const focusAreas =
      charity.focusAreas && charity.focusAreas.length > 0
        ? charity.focusAreas.slice(0, 3).join(", ")
        : null;

    return {
      id: charity.id,
      slug: charity.slug,
      title: charity.name,
      description:
        charity.description ||
        charity.mission ||
        "Learn more about this charity's impact.",
      image: charity.coverImage || charity.logo || "/images/card-img1.png",
      category: charity.category || "Community",
      country: charity.country || "International",
      focusAreas,
      isVerified: charity.isVerified,
    };
  });

  // ===============================
  // Animation Variants
  // ===============================
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const staggerParent = {
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <div className="my-6">
      {/* ===============================
        Benefits Carousel
      =============================== */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <BenefitsCarousel />
      </motion.div>

      {/* ===============================
        Campaign Discovery Section
      =============================== */}
      <div className="w-full px-4 md:px-12 py-12 md:py-20 bg-white">
        {/* Header */}
        <motion.div
          className="flex flex-col gap-6 mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col gap-3">
            <h2 className="font-jakarta font-bold text-3xl md:text-4xl text-black">
              Make a meaningful donation today
            </h2>
            <p className="font-jakarta font-regular text-base md:text-lg text-[#666666]">
              Browse verified campaigns and find a cause that resonates with
              your heart.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#999999] w-5 h-5" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full h-12 md:h-14 pl-12 pr-4 text-base border-2 border-[#E8E8E8] rounded-xl bg-white focus:outline-none focus:border-[#104901] transition-colors"
            />
          </div>
        </motion.div>

        {/* ===============================
          Category Filter Buttons
        =============================== */}
        <motion.div
          className="flex gap-3 flex-wrap overflow-x-auto pb-4 mb-12"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
        >
          {/* (Buttons untouched – only wrapped for animation) */}
          {["all", "education", "medical", "community", "nature"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setSelectedFilter(item)}
                className={`px-6 py-2 rounded-full font-jakarta font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  selectedFilter === item
                    ? "bg-black text-white"
                    : "bg-white border-2 border-[#E8E8E8] text-black hover:border-[#104901]"
                }`}
              >
                {item === "all" && "All Causes"}
                {item === "education" && "🎓 Education"}
                {item === "medical" && "⚕️ Medical"}
                {item === "community" && "🏘️ Community"}
                {item === "nature" && "🌿 Nature"}
              </button>
            )
          )}
        </motion.div>

        {/* ===============================
          Loading / Error handlers
        =============================== */}
        {charitiesLoading && (
          <div className="flex items-center justify-center w-full py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901]"></div>
            <p className="text-[#104901] text-lg ml-4 font-medium">
              Loading campaigns...
            </p>
          </div>
        )}

        {charitiesError && !charitiesLoading && (
          <div className="flex flex-col items-center justify-center w-full py-16">
            <p className="text-red-600 text-center">{charitiesError}</p>
          </div>
        )}

        {/* ===============================
          CAMPAIGN CARDS (With stagger animation)
        =============================== */}
        {!charitiesLoading && !charitiesError && cardDetails.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {cardDetails.map((card) => (
              <motion.div
                key={card.id}
                variants={fadeUp}
                transition={{ duration: 0.45 }}
                className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => router.push(`/virtual-giving-mall/${card.slug}`)}
              >
                {/* IMAGE SECTION — untouched */}
                <div className="relative w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="font-jakarta font-bold text-xs text-[#104901] uppercase tracking-wider">
                      {card.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#333333] text-white px-3 py-1.5 rounded-full">
                    <span className="font-jakarta font-bold text-xs">
                      {" "}
                      {/* Using a custom size if you configured it */}
                      12 days left
                    </span>
                  </div>
                </div>

                {/* CONTENT SECTION — untouched */}
                <div className="p-5 md:p-6 flex flex-col gap-4 flex-grow">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wider">
                        Organized by{" "}
                        <b className="text-black">{card.category}</b>
                      </p>

                      {card.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#104901] border border-[#104901]/20">
                          <ShieldCheck className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <h3 className="font-jakarta font-bold text-lg text-black mb-2">
                      {card.title.length > 50
                        ? `${card.title.slice(0, 50)}...`
                        : card.title}
                    </h3>
                    <p className="font-jakarta font-regular text-sm text-[#666666] line-clamp-2">
                      {card.description}
                    </p>
                  </div>

                  <div className="flex-grow" />
                  <div className="border-t border-[#104109] pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-jakarta font-bold text-[#1ABD73]">
                        $12,500 raised
                      </span>
                      <span className="font-jakarta font-regular text-[#999999] text-sm">
                        $15,000 goal
                      </span>
                    </div>
                    <div className="w-full bg-[#E8E8E8] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#1ABD73] h-full w-[83%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!charitiesLoading && !charitiesError && cardDetails.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-16">
            <p className="text-[#666666] text-center">
              No campaigns available in this category.
            </p>
          </div>
        )}

        {/* Load More Button */}
        <motion.div
          className="flex justify-center mt-12"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          transition={{ duration: 0.7 }}
        >
          {cardDetails.length > 0 && (
            <Button
              onClick={() => router.push("/campaigns")}
              variant="outline"
              className="px-8 py-6 border-2 border-black text-black font-jakarta font-bold text-base rounded-lg hover:bg-black hover:text-white transition-all duration-300"
            >
              Load More Campaigns
            </Button>
          )}
        </motion.div>
      </div>

      {/* ===============================
        BIG YELLOW CTA + ANIMATIONS
      =============================== */}
      <motion.div
        className="w-full bg-[#FFCF55] px-4 md:px-12 py-16 md:py-24"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center gap-8 text-center">
          {/* HEADING Animation */}
          <motion.h2
            className="font-jakarta font-bold text-3xl md:text-5xl text-black"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Together, We Can Make a Difference
          </motion.h2>

          {/* PARAGRAPH Animation */}
          <motion.p
            className="font-jakarta font-regular text-base md:text-lg text-black opacity-90 max-w-2xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Your support empowers us to provide essential resources to those who
            need it most. Join the movement today.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Button
              onClick={() => (window.location.href = "/campaigns")}
              className="px-8 py-6 bg-black text-white font-jakarta font-semibold text-base rounded-full hover:bg-[#333] transition duration-300"
            >
              Donate Now
            </Button>

            <Button
              onClick={() => (window.location.href = "/volunteer")}
              className="px-8 py-6 bg-white text-black font-jakarta font-semibold text-base rounded-full hover:bg-[#f0f0f0] border-2 border-white transition duration-300"
            >
              Become a Volunteer
            </Button>
          </motion.div>

          {/* ===============================
            FLOATING AVATARS
          =============================== */}
          <motion.div
            className="bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3 mt-4"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="flex -space-x-2">
              {/* Circles remain identical */}
              <div className="w-8 h-8 rounded-full bg-[#FF6B6B] border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-[#4ECDC4] border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-[#6BCB77] border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-[#4D96FF] border-2 border-white flex items-center justify-center">
                <span className="text-white font-jakarta font-bold text-xs">
                  1k+
                </span>
              </div>
            </div>

            <div>
              <p className="font-jakarta font-bold text-sm text-black">
                PEOPLE INVOLVED
              </p>
              <p className="font-jakarta font-regular text-xs text-black opacity-70">
                Creating change daily
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Main;
