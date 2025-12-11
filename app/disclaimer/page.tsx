"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, MapPin } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-plusjakarta">
      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-green-600 to-[#104901] text-white overflow-hidden rounded-3xl"
        style={{
          width: "1280px",
          height: "350px",
          marginLeft: "80px",
          marginRight: "80px",
          paddingBottom: "96px",
          boxSizing: "border-box"
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
            opacity: 0.2
          }}
        ></div>

        {/* Left Corner Blur Overlay */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1
          }}
        ></div>

        {/* Center Content Container */}
        <div 
          className="relative mx-auto flex flex-col items-center justify-center font-plusjakarta"
          style={{
            width: "896px",
            maxWidth: "896px",
            height: "198.2px",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "80.8px",
            gap: "24px"
          }}
        >
          {/* Shield Icon Badge */}
          <div 
            className="inline-flex items-center justify-center font-plusjakarta"
            style={{
              backgroundColor: "#104109",
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              marginTop: "24px"
            }}
          >
            <Shield className="h-16 w-16 mx-auto mb-5 text-white" />
          </div>

          {/* Main Heading */}
          <div 
            className="flex items-center justify-center font-plusjakarta"
            style={{
              width: "864px",
              height: "60px"
            }}
          >
            <h1 
              className="font-plusjakarta text-center"
              style={{
                fontWeight: 800,
                fontSize: "60px",
                lineHeight: "60px",
                color: "#FFFFFF"
              }}
            >
              Disclaimers
            </h1>
          </div>

          {/* Subheading */}
          <div 
            className="flex items-center justify-center font-plusjakarta"
            style={{
              width: "672px",
              maxWidth: "672px",
              height: "59px"
            }}
          >
            <p 
              className="font-plusjakarta text-center"
              style={{
                fontWeight: 400,
                fontSize: "18px",
                color: "#D1FAE5CC",
                lineHeight: "1.5"
              }}
            >
              Important information about our platform, services, and your responsibilities as a user.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div 
        className="font-plusjakarta"
        style={{
          width: "1440px",
          paddingLeft: "80px",
          paddingRight: "80px",
          paddingTop: "64px",
          paddingBottom: "96px"
        }}
      >
        <div 
          style={{
            width: "1280px",
            maxWidth: "1280px",
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          {/* US Disclaimer */}
          <div className="mb-8 font-plusjakarta">
            <Card style={{ borderRadius: "16px", padding: "0" }}>
              <CardContent className="p-6 font-plusjakarta">
                <div className="flex items-center gap-3 mb-6 font-plusjakarta">
                  <div 
                    className="p-3 rounded-full flex items-center justify-center font-plusjakarta"
                    style={{
                      backgroundColor: "#f0fdf4",
                      width: "48px",
                      height: "48px"
                    }}
                  >
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 
                    className="font-bold font-plusjakarta"
                    style={{
                      fontSize: "18px",
                      color: "#1a1a1a"
                    }}
                  >
                    US Disclaimer (for Fundraising campaigns in the United States)
                  </h2>
                </div>
                <div 
                  className="space-y-4 leading-relaxed font-plusjakarta"
                  style={{ color: "#4b5563" }}
                >
                  <p className="font-plusjakarta">
                    ChainFundIt LLC is a software company helping non-profit
                    organizations manage their donations and helping individuals
                    manage their gifts for events such as weddings, memorials,
                    birthdays and more. Our software includes real-time reporting
                    for any successful donations raised during the campaign, and
                    helps the customers to better manage their campaigns. We are
                    targeting U.S. and international non-profits and individuals
                    with donations/gifts-based events.
                  </p>
                  <p className="font-plusjakarta">
                    ChainFundIt LLC is a For-Profit Organization operating a
                    "Donation-based"; Crowdfunding Platform.
                  </p>
                  <p className="font-plusjakarta">
                    Registered in the United States ().
                  </p>
                  <p className="font-plusjakarta">
                    Please note for fundraising campaigns in the United States of
                    America ("US"), ChainFundIt does not offer
                    "equity" or "lending"-based crowdfunding
                    services, thus is therefore not subject to the United States
                    Securities and Exchange Commission ("US SEC")
                    regulations for crowdfunding.
                  </p>
                  <div 
                    className="mt-6 p-4 border-l-4"
                    style={{
                      backgroundColor: "#fef2f2",
                      borderColor: "#ef4444"
                    }}
                  >
                    <p 
                      className="font-semibold font-plusjakarta"
                      style={{ color: "#1a1a1a" }}
                    >
                      WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE
                      A FUNDRAISING CAMPAIGN IF WE SUSPECT ANY
                      MISUSE/FRAUDULENT ACTIVITIES.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UK Disclaimer */}
          <div className="mb-8 font-plusjakarta">
            <Card style={{ borderRadius: "16px", padding: "0" }}>
              <CardContent className="p-6 font-plusjakarta">
                <div className="flex items-center gap-3 mb-6 font-plusjakarta">
                  <div 
                    className="p-3 rounded-full flex items-center justify-center font-plusjakarta"
                    style={{
                      backgroundColor: "#f0fdf4",
                      width: "48px",
                      height: "48px"
                    }}
                  >
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 
                    className="font-bold font-plusjakarta"
                    style={{
                      fontSize: "18px",
                      color: "#1a1a1a"
                    }}
                  >
                    UK Disclaimer (for Fundraising campaigns in the United Kingdom)
                  </h2>
                </div>
                <div 
                  className="space-y-4 leading-relaxed font-plusjakarta"
                  style={{ color: "#4b5563" }}
                >
                  <p className="font-plusjakarta">
                    ChainFundIt Limited is a For-Profit Organization operating a
                    &quot;Donation-based&quot; Crowdfunding Platform.
                  </p>
                  <p className="font-plusjakarta">
                    Registered in England (13253451)
                  </p>
                  <p className="font-plusjakarta">
                    Please note ChainFundIt has obtained a no-objection from the
                    Financial Conduct Authority (&quot;FCA&quot;) to operate a
                    &quot;donation&quot;-based crowdfunding platform in the United
                    Kingdom (&quot;UK&quot;).
                  </p>
                  <div 
                    className="mt-6 p-4 border-l-4"
                    style={{
                      backgroundColor: "#fef2f2",
                      borderColor: "#ef4444"
                    }}
                  >
                    <p 
                      className="font-semibold font-plusjakarta"
                      style={{ color: "#1a1a1a" }}
                    >
                      WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE
                      A FUNDRAISING CAMPAIGN IF WE SUSPECT ANY
                      MISUSE/FRAUDULENT ACTIVITIES.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last Revision Date */}
          <div className="text-center font-plusjakarta" style={{ color: "#666666", fontSize: "14px", marginTop: "48px" }}>
            <p className="font-plusjakarta">Date of Last Revision: November 19, 2025</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}