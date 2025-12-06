"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { ShieldCheck, Play, Pause, Volume2, VolumeX, Heart, Shield, Globe, Stethoscope, GraduationCap, Home, TreePine, Music, BookOpen, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Health": Stethoscope,
  "Children": Users,
  "Children & Youth": Users,
  "Education": GraduationCap,
  "Community": Home,
  "Environment": TreePine,
  "Arts": Music,
  "Housing": Home,
  "Housing & Shelter": Home,
  "Global": Globe,
  "Disaster Relief": Shield,
  "Hunger & Poverty": Heart,
  "Employment & Training": BookOpen,
};

type Props = {};

const Main = (props: Props) => {
  const images = [
    "/images/main-3.png", 
    "/images/teamwork.png", 
    "/images/secure.png", 
  ];

  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
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

  const toggleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Filter charities based on selected filter
  const filteredCharities = charities.filter((charity) => {
    const category = charity.category?.toLowerCase() ?? "";

    switch (selectedFilter) {
      case "health":
        return (
          category.includes("health") ||
          category.includes("medical")
        );
      case "education":
        return (
          category.includes("education") ||
          category.includes("youth") ||
          category.includes("children")
        );
      case "environment":
        return (
          category.includes("environment") ||
          category.includes("climate") ||
          category.includes("wildlife")
        );
      default:
        return true;
    }
  });

  const displayCharities = filteredCharities.slice(0, 4);

  // Transform charity data to match the expected format
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
      image:
        charity.coverImage ||
        charity.logo ||
        "/images/card-img1.png",
      category: charity.category || "Community",
      country: charity.country || "International",
      focusAreas,
      isVerified: charity.isVerified,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="my-6">
      {/* benefits */}
      <BenefitsCarousel themeOverride="christmas" />
      {/* charity cards */}
      <div className="p-4 md:p-12 w-full h-fit flex flex-col gap-5 my-5 bg-whitesmoke">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
          <section className="flex flex-col gap-2 md:gap-3">
            <p className="font-source font-semibold text-2xl md:text-3xl text-black">
              Discover inspiring charities to support
            </p>
            <span className="font-source font-normal text-base text-black">
              Support verified causes from the Virtual Giving Mall
            </span>
          </section>

          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-full md:w-[250px] h-12 md:h-14 px-4 md:px-6 font-source font-normal text-base text-black border-2 border-brand-green-dark rounded-none">
              <SelectValue placeholder="All charities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="capitalize cursor-pointer">
                All verified charities
              </SelectItem>
              <SelectItem value="health" className="capitalize cursor-pointer">
                Health & medical initiatives
              </SelectItem>
              <SelectItem
                value="education"
                className="capitalize cursor-pointer"
              >
                Education & youth programmes
              </SelectItem>
              <SelectItem
                value="environment"
                className="capitalize cursor-pointer"
              >
                Environment & climate action
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full">
          {/* Loading State */}
          {charitiesLoading && (
            <div className="flex items-center justify-center w-full py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green-dark mb-4"></div>
              <p className="text-brand-green-dark text-xl ml-4">
                Loading charities...
              </p>
            </div>
          )}

          {/* Error State */}
          {charitiesError && !charitiesLoading && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-red-600 mb-3">
                Error Loading Charities
              </h3>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {/* No Charities State */}
          {!charitiesLoading &&
            !charitiesError &&
            cardDetails.length === 0 && (
            <div className="flex flex-col items-center justify-center w-full py-16">
              <div className="text-brand-green-dark mb-4">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-brand-green-dark mb-3">
                No Charities Available
              </h3>
              <p className="text-brand-green-dark text-center">
                Check back later for inspiring charities!
              </p>
            </div>
          )}

          {/* Charity Cards */}
          {!charitiesLoading &&
            !charitiesError &&
            cardDetails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-12">
              {cardDetails.map((card) => {
                const CategoryIcon = categoryIcons[card.category || 'Community'] || Heart;
                return (
                  <Card
                    key={card.id}
                    className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl cursor-pointer"
                    onClick={() =>
                      router.push(`/virtual-giving-mall/${card.slug}`)
                    }
                  >
                    <CardContent className="p-0">
                      {/* Logo Section with Gradient Overlay */}
                      <div
                        className="relative h-48 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
                        style={{
                          backgroundImage: card.image 
                            ? `linear-gradient(135deg, rgba(16, 73, 1, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%), url(${card.image})` 
                            : 'linear-gradient(135deg, rgba(16, 73, 1, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)',
                          backgroundSize: card.image ? 'contain' : 'auto',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Animated gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 via-green-500/0 to-blue-500/0 group-hover:from-green-600/10 group-hover:via-green-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                        
                        {card.image && (
                          <div className="relative z-10">
                            <Image
                              src={card.image}
                              alt={card.title}
                              width={200}
                              height={200}
                              className="object-contain max-w-full max-h-full"
                            />
                          </div>
                        )}
                        
                        {!card.image && (
                          <div className="text-center p-4 relative z-10">
                            <div className="relative inline-block">
                              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                              <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
                                <CategoryIcon className="h-12 w-12 text-white" />
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
                              {card.title}
                            </p>
                          </div>
                        )}
                        
                        {card.isVerified && (
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">Verified</span>
                            </Badge>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute bottom-3 left-3 z-20">
                          <Badge className="bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200 shadow-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-white transition-colors">
                            <CategoryIcon className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-xs font-medium">
                              {card.category || 'Community'}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 bg-white">
                        <div className="mb-5">
                          <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
                            {card.title}
                          </h3>
                          
                          {/* Decorative divider */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="h-0.5 bg-gradient-to-r from-green-500 to-transparent flex-1"></div>
                            <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                            <div className="h-0.5 bg-gradient-to-l from-green-500 to-transparent flex-1"></div>
                          </div>
                        </div>

                        {/* Donate Button with enhanced design */}
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-green-600 to-[#104901] hover:text-white text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-md group/button"
                        >
                          <Link href={`/virtual-giving-mall/${card.slug}`} className="flex items-center justify-center gap-2">
                            <span>Donate Now</span>
                            <Heart className="h-4 w-4 group-hover/button:scale-110 transition-transform duration-300" />
                          </Link>
                        </Button>
                      </div>

                      {/* Bottom accent border */}
                      <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* features*/}
      <div className="px-4 md:px-12 py-6 md:py-10 mt-5">
        <h2 className="font-semibold text-2xl md:text-3xl text-black">
          All you need for a successful fundraiser
        </h2>
        <p className="font-normal text-base text-black">
          Modern, powerful tools to help your fundraisers reach their goals
          quick
        </p>
        <div className="flex flex-col md:flex-row gap-24 md:gap-5 w-full h-fit my-5">
          <section className="bg-[url('/images/main-1.jpg')] bg-cover bg-no-repeat w-full md:w-2/3 h-64 md:h-[500px]">
            <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#fff_100%)] h-full px-2 md:px-4 py-6 md:py-6 flex flex-col gap-3 md:gap-3">
              <div className="w-full md:w-[365px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <Image
                  src="/images/avatar-1.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">You</span>
                  <p className="font-semibold text-base text-black text-wrap">
                    Create a campaign to cover my tuition at Berkshire College.
                    Goal is $24,000.
                  </p>
                </section>
              </div>
              {/* <div className="w-full md:w-[365px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">
                    Chainfundit
                  </span>
                  <p className="font-semibold text-base text-black text-wrap">
                    College sounds like fun. New campaign coming right up...
                  </p>
                </section>
                <Image
                  src="/images/logo.svg"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
              </div> */}

              <div className="flex flex-col gap-1 justify-end mt-4 mb-5 md:my-0 md:mt-auto">
                <p className="font-dm font-medium text-lg md:text-xl text-black -mb-2">
                  AI-powered writing
                </p>
                <span className="font-source font-normal text-base text-black">
                  Create captivating campaign stories with the power of AI
                </span>
              </div>
            </section>
          </section>
          <section className="bg-[url('/images/main-2.jpg')] bg-cover bg-no-repeat w-full md:w-1/3 h-64 md:h-[500px]">
            <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_50%,#fff_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col gap-2 md:gap-3">
              <div className="w-full md:w-[300px] h-fit p-2 md:p-4 rounded-xl bg-white flex items-start gap-2 md:gap-3 font-dm">
                <Image
                  src="/images/avatar-2.png"
                  alt="avatar"
                  width={40}
                  height={40}
                  className="md:w-[50px] md:h-[50px]"
                />
                <section className="flex flex-col gap-1">
                  <span className="font-normal text-base text-black">
                    Children’s Ground
                  </span>
                  <p className="font-semibold text-base text-black text-wrap">
                    Thanks to your support, our building plan has been approved.
                  </p>
                </section>
              </div>

              <div className="flex flex-col gap-1 justify-end mt-auto">
                <p className="font-dm font-medium text-lg md:text-xl text-black">
                  Campaign updates
                </p>
                <span className="font-source font-normal text-base text-black">
                  Inform donors of progress made on your projects
                </span>
              </div>
            </section>
          </section>
        </div>
      </div>
      <div className="px-4 md:px-12 flex flex-col md:flex-row gap-4 md:gap-5 w-full h-fit my-5">
        <section className="w-full md:w-1/3 h-64 md:h-[650px] relative overflow-hidden group">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          >
            <source src="/video/chain-podcast.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Custom controls at the top */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-3 md:px-4 py-2 md:py-3 flex items-center gap-2 md:gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={toggleVideoPlayPause}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label={isVideoPlaying ? "Pause" : "Play"}
            >
              {isVideoPlaying ? (
                <Pause className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Play className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-200 transition-colors p-1"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
              )}
            </button>
          </div>
          <section className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_50%,whitesmoke_100%)] h-full px-2 md:px-4 py-4 md:py-6 pointer-events-none">
            <div className="space-y-1 absolute bottom-2 md:bottom-6 justify-end mt-auto">
              <p className="font-dm font-medium text-lg md:text-xl text-black">
                Video explainers
              </p>
              <span className="font-source font-normal text-base text-black">
                Maximise engagement with campaign videos
              </span>
            </div>
          </section>
        </section>
        <section className="bg-[#F5F5F5] w-full md:w-2/3 h-60 md:h-[650px] ">
          <section className="bg-[linear-gradient(180deg,rgba(255,255,255,0)_70%,#fff_100%)] h-full px-2 md:px-4 py-4 md:py-6 flex flex-col">
            <NotificationsList />

            <div className="flex flex-col gap-1 justify-end mt-auto">
              <p className="font-dm font-medium text-lg md:text-xl text-black">
                Instant notifications
              </p>
              <span className="font-source font-normal text-base text-black">
                Never miss out on any donation, get notifications on-the-go
              </span>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
};

export default Main;
