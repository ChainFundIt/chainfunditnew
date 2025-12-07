"use client";

import React, { useState, useEffect, useMemo } from "react";
import LiveCampaigns from "./live";
import PastCampaigns from "./past";
import Chains from "./chains";
import Favourites from "./favourites";
import Comments from "./comments";
import { useAuth } from "@/hooks/use-auth";
import { Campaign } from "./types";
import { isLiveCampaign, isPastCampaign } from "@/lib/utils/campaign-status";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Link, MessageSquare } from "lucide-react";
import HeartBeat from "@/public/icons/HeartBeat";
import ClockIcon from "@/public/icons/ClockIcon";
import { DonationsIcon } from "@/public/icons/DonationsIcon";

// const tabs = ["Live", "Past", "Chains", "Favourites", "Comments"];

const tabs = [
  { label: "Live", Icon: HeartBeat },
  { label: "Past", Icon: Clock },
  { label: "Chains", Icon: Link },
  { label: "Favourites", Icon: DonationsIcon },
  { label: "Comments", Icon: MessageSquare },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("Live");
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Filter campaigns to only show those created by the current user
  const userCampaigns = useMemo(() => {
    if (!user?.id) return [];
    return campaigns.filter((campaign) => campaign.creatorId === user.id);
  }, [campaigns, user?.id]);

  // Filter campaigns based on active tab
  const filteredCampaigns = useMemo(() => {
    switch (activeTab) {
      case "Live":
        return userCampaigns.filter((campaign) => isLiveCampaign(campaign));
      case "Past":
        return userCampaigns.filter((campaign) => isPastCampaign(campaign));
      case "Chains":
        // Chains tab handles its own data via useChainerDonations hook
        return [];
      case "Favourites":
        // Favourites component handles its own data fetching
        return [];
      case "Comments":
        // For now, return empty array - comments are handled separately
        return [];
      default:
        return userCampaigns;
    }
  }, [activeTab, userCampaigns]);

  // Fetch campaigns from backend
  const fetchCampaigns = async () => {
    if (!user?.id) return;

    try {
      setCampaignsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("creatorId", user.id);
      params.append("limit", "50");

      const response = await fetch(`/api/dashboard/campaigns`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns || []);
      } else {
        setError(data.error || "Failed to load campaigns");
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setError("Failed to load campaigns");
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Fetch campaigns when user is available
  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchCampaigns();
    }
  }, [user?.id, authLoading]);

  return (
    <div className="bg-[#F0F7Ef] p-6 font-jakarta md:min-h-[calc(100vh-122px)] min-h-[calc(100vh-149px)]">
      <div className="flex flex-col gap-7">
        {/* Campaign Heading */}
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-5">
          <div className="flex flex-col">
            <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
              Campaigns
            </div>
            <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
              Manage and track your fundraising campaigns
            </div>
          </div>

          <Button
            onClick={() => {
              router.push("/create-campaign");
            }}
            className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                       items-center justify-center py-3 h-auto md:w-fit w-full"
          >
            <div> Create Campaign</div>

            <ArrowRight height={18} width={18} />
          </Button>
        </div>
        {/* Filters */}
        <div className="flex bg-white rounded-[14px] p-2 gap-3 overflow-x-auto touch-pan-x scrollbar-hide">
          {tabs.map((data, index) => {
            const isSelected = activeTab == data.label;
            return (
              <div
                key={index}
                onClick={() => setActiveTab(data.label)}
                className={`flex items-center justify-center gap-2 px-4 py-2 w-22 cursor-pointer rounded-md
                   ${isSelected ? "bg-[#104109]" : "bg-white"}
                   ${isSelected ? "" : "hover:bg-[#f3f4f6]"} transition`}
              >
                <data.Icon
                  color={isSelected ? "#ffcf55" : "#6b7280"}
                  height="16px"
                  width="16px"
                />

                <div
                  className={`
        text-[12px] font-bold leading-[18px]
        ${isSelected ? "text-white" : "text-gray-500"}
        group-hover:text-white
      `}
                >
                  {data.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Campaign Cards */}
        {!authLoading && !campaignsLoading && !error && user && (
          <div>
            {activeTab === "Live" && (
              <LiveCampaigns campaigns={filteredCampaigns} />
            )}
            {activeTab === "Past" && (
              <PastCampaigns campaigns={filteredCampaigns} />
            )}
            {activeTab === "Chains" && <Chains />}
            {activeTab === "Favourites" && (
              <Favourites />
            )}
            {activeTab === "Comments" && <Comments campaigns={userCampaigns} />}
          </div>
        )}
      </div>
    </div>
  );
}
