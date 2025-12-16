"use client";

import React from "react";
import { useImpactMetrics } from "@/hooks/use-impact-metrics";
import { useGeolocation } from "@/hooks/use-geolocation";
import { formatCurrency } from "@/lib/utils/currency";

const Partners = () => {
  const { geolocation } = useGeolocation();
  const { data } = useImpactMetrics(geolocation?.currency);

  const donationsDisplay = data ? `${data.donationsCompleted.toLocaleString()}+` : "—";
  const campaignsDisplay = data ? `${data.campaignsPublicActive.toLocaleString()}+` : "—";
  const countriesDisplay = data ? `${data.countriesReached.toLocaleString()}+` : "—";
  const amountRaisedDisplay = data ? `${formatCurrency(data.amountRaised.amount, data.amountRaised.currency)}+` : "—";

  const metrics = [
    {
      number: donationsDisplay,
      label: "Donations",
      description: "Donations made to campaigns",
      bgColor: "bg-[#FFCF55]",
      textColor: "text-black",
    },
    {
      number: amountRaisedDisplay,
      label: "Amount Raised",
      description: "Donated by global community",
      bgColor: "bg-[#59AD4A]",
      textColor: "text-white",
    },
    {
      number: campaignsDisplay,
      label: "Campaigns",
      description: "Successful fundraisers",
      bgColor: "bg-[#EDECE0]",
      textColor: "text-black",
    },
    {
      number: "2+",
      label: "Countries",
      description: "Global reach and support",
      bgColor: "bg-[#104109]",
      textColor: "text-white",
    },
  ];

  return (
    <div className="font-jakarta flex items-center justify-center bg-white py-20 px-4">
      <div className="flex flex-col gap-16 md:max-w-[80rem] w-full">
        {/* Section Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Badge */}
          <div className="px-3 py-1 bg-[#ECFDF5] rounded-full">
            <div className="font-bold text-xs leading-4 uppercase text-[#059669]">
              IMPACT METRICS
            </div>
          </div>
          {/* Title */}
          <div className="font-bold text-4xl leading-10 text-[#1C1917]">
            Campaigns that change lives
          </div>
          {/* Description */}
          <div className="font-normal text-base leading-6 text-[#78716C]">
            Together, we make real impact in communities around the world. Help
            us bring hope and support through donations.
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="flex flex-col md:flex-row gap-6 w-full justify-center items-stretch">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`${metric.bgColor} ${metric.textColor} rounded-3xl p-8 gap-2 flex flex-col md:w-[18rem] w-full`}
            >
              <div className="font-extrabold text-3xl leading-[48px]">
                {metric.number}
              </div>
              <div className="font-bold text-lg leading-7">{metric.label}</div>
              <div className="font-medium text-sm leading-5 bg-white/20 p-4 rounded-xl">
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;
