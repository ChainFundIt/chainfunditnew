"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { themes, type ThemeKey } from "@/lib/utils/carousel-themes";
import { getCurrentTheme } from "@/lib/utils/theme-detection";

interface BenefitsCarouselProps {
  /** Optional manual theme override for testing */
  themeOverride?: ThemeKey;
}

const BenefitsCarousel = ({ themeOverride }: BenefitsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentTheme = useMemo(() => getCurrentTheme(themeOverride), [themeOverride]);
  const activeTheme = themes[currentTheme];
  const images = activeTheme.images;
  const features = activeTheme.features;

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [currentTheme]);

  const scrollTo = useCallback((index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  }, [emblaApi]);

  const autoplay = useCallback(() => {
    if (!emblaApi || !isAutoPlaying) return;
    emblaApi.scrollNext();
  }, [emblaApi, isAutoPlaying]);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(autoplay, 4000);
  }, [autoplay]);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
    }

    return () => stopAutoplay();
  }, [isAutoPlaying, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleFeatureClick = (index: number) => {
    setIsAutoPlaying(false);
    scrollTo(index);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  return (
    <>
      <style jsx>{`
        @keyframes fill-bar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-fill-bar {
          animation: fill-bar 4s linear forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .theme-transition {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
      
      <div className="w-full md:px-12 px-4 py-10 h-[650px] overflow-hidden">
        <div className="flex md:gap-10 w-full">
          <div className="md:w-[60%] md:block hidden h-[650px] bg-cover bg-no-repeat relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {images.map((img, idx) => (
                  <div
                    key={`${currentTheme}-${idx}`}
                    className="min-w-full h-[650px] bg-cover bg-no-repeat relative transition-opacity duration-500"
                    style={{ backgroundImage: `url(${img})` }}
                  >
                    <div className="flex justify-center gap-4 mt-6 px-8 w-full absolute top-0 left-0">
                      {images.map((_, i) => (
                        <div
                          key={i}
                          className="w-[170px] h-[2px] bg-[#8E8C95] rounded overflow-hidden cursor-pointer"
                          onClick={() => handleFeatureClick(i)}
                        >
                          <div
                            className={`h-full bg-white transition-all duration-200 ${
                              current === i ? "animate-fill-bar" : "w-0"
                            }`}
                            style={{
                              animationPlayState: isAutoPlaying ? 'running' : 'paused'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-[40%] w-full h-[650px] flex flex-col mx-auto gap-10">
            <section className={`flex flex-col gap-2 ${isTransitioning ? 'theme-transition' : ''}`}>
              <h4 className="font-source font-semibold text-4xl text-black transition-all duration-500">
                {activeTheme.mainHeading}
              </h4>
              <p className="font-source font-normal text-xl text-black transition-all duration-500">
                {activeTheme.mainDescription}
              </p>
            </section>
            <ul className="flex flex-col gap-2">
              {features.map((item, i) => {
                const isActive = current === i;
                return (
                <li
                  key={`${currentTheme}-${i}`}
                  className={`md:w-[500px] w-full h-fit p-5 flex flex-col gap-2 transition-all duration-500 cursor-pointer ${
                    isActive
                      ? "scale-[1.05] shadow-lg border-2 border-brand-green-dark bg-brand-green-dark"
                      : "bg-brand-green-light backdrop-blur-sm"
                  } ${isTransitioning ? 'theme-transition' : ''}`}
                  style={{
                    opacity: isActive ? 1 : 0.7
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.opacity = '0.7';
                    }
                  }}
                  onClick={() => handleFeatureClick(i)}
                >
                  <p
                    className={`font-source font-medium text-xl ${item.textColor} transition-all duration-300`}
                  >
                    {item.title}
                  </p>
                  {isActive && (
                  <span
                    className={`font-source font-normal text-base ${item.textColor} transition-all duration-300 animate-in fade-in slide-in-from-top-2`}
                  >
                    {item.desc}
                  </span>
                  )}
                </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default BenefitsCarousel;