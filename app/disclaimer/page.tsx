"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, MapPin } from "lucide-react";

const tableOfContents = [
  { id: "us-disclaimer", label: "US Disclaimer" },
  { id: "uk-disclaimer", label: "UK Disclaimer" },
];

const disclaimerSections = [
  {
    id: "us-disclaimer",
    title: "US Disclaimer (for Fundraising campaigns in the United States)",
    icon: MapPin,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <p className=" mb-4">
              ChainFundIt LLC is a software company helping non-profit
              organizations manage their donations and helping individuals
              manage their gifts for events such as weddings, memorials,
              birthdays and more. Our software includes real-time reporting for
              any successful donations raised during the campaign, and helps the
              customers to better manage their campaigns. We are targeting U.S.
              and international non-profits and individuals with
              donations/gifts-based events.
            </p>
            <p className=" mb-4">
              ChainFundIt LLC is a For-Profit Organization operating a
              &quot;Donation-based&quot; Crowdfunding Platform.
            </p>
            <p className=" mb-4">Registered in the United States ().</p>
            <p className=" mb-4">
              Please note for fundraising campaigns in the United States of
              America (&quot;US&quot;), ChainFundIt does not offer
              &quot;equity&quot; or &quot;lending&quot;-based crowdfunding
              services, thus is therefore not subject to the United States
              Securities and Exchange Commission (&quot;US SEC&quot;)
              regulations for crowdfunding.
            </p>
            <div
              className="mt-6 p-4 border-l-4"
              style={{
                backgroundColor: "#fef2f2",
                borderColor: "#ef4444",
              }}
            >
              <p className=" " style={{ color: "#1a1a1a" }}>
                WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE A
                FUNDRAISING CAMPAIGN IF WE SUSPECT ANY MISUSE/FRAUDULENT
                ACTIVITIES.
              </p>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "uk-disclaimer",
    title: "UK Disclaimer (for Fundraising campaigns in the United Kingdom)",
    icon: MapPin,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <p className=" mb-4">
              ChainFundIt Limited is a For-Profit Organization operating a
              &quot;Donation-based&quot; Crowdfunding Platform.
            </p>
            <p className=" mb-4">Registered in England (13253451)</p>
            <p className=" mb-4">
              Please note ChainFundIt has obtained a no-objection from the
              Financial Conduct Authority (&quot;FCA&quot;) to operate a
              &quot;donation&quot;-based crowdfunding platform in the United
              Kingdom (&quot;UK&quot;).
            </p>
            <div
              className="mt-6 p-4 border-l-4"
              style={{
                backgroundColor: "#fef2f2",
                borderColor: "#ef4444",
              }}
            >
              <p className=" " style={{ color: "#1a1a1a" }}>
                WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE A
                FUNDRAISING CAMPAIGN IF WE SUSPECT ANY MISUSE/FRAUDULENT
                ACTIVITIES.
              </p>
            </div>
          </>
        ),
      },
    ],
  },
];

export default function DisclaimerPage() {
  const [activeSection, setActiveSection] = useState("us-disclaimer");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="font-jakarta bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="flex justify-center px-4 py-20 bg-[#FCFAF5]">
        {/* Right Corner Blur Overlay */}
        <div
          className="absolute top-0 right-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.2,
          }}
        ></div>

        {/* Left Corner Blur Overlay */}
        <div
          className="absolute top-0 left-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1,
          }}
        ></div>

        {/* Center Content Container */}
        <div className="flex flex-col items-center justify-center gap-6 md:max-w-[80rem] w-full">
          {/* Trophy Icon Badge */}
          <div className="p-3 bg-[#ECFDF5] rounded-xl">
            <Shield className="h-8 w-8 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div className="font-extrabold text-[#022C22] text-[4rem] leading-[4rem] text-center">
            Disclaimers
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Important information about our platform, services, and your
            responsibilities as a user.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-20 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[80rem] w-full">
          {/* Sidebar - Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto ">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 ">
                TABLE OF CONTENTS
              </h3>
              <nav className="space-y-1 ">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors  ${
                      activeSection === item.id
                        ? "bg-green-100 text-green-700 "
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {disclaimerSections.map((section, index) => {
              const Icon = section.icon;
              const isGreenCard = [1].includes(index);

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-20 "
                  onMouseEnter={() => setActiveSection(section.id)}
                >
                  <Card
                    style={{
                      borderRadius: "16px",
                      padding: "0",
                      border: "none",
                    }}
                    className={isGreenCard ? "bg-[#104901]" : "bg-white"}
                  >
                    <CardContent className="p-6 ">
                      <div className="flex items-center gap-3 mb-6 ">
                        <div
                          className="p-3 rounded-full flex items-center justify-center  flex-shrink-0"
                          style={{
                            backgroundColor: "#1a5a2a", // Green background for icon in second card
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: isGreenCard ? "#FFFFFF" : "white",
                            }}
                          />
                        </div>
                        <h2
                          className="font-bold "
                          style={{
                            fontSize: "18px",
                            color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                          }}
                        >
                          {section.title}
                        </h2>
                      </div>
                      <div className="space-y-6 ">
                        {section.content.map((item, contentIdx) => (
                          <div key={contentIdx} className="">
                            {item.subtitle && (
                              <h3
                                className="text-base  mb-3 "
                                style={{
                                  color: isGreenCard ? "#FFFFFF" : "#4b5563",
                                }}
                              >
                                {item.subtitle}
                              </h3>
                            )}
                            {item.text && (
                              <div
                                className="leading-relaxed text-sm "
                                style={{
                                  color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                                }}
                              >
                                {item.text}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Last Revision Date */}
            <div className="w-full flex justify-center">
              <div className="bg-[#ECFDF5] text-sm text-[#059669] h-8 w-fit flex items-center text-center px-2 rounded-md">
                Date of Last Revision: November 19, 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
