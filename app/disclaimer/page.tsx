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
            <p className="font-plusjakarta mb-4">
              ChainFundIt LLC is a software company helping non-profit
              organizations manage their donations and helping individuals
              manage their gifts for events such as weddings, memorials,
              birthdays and more. Our software includes real-time reporting
              for any successful donations raised during the campaign, and
              helps the customers to better manage their campaigns. We are
              targeting U.S. and international non-profits and individuals
              with donations/gifts-based events.
            </p>
            <p className="font-plusjakarta mb-4">
              ChainFundIt LLC is a For-Profit Organization operating a
              &quot;Donation-based&quot; Crowdfunding Platform.
            </p>
            <p className="font-plusjakarta mb-4">
              Registered in the United States ().
            </p>
            <p className="font-plusjakarta mb-4">
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
              <p
                className="font-plusjakarta font-plusjakarta"
                style={{ color: "#1a1a1a" }}
              >
                WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE
                A FUNDRAISING CAMPAIGN IF WE SUSPECT ANY MISUSE/FRAUDULENT
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
            <p className="font-plusjakarta mb-4">
              ChainFundIt Limited is a For-Profit Organization operating a
              &quot;Donation-based&quot; Crowdfunding Platform.
            </p>
            <p className="font-plusjakarta mb-4">
              Registered in England (13253451)
            </p>
            <p className="font-plusjakarta mb-4">
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
              <p
                className="font-plusjakarta font-plusjakarta"
                style={{ color: "#1a1a1a" }}
              >
                WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE
                A FUNDRAISING CAMPAIGN IF WE SUSPECT ANY MISUSE/FRAUDULENT
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-plusjakarta w-full">
      <Navbar />

      {/* Hero Section */}
      <div
        className="relative text-[#000000ff] overflow-hidden rounded-3xl w-full"
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* Right Corner Blur Overlay */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
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
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1,
          }}
        ></div>

        {/* Center Content Container */}
        <div
          className="relative mx-auto flex flex-col items-center justify-center font-plusjakarta"
          style={{
            width: "896px",
            maxWidth: "100%",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "40.8px",
            gap: "24px",
          }}
        >
          {/* Shield Icon Badge */}
          <div
            className="inline-flex items-center justify-center font-plusjakarta"
            style={{
              backgroundColor: "#ECFDF5",
              width: "64px",
              height: "64px",
              borderRadius: "10px",
              marginTop: "26px",
            }}
          >
            <Shield className="h-8 w-8 mx-auto mb-6 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div
            className="flex items-center justify-center font-plusjakarta text-center px-3"
            style={{
              width: "100%",
              maxWidth: "864px",
            }}
          >
            <h1
              className="font-plusjakarta"
              style={{
                fontWeight: 800,
                fontSize: "48px",
                lineHeight: "1.2",
                color: "#000000ff",
              }}
            >
              Disclaimers
            </h1>
          </div>

          {/* Subheading */}
          <div
            className="flex items-center justify-center font-plusjakarta text-center px-2"
            style={{
              width: "100%",
              maxWidth: "672px",
            }}
          >
            <p
              className="font-plusjakarta"
              style={{
                fontWeight: 400,
                fontSize: "18px",
                color: "#4B5563",
                lineHeight: "1.5",
              }}
            >
              Important information about our platform, services, and your
              responsibilities as a user.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full font-plusjakarta px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto font-plusjakarta">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 font-plusjakarta">
                  TABLE OF CONTENTS
                </h3>
                <nav className="space-y-1 font-plusjakarta">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors font-plusjakarta ${
                        activeSection === item.id
                          ? "bg-green-100 text-green-700 font-plusjakarta"
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
            <div className="lg:col-span-3 space-y-8 font-plusjakarta">
              {disclaimerSections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-20 font-plusjakarta"
                    onMouseEnter={() => setActiveSection(section.id)}
                  >
                    <Card
                      style={{
                        backgroundColor: "#104901 !important",  // Force the green background using !important
                        borderRadius: "16px",
                        padding: "0"
                      }}
>
                      <CardContent className="p-6 font-plusjakarta">
                        <div className="flex items-center gap-3 mb-6 font-plusjakarta">
                          <div
                            className="p-3 rounded-full flex items-center justify-center font-plusjakarta flex-shrink-0"
                            style={{
                              backgroundColor: "#1a5a2a", // Green background for icon in second card
                              width: "48px",
                              height: "48px",
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{
                                color: "#FFFFFF", // White color for icon in second card
                              }}
                            />
                          </div>
                          <h2
                            className="font-bold font-plusjakarta"
                            style={{
                              fontSize: "18px",
                              color: "#FFFFFF", // White text for second card
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                        <div className="space-y-6 font-plusjakarta">
                          {section.content.map((item, contentIdx) => (
                            <div key={contentIdx} className="font-plusjakarta">
                              {item.subtitle && (
                                <h3
                                  className="text-base font-plusjakarta mb-3 font-plusjakarta"
                                  style={{
                                    color: "#FFFFFF", // White subtitle text for second card
                                  }}
                                >
                                  {item.subtitle}
                                </h3>
                              )}
                              {item.text && (
                                <div
                                  className="leading-relaxed text-sm font-plusjakarta"
                                  style={{
                                    color: "#FFFFFF", // White text for second card
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
              <div
                className="text-center font-plusjakarta"
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  marginTop: "48px",
                }}
              >
                <span
                  style={{
                    color: "#059669",
                    backgroundColor: "#ECFDF5",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    display: "inline-block",  // Ensures the background only appears behind the text
                  }}
                >
                  Date of Last Revision: November 19, 2025
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
