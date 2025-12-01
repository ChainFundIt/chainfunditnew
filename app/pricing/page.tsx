"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  DollarSign,
  Heart,
  Shield,
  Zap,
  Users,
  ArrowRight,
  Gift,
} from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    price: "0%",
    description: "Perfect for getting started",
    features: [
      "Create unlimited campaigns",
      "Basic campaign management",
      "Standard payment processing",
      "Email support",
      "Campaign analytics",
    ],
    popular: false,
  },
  {
    name: "Standard",
    price: "5%",
    description: "For serious fundraisers",
    features: [
      "Everything in Free",
      "Priority support",
      "Advanced analytics",
      "Custom campaign pages",
      "Social media integration",
      "Donor management tools",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "3%",
    description: "For organizations and charities",
    features: [
      "Everything in Standard",
      "Dedicated account manager",
      "White-label options",
      "API access",
      "Custom branding",
      "Bulk campaign management",
      "Advanced reporting",
    ],
    popular: false,
  },
];

const feeStructure = [
  {
    title: "Platform Fee",
    description:
      "A small percentage of each donation goes to maintaining and improving our platform.",
    icon: DollarSign,
  },
  {
    title: "Payment Processing",
    description:
      "Standard payment processing fees apply (typically 2.9% + £0.30 per transaction).",
    icon: Shield,
  },
  {
    title: "Transparency",
    description:
      "All fees are clearly displayed before you start your campaign. No hidden costs.",
    icon: Check,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Pricing</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Transparent, fair pricing that works for everyone. Start free, upgrade
            as you grow.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Pricing Cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All plans include secure payment processing and 24/7 platform
              access.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-green-500 shadow-xl scale-105"
                    : "border border-gray-200"
                } hover:shadow-lg transition-all duration-200`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-5xl font-bold text-green-600">
                        {plan.price}
                      </span>
                      {plan.price !== "0%" && (
                        <span className="text-gray-600">platform fee</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/create-campaign" className="block">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-900 hover:bg-gray-800"
                      } text-white`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Fee Structure */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Understanding Our Fees
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in complete transparency. Here&apos;s what you need to
              know about our fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feeStructure.map((item, index) => {
              const Icon = item.icon;
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
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  When do I pay the platform fee?
                </h3>
                <p className="text-gray-600">
                  Platform fees are deducted automatically from each donation
                  received. You only pay when you receive funds.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are there any hidden fees?
                </h3>
                <p className="text-gray-600">
                  No hidden fees. The only costs are the platform fee (if
                  applicable) and standard payment processing fees, which are
                  clearly displayed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Do charities get special pricing?
                </h3>
                <p className="text-gray-600">
                  Yes! Registered charities can apply for our Premium plan at
                  reduced rates. Contact us for more information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Gift className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Fundraising?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of fundraisers who trust ChainFundIt to help them
            reach their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-campaign">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                <Heart className="h-5 w-5 mr-2" />
                Create Your Campaign
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

