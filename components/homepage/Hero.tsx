"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, CheckCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import "@/components/layout/animations.css";

const Hero = () => {
  const { ref: leftRef, isInView: leftInView } = useScrollAnimation();
  const { ref: rightRef, isInView: rightInView } = useScrollAnimation();

  return (
    <div className="w-full bg-white">
      <div className="py-12 md:py-20 px-4 md:px-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center justify-between">
          {/* Left Section */}
          <div
            ref={leftRef}
            className={`w-full lg:w-1/2 text-left transition-all duration-500 ${
              leftInView ? "animate-slide-in-left" : "opacity-0"
            }`}
          >
            {/* Badge */}
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-full bg-[#104901] bg-opacity-5 px-3 py-1 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#104901] flex-shrink-0"></div>
                <span className="font-jakarta font-medium text-xs md:text-sm text-[#104901] uppercase tracking-wide">
                  Over 1,000+ active campaigns
                </span>
              </div>
            </div>
            {/* Heading */}
            <h1 className="font-jakarta font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-black leading-tight mb-2">
              Raise funds,
            </h1>
            <h1 className="font-jakarta font-bold text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-[#104901] leading-tight mb-6">
              support dreams.
            </h1>

            {/* Subheading */}
            <p className="font-jakarta font-regular text-sm md:text-base lg:text-lg text-[#666666] mb-8 leading-relaxed max-w-sm lg:max-w-md">
              Support causes you love with a modern fundraising platform built
              for transparency, speed, and global impact.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-12">
              <Button
                onClick={() => (window.location.href = "/campaigns")}
                className="px-6 md:px-8 py-3 md:py-3 bg-[#0d5e0f] text-white font-semibold text-sm md:text-base rounded-full hover:bg-[#0a4709] transition duration-300 flex items-center gap-2 h-auto whitespace-nowrap"
              >
                Donate Now <ArrowRight size={17} />
              </Button>

              {/* Watch Story Button with Container */}
              <div className="relative inline-flex items-center py-2 px-4 text-sm md:text-base font-semibold text-black border-2 border-gray-400 rounded-full hover:bg-gray-100 cursor-pointer">
                {/* Play Button Icon with white circle background and black border */}
                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center mr-2 bg-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    className="text-black"
                  >
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </div>

                {/* Watch Story Text */}
                <span>Watch Story</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 md:gap-6 lg:gap-8">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#104901] flex-shrink-0" />
                <span className="font-jakarta font-medium text-xs md:text-sm text-black">
                  Secure
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#104901] flex-shrink-0" />
                <span className="font-jakarta font-medium text-xs md:text-sm text-black">
                  Global
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle
                  size={18}
                  className="text-[#104901] flex-shrink-0"
                />
                <span className="font-jakarta font-medium text-xs md:text-sm text-black">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - Image */}
          <div
            ref={rightRef}
            className={`w-full lg:w-1/2 flex justify-center items-center transition-all duration-500 ${
              rightInView ? "animate-slide-in-right" : "opacity-0"
            }`}
          >
            <div className="relative w-full max-w-lg lg:max-w-2xl">
              {/* Main Image */}
              <Image
                src="/images/Happy children.png"
                alt="Featured Campaign"
                width={800}
                height={600}
                priority
                className="w-full h-auto object-cover rounded-3xl"
              />

              {/* Overlay Card */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white rounded-2xl shadow-xl px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-jakarta font-regular text-xs text-[#666]">
                    <b>Urgent Cause</b>
                  </p>

                  <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-2 py-1 rounded-full whitespace-nowrap">
                    85% Funded
                  </span>
                </div>

                <h4 className="font-jakarta font-bold text-lg text-black">
                  Hearing aids for Bolu
                </h4>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-[#13C870] rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
