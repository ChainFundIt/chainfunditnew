"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Target,
  Share2,
  Heart,
  Camera,
  MessageSquare,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const tips = [
  {
    icon: Target,
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
    icon: Camera,
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
    icon: MessageSquare,
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
    icon: Share2,
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
    icon: Users,
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
    icon: TrendingUp,
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
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-[#FCFAF5] mt-16 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-yellow-100 rounded-full text-sm font-semibold text-yellow-700 uppercase tracking-wide">
            Expert Advice
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Essential Fundraising Strategies
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn from successful campaigns and implement these proven strategies
            to reach your fundraising goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Main Tips Grid */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              const colors = [
                { bg: "#E0F5E0", text: "#10B981" },
                { bg: "#E0F0FF", text: "#3B82F6" },
                { bg: "#F0E0FF", text: "#8B5CF6" },
                { bg: "#FFE0F0", text: "#EC4899" },
                { bg: "#FFF0E0", text: "#F59E0B" },
                { bg: "#E0F5FF", text: "#06B6D4" },
              ];
              const color = colors[index % 6];

              return (
                <div
                  key={index}
                  className="bg-[#FCFAF5] rounded-2xl p-8"
                >
                  <div className="mb-4">
                    <div
                      className="inline-flex p-3 rounded-full"
                      style={{ backgroundColor: color.bg }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: color.text }}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {tip.description}
                  </p>
                  <ul className="space-y-2">
                    {tip.tips.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips and Best Practices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20]">
          {/* Quick Tips */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Quick Tips for Success
            </h2>
            <div className="space-y-4">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm"
                >
                  <div className="flex justify-center items-center bg-green-100 rounded-full h-7 w-7 mr-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-gray-700 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Best Practices
            </h2>
            <div className="space-y-8">
              {/* Before Launch */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Before Launch
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Prepare all content and visuals in advance
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Build your initial support network
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Set up social media accounts and pages
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Create a content calendar for updates
                    </span>
                  </li>
                </ul>
              </div>

              {/* During Campaign */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  During Campaign
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Post regular updates (at least weekly)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Respond to all comments and messages promptly
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Thank donors publicly and privately
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">
                      Share milestones and celebrate progress
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <Heart className="h-0 w-0 text-red-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Campaign?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Put these tips into practice and launch your fundraising campaign
            today.
          </p>
          <Link href="/dashboard/campaigns/create-campaign">
            <Button className="bg-[#104901] rounded-full text-white hover:bg-[#0a3a01] font-semibold py-6 px-8">
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