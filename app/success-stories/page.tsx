"use client";

import React, { useState } from "react";
import {
  Trophy,
  Users,
  DollarSign,
  Target,
  Filter,
  CheckCircle,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const successStories = [
  {
    id: 1,
    title: "Medical Emergency Fund for Sarah",
    category: "Medical",
    raised: 25000,
    goal: 20000,
    donors: 342,
    image: "🥗",
    story:
      "Sarah's family needed urgent funds for her cancer treatment. Through ChainFundIt, they exceeded their goal in just 3 weeks, allowing Sarah to receive the life-saving treatment she needed.",
    quote:
      "ChainFundIt gave us hope when we needed it most. The support from strangers turned into a lifeline for our family.",
    author: "Sarah's Family",
  },
  {
    id: 2,
    title: "Community School Renovation",
    category: "Education",
    raised: 45000,
    goal: 40000,
    donors: 567,
    image: "🏫",
    story:
      "A local community came together to renovate their aging school building. The campaign not only reached its goal but exceeded it, enabling additional improvements to the playground and library.",
    quote:
      "This campaign brought our entire community together. We're so grateful for everyone who contributed.",
    author: "Principal Johnson",
  },
  {
    id: 3,
    title: "Small Business Recovery Fund",
    category: "Business",
    raised: 18000,
    goal: 15000,
    donors: 189,
    image: "💼",
    story:
      "After a devastating fire, a local bakery needed funds to rebuild. The community rallied behind them, helping them reopen and continue serving their delicious treats.",
    quote:
      "The support we received was overwhelming. We're back and stronger than ever!",
    author: "Maria's Bakery",
  },
  {
    id: 4,
    title: "Wildlife Conservation Project",
    category: "Environment",
    raised: 32000,
    goal: 30000,
    donors: 423,
    image: "🌳",
    story:
      "A conservation group raised funds to protect a local forest area from development. The campaign raised awareness and funds, leading to the area being designated as protected land.",
    quote:
      "This campaign showed us the power of collective action. Every donation made a difference.",
    author: "Green Earth Initiative",
  },
  {
    id: 5,
    title: "Youth Sports Program",
    category: "Sports",
    raised: 12000,
    goal: 10000,
    donors: 156,
    image: "⚽",
    story:
      "A youth sports program needed funding for equipment and facilities. The campaign enabled them to provide opportunities for over 200 children in the community.",
    quote:
      "Thanks to ChainFundIt, we can now offer sports programs to kids who couldn't afford it before.",
    author: "Community Sports Center",
  },
  {
    id: 6,
    title: "Emergency Relief Fund",
    category: "Disaster Relief",
    raised: 55000,
    goal: 50000,
    donors: 678,
    image: "🚨",
    story:
      "After a natural disaster, a relief fund was set up to help affected families. The campaign exceeded its goal, providing essential supplies and temporary housing for dozens of families.",
    quote:
      "In our darkest hour, the generosity of strangers gave us hope and helped us rebuild.",
    author: "Disaster Relief Committee",
  },
];

const categories = [
  "All Stories",
  "Medical",
  "Education",
  "Business",
  "Environment",
  "Sports",
  "Disaster Relief",
];

const stats = [
  { label: "Campaigns Funded", value: "500+", icon: Target },
  { label: "Total Raised", value: "£2.5M+", icon: DollarSign },
  { label: "Active Donors", value: "10,000+", icon: Users },
  { label: "Success Rate", value: "85%", icon: Trophy },
];

export default function SuccessStoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Stories");

  const filteredStories =
    selectedCategory === "All Stories"
      ? successStories
      : successStories.filter((story) => story.category === selectedCategory);

  return (
    <div className="font-jakarta bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative flex justify-center px-4 py-20 bg-[#FCFAF5]">
        {/* Right Corner Blur Overlay */}
        <div
          className="absolute top-0 right-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.2,
          }}
        ></div>

        {/* Left Corner Blur Overlay */}
        <div
          className="absolute top-0 left-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1,
          }}
        ></div>

        {/* Center Content Container */}
        <div className="flex flex-col items-center justify-center gap-6 md:max-w-[80rem] w-full">
          {/* Trophy Icon Badge */}
          <div className="p-3 bg-[#ECFDF5] rounded-xl">
            <Trophy className="h-8 w-8 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div className="font-extrabold text-[#022C22] text-[4rem] leading-[4rem] text-center">
            Success Stories
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Real stories from real people who've achieved their fundraising
            goals with ChainFundIt.
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex justify-center px-4 pt-20 pb-12 bg-white">
        <div className="flex flex-row flex-wrap items-center justify-center gap-6 md:max-w-[80rem] w-full">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                className="border border-[#f3f4f6] rounded-2xl md:w-[16rem] w-full h-[12rem] py-8 px-16 text-center flex flex-col gap-5 items-center shadow-sm"
                key={index}
              >
                <div className="p-3 bg-[#ECFDF5] rounded-xl w-fit">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-bold text-xl text-[##022C22]">
                  {stat.value}
                </div>
                <div className="text-sm text-[#6B7280]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="flex flex-col items-center px-4 py-20 bg-white gap-12">
        {/* Category Filter */}
       <div className="flex flex-col flex-wrap items-center md:items-start justify-center gap-6 md:max-w-[80rem] w-full">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2
              className="text-2xl font-bold text-[#1a1a1a]"
            >
              Filter by Category
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors  ${
                  selectedCategory === category
                    ? "bg-[#104109] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Success Stories Grid */}
       <div className="flex flex-row flex-wrap items-center justify-center gap-6 md:max-w-[80rem] w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
            {filteredStories.map((story) => (
              <Card
                key={story.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden "
                style={{
                  borderRadius: "24px",
                }}
              >
                <CardContent className="p-0 ">
                  <div
                    className="bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center "
                    style={{
                      height: "192px",
                    }}
                  >
                    <div style={{ fontSize: "80px" }}>{story.image}</div>
                  </div>
                  <div className="p-6 ">
                    <div className="flex items-center justify-between mb-3 ">
                      <Badge className="bg-green-600 text-white ">
                        {story.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-green-600 ">
                        <CheckCircle className="h-4 w-4" />
                        <span
                          className=""
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Success
                        </span>
                      </div>
                    </div>
                    <h3
                      className=" mb-3 line-clamp-2"
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#000000ff",
                      }}
                    >
                      {story.title}
                    </h3>
                    <p
                      className="mb-4 line-clamp-3 "
                      style={{
                        fontSize: "14px",
                        color: "#000000ff",
                        lineHeight: "1.5",
                      }}
                    >
                      {story.story}
                    </p>

                    <div className="border-t pt-4 mb-4 ">
                      <div className="flex items-center justify-between text-sm mb-2 ">
                        <span className="" style={{ color: "#666666" }}>
                          Raised
                        </span>
                        <span
                          className=""
                          style={{
                            fontWeight: 700,
                            color: "#059669",
                          }}
                        >
                          £{story.raised.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2 ">
                        <span className="" style={{ color: "#666666" }}>
                          Goal
                        </span>
                        <span className="" style={{ color: "#4b5563" }}>
                          £{story.goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm ">
                        <span className="" style={{ color: "#666666" }}>
                          Donors
                        </span>
                        <span className="" style={{ color: "#4b5563" }}>
                          {story.donors}
                        </span>
                      </div>
                      <div
                        className="w-full bg-gray-200 rounded-full mt-3 "
                        style={{ height: "8px" }}
                      >
                        <div
                          className="bg-green-600 rounded-full "
                          style={{
                            height: "8px",
                            width: `${Math.min((story.raised / story.goal) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div
                      className="rounded-lg p-4 border-l-4 border-green-600 "
                      style={{ backgroundColor: "#f0fdf4" }}
                    >
                      <p
                        className="italic mb-2 "
                        style={{
                          fontSize: "14px",
                          color: "#4b5563",
                        }}
                      >
                        &quot;{story.quote}&quot;
                      </p>
                      <p
                        className=" font-bold"
                        style={{
                          fontSize: "12px",
                          color: "#666666",
                        }}
                      >
                        – {story.author}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
