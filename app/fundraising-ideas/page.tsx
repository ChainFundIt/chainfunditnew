"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Users,
  Music,
  Camera,
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
  HeartIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            Fundraising Ideas
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Discover creative and effective ways to engage your community and
            reach your fundraising goals faster.
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="md:flex hidden  absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>

      <div className="bg-[#104109] font-jakarta">
        <div className="bg-[#fcfaf5] rounded-tr-[48px] rounded-tl-[48px] pt-16 pb-[96px] md:px-0 px-4 flex flex-col items-center justify-center gap-[96px]">
          {/* Events & activities */}
          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex md:flex-row flex-col md:justify-between md:text-left text-center md:items-end gap-2">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  EVENTS & ACTIVITIES
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22] ">
                  Get Moving Together
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full md:text-right text-center">
                Physical events are a great way to build community spirit while
                raising funds for your cause.
              </div>
            </div>

            <div className="flex md:flex-row flex-col gap-6">
              {eventIdeas.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem]  md:items-start items-center md:text-left text-center "
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
          {/* Community engagement */}
          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex md:flex-row flex-col md:justify-between text-center md:text-left md:items-end gap-2">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  Community Engagement
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22]">
                  Build Connections
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full md:text-right">
                Bring people together through meaningful activities while
                inspiring donations for your cause.
              </div>
            </div>

            <div className="flex md:flex-row flex-col gap-6">
              {communityEngagement.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem]  md:items-start items-center md:text-left text-center "
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
          {/* Product Based */}
          <div className="flex flex-col gap-12 md:max-w-[80rem] w-full">
            <div className="flex md:flex-row flex-col md:justify-between text-center md:text-left md:items-end gap-2">
              <div className="flex flex-col gap-2">
                <div className="font-bold text-sm text-[#059669]">
                  Product Based
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-[#022c22]">
                  Create & Sell
                </div>
              </div>
              <div className="text-[#6b7280] text-base md:max-w-[28rem] w-full md:text-right">
                Turn creative products into powerful fundraising tools by
                selling items that support your cause and spread your message.
              </div>
            </div>

            <div className="flex md:flex-row flex-col gap-6">
              {productBased.map((data, index) => {
                return (
                  <div
                    className="bg-white border border-[#f3f4f6] rounded-3xl p-8 gap-4 flex flex-col md:w-[20rem] md:items-start items-center md:text-left text-center "
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

          {/* Creative Campaigns */}
          <div className="bg-[#104109] p-16 rounded-[48px] md:max-w-[80rem] w-full flex items-center justify-center relative">
            <div className="flex md:flex-row flex-col gap-16">
              {/* Left Box */}
              <div className="flex flex-col gap-6 md:text-left text-center md:items-start items-center">
                <div className="bg-[#065f46] flex gap-2 px-4 py-[6px] border border-[#047857] rounded-full w-fit text-[#6ee7b7] font-bold text-xs">
                  CREATIVE CAMPAIGNS
                </div>
                <div className="font-bold text-[36px] leading-[40px] text-white ">
                  Think Outside the Box
                </div>
                <div className="text-base text-[#d1fae5cc]">
                  Use the power of social media and creativity to spread your
                  message further. Virtual campaigns have 3x more reach on
                  average
                </div>
                <Button
                  onClick={() => router.push("/create-campaign")}
                  className="bg-white px-8 py-3 rounded-full h-auto font-bold text-lg leading-7 text-[#104109] w-fit"
                >
                  Start a Campaign
                </Button>
              </div>
              {/* Right  Box */}
              <div className="flex flex-col gap-6">
                <div className="flex md:flex-row flex-col gap-6">
                  <div className="md:py-0 py-6 bg-[#ffffff1a] flex items-center justify-center md:h-[9rem] md:w-[22rem] px-6 rounded-2xl border border-[#ffffff1a]">
                    <div className="flex gap-4 ">
                      <div className="p-2 rounded-lg bg-[#10b98133] w-fit h-fit">
                        <Sparkles color="#6ee7b7" size={20} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="font-bold text-lg text-white">
                          Photo Challenge
                        </div>
                        <div className="text-sm text-[#d1fae5b2]">
                          Create a viral hashtag and challenge friends to post
                          photos and donate
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:py-0 py-6 bg-[#ffffff1a] flex items-center justify-center md:h-[9rem] md:w-[22rem] px-6 rounded-2xl border border-[#ffffff1a]">
                    <div className="flex gap-4 ">
                      <div className="p-2 rounded-lg bg-[#10b98133] w-fit h-fit">
                        <Sparkles color="#6ee7b7" size={20} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="font-bold text-lg text-white">
                          Art Exhibition
                        </div>
                        <div className="text-sm text-[#d1fae5b2]">
                          Showcase local artwork and sell pieces with proceeds
                          going to your cause.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex md:flex-row flex-col gap-6">
                  <div className="md:py-0 py-6 bg-[#ffffff1a] flex items-center justify-center md:h-[9rem] md:w-[22rem] px-6 rounded-2xl border border-[#ffffff1a]">
                    <div className="flex gap-4 ">
                      <div className="p-2 rounded-lg bg-[#10b98133] w-fit h-fit">
                        <Sparkles color="#6ee7b7" size={20} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="font-bold text-lg text-white">
                          Video Series
                        </div>
                        <div className="text-sm text-[#d1fae5b2]">
                          Tell your story over multiple episodes to keep donors
                          engaged and coming back.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:py-0 py-6 bg-[#ffffff1a] flex items-center justify-center md:h-[9rem] md:w-[22rem] px-6 rounded-2xl border border-[#ffffff1a]">
                    <div className="flex gap-4 ">
                      <div className="p-2 rounded-lg bg-[#10b98133] w-fit h-fit">
                        <Sparkles color="#6ee7b7" size={20} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="font-bold text-lg text-white">
                          Virtual Workshop
                        </div>
                        <div className="text-sm text-[#d1fae5b2]">
                          Teach a skill online in exchange for donations to your
                          campaign.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute h-64 w-64 rounded-full bg-[#10b98133] top-0 right-0 blur-[64px]"></div>
          </div>

          {/* Quick-Fire Ideas */}
          <div className="md:max-w-[80rem] bg-white border border-[#f3f4f6]  p-12 rounded-[48px] items-center justify-center shadow-md">
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-2 items-center justify-center">
                <div className="font-bold text-[30px] leading-[36px] text-[#111827]">
                  Quick-Fire Ideas
                </div>
                <div className="text-[#6b7280] text-base">
                  Organize these fun activities for your campaigns
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:w-[74rem] justify-center">
                {quickIdeas.map((data, index) => {
                  return (
                    <div
                      className="rounded-full py-3 px-6 bg-[#f9fafb] border border-[#00000000] font-medium text-base text-[#374151]"
                      key={index}
                    >
                      {data}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Making ur ideas successful */}
          <div className=" flex items-center justify-center md:max-w-[80rem] flex-col gap-8">
            {/* Header */}

            <div className=" font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
              Making Your Ideas Successful
            </div>

            <div className="flex gap-8 flex-wrap justify-center flex-col md:flex-row">
              {/* Card 1 */}
              <div className="md:w-[24rem] h-[20rem] w-full rounded-[40px]  flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#DCFCE7] flex items-center justify-center">
                  <Users size={36} color="#16a34a" />
                </div>
                <div className=" font-bold text-[24px] leading-8 text-[#1C1917]">
                  Build a Team
                </div>
                <div className=" font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  Recruit volunteers to help plan, promote, and execute your
                  fundraising idea.
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:w-[24rem] h-[20rem] w-full rounded-[40px]  flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FEF9C3] flex items-center justify-center">
                  <Camera size={36} color="#ca8a04" />
                </div>
                <div className="font-bold text-[24px] leading-8 text-[#1C1917]">
                  Document Everything
                </div>
                <div className=" font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  Take photos and videos to share on social media and your
                  campaign page.
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:w-[24rem] h-[20rem] w-full rounded-[40px] flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FFEDD5] flex items-center justify-center">
                  <HeartIcon size={36} color="#EA580C" />
                </div>
                <div className=" font-bold text-[24px] leading-8 text-[#1C1917]">
                  Show Impact
                </div>
                <div className="font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  Clearly communicate how funds will be used and the difference
                  they'll make.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
