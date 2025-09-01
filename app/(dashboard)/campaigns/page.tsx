"use client";

import React, { useState, useEffect, useMemo } from "react";
import LiveCampaigns from "./live";
import PastCampaigns from "./past";
import Chains from "./chains";
import Favourites from "./favourites";
import Comments from "./comments";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useAuth } from "@/hooks/use-auth";
import { isLiveCampaign, isPastCampaign } from "@/lib/utils/campaign-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

const tabs = ["Live", "Past", "Chains", "Favourites", "Comments"];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("Live");
  const { user, loading: authLoading } = useAuth();
  const { campaigns, loading: campaignsLoading, error, fetchCampaigns, updateFilters } = useCampaigns();

  // Filter campaigns to only show those created by the current user
  const userCampaigns = useMemo(() => {
    if (!user?.id) return [];
    return campaigns.filter(campaign => campaign.creatorId === user.id);
  }, [campaigns, user?.id]);

  // Filter campaigns based on active tab - memoized to prevent infinite re-renders
  const filteredCampaigns = useMemo(() => {
    switch (activeTab) {
      case "Live":
        return userCampaigns.filter(campaign => isLiveCampaign(campaign));
      case "Past":
        return userCampaigns.filter(campaign => isPastCampaign(campaign));
      case "Chains":
        // For now, return campaigns that have been chained (you might need to add a chainId field)
        return userCampaigns.filter(campaign => campaign.status === 'active');
      case "Favourites":
        // For now, return empty array (you might need to implement favorites functionality)
        return [];
      case "Comments":
        // For now, return empty array (comments are handled separately)
        return [];
      default:
        return userCampaigns;
    }
  }, [activeTab, userCampaigns]);

  // Fetch campaigns for the current user when the component mounts or user changes
  useEffect(() => {
    console.log('CampaignsPage - useEffect triggered');
    console.log('CampaignsPage - user:', user);
    console.log('CampaignsPage - campaigns:', campaigns);
    if (user?.id && campaigns.length === 0) {
      console.log('CampaignsPage - Fetching campaigns for user:', user.id);
      updateFilters({ creatorId: user.id });
    }
  }, [user?.id, campaigns.length, updateFilters]);

  useEffect(() => {
    console.log('CampaignsPage - authLoading changed:', authLoading);
  }, [authLoading]);

  useEffect(() => {
    console.log('CampaignsPage - campaignsLoading changed:', campaignsLoading);
  }, [campaignsLoading]);

  useEffect(() => {
    console.log('CampaignsPage - error changed:', error);
  }, [error]);

  useEffect(() => {
    console.log('CampaignsPage - activeTab changed:', activeTab);
  }, [activeTab]);

 
  return (
    <div className="w-full flex flex-col gap-8 font-source 2xl:container 2xl:mx-auto p-6 bg-gradient-to-br from-green-50 via-white to-green-50 min-h-screen">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-[#104901] rounded-3xl blur opacity-10"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <h2 className="font-bold text-5xl text-[#104901] mb-6">Campaigns</h2>
          
          {/* Tabs */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl blur opacity-5"></div>
            <div className="relative bg-[#E5ECDE]/80 backdrop-blur-sm rounded-2xl p-2">
              <ul className="flex gap-2 font-medium text-xl text-[#757575]">
                {tabs.map((tab) => (
                  <li
                    key={tab}
                    className={`cursor-pointer px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab 
                        ? "bg-white text-[#104901] shadow-lg transform scale-105" 
                        : "hover:bg-white/50 hover:text-[#104901]"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-[#104901] rounded-3xl blur opacity-5"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
       
          {/* Campaigns Loading State */}
          {!authLoading && campaignsLoading && (
            <div className="flex flex-col items-center justiplfy-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901] mb-4"></div>
              <p className="text-[#104901] text-xl">Loading your campaigns...</p>
            </div>
          )}

          {/* Error State */}
          {!authLoading && !campaignsLoading && error && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-red-600 mb-3">Error Loading Campaigns</h3>
              <p className="text-red-500 text-center mb-4">{error}</p>
              <Button 
                onClick={() => fetchCampaigns()} 
                className="bg-[#104901] hover:bg-[#0d3d01] text-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Not Authenticated State */}
          {!authLoading && !campaignsLoading && !error && !user && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-[#104901] mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-bold text-2xl text-[#104901] mb-3">Please Sign In</h3>
              <p className="text-[#104901] text-center mb-4">You need to be signed in to view your campaigns.</p>
              <Link href="/signin">
                <Button className="bg-[#104901] hover:bg-[#0d3d01] text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* No Campaigns State */}
          {!authLoading && !campaignsLoading && !error && user && userCampaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative inline-block mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-[#104901] rounded-full blur opacity-20"></div>
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-full">
                  <Image src="/images/frame.png" alt="" width={200} height={180} />
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-600 to-[#104901] flex items-center justify-center font-bold text-4xl text-white rounded-2xl shadow-lg">
                    0
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="font-bold text-3xl text-[#104901] mb-3">
                  No campaigns yet
                </h3>
                <p className="font-normal text-xl text-[#104901] opacity-80">
                  Start your fundraising journey by creating your first campaign!
                </p>
              </div>

              <Link href="/create-campaign">
                <Button className="bg-gradient-to-r from-green-600 to-[#104901] text-white hover:from-green-600 hover:to-[#104901] hover:text-white rounded-xl px-8 py-4 hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-semibold text-xl">
                  Create Your First Campaign <Plus size={24} />
                </Button>
              </Link>
            </div>
          )}

          {/* Campaigns Content */}
          {!authLoading && !campaignsLoading && !error && user && userCampaigns.length > 0 && (
            <>
              {activeTab === "Live" && <LiveCampaigns campaigns={filteredCampaigns} />}
              {activeTab === "Past" && <PastCampaigns campaigns={filteredCampaigns} />}
              {activeTab === "Chains" && <Chains campaigns={filteredCampaigns} />}
              {activeTab === "Favourites" && <Favourites campaigns={filteredCampaigns} />}
              {activeTab === "Comments" && <Comments />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
