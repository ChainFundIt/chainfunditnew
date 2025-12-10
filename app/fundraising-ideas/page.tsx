"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Heart,
  Users,
  Music,
  Gamepad2,
  Camera,
  Utensils,
  Gift,
  Trophy,
  BookOpen,
  ArrowRight,
  Sparkles,
  Footprints,
  GiftIcon,
  TrophyIcon,
  Sprout,
  Library,
  Handshake,
  Cake,
  Shirt,
  BookCheck,
  Calendar,
  PencilRuler,
} from "lucide-react";
import Link from "next/link";
import BulbIcon from "@/public/icons/BulbIcon";

const fundraisingIdeas = [
  {
    category: "Events & Activities",
    categoryLabel: "Get Moving Together",
    icon: Sparkles,
    description:
      "Physical events are a great way to build community spirit while raising funds for your cause.",
  },
  {
    category: "Creative Campaigns",
    categoryLabel: "Think Outside the Box",
    icon: Camera,
    description:
      "Use the power of social media and creativity to spread your message further. Virtual campaigns have 3x more reach on average.",
    ideas: [
      {
        icon: "📸",
        title: "Photo Challenge",
        description:
          "Create a social media challenge where participants share photos and donate.",
        tips: "Use a unique hashtag and encourage viral sharing.",
      },
      {
        icon: "🎨",
        title: "Art Exhibition",
        description:
          "Showcase local artwork and sell pieces with proceeds going to your cause.",
        tips: "Partner with local artists and galleries for support.",
      },
      {
        icon: "🎬",
        title: "Video Series",
        description:
          "Create engaging video content that tells your story over multiple episodes.",
        tips: "Release episodes weekly to maintain engagement and momentum.",
      },
      {
        icon: "💻",
        title: "Virtual Workshop",
        description:
          "Teach a skill online in exchange for donations to your campaign.",
        tips: "Charge admission or accept donations during the event.",
      },
    ],
  },
  {
    category: "Community Engagement",
    categoryLabel: "Build Connections",
    icon: Users,
    ideas: [
      {
        icon: "🌱",
        title: "Community Cleanup",
        description:
          "Organize a neighborhood cleanup and collect donations from participants.",
        tips: "Partner with local organizations and promote environmental impact.",
      },
      {
        icon: "📚",
        title: "Skill-Sharing",
        description:
          "Offer workshops where people can learn new skills for a donation.",
        tips: "Tap into your network for volunteer instructors.",
      },
      {
        icon: "🤝",
        title: "Matching Gifts",
        description:
          "Find a sponsor who will match donations up to a certain amount.",
        tips: "Create urgency by setting a deadline for matching funds.",
      },
      {
        icon: "🎂",
        title: "Birthday Fundraiser",
        description:
          "Ask friends and family to donate to your cause instead of giving gifts.",
        tips: "Create a dedicated campaign page and share on social media.",
      },
    ],
  },
  {
    category: "Product-Based",
    categoryLabel: "Create & Sell",
    icon: Gift,
    ideas: [
      {
        icon: "👕",
        title: "Merchandise Sales",
        description:
          "Create and sell branded merchandise like t-shirts, mugs, or stickers.",
        tips: "Use print-on-demand services to minimize upfront costs.",
      },
      {
        icon: "📖",
        title: "Cookbook",
        description:
          "Compile recipes from community members and sell the cookbook.",
        tips: "Include personal stories with each recipe for added value.",
      },
      {
        icon: "📅",
        title: "Calendar",
        description:
          "Create a themed calendar with photos or artwork and sell it.",
        tips: "Start early to have it ready before the new year.",
      },
      {
        icon: "🛍️",
        title: "Craft Fair",
        description:
          "Organize a market where local artisans sell their work with a portion going to your cause.",
        tips: "Charge vendor fees and a percentage of sales.",
      },
    ],
  },
];

const eventIdeas = [
  {
    Icon: (
      <div className="bg-[#d8eafe] rounded-2xl p-3 w-fit">
        <Footprints color="#2563eb" size={24} />
      </div>
    ),
    title: "Charity Walk/Run",
    description:
      "Organize a community walk where participants raise funds through sponsorships.",
    tips: "Set up registration fees and encourage participants to get sponsors.",
  },
  {
    Icon: (
      <div className="bg-[#ffedd5] rounded-2xl p-3 w-fit">
        <GiftIcon color="#ea580c" size={24} />
      </div>
    ),
    title: "Bake Sale",
    description:
      "Host a sale with homemade goods. Perfect for schools, communities, or local events.",
    tips: "Get volunteers to bake and set up in high-traffic areas.",
  },
  {
    Icon: (
      <div className="bg-[#f3e8ff] rounded-2xl p-3 w-fit">
        <TrophyIcon color="#9333ea" size={24} />
      </div>
    ),
    title: "Auction Event",
    description:
      "Organize a silent or live auction with donated items from local businesses.",
    tips: "Reach out to local businesses for donations and promote widely.",
  },
  {
    Icon: (
      <div className="bg-[#fce7f3] rounded-2xl p-3 w-fit">
        <Music color="#db2777" size={24} />
      </div>
    ),
    title: "Talent Show",
    description:
      "Host a music event featuring local artists or community talent.",
    tips: "Charge admission and sell refreshments to maximize fundraising.",
  },
];

const communityEngagement = [
  {
    Icon: (
      <div className="bg-[#d8eafe] rounded-2xl p-3 w-fit">
        <Sprout color="#2563eb" size={24} />
      </div>
    ),
    title: "Community Cleanup",
    description:
      "Organize a neighborhood cleanup and collect donations from participants.",
    tips: "Set up registration fees and encourage participants to get sponsors.",
  },
  {
    Icon: (
      <div className="bg-[#ffedd5] rounded-2xl p-3 w-fit">
        <Library color="#ea580c" size={24} />
      </div>
    ),
    title: "Skill-Sharing Workshops",
    description:
      "Offer workshops where people can learn new skills for a donation",
    tips: "Get volunteers to bake and set up in high-traffic areas.",
  },
  {
    Icon: (
      <div className="bg-[#f3e8ff] rounded-2xl p-3 w-fit">
        <Handshake color="#9333ea" size={24} />
      </div>
    ),
    title: "Matching Gift Campaign",
    description:
      "Find a sponsor who will match donations up to a certain amount.",
    tips: "Reach out to local businesses for donations and promote widely.",
  },
  {
    Icon: (
      <div className="bg-[#fce7f3] rounded-2xl p-3 w-fit">
        <Cake color="#db2777" size={24} />
      </div>
    ),
    title: "Birthday Fundraiser",
    description:
      "Ask friends and family to donate to your cause instead of giving gifts.",
    tips: "Charge admission and sell refreshments to maximize fundraising.",
  },
];

const productBased = [
  {
    Icon: (
      <div className="bg-[#d8eafe] rounded-2xl p-3 w-fit">
        <Shirt color="#2563eb" size={24} />
      </div>
    ),
    title: "Merchandise Sales",
    description:
      "Create and sell branded merchandise like t-shirts, mugs, or stickers.",
    tips: "Set up registration fees and encourage participants to get sponsors.",
  },
  {
    Icon: (
      <div className="bg-[#ffedd5] rounded-2xl p-3 w-fit">
        <BookCheck color="#ea580c" size={24} />
      </div>
    ),
    title: "Cookbook",
    description:
      "Compile recipes from community members and sell the cookbook.",
    tips: "Get volunteers to bake and set up in high-traffic areas.",
  },
  {
    Icon: (
      <div className="bg-[#f3e8ff] rounded-2xl p-3 w-fit">
        <Calendar color="#9333ea" size={24} />
      </div>
    ),
    title: "Calendar",
    description: "Create a themed calendar with photos or artwork and sell it.",
    tips: "Reach out to local businesses for donations and promote widely.",
  },
  {
    Icon: (
      <div className="bg-[#fce7f3] rounded-2xl p-3 w-fit">
        <PencilRuler color="#db2777" size={24} />
      </div>
    ),
    title: "Craft Fair",
    description:
      "Organize a market where local artisans sell their work with a portion going to your cause.",
    tips: "Charge admission and sell refreshments to maximize fundraising.",
  },
];

const quickIdeas = [
  "Car wash",
  "Game night",
  "Fitness challenge",
  "Book drive",
  "Movie night",
  "Community garden",
  "Pet show",
  "Dinner party",
  "Reading challenge",
  "Sports tournament",
  "Trivia night",
  "Garage sale",
];

export default function FundraisingIdeasPage() {
  return (
    <div>
      <Navbar />
      {/* Green Header Box */}
      <div className="bg-[#104109] py-[5rem] flex items-center justify-center font-jakarta ">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative">
          <div className="flex gap-2 px-4 py-[6px] border border-[#047857] rounded-full w-fit ">
            <Lightbulb color="#6ee7b7" size={14} />
            <div className="text-[#6ee7b7] font-bold text-xs ">INSPIRATION</div>
          </div>
          <div className="font-extrabold text-white text-[4rem] leading-[4rem]">
            Fundraising Ideas
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Discover creative and effective ways to engage your community and
            reach your fundraising goals faster.
          </div>
          <div className="absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>

      <div className="bg-[#104109]">
        <div className="bg-[#fcfaf5] rounded-tr-[48px] rounded-tl-[48px] pt-16 pb-[96px] md:px-0 px-4 flex flex-col items-center justify-center gap-[96px]">
          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  EVENTS & ACTIVITIES
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22]">
                  Get Moving Together
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full">
                Physical events are a great way to build community spirit while
                raising funds for your cause.
              </div>
            </div>

            <div className="flex gap-6">
              {eventIdeas.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem] "
                    key={index}
                  >
                    {data.Icon}
                    <div className="font-bold text-xl text-[#111827] ">
                      {data.title}
                    </div>
                    <div className="text-[#4b5563] text-sm ">
                      {data.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  Community Engagement
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22]">
                  Build Connections
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full">
                Bring people together through meaningful activities while
                inspiring donations for your cause.
              </div>
            </div>

            <div className="flex gap-6">
              {communityEngagement.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem] "
                    key={index}
                  >
                    {data.Icon}
                    <div className="font-bold text-xl text-[#111827] ">
                      {data.title}
                    </div>
                    <div className="text-[#4b5563] text-sm ">
                      {data.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  Product Based
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22]">
                  Create & Sell
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full">
                Turn creative products into powerful fundraising tools by
                selling items that support your cause and spread your message.
              </div>
            </div>

            <div className="flex gap-6">
              {productBased.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem] "
                    key={index}
                  >
                    {data.Icon}
                    <div className="font-bold text-xl text-[#111827] ">
                      {data.title}
                    </div>
                    <div className="text-[#4b5563] text-sm ">
                      {data.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
