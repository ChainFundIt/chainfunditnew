"use client";

import React, { useState } from "react";
import ReceivedDonations from "./received";
import PendingDonations from "./pending";
import FailedDonations from "./failed";
import { fa } from "zod/v4/locales";
import { useDonations } from "@/hooks/use-dashboard";
import Image from "next/image";
import { CircleCheckBig } from "lucide-react";

const tabs = ["Received", "Pending", "Failed"];

const DonationsPage = () => {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const { donations, loading, error, pagination, refreshDonations } =
    useDonations("completed", currentPage);

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
    <div className="bg-[#F0F7Ef] p-6 font-jakarta md:min-h-[calc(100vh-122px)] ">
      <div className="flex flex-col gap-7">
        {/* Dashboard Heading */}
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-5">
          <div className="flex flex-col">
            <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
              Donations
            </div>
            <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
              Track and manage your incoming contributions.
            </div>
          </div>
        </div>

        {/* Table */}
        <div className=" border border-[#f3f4f6] rounded-[21px]  flex flex-col">
          {/* Buttons */}
          <div className="bg-white p-5">
            <div className="flex p-1  bg-[#f3f4f6] w-fit border rounded-[11px]">
              {tabs.map((data, index) => {
                const isSelected = activeTab == data;
                return (
                  <div
                    className={`${isSelected ? "bg-white text-[#104109]" : "text-[#6b7280]"} text-[12px] leading-[18px] cursor-pointer font-bold py-2 px-5 rounded-[7px]`}
                    key={index}
                    onClick={() => {
                      setActiveTab(data);
                    }}
                  >
                    {data}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Table Content */}
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="bg-[#Fcfdfd] flex  py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold justify-between border-t ">
              <div className=" w-[19rem]">DONOR</div>
              <div className=" w-[19rem] ">AMOUNT</div>
              <div className=" w-[19rem]">CAMPAIGN</div>
              <div className="w-[19rem]">DATE</div>
              <div className="w-[19rem]">STATUS</div>
            </div>
            {/* Table Data */}
            {donations.map((data, index) => {
              return (
                <div
                  className="flex py-3 px-5 bg-white items-center justify-between border-t"
                  key={index}
                >
                  {/* Donor */}
                  <div className="flex gap-4 items-center w-[19rem]">
                    <Image
                      src={"/images/avatar-2.png"}
                      alt={"user pic"}
                      width={35}
                      height={35}
                      style={{
                        border: "1px solid #f3f4f6",
                        borderRadius: "999px",
                      }}
                    />
                    <div className="flex flex-col">
                      <div className="text-[16px] font-bold leading-[30px] text-[#111827]">
                        Sarah Jenkins
                      </div>
                      <div className="text-[11px] leading-[14px] text-[#6b7280]">
                        Via Credit Card
                      </div>
                    </div>
                  </div>
                  {/* Amount */}
                  <div className="font-bold text-[#104109] text-[16px] leading-[25px] w-[19rem]  ">
                    $150
                  </div>
                  {/* Campaign */}
                  <div className="font-medium text-[12px] leading-[18px] text-[#4b5563] w-[19rem]">
                    Clean Water
                  </div>
                  {/* Date */}
                  <div className="text-[12px] leading-[18px] text-[#6b7280] w-[19rem]">
                    Oct 24, 2024
                  </div>
                  {/* Status */}
                  <div className=" w-[19rem]">
                    <div className="bg-[#f0fdf4] border border-[#DCFCE7]  flex gap-2 items-center rounded-full px-5  py-1 w-fit ">
                      <CircleCheckBig
                        style={{
                          color: "#15803d",
                          width: "12px",
                          height: "12px",
                        }}
                      />
                      <div className="font-bold text-[11px] leading-[14px] text-[#15803d]">
                        Received
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsPage;

//  <div className="w-full flex flex-col gap-5 font-source 2xl:container 2xl:mx-auto">
//       <h2 className="font-semibold text-3xl md:text-6xl text-black">Donations</h2>
//       {/* Tabs */}
//       <ul className="w-full md:w-fit bg-[#E5ECDE] flex gap-2 md:gap-4 font-medium text-sm md:text-[28px] text-[#757575] p-1 overflow-x-auto scrollbar-hide">
//         {tabs.map((tab) => (
//           <li
//             key={tab}
//             className={`cursor-pointer px-3 md:px-4 py-2 transition whitespace-nowrap flex-shrink-0 ${
//               activeTab === tab ? "bg-white text-black" : "hover:bg-[#d2e3c8]"
//             }`}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab}
//           </li>
//         ))}
//       </ul>
//       <div className="mt-6">
//         {renderActiveTab()}
//       </div>
//     </div>
