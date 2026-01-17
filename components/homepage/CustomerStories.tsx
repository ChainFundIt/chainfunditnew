"use client";

import React from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import { StarIcon } from "lucide-react";

type Props = {};

const CustomerStories = (props: Props) => {
  /**
   * REVIEWS.io widgets are configured in the REVIEWS.io dashboard (Publishing -> Widget Library).
   * Copy the "Get Installation Code" output and store it in env vars below.
   *
   * Note: scripts injected via `dangerouslySetInnerHTML` won't reliably execute in React,
   * so we load the widget script URL separately via `next/script`.
   */
  const reviewsioWidgetScriptSrc =
    process.env.NEXT_PUBLIC_REVIEWSIO_WIDGET_SCRIPT_SRC ?? "";
  const reviewsioWidgetHtml = process.env.NEXT_PUBLIC_REVIEWSIO_WIDGET_HTML ?? "";

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
          {reviewsioWidgetScriptSrc ? (
            <Script src={reviewsioWidgetScriptSrc} strategy="afterInteractive" />
          ) : null}

          {reviewsioWidgetScriptSrc && reviewsioWidgetHtml ? (
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: reviewsioWidgetHtml }}
            />
          ) : (
            <div className="rounded-[32px] bg-[#FDFBF7] p-8 text-center text-sm text-[#A8A29E]">
              REVIEWS.io widget is not configured. Set{" "}
              <span className="font-mono">
                NEXT_PUBLIC_REVIEWSIO_WIDGET_SCRIPT_SRC
              </span>{" "}
              and{" "}
              <span className="font-mono">NEXT_PUBLIC_REVIEWSIO_WIDGET_HTML</span>
              {" "}from the widget&apos;s &quot;Get Installation Code&quot;.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerStories;
