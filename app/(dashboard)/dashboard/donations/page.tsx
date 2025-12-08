"use client";

import React, { useEffect, useState } from "react";
import ReceivedDonations from "./received";
import PendingDonations from "./pending";
import FailedDonations from "./failed";
import { fa } from "zod/v4/locales";
import { useDonations } from "@/hooks/use-dashboard";
import Image from "next/image";
import { ChevronDown, CircleCheckBig, Clock, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";

const tabs = ["Received", "Pending", "Failed"];

const DonationsPage = () => {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const statusMap: any = {
    Received: "completed",
    Pending: "pending",
    Failed: "failed",
  };

  const { donations, loading, error, pagination, refreshDonations } =
    useDonations(statusMap[activeTab], currentPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
              console.log(data);
              return (
                <div
                  className="flex py-3 px-5 bg-white items-center justify-between border-t"
                  key={index}
                >
                  {/* Donor */}
                  <div className="flex gap-4 items-center w-[19rem]">
                    {data.donorAvatar ? (
                      <Image
                        src={data.donorAvatar}
                        alt={
                          data.isAnonymous
                            ? "Anonymous"
                            : data.donorName || "Donor"
                        }
                        width={35}
                        height={35}
                        style={{
                          border: "1px solid #f3f4f6",
                          borderRadius: "999px",
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#104109] to-[#59ad4a] rounded-full flex items-center justify-center text-white font-semibold">
                        {data.isAnonymous
                          ? "A"
                          : (data.donorName?.[0] || "D").toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="text-[16px] font-bold leading-[30px] text-[#111827]">
                        {data.isAnonymous
                          ? "Anonymous Donation"
                          : data.donorName || "Donor"}
                      </div>
                      <div className="text-[11px] leading-[14px] text-[#6b7280] ">
                        Via{" "}
                        <span className="capitalize">
                          {data.paymentProvider}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Amount */}
                  <div className="font-bold text-[#104109] text-[16px] leading-[25px] w-[19rem]  ">
                    {formatCurrency(data.amount, data.currency)}
                  </div>
                  {/* Campaign */}
                  <div className="font-medium text-[12px] leading-[18px] text-[#4b5563] w-[19rem]">
                    {data.campaignTitle}
                  </div>
                  {/* Date */}
                  <div className="text-[12px] leading-[18px] text-[#6b7280] w-[19rem]">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </div>
                  {/* Status */}
                  <div className=" w-[19rem]">
                    {activeTab == "Received" && (
                      <div className="bg-[#f0fdf4] border border-[#DCFCE7]  flex gap-2 items-center rounded-full px-5  py-1 w-fit ">
                        <CircleCheckBig color="#15803d" size={12} />
                        <div className="font-bold text-[11px] leading-[14px] text-[#15803d] capitalize">
                          {data.paymentStatus}
                        </div>
                      </div>
                    )}
                    {activeTab == "Pending" && (
                      <div className="bg-yellow-100 border border-yellow-800  flex gap-2 items-center rounded-full px-5  py-1 w-fit ">
                        <Clock color="#854d0e" size={12} />
                        <div className="font-bold text-[11px] leading-[14px] text-yellow-800 capitalize">
                          {data.paymentStatus}
                        </div>
                      </div>
                    )}
                    {activeTab == "Failed" && (
                      <div className="bg-destructive border border-transparent  flex gap-2 items-center rounded-full px-5  py-1 w-fit ">
                        <XCircle color="white" size={12} />
                        <div className="font-bold text-[11px] leading-[14px] text-destructive-foreground capitalize">
                          {data.paymentStatus}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Load More Button */}
        {pagination && pagination.totalPages > pagination.page && (
          <div className="flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                       items-center justify-center py-3 h-auto md:w-fit w-full"
            >
              Load More ({pagination.total - pagination.page * pagination.limit}{" "}
              remaining)
              <ChevronDown className="h-4 w-4 " />
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="text-center text-sm text-gray-500 ">
            Showing {donations.length} of {pagination.total} donations
          </div>
        )}
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
