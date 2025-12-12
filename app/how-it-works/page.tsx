import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Users, PenTool, Share2, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-white font-plusjakarta">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#104901] to-[#0a3a01] mt-16 text-white py-20 font-plusjakarta">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-plusjakarta">
            How It <span className="text-[#59AD4A]">Works.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-plusjakarta">
            Learn how to use ChainFundIt to maximize your fundraising success.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 py-20 font-plusjakarta">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-32 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 font-plusjakarta"
              >
                <div className="flex flex-col items-start gap-4 h-full font-plusjakarta">
                  <div className="bg-[#F5F2EA] p-4 rounded-2xl">
                    <Icon className="h-8 w-8 text-[#59AD4A]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#104901] mb-2 font-plusjakarta">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-plusjakarta">
                      {step.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-4">
                    <span className="text-3xl font-bold text-gray-200 font-plusjakarta">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#F5F2EA] py-20 font-plusjakarta">
        <div className="container mx-auto px-4">
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
            <div className="space-y-8 font-plusjakarta">
              <div>
                <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-widest mb-3 bg-[#E5E7EB] w-fit px-4 py-2 rounded-full font-plusjakarta">
                  For Campaign Organizers
                </p>

                <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4 font-plusjakarta">
                  Powerful tools at your fingertips
                </h2>
                <p className="text-base text-gray-600 leading-relaxed font-plusjakarta">
                  Track donations in real-time, send automated thank-you notes,
                  and post updates directly from your dashboard. We give you
                  everything you need to succeed.
                </p>
              </div>

              <ul className="space-y-4 font-plusjakarta">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#59AD4A] flex-shrink-0 mt-1" />
                    <span className="text-base font-bold text-[#1a1a1a] font-plusjakarta">
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
      <div className="container mx-auto px-4 py-20 font-plusjakarta">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#104901] font-plusjakarta">
              Start your campaign
            </h3>
            <ul className="space-y-3 font-plusjakarta">
              {[
                "Set your fundraiser goal",
                "Tell your story",
                "Add a picture",
                "Set your chain commission",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#59AD4A] flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-800 font-plusjakarta">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#104901] font-plusjakarta">
              Share with your network
            </h3>
            <ul className="space-y-3 font-plusjakarta">
              {[
                "Share on social media",
                "Share through emails",
                "Share through text messages",
                "Share with friends and family",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#59AD4A] flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-800 font-plusjakarta">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#104901] font-plusjakarta">
              Manage donations
            </h3>
            <ul className="space-y-3 font-plusjakarta">
              {[
                "Track your donations",
                "Manage your campaign",
                "Thank donors",
                "Withdraw your funds",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-[#59AD4A] flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-gray-800 font-plusjakarta">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#FFFFFF] from-[#104901] to-[#0a3a01] py-20 font-plusjakarta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-8 font-plusjakarta">
            Ready to make a difference?
          </h2>
          <Link href="/dashboard/campaigns/create-campaign">
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-[#59AD4A] text-white font-bold text-lg rounded-full hover:bg-[#4a9339] transition-colors duration-300 shadow-lg hover:shadow-xl font-plusjakarta">
              Start Fundraising <span>→</span>
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}