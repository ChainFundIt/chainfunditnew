"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, StarIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

type Props = {};

type PublicReview = {
  id: string;
  rating: number;
  headline: string | null;
  body: string | null;
  displayName: string;
  role: "donor" | "creator" | "both";
};

type Slide = PublicReview & { isLoading: boolean };

const CustomerStories = (props: Props) => {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);

  const autoplay = useRef(
    Autoplay({
      delay: 6500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" }, [
    autoplay.current,
  ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/reviews/public?limit=12");
        const data = await res.json();
        if (!cancelled && res.ok && data?.success) {
          setReviews(data.reviews ?? []);
        }
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const slides: Slide[] = useMemo(() => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, i) => ({
        id: `loading-${i}`,
        rating: 5,
        headline: null,
        body: "Loading customer stories...",
        displayName: "Loading",
        role: "donor" as const,
        isLoading: true,
      }));
    }
    if (reviews.length === 0) return [];
    return reviews.map((r) => ({ ...r, isLoading: false }));
  }, [loading, reviews]);

  const roleLabel = (role: PublicReview["role"]) => {
    if (role === "both") return "Donor & Creator";
    if (role === "creator") return "Campaign Creator";
    return "Donor";
  };

  const initials = (name: string) => {
    if (!name || name.toLowerCase() === "anonymous") return "?";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
  };

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

        {/* Reviews carousel */}
        {slides.length > 0 ? (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {slides.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className="min-w-0 flex-[0_0_92%] sm:flex-[0_0_60%] lg:flex-[0_0_33.333%] px-3"
                >
                  <div className="bg-[#FDFBF7] rounded-[32px] p-8 flex flex-col gap-6 h-full">
                    {/* Star Rating */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className={
                            i < review.rating
                              ? "fill-[#FFD700] text-[#FFD700]"
                              : "text-[#E8E8E8]"
                          }
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p
                      className={`font-medium text-lg leading-[30px] text-[#1C1917] ${
                        review.isLoading ? "opacity-60" : ""
                      }`}
                    >
                      "
                      {review.headline
                        ? review.headline
                        : review.body ?? "Great experience overall."}
                      "
                    </p>

                    {/* Spacer to push user info to bottom */}
                    <div className="flex-grow" />

                    {/* User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#DCFCE7] text-[#104109] font-extrabold flex items-center justify-center flex-shrink-0">
                        {initials(review.displayName)}
                      </div>
                      <div>
                        <p className="font-bold text-base leading-6 text-[#1C1917]">
                          {review.displayName}
                        </p>
                        <p className="font-bold text-xs leading-4 text-[#A8A29E]">
                          {roleLabel(review.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] bg-[#FDFBF7] p-8 text-center text-sm text-[#A8A29E]">
            No reviews yet. Be the first to share your experience.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStories;
