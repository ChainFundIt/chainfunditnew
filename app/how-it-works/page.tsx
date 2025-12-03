import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">How It Works</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Learn how to use ChainFundIt to maximize your fundraising success.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Image
          src="/images/how-it-works.png"
          alt="How It Works"
          width={1000}
          height={1000}
        />
      </div>

      <div className="container mx-auto px-10 py-16 flex md:flex-row gap-5 flex-col items-center justify-center">
        <div className="space-y-3 w-full md:w-1/3">
          <p className="text-2xl font-bold text-[#104901]">
            Start your campaign
          </p>
          <ul className="space-y-3 list-disc list-inside">
            <li className="font-bold text-base text-black list-disc">
              Set your fundraiser goal
            </li>
            <li className="font-bold text-base text-black list-disc">
              Tell your story
            </li>
            <li className="font-bold text-base text-black list-disc">
              Add a picture
            </li>
            <li className="font-bold text-base text-black list-disc">
              Set your chain commission
            </li>
          </ul>
        </div>
        <div className="space-y-3 w-full md:w-1/3">
          <p className="text-2xl font-bold text-[#104901]">
            Share with your network
          </p>
          <ul className="space-y-3 list-disc list-inside">
            <li className="font-bold text-base text-black list-disc">
              Share on social media
            </li>
            <li className="font-bold text-base text-black list-disc">
              Share through emails
            </li>
            <li className="font-bold text-base text-black list-disc">
              Share through text messages
            </li>
            <li className="font-bold text-base text-black list-disc">
              Share with friends and family
            </li>
          </ul>
        </div>
        <div className="space-y-3 w-full md:w-1/3">
          <p className="text-2xl font-bold text-[#104901]">Manage donations</p>
          <ul className="space-y-3 list-disc list-inside">
            <li className="font-bold text-base text-black list-disc">
              Track your donations
            </li>
            <li className="font-bold text-base text-black list-disc">
              Manage your campaign
            </li>
            <li className="font-bold text-base text-black list-disc">
              Thank donors
            </li>
            <li className="font-bold text-base text-black list-disc">
              Withdraw your funds
            </li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
