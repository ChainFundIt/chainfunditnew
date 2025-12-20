"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, CreditCard, Lock, User } from "lucide-react";
import Account from "./account";
import Security from "./security";
import Preferences from "./preferences";
import Payments from "./payments";

const tabs = [
  { label: "Account", Icon: User },
  { label: "Security", Icon: Lock },
  { label: "Preferences", Icon: Bell },
  { label: "Payments", Icon: CreditCard },
];

const SettingsPageContent = () => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(tabs[0].label);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const tabLabel = tabs.find(
        (tab) => tab.label.toLowerCase() === tabParam.toLowerCase()
      )?.label;
      if (tabLabel) {
        setActiveTab(tabLabel);
      }
    }
  }, [searchParams]);

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
        <div>
          {/* Settings Header */}
          <div className="flex border border-b-[f3f4f6] bg-white p-2 gap-2 rounded-tl-3xl rounded-tr-3xl overflow-x-auto scrollbar-hide">
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
          {/* Settings Active Tab Content */}
          {activeTab === "Account" && <Account />}
          {activeTab === "Security" && <Security />}
          {activeTab === "Preferences" && <Preferences />}
          {activeTab === "Payments" && <Payments />}
        </div>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="bg-[#F0F7Ef] p-6 font-jakarta min-h-[calc(100vh-122px)]">Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
};

