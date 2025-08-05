"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CardDetailsDrawer from "@/components/homepage/CardDetailsDrawer";

const cardDetails = [
  {
    title: "91 Days of Kindness Challenge",
    description:
      "Nigeria is a nation built on resilience, unity, and a love for community. This campaign aims to spread kindness across the country, one act at a time. Join us in making a difference!",
    raised: "₦1,201,000 raised",
    image: "/images/card-img1.png",
    extra: "Goal: ₦2,000,000. Over 500 acts of kindness completed so far!",
    date: "March 24, 2025",
    timeLeft: "5 days left",
    avatar: "/images/avatar-7.png",
    creator: "Adebola Ajani",
    createdFor: "Ajegunle Children’s Charity",
    percentage: "40%",
    total: "₦3,000,000 total",
    donors: 64,
  },
  {
    title: "Let’s Help Get Jeffrey off the Streets",
    description:
      "Jeffrey has been a recognisable face in Brunswick village. This campaign is dedicated to helping him find a home and a new start. Your support can change a life.",
    raised: "$121,500 raised",
    image: "/images/card-img2.png",
    extra: "Goal: $150,000. Housing secured, now raising for job training.",
    date: "April 28, 2025",
    timeLeft: "12 days left",
    avatar: "/images/avatar-7.png",
    creator: "Adebola Ajani",
    createdFor: "Ajegunle Children’s Charity",
    percentage: "93%",
    total: "₦3,000,000 total",
    donors: 64,
  },
  {
    title: "Support Kamala’s Tuition at West End Primary",
    description:
      "Kamala, our first daughter, won a part-scholarship to attend West End Primary. Help us cover the remaining tuition and give her the education she deserves!",
    raised: "£2,000 raised",
    image: "/images/card-img3.png",
    extra: "Goal: £5,000. 40% funded. Every bit helps Kamala stay in school!",
    date: "June 4, 2025",
    timeLeft: "7 days left",
    avatar: "/images/avatar-7.png",
    creator: "Adebola Ajani",
    createdFor: "Ajegunle Children’s Charity",
    percentage: "13%",
    total: "₦3,000,000 total",
    donors: 64,
  },
  {
    title: "91 Days of Kindness Challenge",
    description:
      "Nigeria is a nation built on resilience, unity, and a love for community. This campaign aims to spread kindness across the country, one act at a time. Join us in making a difference!",
    raised: "₦1,201,000 raised",
    image: "/images/card-img1.png",
    extra: "Goal: ₦2,000,000. Over 500 acts of kindness completed so far!",
    date: "March 24, 2025",
    timeLeft: "5 days left",
    avatar: "/images/avatar-7.png",
    creator: "Adebola Ajani",
    createdFor: "Ajegunle Children’s Charity",
    percentage: "40%",
    total: "₦3,000,000 total",
    donors: 64,
  },
  {
    title: "Support Kamala’s Tuition at West End Primary",
    description:
      "Kamala, our first daughter, won a part-scholarship to attend West End Primary. Help us cover the remaining tuition and give her the education she deserves!",
    raised: "£2,000 raised",
    image: "/images/card-img3.png",
    extra: "Goal: £5,000. 40% funded. Every bit helps Kamala stay in school!",
    date: "June 4, 2025",
    timeLeft: "7 days left",
    avatar: "/images/avatar-7.png",
    creator: "Adebola Ajani",
    createdFor: "Ajegunle Children’s Charity",
    percentage: "13%",
    total: "₦3,000,000 total",
    donors: 64,
  },
];

const Cards = () => {
  const [openCard, setOpenCard] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  const handlePreviousCard = () => {
    if (openCard !== null && openCard > 0) {
      setOpenCard(openCard - 1);
    }
  };

  const handleNextCard = () => {
    if (openCard !== null && openCard < cardDetails.length - 1) {
      setOpenCard(openCard + 1);
    }
  };

  return (
    <div className="p-4 md:p-12 w-full h-fit flex flex-col gap-5 my-5 bg-[#F2F1E9]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
        <section className="flex flex-col gap-2 md:gap-3">
          <p className="font-source font-semibold text-2xl md:text-3xl text-black">
            Many more ways to support others and create life-changing
            experiences.
          </p>
          <span className="font-source font-normal text-base text-black">
            Find campaigns and causes you love, close to you or around the
            world.
          </span>
        </section>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={scrollLeft}
            className="w-12 h-12 bg-[#104901] border-2 border-[#0F4201] rounded-none"
          >
            <ArrowLeft size={32} />
          </Button>
          <Button
            onClick={scrollRight}
            className="w-12 h-12 bg-[#104901] border-2 border-[#0F4201] rounded-none"
          >
            <ArrowRight size={32} />
          </Button>
        </div>
      </div>

      <section className="flex justify-between items-center">
        <Select>
          <SelectTrigger className="w-full md:w-[250px] h-12 md:h-14 px-4 md:px-6 font-source font-normal text-base text-black border-2 border-[#0F4201] rounded-none">
            <SelectValue placeholder="Happening worldwide" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="live campaigns"
              className="capitalize cursor-pointer"
            >
              live campaigns anywhere (worldwide)
            </SelectItem>
            <SelectItem
              value="need momentum"
              className="capitalize cursor-pointer"
            >
              need momentum (campaigns between 0-10%)
            </SelectItem>
            <SelectItem
              value="close to target"
              className="capitalize cursor-pointer"
            >
              close to target (campaigns above 90%)
            </SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Scrollable Cards Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cardDetails.map((card, idx) => (
          <section
            key={idx}
            className="min-w-[300px] md:min-w-[350px] p-2 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setOpenCard(idx)}
          >
            <Image
              src={card.image}
              alt={card.title}
              width={400}
              height={300}
              className="w-full h-40 md:h-60 object-cover"
            />
            <p className="font-source font-medium text-lg md:text-xl text-black">
              {card.title}
            </p>
            <span className="font-source font-normal text-sm md:text-base text-black">
              {card.description.slice(0, 60)}...
            </span>
            <span className="font-medium text-base md:text-lg text-black">
              {card.raised}
            </span>
            <div className="w-full bg-[#FBFBFB] h-2">
              <div
                className="bg-[#104901] h-full transition-all duration-500"
                style={{
                  width: card.percentage
                    ? card.percentage
                    : idx === 0
                    ? "60%"
                    : idx === 1
                    ? "93%"
                    : "13%",
                }}
              ></div>
            </div>
          </section>
        ))}
        <CardDetailsDrawer
          open={openCard !== null}
          onOpenChange={(open) => !open && setOpenCard(null)}
          card={openCard !== null ? cardDetails[openCard] : null}
          currentIndex={openCard !== null ? openCard : 0}
          totalCards={cardDetails.length}
          onPrevious={handlePreviousCard}
          onNext={handleNextCard}
        />
      </div>
    </div>
  );
};

export default Cards;
