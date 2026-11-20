"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import "@/components/layout/animations.css";

type HeroSlide = {
  id: string;
  imageUrl: string;
  label: string;
  title: string;
};

const slides: HeroSlide[] = [
  {
    id: "wedding",
    imageUrl: "/images/teamwork.png",
    label: "Wedding gift",
    title: "A gift the whole group can share",
  },
  {
    id: "birthday",
    imageUrl: "/images/coin-jar.jpg",
    label: "Birthday",
    title: "Everyone chips in before the day",
  },
  {
    id: "reunion",
    imageUrl: "/images/welcome.jpg",
    label: "Reunion",
    title: "One pot for the whole get-together",
  },
];

const CollectionsHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { ref: leftRef, isInView: leftInView } = useScrollAnimation();
  const { ref: rightRef, isInView: rightInView } = useScrollAnimation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-jakarta flex items-center justify-center bg-[var(--color-background)] py-20 px-12">
      <div className="flex md:flex-row md:gap-20 flex-col gap-12">
        <div
          ref={leftRef}
          className={`flex flex-col gap-8 md:w-[35rem] w-full text-left transition-all duration-500 ${
            leftInView ? "animate-slide-in-left" : "opacity-0"
          }`}
        >
          <div className="flex py-2 px-4 gap-2 rounded-full bg-white items-center w-fit mb-2">
            <div className="w-2 h-2 rounded-full bg-[#104901] flex-shrink-0"></div>
            <span className="font-bold text-xs leading-4 uppercase">
              Collect money without sharing bank details
            </span>
          </div>
          <h1 className="font-extrabold text-5xl md:text-6xl leading-[1.05]">
            <span className="block text-[#1C1917]">Everyone chips in.</span>
            <span className="block text-[#104109]">Nobody gets left</span>
            <span className="relative inline-block text-[#104109]">
              <span className="relative z-10">with the bill.</span>
              <span className="absolute inset-x-0 -bottom-3 h-3 bg-[#10B9814D] z-0" />
            </span>
          </h1>
          <div className="font-normal text-lg leading-[1.9] text-[#57534E]">
            From weddings and birthdays to group gifts, reunions and special
            occasions, make it easy for everyone to chip in without chasing
            bank transfers or keeping track of who has paid.
          </div>
          <div className="w-full">
            <Button
              asChild
              className="bg-[#104109] w-full px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none justify-center"
            >
              <Link
                href="/collections/create"
                className="flex w-full items-center justify-center gap-2"
              >
                Start a collection <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-8 text-[#78716C] font-medium text-sm leading-5 mt-6">
            <div className="flex items-center gap-2">
              <Shield size={18} color="#78716C" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={18} color="#78716C" />
              <span>Contribute without an account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} color="#78716C" />
              <span>See who paid</span>
            </div>
          </div>
        </div>

        <div
          ref={rightRef}
          className={`transition-all duration-500 ${
            rightInView ? "animate-slide-in-right" : "opacity-0"
          }`}
        >
          <div className="md:w-[35rem] w-full">
            <div className="relative rounded-3xl overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className="relative min-w-full rounded-3xl overflow-hidden"
                  >
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      width={500}
                      height={400}
                      priority={index === 0}
                      className="md:w-[35rem] w-full h-full md:h-[30rem] object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-2xl shadow-xl px-4 py-3">
                      <p className="font-regular text-xs text-[#666] mb-1">
                        <b>{slide.label}</b>
                      </p>
                      <h4 className="font-bold text-base md:text-lg text-black line-clamp-2">
                        {slide.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.id}-dot`}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index
                      ? "w-6 bg-[#104109]"
                      : "w-2 bg-[#D6D3D1]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsHero;
