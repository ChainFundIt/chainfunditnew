"use client";

import React, { useState, useRef, useEffect } from "react";
import { R2Image } from "@/components/ui/r2-image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Search,
  Stethoscope,
  ShieldIcon,
  CircleCheck,
  Heart,
  Briefcase,
  Gift,
  Users,
  Activity,
  BookOpen,
} from "lucide-react";

import { usePublicCampaigns } from "@/hooks/use-public-campaigns";

import { Button } from "../ui/button";
import BenefitsCarousel from "./BenefitsCarousel";

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

const CAMPAIGN_REASON_FILTERS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Causes", icon: null },
  { value: "Business", label: "Business", icon: <Briefcase size={16} /> },
  { value: "Charity", label: "Charity", icon: <Gift size={16} /> },
  { value: "Community", label: "Community", icon: <Users size={16} /> },
  { value: "Education", label: "Education", icon: <BookOpen size={16} /> },
  { value: "Emergency", label: "Emergency", icon: <Activity size={16} /> },
  { value: "Medical", label: "Medical", icon: <Stethoscope size={16} /> },
];

const Main = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    updateFilters,
  } = usePublicCampaigns({ status: "active", limit: 6 });

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    updateFilters({
      status: "active",
      limit: 6,
      reason: selectedFilter === "all" ? undefined : selectedFilter,
    });
  }, [selectedFilter, updateFilters]);

  // Fetch total users count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch("/api/public/impact-metrics");
        if (response.ok) {
          const data = await response.json();
          setTotalUsers(data.totalUsers || 0);
        }
      } catch (error) {
        console.error("Failed to fetch user count:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUserCount();
  }, []);

  // Format user count for display (e.g., "1k+", "2.5k+", "10k+")
  const formatUserCount = (count: number | null): string => {
    if (count === null || count === 0) return "1k+";
    if (count < 1000) return `${count}+`;
    if (count < 10000) {
      const thousands = (count / 1000).toFixed(1);
      return `${thousands.replace(/\.0$/, "")}k+`;
    }
    const thousands = Math.floor(count / 1000);
    return `${thousands}k+`;
  };

  const campaignList = Array.isArray(campaigns) ? campaigns : [];
  const displayCampaigns = [...campaignList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

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

  const cardDetails = displayCampaigns.map((campaign) => {
    return {
        id: campaign.id,
        slug: campaign.slug,
      title: campaign.title,
      description: campaign.description || "Learn more about this campaign's impact.",
      image: campaign.coverImageUrl || null,
      category: campaign.reason || "Community",
    };  
  });
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
                Browse verified campaigns and find a cause that resonates with
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
                placeholder="Search campaigns..."
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
            {CAMPAIGN_REASON_FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedFilter(item.value)}
                className={`flex gap-2 items-center px-5 py-3 rounded-full font-bold text-sm leading-5 transition-all duration-300 ${
                  selectedFilter === item.value
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>

          {/* Loading / Error handlers */}
          {campaignsLoading && (
            <div className="flex items-center justify-center w-full py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901]"></div>
              <p className="text-[#104901] text-lg ml-4 font-medium">
                Loading Campaigns...
              </p>
            </div>
          )}

          {campaignsError && !campaignsLoading && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <p className="text-red-600 text-center">{campaignsError}</p>
            </div>
          )}

          {/* Campaign Cards */}
          {!campaignsLoading && !campaignsError && cardDetails.length > 0 && (
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
                    router.push(`/campaign/${card.slug}`)
                  }
                >
                  {/* IMAGE SECTION */}
                  <div className="relative overflow-hidden">
                    {/* Show placeholder heart icon when no image, otherwise try to show the image (including clearbit URLs) */}
                    {!card.image ? (
                      <div className="w-[382px] h-[224px] bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center relative">
                        <div className="text-center p-4 relative z-10">
                          <div className="relative inline-block w-full">
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
                      </div>
                      <div className="font-bold text-xl text-[#1C1917] truncate ">
                        {card.title}
                      </div>
                      <div className="font-normal text-sm text-[#78716C]">
                        {card.description.slice(0, 100)}...
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
                          router.push(`/campaign/${card.slug}`);
                        }}
                        className="bg-white px-0 py-3 rounded-full h-auto text-[#104109] font-bold text-base leading-6 border-2 border-transparent hover:border-[#104109] transition-colors"
                      >
                        View Campaign
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!campaignsLoading && !campaignsError && cardDetails.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <p className="text-[#666666] text-center">
                No campaigns available yet. Check back soon.
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
                View More Campaigns
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
                <span className="font-bold text-xs leading-4">
                  {loadingUsers ? "..." : formatUserCount(totalUsers)}
                </span>
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
