"use client";
import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import {
  Users,
  PenTool,
  Share2,
  DollarSign,
  CheckCircle,
  Check,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Users,
      title: "Create Account",
      description:
        "A Chainfundit account is created for the fundraising campaign (Campaign creator sets the chain commission paid to the Chain Agents anywhere from 0-10%)",
    },
    {
      icon: PenTool,
      title: "Tell Your Story",
      description:
        "Campaign Creator shares campaign donation link via email, social media, WhatsApp, etc",
    },
    {
      icon: Share2,
      title: "Share & Engage",
      description:
        "Recipients/participants visit the donation page, donate, share or chain the campaign.",
    },
    {
      icon: DollarSign,
      title: "Receive Funds",
      description:
        "All donations across the entire campaign (donations on chain pages included) are paid to the fundraising campaign beneficiaries at specified frequency, or upon request",
    },
  ];

  const features = [
    "Real-time analytics and reporting",
    "Automated email receipts for donors",
    "Social media sharing integrations",
    "24/7 dedicated support team",
  ];

  return (
    <div className="bg-white font-jakarta">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#104109] pt-[5rem] pb-[7rem] flex items-center justify-center">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative z-0">
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            How It <span className="text-[#59AD4A]">Works.</span>
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Learn how to use ChainFundIt to maximize your fundraising success.
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="md:flex hidden  absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="flex justify-center px-4 py-20 ">
        <div className="md:max-w-[80rem] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-32 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 "
              >
                <div className="flex flex-col items-start gap-4 h-full ">
                  <div className="flex justify-between items-center w-full">
                    <div className="bg-[#ECFDF5] p-4 rounded-2xl">
                      <Icon className="h-8 w-8 text-[#59AD4A]" />
                    </div>
                    <span className="text-3xl font-bold text-gray-200 ">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#104901] mb-2 ">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 ">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="flex justify-center px-4 py-20 bg-[#f5f2ea] ">
        <div className="md:max-w-[80rem] w-full container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="flex justify-center">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/howitworks.jpg"
                  alt="Powerful tools"
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8 ">
              <div>
                <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-widest mb-3 bg-[#FFFFFF] w-fit px-4 py-2 rounded-full border border-[#E5E7EB] ">
                  For Campaign Organizers
                </p>

                <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4 ">
                  Powerful tools at your fingertips
                </h2>
                <p className="text-base text-gray-600 leading-relaxed ">
                  Track donations in real-time, send automated thank-you notes,
                  and post updates directly from your dashboard. We give you
                  everything you need to succeed.
                </p>
              </div>

              <ul className="space-y-4 ">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#59AD4A] flex-shrink-0 mt-1" />
                    <span className="text-base font-bold text-[#1a1a1a] ">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Steps Section */}
      <div className="bg-white flex items-center justify-center py-20 px-4">
        <div className="flex md:flex-row flex-col gap-4 md:max-w-[80rem] w-full">
          {/* Start your campaign */}
          <div className="flex flex-col gap-1 border border-[#f3f4f6] rounded-3xl p-5 flex-1 shadow-sm">
            <div className="font-bold text-[#022c22] text-2xl text-center">
              Start your campaign
            </div>
            {[
              "Set your fundraiser goal",
              "Tell your story",
              "Add a picture",
              "Set your chain commission",
            ].map((item, index) => (
              <div
                key={index}
                className="flex rounded-xl p-4 gap-3 items-center bg-white"
              >
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={16} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">{item}</div>
              </div>
            ))}
          </div>
          {/* Share with your network */}
          <div className="flex flex-col gap-1 border border-[#f3f4f6] rounded-3xl p-5 flex-1 shadow-sm">
            <div className="font-bold text-[#022c22] text-2xl text-center">
              Share with your network
            </div>
            {[
              "Share on social media",
              "Share through emails",
              "Share through text messages",
              "Share with friends and family",
            ].map((item, index) => (
              <div
                key={index}
                className="flex rounded-xl p-4 gap-3 items-center bg-white"
              >
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={16} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">{item}</div>
              </div>
            ))}
          </div>
          {/* Manage donations */}
          <div className="flex flex-col gap-1 border border-[#f3f4f6] rounded-3xl p-5 flex-1 shadow-sm">
            <div className="font-bold text-[#022c22] text-2xl text-center">
              Manage donations
            </div>
            {[
              "Track your donations",
              "Manage your campaign",
              "Thank donors",
              "Withdraw your funds",
            ].map((item, index) => (
              <div
                key={index}
                className="flex rounded-xl p-4 gap-3 items-center bg-white"
              >
                <div className="bg-[#d1fae5] p-1 rounded-full">
                  <Check size={16} color="#059669" />
                </div>
                <div className="font-medium text-sm text-[#1f2937]">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#FFFFFF] from-[#104901] to-[#0a3a01] py-20 flex justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="text-3xl md:text-5xl font-bold text-black mb-8 ">
            Ready to make a difference?
          </div>
          <Button
            onClick={() => {}}
            className="py-4 rounded-full h-auto px-8 font-bold text-xl"
          >
            Start Fundraising
            <ArrowRight />
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
