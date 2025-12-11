import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Share2, DollarSign, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      icon: "create.png",
      title: "Create Account",
      description:
        "A Chainfundit account is created for the fundraising campaign (Campaign creator sets the chain commission paid to the Chain Agents anywhere from 0-10%)",
      number: "01",
    },
    {
      icon: "tellstory.png",
      title: "Tell Your Story",
      description:
        "Campaign Creator shares campaign donation link via email, social media, WhatsApp, etc",
      number: "02",
    },
    {
      icon: "share.png",
      title: "Share & Engage",
      description:
        "Recipients/participants visit the donation page, donate, share or chain the campaign.",
      number: "03",
    },
    {
      icon: "receivefunds.png",
      title: "Receive Funds",
      description:
        "All donations across the entire campaign (donations on chain pages included) are paid to the fundraising campaign beneficiaries at specified frequency, or upon request",
      number: "04",
    },
  ];

  const features = [
    "Real-time analytics and reporting",
    "Automated email receipts for donors",
    "Social media sharing integrations",
    "24/7 dedicated support team",
  ];

  return (
    <div className="font-jakarta">
      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-[#104901] to-[#0a3a01] text-white flex items-center justify-center pt-24 pb-32"
      >
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            How It <span className="text-[#59AD4A]">Works.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Learn how to use ChainFundIt to maximize your fundraising success.
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ marginTop: "-250px", paddingTop: "152px" }} className="flex flex-col items-center">
        {/* Steps Section */}
        <div className="font-jakarta max-w-[80rem]" style={{ paddingLeft: "80px", paddingRight: "80px", position: "relative", zIndex: "10" }}>
          <div className="h-64 flex gap-6 flex-wrap">
            {steps.map((step, index) => (
              <div
                key={index}
                style={{ width: "302px", height: "256.25px" }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300  flex flex-col"
              >
                <div className="flex flex-col h-full  gap-4">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="bg-[#F5F2EA] rounded-2xl flex-shrink-0" style={{ width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Image
                        src={`/images/${step.icon}`}
                        alt={step.title}
                        width={24}
                        height={24}
                      />
                    </div>
                    <span className="text-3xl font-bold text-gray-200 ">
                      {step.number}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-[#104901] mb-2 ">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 ">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-[#F5F2EA] py-20 flex justify-center mt-20 w-full">
          <div className="px-4 max-w-[80rem]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
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
                  <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-widest mb-3 bg-[#E5E7EB] w-fit px-4 py-2 rounded-full ">
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
                      <img 
                        src="/images/tick.png" 
                        alt="Tick" 
                        className="h-6 w-6 flex-shrink-0 mt-1 bg-[#D1FAE5] p-1 rounded-full" 
                      />
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

        {/* CTA Section */}
        <div className="bg-[#FFFFFF] py-20 flex justify-center w-full">
          <div className="px-4 max-w-[80rem] text-center">
            <h2 
              className="text-3xl md:text-5xl font-bold text-black mb-8 "
              style={{
                fontWeight: 700, 
                fontSize: '36px', 
                lineHeight: '40px', 
                letterSpacing: '0%', 
                textAlign: 'center', 
                verticalAlign: 'middle'
              }}
            >
              Ready to make a difference?
            </h2>
            <Link href="/create-campaign">
              <button 
                className="inline-flex items-center justify-center gap-2 px-0 py-0 bg-[#59AD4A] text-white font-bold text-lg rounded-full hover:bg-[#4a9339] transition-colors duration-300 shadow-lg hover:shadow-xl "
                style={{
                  width: '256.84px', 
                  height: '60px', 
                  borderRadius: '9999px', 
                  padding: 0
                }}
              >
                <span 
                  style={{
                    width: '149.12px',
                    height: '22.4px',
                    fontWeight: 700,
                    fontSize: '18px',
                    lineHeight: '22.4px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    display: 'inline-block'
                  }}
                >
                  Start Fundraising
                </span>
                <img 
                  src="./images/arrow.png" 
                  alt="Arrow" 
                  style={{
                    width: '20px',
                    height: '20px',
                    marginLeft: '8px' // You can adjust this space as needed
                  }} 
                />
              </button>
            </Link>
          </div>
</div>
      </div>

      <Footer />
    </div>
  );
}