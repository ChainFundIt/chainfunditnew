"use client";

import React, { useState } from "react";
import { Bell, CreditCard, Lock, User } from "lucide-react";

const tabs = [
  { label: "Account", Icon: User },
  { label: "Security", Icon: Lock },
  { label: "Preferences", Icon: Bell },
  { label: "Payments", Icon: CreditCard },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  return (
    <div className="bg-[#F0F7Ef] p-6 font-jakarta min-h-[calc(100vh-122px)] ">
      <div className="flex flex-col gap-7">
        {/* Dashboard Heading */}
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-5">
          <div className="flex flex-col">
            <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
              Settings
            </div>
            <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
              Manage your profile details and account preferences.
            </div>
          </div>
        </div>
        {/* Settings Header */}
        <div className="flex border border-b-[f3f4f6] bg-white p-2 gap-2 rounded-tl-3xl rounded-tr-3xl">
          {tabs.map((data, index) => {
            const isSelected = activeTab == data.label;
            return (
              <div
                className={`${isSelected ? "bg-[#104109]" : ""} flex px-5 py-3 gap-2 rounded-[10.5px] items-center cursor-pointer`}
                key={index}
                onClick={() => {
                  setActiveTab(data.label);
                }}
              >
                <data.Icon
                  size={16}
                  color={`${isSelected ? "white" : "#6b7280"}`}
                />
                <span
                  className={`${isSelected ? "text-white" : "text-[#6b7280]"} text-xs font-semibold `}
                >
                  {data.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

//  <div className="w-full flex flex-col gap-5 font-source 2xl:container 2xl:mx-auto">
//       <h2 className="font-semibold text-3xl md:text-6xl text-black">Settings</h2>
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
//         {activeTab === "Account" && <Account />}
//         {activeTab === "Security" && <Security />}
//         {activeTab === "Preferences" && <Preferences />}
//         {activeTab === "Payments" && <Payments />}
//       </div>
//     </div>
