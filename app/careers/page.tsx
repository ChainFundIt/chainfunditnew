"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Salary",
    description:
      "We offer competitive compensation packages based on experience and location.",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health insurance and wellness programs to keep you healthy.",
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description:
      "Remote work options and flexible hours to support work-life balance.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Opportunities for professional development and career advancement.",
  },
  {
    icon: Users,
    title: "Great Team",
    description:
      "Work with a passionate, diverse team committed to making a difference.",
  },
  {
    icon: Shield,
    title: "Impact",
    description:
      "Be part of a platform that helps people achieve their fundraising goals.",
  },
];

const values = [
  "Transparency and honesty in everything we do",
  "Commitment to making a positive impact",
  "Innovation and continuous improvement",
  "Diversity and inclusion",
  "Work-life balance and employee wellbeing",
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Briefcase className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Careers</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Join our mission to democratize fundraising and make a positive
            impact on the world.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Why Work With Us */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Work at ChainFundIt?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of crowdfunding, and we need talented
              people like you to help us get there.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-6 text-center">
                    <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our current job openings and find the perfect role for
              you.
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-xl text-gray-600 text-center">
              There are no open positions at the moment. Check back soon!
            </p>
          </div>
        </div>

        {/* No Open Positions Message */}
        <div className="mb-16">
          <Card className="bg-gray-50 border-2 border-gray-200">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Don't see a role that fits?
              </h3>
              <p className="text-gray-600 mb-6">
                We're always looking for talented individuals. Send us your
                resume and we'll keep you in mind for future opportunities.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our team and help us build the future of crowdfunding. We'd
            love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:careers@chainfundit.com">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Contact Us
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
