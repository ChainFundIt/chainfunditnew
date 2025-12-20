"use client";

import { Button } from "@/components/ui/button";
import { Airplay, ArrowRight, Key, Send, Zap, Shield, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils/currency";
import { useGeolocation } from "@/hooks/use-geolocation";

type Props = {};

type ImpactMetrics = {
  donationsCompleted: number;
  campaignsPublicActive: number;
  countriesReached: number;
  distinctDonors: number;
  amountRaised: {
    currency: string;
    amount: number;
    originalCurrency: "GBP";
    originalAmount: number;
  };
  updatedAt: string;
};

const CTA = (props: Props) => {
  const [stats, setStats] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { geolocation } = useGeolocation();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/public/impact-metrics?currency=${geolocation?.currency}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch impact metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      const millions = num / 1000000;
      return `${millions >= 10 ? Math.floor(millions) : millions.toFixed(1)}M+`;
    } else if (num >= 1000) {
      const thousands = num / 1000;
      return `${thousands >= 10 ? Math.floor(thousands) : thousands.toFixed(1)}K+`;
    }
    return `${num}+`;
  };

  const formatCurrencyAmount = (amount: number, currency: string): string => {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      const formatted = millions >= 10 
        ? Math.floor(millions).toLocaleString()
        : millions.toFixed(1);
      const symbol = getCurrencySymbol(currency);
      return `${symbol}${formatted}M+`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      const formatted = thousands >= 10 
        ? Math.floor(thousands).toLocaleString()
        : thousands.toFixed(1);
      const symbol = getCurrencySymbol(currency);
      return `${symbol}${formatted}K+`;
    }
    return formatCurrency(amount, currency);
  };
  return (
    <div className="w-full py-16 md:py-12 flex items-center justify-center flex-col">
      {/* Main CTA Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl shadow-lg border border-emerald-100 overflow-hidden max-w-[80rem]">
        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="flex-1 space-y-8">
              {/* Heading */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Start Your Campaign Today</span>
                </div>
                <h3 className="font-bold text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                  Start fundraising in minutes the easy, secure way
                </h3>
                <p className="text-lg text-gray-600">
                  Join thousands of people raising money for causes they care about
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 mb-1">
                      Simple as ABC
                    </p>
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Donate the one-click way with our streamlined process
                    </span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Airplay className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 mb-1">
                      AI-Powered
                    </p>
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Get AI suggestions to create your compelling fundraising story
                    </span>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900 mb-1">
                      Bank-Level Security
                    </p>
                    <span className="text-sm text-gray-600 leading-relaxed">
                      Donations secured by our trusted payment processing partners
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right CTA Button */}
            <div className="w-full lg:w-auto flex-shrink-0">
              <Button 
                className="w-full lg:w-64 h-16 bg-[#104901] hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                No credit card required
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="bg-white border-t border-gray-200">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="px-6 py-4 text-center">
              {stats && (
                <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                  {formatCurrencyAmount(stats?.amountRaised?.amount || 0, geolocation?.currency as string)}+
                </p>
              )}
              <p className="text-xs md:text-sm text-gray-600 mt-1">Total Raised</p>
            </div>
            <div className="px-6 py-4 text-center">
              {stats && (
                <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                  {formatNumber(stats?.campaignsPublicActive || 0)}
                </p>
              )}
              <p className="text-xs md:text-sm text-gray-600 mt-1">Active Campaigns</p>
            </div>
            <div className="px-6 py-4 text-center">
              {stats && (
                <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                  {formatNumber(stats?.distinctDonors || 0)}
                </p>
              )}
              <p className="text-xs md:text-sm text-gray-600 mt-1">Happy Donors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Trust Badges */}
      {/* <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">Trusted by organizations worldwide</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50"> */}
          {/* Add your trust badge logos here */}
          {/* <div className="text-gray-400 font-semibold">STRIPE</div>
          <div className="text-gray-400 font-semibold">PAYPAL</div>
          <div className="text-gray-400 font-semibold">VISA</div>
          <div className="text-gray-400 font-semibold">MASTERCARD</div>
        </div>
      </div> */}
    </div>
  );
};

export default CTA;