"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Heart,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Running a Successful Fundraising Campaign",
    excerpt:
      "Learn the essential strategies that top fundraisers use to reach their goals and engage donors effectively.",
    author: "ChainFundIt Team",
    date: "January 15, 2025",
    category: "Fundraising",
    readTime: "5 min read",
    image: "💡",
  },
  {
    id: 2,
    title: "How to Tell Your Story: A Guide to Compelling Campaign Narratives",
    excerpt:
      "Your story is your most powerful tool. Discover how to craft a narrative that resonates with donors and drives action.",
    author: "ChainFundIt Team",
    date: "January 10, 2025",
    category: "Storytelling",
    readTime: "7 min read",
    image: "📖",
  },
  {
    id: 3,
    title: "The Power of Social Media in Modern Fundraising",
    excerpt:
      "Explore how social media platforms can amplify your campaign reach and help you connect with supporters worldwide.",
    author: "ChainFundIt Team",
    date: "January 5, 2025",
    category: "Marketing",
    readTime: "6 min read",
    image: "📱",
  },
  {
    id: 4,
    title: "Understanding Donor Psychology: What Motivates People to Give",
    excerpt:
      "Dive into the psychology behind charitable giving and learn how to create campaigns that inspire generosity.",
    author: "ChainFundIt Team",
    date: "December 28, 2024",
    category: "Psychology",
    readTime: "8 min read",
    image: "🧠",
  },
  {
    id: 5,
    title: "Fundraising for Medical Emergencies: A Complete Guide",
    excerpt:
      "A comprehensive guide to raising funds for medical expenses, including best practices and real-world examples.",
    author: "ChainFundIt Team",
    date: "December 20, 2024",
    category: "Medical",
    readTime: "10 min read",
    image: "🏥",
  },
  {
    id: 6,
    title: "Building Trust: Transparency in Crowdfunding",
    excerpt:
      "Learn why transparency matters in fundraising and how to build trust with your donors through honest communication.",
    author: "ChainFundIt Team",
    date: "December 15, 2024",
    category: "Trust",
    readTime: "6 min read",
    image: "🛡️",
  },
];

const categories = [
  "All Posts",
  "Fundraising",
  "Storytelling",
  "Marketing",
  "Success Stories",
  "Tips & Tricks",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Blog</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Insights, tips, and stories to help you succeed in your fundraising
            journey.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-green-600 hover:text-white transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Card className="overflow-hidden border-2 border-green-200 hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 p-12 flex items-center justify-center">
                <div className="text-8xl">{blogPosts[0].image}</div>
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-green-600 text-white">
                  {blogPosts[0].category}
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {blogPosts[0].author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {blogPosts[0].date}
                  </div>
                  <div>{blogPosts[0].readTime}</div>
                </div>
                <Button className="w-fit bg-green-600 hover:bg-green-700 text-white">
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Blog Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Card
                key={post.id}
                className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 h-48 flex items-center justify-center">
                    <div className="text-6xl">{post.image}</div>
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 bg-green-600 text-white">
                      {post.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </div>
                      <div>{post.readTime}</div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Lightbulb className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get the latest fundraising tips, success stories, and platform
            updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg text-gray-900 flex-1"
            />
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

