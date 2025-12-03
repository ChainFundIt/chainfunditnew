"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, MapPin } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Disclaimers</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Important information about our platform, services, and your
            responsibilities as a user.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Date of Last Revision: November 19, 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* US Disclaimer */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  US Disclaimer (for Fundraising campaigns in the United States)
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  ChainFundIt LLC is a software company helping non-profit
                  organizations manage their donations and helping individuals
                  manage their gifts for events such as weddings, memorials,
                  birthdays and more. Our software includes real-time reporting
                  for any successful donations raised during the campaign, and
                  helps the customers to better manage their campaigns. We are
                  targeting U.S. and international non-profits and individuals
                  with donations/gifts-based events.
                </p>
                <p>
                  ChainFundIt LLC is a For-Profit Organization operating a
                  &quot;Donation-based&quot; Crowdfunding Platform.
                </p>
                <p>Registered in the United States ().</p>
                <p>
                  Please note for fundraising campaigns in the United States of
                  America (&quot;US&quot;), ChainFundIt does not offer
                  &quot;equity&quot; or &quot;lending&quot;-based crowdfunding
                  services, thus is therefore not subject to the United States
                  Securities and Exchange Commission (&quot;US SEC&quot;)
                  regulations for crowdfunding.
                </p>
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500">
                  <p className="text-gray-900 font-semibold">
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
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  UK Disclaimer (for Fundraising campaigns in the United
                  Kingdom)
                </h2>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  ChainFundIt Limited is a For-Profit Organization operating a
                  &quot;Donation-based&quot; Crowdfunding Platform.
                </p>
                <p>Registered in England (13253451)</p>
                <p>
                  Please note ChainFundIt has obtained a no-objection from the
                  Financial Conduct Authority (&quot;FCA&quot;) to operate a
                  &quot;donation&quot;-based crowdfunding platform in the United
                  Kingdom (&quot;UK&quot;).
                </p>
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500">
                  <p className="text-gray-900 font-semibold">
                    WE RESERVE THE RIGHT TO OPEN, EXTEND, SHORTEN OR EVEN CLOSE
                    A FUNDRAISING CAMPAIGN IF WE SUSPECT ANY
                    MISUSE/FRAUDULENT ACTIVITIES.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

