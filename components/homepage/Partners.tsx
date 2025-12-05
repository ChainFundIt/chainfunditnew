"use client";

import React from "react";

type Props = {};

const Partners = (props: Props) => {
  const metrics = [
    {
      number: "5k+",
      label: "Beneficiaries",
      description: "Lives impacted directly",
      bgColor: "bg-[#FFCF55]",
      textColor: "text-black",
    },
    {
      number: "12M+",
      label: "Total Raised",
      description: "Donated by global community",
      bgColor: "bg-[#59AD4A]",
      textColor: "text-white",
    },
    {
      number: "250+",
      label: "Campaigns",
      description: "Successful fundraisers",
      bgColor: "bg-[#EDECE0]",
      textColor: "text-black",
    },
    {
      number: "14+",
      label: "Countries",
      description: "Global reach and support",
      bgColor: "bg-[#104109]",
      textColor: "text-white",
    },
  ];

  return (
    <div className="w-full px-4 md:px-12 py-12 md:py-20 bg-white flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center max-w-2xl mx-auto">
        <div className="inline-block bg-[#E8F5F0] rounded-full px-4 py-2">
          <span className="font-jakarta font-bold text-xs md:text-sm text-[#104901] uppercase tracking-wider">
            Impact Metrics
          </span>
        </div>
        <h2 className="font-jakarta font-bold text-3xl md:text-5xl text-black leading-tight">
          Programs that change lives
        </h2>
        <p className="font-jakarta font-regular text-base md:text-lg text-[#666666] leading-relaxed">
          Together, we make real impact in communities around the world. Help us bring hope and support.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${metric.bgColor} ${metric.textColor} rounded-2xl p-6 md:p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-lg hover:scale-105`}
          >
            <div>
              <p className={`font-jakarta font-bold text-4xl md:text-5xl ${metric.textColor} mb-2`}>
                {metric.number}
              </p>
              <p className={`font-jakarta font-bold text-lg md:text-xl ${metric.textColor}`}>
                {metric.label}
              </p>
            </div>
            <p className={`font-jakarta font-regular text-sm md:text-base ${metric.textColor} opacity-80`}>
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Partners;