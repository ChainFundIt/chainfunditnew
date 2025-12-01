"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    icon: Sparkles,
    ideas: [
      {
        title: "Charity Walk/Run",
        description:
          "Organize a community walk or run where participants raise funds through sponsorships.",
        tips: "Set up registration fees and encourage participants to get sponsors.",
      },
      {
        title: "Bake Sale",
        description:
          "Host a bake sale with homemade goods. Perfect for schools, communities, or local events.",
        tips: "Get volunteers to bake and set up in high-traffic areas.",
      },
      {
        title: "Auction Event",
        description:
          "Organize a silent or live auction with donated items from local businesses.",
        tips: "Reach out to local businesses for donations and promote widely.",
      },
      {
        title: "Concert or Talent Show",
        description:
          "Host a music event featuring local artists or community talent.",
        tips: "Charge admission and sell refreshments to maximize fundraising.",
      },
    ],
  },
  {
    category: "Creative Campaigns",
    icon: Camera,
    ideas: [
      {
        title: "Photo Challenge",
        description:
          "Create a social media challenge where participants share photos and donate.",
        tips: "Use a unique hashtag and encourage viral sharing.",
      },
      {
        title: "Art Exhibition",
        description:
          "Showcase local artwork and sell pieces with proceeds going to your cause.",
        tips: "Partner with local artists and galleries for support.",
      },
      {
        title: "Crowdfunding Video Series",
        description:
          "Create engaging video content that tells your story over multiple episodes.",
        tips: "Release episodes weekly to maintain engagement and momentum.",
      },
      {
        title: "Virtual Event",
        description:
          "Host online events like webinars, workshops, or virtual parties.",
        tips: "Charge admission or accept donations during the event.",
      },
    ],
  },
  {
    category: "Community Engagement",
    icon: Users,
    ideas: [
      {
        title: "Community Cleanup",
        description:
          "Organize a neighborhood cleanup and collect donations from participants.",
        tips: "Partner with local organizations and promote environmental impact.",
      },
      {
        title: "Skill-Sharing Workshops",
        description:
          "Offer workshops where people can learn new skills for a donation.",
        tips: "Tap into your network for volunteer instructors.",
      },
      {
        title: "Matching Gift Campaign",
        description:
          "Find a sponsor who will match donations up to a certain amount.",
        tips: "Create urgency by setting a deadline for matching funds.",
      },
      {
        title: "Birthday Fundraiser",
        description:
          "Ask friends and family to donate to your cause instead of giving gifts.",
        tips: "Create a dedicated campaign page and share on social media.",
      },
    ],
  },
  {
    category: "Product-Based",
    icon: Gift,
    ideas: [
      {
        title: "Merchandise Sales",
        description:
          "Create and sell branded merchandise like t-shirts, mugs, or stickers.",
        tips: "Use print-on-demand services to minimize upfront costs.",
      },
      {
        title: "Cookbook",
        description:
          "Compile recipes from community members and sell the cookbook.",
        tips: "Include personal stories with each recipe for added value.",
      },
      {
        title: "Calendar",
        description:
          "Create a themed calendar with photos or artwork and sell it.",
        tips: "Start early to have it ready before the new year.",
      },
      {
        title: "Craft Fair",
        description:
          "Organize a market where local artisans sell their work with a portion going to your cause.",
        tips: "Charge vendor fees and a percentage of sales.",
      },
    ],
  },
];

const quickIdeas = [
  "Organize a car wash in your community",
  "Host a game night with entry fees",
  "Create a sponsored fitness challenge",
  "Organize a book drive and sell donated books",
  "Host a movie night with ticket sales",
  "Create a community garden project",
  "Organize a pet show or parade",
  "Host a themed dinner party",
  "Create a sponsored reading challenge",
  "Organize a sports tournament",
];

export default function FundraisingIdeasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Lightbulb className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fundraising Ideas
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Discover creative and effective fundraising ideas to inspire your next
            campaign.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Ideas by Category */}
        {fundraisingIdeas.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <div key={categoryIndex} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-100 rounded-full">
                  <CategoryIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {category.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.ideas.map((idea, ideaIndex) => (
                  <Card
                    key={ideaIndex}
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {idea.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{idea.description}</p>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-800 mb-1">
                          💡 Pro Tip:
                        </p>
                        <p className="text-sm text-green-700">{idea.tips}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick Ideas List */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Quick Fundraising Ideas
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 bg-white rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <Trophy className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{idea}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <div className="mb-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Making Your Idea Successful
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Build a Team
                  </h3>
                  <p className="text-gray-600">
                    Recruit volunteers to help plan, promote, and execute your
                    fundraising idea.
                  </p>
                </div>
                <div>
                  <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
                    <Camera className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Document Everything
                  </h3>
                  <p className="text-gray-600">
                    Take photos and videos to share on social media and your
                    campaign page.
                  </p>
                </div>
                <div>
                  <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Show Impact
                  </h3>
                  <p className="text-gray-600">
                    Clearly communicate how funds will be used and the difference
                    they&apos;ll make.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Gift className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Turn Your Idea Into Reality?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start your fundraising campaign today and bring your creative ideas to
            life.
          </p>
          <Link href="/create-campaign">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Create Your Campaign
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

