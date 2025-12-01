"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Heart,
  Users,
  DollarSign,
  Target,
  ArrowRight,
  Filter,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const successStories = [
  {
    id: 1,
    title: "Medical Emergency Fund for Sarah",
    category: "Medical",
    raised: 25000,
    goal: 20000,
    donors: 342,
    image: "🏥",
    story:
      "Sarah's family needed urgent funds for her cancer treatment. Through ChainFundIt, they exceeded their goal in just 3 weeks, allowing Sarah to receive the life-saving treatment she needed.",
    quote: "ChainFundIt gave us hope when we needed it most. The support from strangers turned into a lifeline for our family.",
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
    quote: "This campaign brought our entire community together. We're so grateful for everyone who contributed.",
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
    quote: "The support we received was overwhelming. We're back and stronger than ever!",
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
    quote: "This campaign showed us the power of collective action. Every donation made a difference.",
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
    quote: "Thanks to ChainFundIt, we can now offer sports programs to kids who couldn't afford it before.",
    author: "Community Sports Center",
  },
  {
    id: 6,
    title: "Emergency Relief Fund",
    category: "Disaster Relief",
    raised: 55000,
    goal: 50000,
    donors: 678,
    image: "🆘",
    story:
      "After a natural disaster, a relief fund was set up to help affected families. The campaign exceeded its goal, providing essential supplies and temporary housing for dozens of families.",
    quote: "In our darkest hour, the generosity of strangers gave us hope and helped us rebuild.",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Real stories from real people who've achieved their fundraising goals
            with ChainFundIt.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Filter by Category</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  selectedCategory === category
                    ? "bg-green-600 text-white"
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
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <Card
                key={story.id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 h-48 flex items-center justify-center">
                    <div className="text-8xl">{story.image}</div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-green-600 text-white">
                        {story.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-semibold">Success</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{story.story}</p>

                    <div className="border-t pt-4 mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Raised</span>
                        <span className="font-bold text-green-600">
                          £{story.raised.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Goal</span>
                        <span className="text-gray-700">
                          £{story.goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Donors</span>
                        <span className="text-gray-700">{story.donors}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((story.raised / story.goal) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                      <p className="text-sm text-gray-700 italic mb-2">
                        &quot;{story.quote}&quot;
                      </p>
                      <p className="text-xs text-gray-600 font-semibold">
                        — {story.author}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Heart className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful fundraisers who've achieved their goals
            with ChainFundIt.
          </p>
          <Link href="/create-campaign">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Start Your Campaign
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

