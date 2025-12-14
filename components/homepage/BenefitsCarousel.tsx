"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Zap, Globe, Shield, CircleCheck } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { getCurrentTheme } from "@/lib/utils/theme-detection";
import { themes, type ThemeKey } from "@/lib/utils/carousel-themes";

const defaultFeatures = [
  {
    title: "Multi-currency support",
    desc: "Raise donations in any currency. Explore crypto options to reach more donors worldwide",
    isHighlighted: true,
  },
  {
    title: "Influencer network",
    desc: "Get amplified reach through our creator network to accelerate your fundraising goals",
    isHighlighted: false,
  },
  {
    title: "Secure payments",
    desc: "Industry-leading security protects your funds and payouts with enterprise-grade encryption",
    isHighlighted: false,
  },
];

const BenefitsCarousel = () => {
  const themeKey: ThemeKey = useMemo(() => getCurrentTheme(), []);
  const themeConfig = themes[themeKey] ?? themes.default;

  const slides = useMemo(() => {
    return [
      {
        key: "default",
        badge: "Powering Next-Gen Fundraising",
        heading: "Discover the Impact of Transparent Giving",
        description:
          "We've built a platform that removes the barriers to kindness. Connect directly with causes, track every dollar, and see the change you create in real-time.",
        features: defaultFeatures.map((f) => ({ title: f.title })),
        image: "/images/volunteersHelping.png",
      },
      {
        key: `${themeKey}-1`,
        badge: `Seasonal Spotlight • ${themeKey}`,
        heading: themeConfig.mainHeading,
        description: themeConfig.mainDescription,
        features: (themeConfig.features ?? []).slice(0, 3).map((f) => ({
          title: f.title,
        })),
        image: themeConfig.images?.[0] ?? "/images/secure.png",
      },
      {
        key: `${themeKey}-2`,
        badge: `Seasonal Spotlight • ${themeKey}`,
        heading: themeConfig.mainHeading,
        description: themeConfig.mainDescription,
        features: (themeConfig.features ?? []).slice(0, 3).map((f) => ({
          title: f.title,
        })),
        image: themeConfig.images?.[1] ?? themeConfig.images?.[0] ?? "/images/teamwork.png",
      },
    ];
  }, [themeConfig, themeKey]);

  const autoplay = useRef(
    Autoplay({
      delay: 6500,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    autoplay.current,
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const activeSlide = slides[selectedIndex] ?? slides[0];

  return (
    <div className="font-jakarta bg-[#59AD4A] py-24 px-4 flex justify-center items-center">
      <div className="flex flex-col md:flex-row gap-16 items-center w-full max-w-6xl justify-between">
        {/* Left Text Content */}
        <div className="w-full md:w-[36rem] flex flex-col gap-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="px-4 py-2 rounded-full flex gap-2 bg-white/10 w-fit items-center"
          >
            <Zap color="#FDE047" size={16} />
            <div className="font-bold text-sm leading-5 text-white">
              {activeSlide.badge}
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            key={`title-${activeSlide.key}`}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-extrabold text-5xl leading-[48px] text-white"
          >
            {activeSlide.heading}
          </motion.div>

          {/* Description */}
          <motion.div
            key={`desc-${activeSlide.key}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-normal text-lg leading-[30px] text-white"
          >
            {activeSlide.description}
          </motion.div>

          {/* Features List */}
          <motion.div
            className="flex flex-col gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {activeSlide.features.map((feature, i) => (
              <motion.div
                key={`${activeSlide.key}-${i}`}
                variants={{
                  hidden: { opacity: 0, x: -25 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.5 }}
                className="flex gap-4"
              >
                <CircleCheck color="#86EFAC" size={20} />
                <div className="font-medium text-base leading-6 text-white">
                  {feature.title}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right Carousel Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-6 md:p-0 w-full md:w-auto"
        >
          <div className="relative w-full md:w-[36rem]">
            {/* Fixed-size carousel viewport (keeps layout balanced across different image aspect ratios) */}
            <div
              className="embla w-full overflow-hidden rounded-[40px] h-[420px] md:h-[600px]"
              ref={emblaRef}
            >
              <div className="embla__container flex h-full">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.key}
                    className="embla__slide flex-[0_0_100%] min-w-0 h-full"
                    aria-hidden={selectedIndex !== idx}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={slide.image}
                        alt={slide.heading}
                        fill
                        sizes="(min-width: 768px) 36rem, 100vw"
                        className="object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Card - Top Left */}
            <div className="absolute top-8 left-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DCFCE7] flex items-center justify-center rounded-xl p-3">
                <Globe size={20} color="#16A34A" />
              </div>
              <div className="flex flex-col g-1">
                <p className="font-bold text-sm leading-5">Global Reach</p>
                <p className="font-normal text-xs leading-4">
                  Support causes in 14+ countries instantly.
                </p>
              </div>
            </div>

            {/* Floating Card - Bottom Right */}
            <div className="absolute bottom-8 right-[-32px] bg-white rounded-2xl p-5 flex items-center gap-4 w-60">
              <div className="w-12 h-12 bg-[#DBEAFE] flex items-center justify-center rounded-xl p-3">
                <Shield size={20} color="#2563EB" />
              </div>
              <div className="flex flex-col g-1">
                <p className="font-bold text-sm leading-5">100% Secure</p>
                <p className="font-normal text-xs leading-4">
                  Bank-grade encryption for every donation.
                </p>
              </div>
            </div>

            {/* Progress indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/25 rounded-full px-3 py-2 backdrop-blur-sm">
              {slides.map((s, i) => (
                <button
                  key={`dot-${s.key}`}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-2 rounded-full transition-all ${
                    selectedIndex === i ? "w-8 bg-white" : "w-2 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BenefitsCarousel;
