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
} from "lucide-react";
import Link from "next/link";

const fundraisingIdeas = [
  {
    category: "Events & Activities",
    categoryLabel: "Get Moving Together",
    icon: Sparkles,
    description:
      "Physical events are a great way to build community spirit while raising funds for your cause.",
    ideas: [
      {
        icon: "🏃",
        title: "Charity Walk/Run",
        description:
          "Organize a community walk where participants raise funds through sponsorships.",
        tips: "Set up registration fees and encourage participants to get sponsors.",
      },
      {
        icon: "🎁",
        title: "Bake Sale",
        description:
          "Host a sale with homemade goods. Perfect for schools, communities, or local events.",
        tips: "Get volunteers to bake and set up in high-traffic areas.",
      },
      {
        icon: "🏆",
        title: "Auction Event",
        description:
          "Organize a silent or live auction with donated items from local businesses.",
        tips: "Reach out to local businesses for donations and promote widely.",
      },
      {
        icon: "🎵",
        title: "Talent Show",
        description:
          "Host a music event featuring local artists or community talent.",
        tips: "Charge admission and sell refreshments to maximize fundraising.",
      },
    ],
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-[#1B6B4F] mt-16 text-white py-20 pb-40">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 border border-green-300 rounded-full text-sm font-plusjakarta text-green-200">
            💡 INSPIRATION
          </div>
          <h1 className="text-5xl font-bold mb-6">Fundraising Ideas</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Discover creative and effective ways to engage your community and
            reach your fundraising goals faster.
          </p>
        </div>
      </div>

      <div className="relative -mt-32 z-10">
        <div className="container mx-auto px-4 max-w-full">
          {/* Ideas by Category */}
          {fundraisingIdeas.map((category, categoryIndex) => {
            return (
              <div key={categoryIndex} className="mb-20 mx-4 md:mx-0">
                {/* Category Header - White background */}
                <div className="bg-white rounded-t-3xl p-8 md:p-12">
                  <div className="container mx-auto max-w-full">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-sm font-plusjakarta uppercase tracking-wide mb-2 text-green-600">
                          {category.category}
                        </p>
                        <h2 className="text-4xl font-bold mb-4 text-gray-900">
                          {category.categoryLabel}
                        </h2>
                      </div>
                      <p className="text-gray-600 max-w-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ideas Grid - Grey background with white cards */}
                <div className="bg-gray-100 rounded-b-3xl px-8 md:px-12 py-8 md:py-12">
                  <div className="container mx-auto max-w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {category.ideas.map((idea, ideaIndex) => (
                        <div
                          key={ideaIndex}
                          className="bg-white rounded-2xl p-6"
                        >
                          <div className="text-4xl mb-4">{idea.icon}</div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            {idea.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            {idea.description}
                          </p>
                          <Link
                            href="/create-campaign"
                            className="text-green-600 text-sm font-plusjakarta hover:underline flex items-center gap-1"
                          >
                            LEARN MORE →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Ideas */}
          <div className="bg-white rounded-3xl p-8 md:p-12 mb-20 shadow-lg mx-4 md:mx-auto w-3/4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Quick-Fire Ideas
            </h2>
            <p className="text-gray-600 mb-8">Simple ideas you can start today</p>

            <div className="flex flex-wrap gap-4">
              {quickIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-gray-100 rounded-full text-gray-700 font-medium"
                >
                  {idea}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#1B6B4F] rounded-3xl p-12 text-center text-white mb-20 mx-4 md:mx-0">
            <Gift className="h-12 w-12 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to Turn Your Idea Into Reality?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Start your fundraising campaign today and bring your creative ideas
              to life.
            </p>
            <Link href="/create-campaign">
              <Button className="bg-white text-green-600 rounded-full hover:bg-gray-100 font-plusjakarta py-6 px-8">
                Create Your Campaign
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}