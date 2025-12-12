"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Camera,
  TrendingUp,
  Users,
  PanelsLeftBottom,
  PencilLine,
  Check,
} from "lucide-react";

const tips = [
  {
    Icon: (
      <div className="rounded-2xl bg-[#ecfdf5] w-fit p-3 ">
        <PanelsLeftBottom color="#10b981" size={28} />
      </div>
    ),
    title: "Set a Realistic Goal",
    description:
      "Research similar campaigns to determine an appropriate funding goal. Setting a realistic target increases your chances of success and builds donor confidence.",
    tips: [
      "Break down your goal into specific needs",
      "Consider all associated costs",
      "Set milestones for partial funding",
    ],
  },
  {
    Icon: (
      <div className="rounded-2xl bg-[#eff6ff] w-fit p-3 ">
        <Camera color="#3b82f6" size={28} />
      </div>
    ),
    title: "Use Compelling Visuals",
    description:
      "High-quality images and videos can significantly increase engagement and donations. Visual storytelling helps donors connect with your cause.",
    tips: [
      "Use clear, high-resolution photos",
      "Include videos showing your story",
      "Update visuals regularly throughout your campaign",
    ],
  },
  {
    Icon: (
      <div className="rounded-2xl bg-[#faf5ff] w-fit p-3 ">
        <PencilLine color="#a855f7" size={28} />
      </div>
    ),
    title: "Tell Your Story",
    description:
      "A compelling narrative is the heart of a successful campaign. Share your personal connection to the cause and explain why it matters.",
    tips: [
      "Be authentic and personal",
      "Explain the impact of donations",
      "Share updates and progress regularly",
    ],
  },
  {
    Icon: (
      <div className="rounded-2xl bg-[#fff7ed] w-fit p-3 ">
        <Share2 color="#f97316" size={28} />
      </div>
    ),
    title: "Leverage Social Media",
    description:
      "Social media is one of the most powerful tools for spreading awareness. Create a consistent posting schedule and engage with your audience.",
    tips: [
      "Post updates at least 2-3 times per week",
      "Use relevant hashtags",
      "Engage with comments and messages",
      "Share across multiple platforms",
    ],
  },
  {
    Icon: (
      <div className="rounded-2xl bg-[#fdf2f8] w-fit p-3 ">
        <Users color="#ec4899" size={28} />
      </div>
    ),
    title: "Build a Support Network",
    description:
      "Enlist friends, family, and community members to help share your campaign. The more people promoting your cause, the wider your reach.",
    tips: [
      "Create a team of campaign ambassadors",
      "Ask supporters to share on their networks",
      "Organize local events or gatherings",
    ],
  },
  {
    Icon: (
      <div className="rounded-2xl bg-[#ecfeff] w-fit p-3 ">
        <TrendingUp color="#06b6d4" size={28} />
      </div>
    ),
    title: "Track and Optimize",
    description:
      "Monitor your campaign performance and adjust your strategy based on what works. Use analytics to understand your audience better.",
    tips: [
      "Track donation patterns",
      "A/B test different messages",
      "Respond to feedback and adapt",
    ],
  },
];

const quickTips = [
  "Launch your campaign on a Tuesday or Wednesday for better visibility",
  "Send personal thank-you messages to all donors",
  "Create urgency with time-limited milestones",
  "Partner with local businesses or organizations",
  "Use email marketing to reach your existing network",
  "Keep your campaign page updated with fresh content",
];

export default function FundraisingTipsPage() {
  return (
    <div className="font-jakarta">
      <Navbar />
      {/* Header Box */}
      <div className="flex items-center justify-center pt-20  pb-[140px] bg-[#FCFAF5]">
        <div className="flex flex-col gap-6 px-4 items-center justify-center md:max-w-[56rem] text-center">
          <div className="bg-[#fef9c3] rounded-full py-2 px-4 text-[#854D0E] text-xs font-bold flex items-center justify-center">
            EXPERT ADVICE
          </div>
          <div className="font-extrabold md:text-[60px] text-[48px] leading-[60px] text-[#022c22]">
            Essential Fundraising Strategies
          </div>
          <div className="text-lg text-[#4b5563]">
            Learn from successful campaigns and implement these proven
            strategies to reach your fundraising goals
          </div>
        </div>
      </div>

      {/* Boxes */}
      <div className="flex items-center justify-center py-[4rem] px-4">
        <div className="flex flex-col gap-8  w-[82rem] items-center md:items-start">
          <div className="flex md:flex-row flex-col gap-8 flex-wrap">
            {tips.map((data, index) => {
              return (
                <div
                  className="border border-[#f3f4f6] rounded-[32px] w-[26rem] h-[17rem] p-8 flex flex-col gap-5 md:items-start items-center"
                  key={index}
                >
                  {data.Icon}
                  <div className="font-bold text-xl text-[#022c22]">
                    {data.title}
                  </div>
                  <div className="text-sm text-[#4b5563] md:text-left text-center">
                    {data.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tips for success */}
      <div className="bg-[#ecfdf5] py-24 px-4 flex items-center justify-center">
        <div className="w-[70rem] flex gap-16 items-center md:flex-row flex-col ">
          {/* Left container */}
          <div className="flex flex-col gap-6 ">
            <div className="font-bold text-[#022c22] text-[30px] leading-[36px] md:text-left text-center">
              Quick Tips for Success
            </div>
            {quickTips.map((data, index) => {
              return (
                <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                  <div className="bg-[#d1fae5] p-1 rounded-full">
                    <Check size={24} color="#059669" />
                  </div>
                  <div className="font-medium text-sm text-[#1f2937]">
                    {data}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Right Container */}
          <div className=" flex flex-col gap-8 rounded-[40px] p-10 bg-white items-center justify-center shadow-xl">
            <div className="text-[#022c22] font-bold text-2xl">
              Ready to Start?
            </div>
            <div className="text-[#4b5563] text-base text-center">
              Put these tips into practice and launch your fundraising campaign
              today.
            </div>
            <Button className="rounded-2xl h-auto py-4 w-full">
              Create Your Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Best practices */}
      <div className="bg-white flex items-center justify-center py-24 px-4">
        <div className="flex flex-col  justify-center gap-8 w-[70rem]">
          <div className="font-bold text-[#022c22] text-[45px] leading-[48px] text-center">
            Best Practices
          </div>
          <div className="flex md:flex-row flex-col gap-16">
            {/* Before launch */}
            <div className="flex flex-col gap-3 border border-[#f3f4f6] rounded-3xl p-5 flex-1">
              <div className="font-bold text-[#022c22] text-[30px] leading-[36px] text-center">
                Before Launch
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Prepare all content and visuals in advance
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Build your initial support network.
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Set up social media accounts and pages.
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Create a content calendat for updates.
                </div>
              </div>
            </div>
            {/* during campaign */}
            <div className="flex flex-col gap-3 border border-[#f3f4f6] rounded-3xl p-5 flex-1">
              <div className="font-bold text-[#022c22] text-[30px] leading-[36px] text-center">
                During Campaigns
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Post regular updates (atleast weekly).
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Respond to all comments and messages promptly.
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Thank donors publicly and privately.
                </div>
              </div>
              <div className="flex rounded-xl p-4 gap-3 items-center bg-white">
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={24} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">
                  Share milestones and celebrate progress.
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
