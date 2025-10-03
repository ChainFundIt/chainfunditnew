"use client";

import React from "react";
import ReceivedDonations from "./received";
import PendingDonations from "./pending";
import FailedDonations from "./failed";

const tabs = ["Received", "Pending", "Failed"];

const DonationsPage = () => {
  const [activeTab, setActiveTab] = React.useState(tabs[0]);
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case "Received":
        return <ReceivedDonations key="received" />;
      case "Pending":
        return <PendingDonations key="pending" />;
      case "Failed":
        return <FailedDonations key="failed" />;
      default:
        return <ReceivedDonations key="received" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 font-source 2xl:container 2xl:mx-auto">
      <h2 className="font-semibold text-3xl md:text-6xl text-black">Donations</h2>
      {/* Tabs */}
      <ul className="w-full md:w-fit bg-[#E5ECDE] flex gap-2 md:gap-4 font-medium text-sm md:text-[28px] text-[#757575] p-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`cursor-pointer px-3 md:px-4 py-2 transition whitespace-nowrap flex-shrink-0 ${
              activeTab === tab ? "bg-white text-black" : "hover:bg-[#d2e3c8]"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default DonationsPage;
