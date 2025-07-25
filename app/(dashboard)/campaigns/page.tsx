"use client";

import React, { useState } from "react";
import LiveCampaigns from "./live";
import PastCampaigns from "./past";
import Chains from "./chains";
import Favourites from "./favourites";
import Comments from "./comments";

const tabs = ["Live", "Past", "Chains", "Favourites", "Comments"];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState("Live");

  return (
    <div className="w-full flex flex-col gap-5 font-source">
      <h2 className="font-semibold text-6xl text-black">Campaigns</h2>
      {/* Tabs */}
      <ul className="w-fit bg-[#E5ECDE] flex gap-4 font-medium text-[28px] text-[#757575] p-1">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`cursor-pointer px-4 py-2 transition ${
              activeTab === tab
                ? "bg-white text-black"
                : "hover:bg-[#d2e3c8]"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {activeTab === "Live" && <LiveCampaigns />}
        {activeTab === "Past" && <PastCampaigns />}
        {activeTab === "Chains" && <Chains />}
        {activeTab === "Favourites" && <Favourites />}
        {activeTab === "Comments" && <Comments />}
      </div>
    </div>
  );
}
