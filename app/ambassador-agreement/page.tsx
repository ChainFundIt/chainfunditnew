"use client";

import React, { useState } from "react";
import { Hand } from "lucide-react";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ambassadorAgreementSections } from "./sections";

const tableOfContents = [
  { id: "section-1", label: "1. Interpretation" },
  { id: "section-2", label: "2. Commencement and Duration" },
  { id: "section-3", label: "3. Referrals and Assurance" },
  { id: "section-4", label: "4. Commission and Payment" },
  { id: "section-5", label: "5. Data Protection" },
  { id: "section-6", label: "6. Limitation of Liability" },
  { id: "section-7", label: "7. Termination" },
  { id: "section-8", label: "8. General" },
];


export default function AmbassadorAgreementPage() {
  const [activeSection, setActiveSection] = useState("section-1");

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

      {/* HERO SECTION */}
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
            <Hand className="h-8 w-8 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div className="font-extrabold text-[#022C22] text-[4rem] leading-[4rem] text-center">
            Ambassador Agreement
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Terms & Conditions for Chain Ambassadors
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 py-20 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[80rem] w-full">
          {/* SIDEBAR - TABLE OF CONTENTS */}
          <div className="lg:col-span-1 md:mb-16">
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

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-8">
            {/* CONTRACT DETAILS */}
            <div className="">
              <Card
                style={{
                  borderRadius: "16px",
                  padding: "0",
                  backgroundColor: "#FFFFFF !important",
                }}
              >
                <CardContent className="p-8 ">
                  <h2
                    className=" font-bold"
                    style={{ fontSize: "24px", color: "#1a1a1a" }}
                  >
                    Contract Details
                  </h2>
                  <div
                    style={{ fontSize: "16px", color: "#4b5563" }}
                    className="space-y-2 mt-4 "
                  >
                    <p>
                      <strong>Parties:</strong> ChainFundIt Limited and Chain
                      Ambassador
                    </p>
                    <p>
                      <strong>Effective Date:</strong> Upon acceptance of this
                      Agreement
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      <Link
                        href="mailto:ambassadors@chainfundit.com"
                        style={{ color: "#104901", fontWeight: 600 }}
                      >
                        ambassadors@chainfundit.com
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TERMS & CONDITIONS INTRO */}
            <div className="">
              <Card
                style={{
                  borderRadius: "16px",
                  padding: "0",
                  backgroundColor: "#FFFFFF !important",
                }}
              >
                <CardContent className="p-8 ">
                  <h2
                    className=" font-bold mb-4"
                    style={{ fontSize: "24px", color: "#1a1a1a" }}
                  >
                    Terms & Conditions
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#4b5563",
                      lineHeight: "1.6",
                    }}
                    className=""
                  >
                    This Agreement sets out the terms and conditions under which
                    you may participate as a Chain Ambassador.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* DYNAMIC SECTIONS */}
            {ambassadorAgreementSections.map((section, index) => {
              const Icon = section.icon;
              const isGreenCard = [2, 4, 6].includes(index);

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
                      {/* CARD HEADER */}
                      <div className="flex items-center gap-3 mb-6 ">
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: isGreenCard
                              ? "#1a5a2a"
                              : "#f0fdf4",
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: isGreenCard ? "#FFFFFF" : "#059669",
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

                      {/* SECTION CONTENT */}
                      <div
                        className="space-y-6 "
                        style={{
                          fontSize: "16px",
                          lineHeight: "1.65",
                          color: isGreenCard ? "#FFFFFF" : "#4b5563",
                        }}
                      >
                        {section.content.map((item, idx) => (
                          <div key={idx} className="">
                            {item.subtitle && (
                              <h3
                                className=" mb-2 "
                                style={{
                                  fontSize: "18px",
                                  color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                                }}
                              >
                                {item.subtitle}
                              </h3>
                            )}
                            <div className="text-justify">{item.text}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* REVISION DATE */}
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
