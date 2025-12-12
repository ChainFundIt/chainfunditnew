"use client";

import React, { useState, useRef } from "react";
import { R2Image } from "@/components/ui/r2-image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  GraduationCap,
  Stethoscope,
  Building2,
  Leaf,
  ShieldIcon,
  CircleCheck,
  Heart,
} from "lucide-react";

import { useCharities } from "@/hooks/use-charities";

import { Button } from "../ui/button";
import BenefitsCarousel from "./BenefitsCarousel";

// Component to show image with heart icon fallback on error
const CharityImageWithFallback = ({ 
  src, 
  alt, 
  title, 
  height,
  width,
  className
}: { 
  src: string; 
  alt: string; 
  title: string; 
  height: number; 
  width: number; 
  className: string;
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const HeartIconPlaceholder = () => (
    <div className="w-[382px] h-[224px] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center relative">
      <div className="text-center p-4 relative z-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
            <Heart className="h-12 w-12 text-white" />
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );

  if (!src || imageError) {
    return <HeartIconPlaceholder />;
  }

  return (
    <div className="relative w-[382px] h-[224px]">
      <img
        src={src}
        alt={alt}
        height={height}
        width={width}
        className={className}
        onError={() => setImageError(true)}
        onLoad={() => setImageError(false)}
      />
      {imageError && <HeartIconPlaceholder />}
    </div>
  );
};

const Main = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    const charityName = charity.name?.toLowerCase() ?? "";
    const matchesSearch = charityName.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
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

  const charitiesFilterTabs = [
    "all",
    "education",
    "medical",
    "community",
    "nature",
  ];

  const cardDetails = displayCharities.map((charity) => {
    const focusAreas =
      charity.focusAreas && charity.focusAreas.length > 0
        ? charity.focusAreas.slice(0, 4).join(", ")
        : null;

    return {
      id: charity.id,
      slug: charity.slug,
      title: charity.name,
      description:
        charity.description ||
        charity.mission ||
        "Learn more about this charity's impact.",
      image: charity.coverImage || charity.logo || null,
      category: charity.category || "Community",
      country: charity.country || "International",
      focusAreas,
      isVerified: charity.isVerified,
    };
  });

  /* Animations */
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
    <div>
      {/* Next-Gen Fundraising Section */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <BenefitsCarousel />
      </motion.div>

      {/* Campaign Discovery Section */}
      <div className="font-jakarta bg-[#F5F2EA80] py-24 px-4 flex justify-center items-center">
        <div className="flex flex-col gap-12 w-[80rem]">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:justify-between gap-6 items-end"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col gap-4">
              <div className="font-bold text-4xl leading-10 text-[#1C1917]">
                Make a meaningful donation today
              </div>
              <div className="font-normal text-base leading-6 text-[#78716C]">
                Browse verified charities and find a cause that resonates with
                your heart.
              </div>
            </div>

            {/* Search Input */}
            <div className="relative md:w-64 w-full rounded-xl bg-white border-2 border-transparent focus-within:border-[#104109] transition-colors">
              <Search
                color="#A8A29E"
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search charities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 w-full rounded-xl focus:outline-none text-[#A8A29E] bg-transparent"
              />
            </div>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            className="flex gap-3 flex-wrap overflow-x-auto"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7 }}
          >
            {charitiesFilterTabs.map((item) => (
              <button
                key={item}
                onClick={() => setSelectedFilter(item)}
                className={`flex gap-2 items-center px-5 py-3 rounded-full font-bold text-sm leading-5 transition-all duration-300 ${
                  selectedFilter === item
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {item === "all" && "All Causes"}
                {item === "education" && (
                  <>
                    <GraduationCap size={16} />
                    Education
                  </>
                )}
                {item === "medical" && (
                  <>
                    <Stethoscope size={16} />
                    Medical
                  </>
                )}
                {item === "community" && (
                  <>
                    <Building2 size={16} />
                    Community
                  </>
                )}
                {item === "nature" && (
                  <>
                    <Leaf size={16} />
                    Nature
                  </>
                )}
              </button>
            ))}
          </motion.div>

          {/* Loading / Error handlers */}
          {charitiesLoading && (
            <div className="flex items-center justify-center w-full py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901]"></div>
              <p className="text-[#104901] text-lg ml-4 font-medium">
                Loading Charities...
              </p>
            </div>
          )}

          {charitiesError && !charitiesLoading && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <p className="text-red-600 text-center">{charitiesError}</p>
            </div>
          )}

          {/* Campaign Cards */}
          {!charitiesLoading && !charitiesError && cardDetails.length > 0 && (
            <motion.div
              key={`${selectedFilter}-${searchQuery}`}
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
                  className="group rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() =>
                    router.push(`/virtual-giving-mall/${card.slug}`)
                  }
                >
                  {/* IMAGE SECTION */}
                  <div className="relative overflow-hidden">
                    {/* Show placeholder heart icon when no image, otherwise try to show the image (including clearbit URLs) */}
                    {!card.image ? (
                      <div className="w-[382px] h-[224px] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center relative">
                        <div className="text-center p-4 relative z-10">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
                              <Heart className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
                            {card.title}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <CharityImageWithFallback
                        src={card.image}
                        alt={card.title}
                        title={card.title}
                        height={224}
                        width={382}
                        className="w-[382px] h-[224px] object-contain bg-white group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full">
                      <span className="font-bold text-xs leading-4">
                        {card.category}
                      </span>
                    </div>
                    <div className="absolute flex gap-1 items-center top-4 right-4 bg-[#59AD4A] text-white px-3 py-1 rounded-full">
                      <ShieldIcon color="white" size={12} />
                      <span className="font-bold text-xs leading-4">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-6 flex flex-col gap-6 flex-grow">
                    <div className="flex flex-col gap-3 flex-grow">
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-xs text-[#A8A29E] uppercase">
                          Organized by{" "}
                          <b className="font-bold text-xs text-[#292524]">
                            {card.category}
                          </b>
                        </p>

                        {card.isVerified && (
                          <CircleCheck size={12} color="#3B82F6" />
                        )}
                      </div>
                      <div className="font-bold text-xl text-[#1C1917] truncate ">
                        {card.title}
                      </div>
                      <div className="font-normal text-sm text-[#78716C]">
                        {card.description}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-2 bg-[#59AD4A] h-1 w-full rounded-full"></div>
                        <Heart color="#F87171" size={30} />
                        <div className="flex gap-2 bg-[#59AD4A] h-1 w-full rounded-full"></div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/virtual-giving-mall/${card.slug}`);
                        }}
                        className="bg-white px-0 py-3 rounded-full h-auto text-[#104109] font-bold text-base leading-6 border-2 border-transparent hover:border-[#104109] transition-colors"
                      >
                        View Charity
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!charitiesLoading && !charitiesError && cardDetails.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <p className="text-[#666666] text-center">
                No Charities available in this category.
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
                className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none"
              >
                View More Charities
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Make a Difference Section */}
      <motion.div
        className="font-jakarta flex items-center justify-center bg-[#FFCF55] py-24 px-4"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col gap-16 md:max-w-[56rem] w-full">
          {/* HEADING */}
          <motion.div
            className="font-extrabold text-5xl md:text-6xl leading-tight text-center text-[#1C1917]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Together, We Can Make a Difference
          </motion.div>

          {/* PARAGRAPH */}
          <motion.div
            className="font-medium text-xl leading-7 text-center text-[#292524]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Your support empowers us to provide essential resources to those who
            need it most. Join the movement today.
          </motion.div>

          {/* BUTTONS */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Button
              onClick={() => router.push("/campaigns")}
              className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none w-full md:w-fit"
            >
              Donate Now
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-white px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 text-[#104109] w-full md:w-fit"
            >
              Become a Chain Ambassador
            </Button>
          </motion.div>

          {/* PEOPLE INVOLVED */}
          <motion.div
            className="bg-[#FFFFFF4D] rounded-full px-6 py-3 flex items-center gap-4 justify-center w-fit mx-auto"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="flex -space-x-2">
              {/* Circles remain identical */}
              <R2Image
                src="/images/peopleInvolved_0.png"
                alt="People Involved"
                height={40}
                width={40}
                className="w-10 h-10 rounded-full border-2 border-white z-10"
              />
              <R2Image
                src="/images/peopleInvolved_1.png"
                alt="People Involved"
                height={40}
                width={40}
                className="w-10 h-10 rounded-full border-2 border-white z-20"
              />
              <R2Image
                src="/images/peopleInvolved_2.png"
                alt="People Involved"
                height={40}
                width={40}
                className="w-10 h-10 rounded-full border-2 border-white z-30"
              />
              <R2Image
                src="/images/peopleInvolved_3.png"
                alt="People Involved"
                height={40}
                width={40}
                className="w-10 h-10 rounded-full border-2 border-white z-40"
              />
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center z-0">
                <span className="font-bold text-xs leading-4">1k+</span>
              </div>
            </div>

            <div className="flex flex-col">
              <p className="font-bold text-xs leading-4">PEOPLE INVOLVED</p>
              <p className="font-medium text-xs leading-4">
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
