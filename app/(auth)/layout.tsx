"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import ClientToaster from "@/components/ui/client-toaster";
import Navbar from "@/components/layout/Navbar";

const carouselData = [
  {
    image: "/images/signin-1.jpg",
    buttonText: "Create campaigns",
    text: "Start raising funds for causes you love on the Chainfundit platform, using modern tools for fundraising like Stripe, PayPal, Paystack and more to get your funds quickly.",
  },
  {
    image: "/images/signin-2.jpg",
    buttonText: "Chain campaigns",
    text: "Start raising funds for causes you love on the Chainfundit platform, using modern tools for fundraising like Stripe, PayPal, Paystack and more to get your funds quickly.",
  },
  {
    image: "/images/signin-3.jpg",
    buttonText: "Activate tax incentives",
    text: "Start raising funds for causes you love on the Chainfundit platform, using modern tools for fundraising like Stripe, PayPal, Paystack and more to get your funds quickly.",
  },
];

// Optimized carousel slide component
const CarouselSlide = React.memo(
  ({
    item,
    index,
    isActive,
  }: {
    item: (typeof carouselData)[0];
    index: number;
    isActive: boolean;
  }) => (
    <div className="embla__slide flex-[0_0_100%] relative min-w-0 w-full h-full overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      <Image
        src={item.image}
        alt={`Carousel slide ${index + 1}`}
        fill
        sizes="50vw"
        className="object-cover object-center opacity-80"
        priority={index === 0}
        quality={75}
        loading={index === 0 ? "eager" : "lazy"}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-5" />
    </div>
  )
);

CarouselSlide.displayName = "CarouselSlide";

function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Optimized interval management
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (isPlaying) emblaApi.scrollNext();
    }, 5000);

    const handleSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", handleSelect);

    return () => {
      clearInterval(interval);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, isPlaying]);

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="embla w-full h-full" ref={emblaRef}>
        <div className="embla__container flex w-full h-full">
          {carouselData.map((item, index) => (
            <CarouselSlide
              key={item.image}
              item={item}
              index={index}
              isActive={selectedIndex === index}
            />
          ))}
        </div>
      </div>

      {/* Bottom content overlay */}
      <div className="absolute bottom-0 left-0 right-0 text-white z-20 p-8">
        {/* Progress bars */}
        <div className="flex gap-2 mb-6">
          {[0, 1, 2].map((barIdx) => (
            <div
              key={barIdx}
              ref={(el) => {
                progressRefs.current[barIdx] = el;
              }}
              className="h-1 bg-white/40 rounded-full flex-1 overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-500 ease-out ${
                  selectedIndex === barIdx ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Title and description */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold leading-tight">
            {carouselData[selectedIndex].buttonText}
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            {carouselData[selectedIndex].text}
          </p>
        </div>
      </div>
    </div>
  );
}

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex items-center justify-center md:p-6 p-3 my-auto">
        <div className="flex w-full max-w-5xl h-[600px] rounded-3xl overflow-hidden shadow-2xl">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 flex flex-col justify-center bg-white md:px-10 px-2">
            <div className="w-full h-fit">
              <div className="w-full flex flex-col gap-5">{children}</div>
              <ClientToaster />
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="hidden md:flex md:w-1/2 h-full">
            <Carousel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default layout;
