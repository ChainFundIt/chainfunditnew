"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Lightbulb className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fundraising Tips
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Expert strategies and proven techniques to maximize your fundraising
            success.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Tips Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Essential Fundraising Strategies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from successful campaigns and implement these proven strategies
              to reach your fundraising goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <CardContent className="p-6">
                    <div className="p-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl w-fit mb-4">
                      <Icon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{tip.description}</p>
                    <ul className="space-y-2">
                      {tip.tips.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Quick Tips for Success
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Best Practices
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Before Launch
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Prepare all content and visuals in advance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Build your initial support network</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Set up social media accounts and pages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Create a content calendar for updates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  During Campaign
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Post regular updates (at least weekly)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Respond to all comments and messages promptly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Thank donors publicly and privately</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Share milestones and celebrate progress</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Heart className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Campaign?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Put these tips into practice and launch your fundraising campaign
            today.
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

