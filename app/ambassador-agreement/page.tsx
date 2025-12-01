"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Handshake,
  Award,
  DollarSign,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn Commissions",
    description:
      "Receive competitive commission rates for every successful campaign you help promote.",
  },
  {
    icon: Users,
    title: "Build Your Network",
    description:
      "Connect with campaign creators and expand your influence in the fundraising community.",
  },
  {
    icon: Award,
    title: "Recognition",
    description:
      "Get featured as a top ambassador and build your reputation as a trusted promoter.",
  },
  {
    icon: Shield,
    title: "Support & Resources",
    description:
      "Access exclusive marketing materials, training, and dedicated support from our team.",
  },
];

const requirements = [
  "Be at least 18 years old",
  "Have an active ChainFundIt account in good standing",
  "Comply with all platform terms and conditions",
  "Maintain ethical promotion practices",
  "Provide accurate information in your application",
];

const responsibilities = [
  "Promote campaigns ethically and transparently",
  "Comply with all applicable laws and regulations",
  "Maintain the integrity of the ChainFundIt brand",
  "Report any suspicious activity or violations",
  "Keep your account information up to date",
];

export default function AmbassadorAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Handshake className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Ambassador Agreement
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Join our ambassador program and earn while helping others achieve their
            fundraising goals.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Introduction */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to the ChainFundIt Ambassador Program
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The ChainFundIt Ambassador Program allows individuals to earn
                commissions by promoting campaigns on our platform. This agreement
                outlines the terms, conditions, and responsibilities for
                participation in the program.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By choosing to become an ambassador, you agree to comply with all
                terms outlined in this agreement, as well as our Terms and
                Conditions and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Program Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="p-3 bg-green-100 rounded-full w-fit mb-4">
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

        {/* Requirements */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Eligibility Requirements
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                To become a ChainFundIt Ambassador, you must meet the following
                requirements:
              </p>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Responsibilities */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ambassador Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                As an ambassador, you agree to:
              </p>
              <ul className="space-y-3">
                {responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Commission Structure */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Commission Structure
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Commission rates are determined based on the set ambassador commission rate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prohibited Activities */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Prohibited Activities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The following activities are strictly prohibited and may result in
                immediate termination from the program:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500">•</span>
                  <span>
                    Using spam, unsolicited emails, or other aggressive marketing
                    tactics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">•</span>
                  <span>
                    Creating fake accounts or engaging in fraudulent activities
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">•</span>
                  <span>
                    Misrepresenting ChainFundIt or our services in any way
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">•</span>
                  <span>
                    Violating any applicable laws or regulations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500">•</span>
                  <span>
                    Engaging in any activity that could harm ChainFundIt&apos;s
                    reputation
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Termination */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Program Termination
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Either party may terminate this agreement at any time with or
                  without cause. ChainFundIt reserves the right to terminate your
                  participation immediately if you violate any terms of this
                  agreement or engage in prohibited activities.
                </p>
                <p>
                  Upon termination, you will receive any earned commissions that
                  were pending at the time of termination, subject to our standard
                  payout terms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Become an Ambassador?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our ambassador program and start earning while making a positive
            impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Start Earning Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

