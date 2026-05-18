"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Globe,
  CheckCircle,
  CirclePlay,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import "@/components/layout/animations.css";

type HeroSlide = {
  id: string;
  imageUrl: string;
  label: string;
  title: string;
  progress: number;
};

const Hero = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [campaignSlides, setCampaignSlides] = useState<HeroSlide[]>([]);

  const { ref: leftRef, isInView: leftInView } = useScrollAnimation();
  const { ref: rightRef, isInView: rightInView } = useScrollAnimation();

  const fallbackSlide: HeroSlide = {
    id: "default-hero-campaign",
    imageUrl: "/images/story-2.png",
    label: "Urgent Cause",
    title: "Hearing aids for Bolu",
    progress: 100,
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchHeroCampaigns = async () => {
      try {
        const response = await fetch(
          "/api/public/hero-campaigns?minProgress=70&maxProgress=100&sourceLimit=300&take=10",
          {
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (!isMounted || !payload?.success || !Array.isArray(payload?.data)) {
          return;
        }
        setCampaignSlides(payload.data);
      } catch {
        // Keep fallback slide if request fails.
      }
    };

    fetchHeroCampaigns();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const slides = useMemo(() => {
    const uniqueById = new Map(
      [fallbackSlide, ...campaignSlides].map((slide) => [slide.id, slide]),
    );
    return Array.from(uniqueById.values());
  }, [campaignSlides]);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (currentSlide > slides.length - 1) {
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length]);

  return (
    <div className="font-jakarta flex items-center justify-center bg-[var(--color-background)] py-20 px-4">
      <div className="flex md:flex-row md:gap-20 flex-col gap-12">
        {/* Left Section */}
        <div
          ref={leftRef}
          className={`flex flex-col gap-8 md:w-[35rem] w-full text-left transition-all duration-500 ${leftInView ? "animate-slide-in-left" : "opacity-0"
            }`}
        >
          {/* Badge */}
          <div className="flex py-2 px-4 gap-2 rounded-full bg-white items-center w-fit mb-2">
            <div className="w-2 h-2 rounded-full bg-[#104901] flex-shrink-0"></div>
            <span className="font-bold text-xs leading-4 uppercase">
              Over 1,000+ active campaigns
            </span>
          </div>
          {/* Heading */}
          <div className="font-extrabold text-5xl md:text-7xl leading-tight">
            <div className="text-[#1C1917]">Raise funds,</div>
            <div className="relative inline-block">
              <span className="relative text-[#104109] md:whitespace-nowrap z-10">
                support dreams.
              </span>

              {/* green bar */}
              <span className="absolute inset-x-0 bottom-[-0.4rem] h-3 bg-[#10B9814D] translate-y-1 z-0" />
            </div>
          </div>
          {/* Subheading */}
          <div className="font-normal text-lg leading-[1.9] text-[#57534E]">
            Support causes you love with a modern fundraising platform built for
            transparency, speed, and global impact.
          </div>
          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={() => router.push("/campaigns")}
              className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none"
            >
              Donate Now <ArrowRight size={20} className="cursor-pointer" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-white px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 text-[#104109] cursor-pointer">
                  <CirclePlay
                    color="#104109"
                    size={20}
                    className="cursor-pointer"
                  />
                  Watch Story
                </Button>
              </DialogTrigger>
              <DialogContent className="md:max-w-2xl max-w-md sm:max-w-2xl p-0 overflow-hidden bg-white flex items-center justify-center">
                <video
                  className="w-[80%] h-auto rounded-lg"
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <source src="/video/story.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </DialogContent>
            </Dialog>
          </div>
          {/* Features */}
          <div className="flex gap-8 text-[#78716C] font-medium text-sm leading-5 mt-6">
            <div className="flex items-center gap-2">
              <Shield size={18} color={"#78716C"} />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={18} color={"#78716C"} />
              <span>Global</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} color={"#78716C"} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Right Section - Image */}
        <div
          ref={rightRef}
          className={`transition-all duration-500 ${rightInView ? "animate-slide-in-right" : "opacity-0"
            }`}
        >
          <div className="md:w-[35rem] w-full">
            <div className="relative rounded-3xl overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={slide.id} className="relative min-w-full rounded-3xl overflow-hidden">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      width={500}
                      height={400}
                      priority={index === 0}
                      className="md:w-[35rem] w-full h-full md:h-[30rem] object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-2xl shadow-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1 gap-3">
                        <p className="font-regular text-xs text-[#666]">
                          <b>{slide.label}</b>
                        </p>
                        <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded-full whitespace-nowrap">
                          {slide.progress}% Funded
                        </span>
                      </div>
                      <h4 className="font-bold text-base md:text-lg text-black line-clamp-1">
                        {slide.title}
                      </h4>
                      <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-[#13C870] rounded-full transition-all duration-700"
                          style={{ width: `${slide.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.id}-dot`}
                    type="button"
                    aria-label={`Go to campaign slide ${index + 1}`}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${currentSlide === index ? "w-6 bg-[#104109]" : "w-2 bg-[#D6D3D1]"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
