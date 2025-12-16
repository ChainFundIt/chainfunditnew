"use client";

import React from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import { StarIcon } from "lucide-react";

type Props = {};

const CustomerStories = (props: Props) => {
  const trustpilotTemplateId =
    process.env.NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID ?? "";
  const trustpilotBusinessUnitId =
    process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID ?? "";
  const trustpilotReviewUrl = process.env.NEXT_PUBLIC_TRUSTPILOT_REVIEW_URL ?? "";
  const trustpilotLocale = process.env.NEXT_PUBLIC_TRUSTPILOT_LOCALE ?? "en-US";

  return (
    <div className="font-jakarta flex items-center justify-center bg-white py-20 px-4">
      <div className="flex flex-col gap-16 md:max-w-[80rem] w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="px-4 py-2 rounded-full bg-[#DCFCE7] flex gap-2 w-fit items-center">
            <StarIcon color="#104109" size={16} />
            <div className="font-bold text-sm leading-5 text-[#104109]">
              Trust & Impact
            </div>
          </div>
          <div className="font-bold text-5xl leading-[48px]">
            Hear from those who believe
          </div>
        </motion.div>

        {/* Trustpilot Widget */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="w-full"
        >
          <Script
            src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
            strategy="afterInteractive"
          />

          {trustpilotTemplateId && trustpilotBusinessUnitId ? (
            <div
              className="trustpilot-widget"
              data-locale={trustpilotLocale}
              data-template-id={trustpilotTemplateId}
              data-businessunit-id={trustpilotBusinessUnitId}
              data-style-height="240px"
              data-style-width="100%"
              data-theme="light"
            >
              <a
                href={trustpilotReviewUrl || "https://www.trustpilot.com/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                Trustpilot
              </a>
            </div>
          ) : (
            <div className="rounded-[32px] bg-[#FDFBF7] p-8 text-center text-sm text-[#A8A29E]">
              Trustpilot widget is not configured. Set{" "}
              <span className="font-mono">
                NEXT_PUBLIC_TRUSTPILOT_TEMPLATE_ID
              </span>{" "}
              and{" "}
              <span className="font-mono">
                NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID
              </span>
              .
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerStories;
