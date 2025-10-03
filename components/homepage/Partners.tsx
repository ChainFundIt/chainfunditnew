"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {};

const Partners = (props: Props) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationId: number;
    let startTime: number;
    const duration = 30000; // 30 seconds

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Calculate the translateX value
      const translateX = -progress * 50; // Move from 0% to -50%
      slider.style.transform = `translateX(${translateX}%)`;
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const partners = [
    {
      src: "/images/together-to-win.png",
      alt: "Together to win",
    },
    {
      src: "/images/tahmamuq.png",
      alt: "Tahmamuq",
    },
    {
      src: "/images/100bmol.png",
      alt: "100bmol",
    },
    {
      src: "/images/nspcc.png",
      alt: "NSPCC",
    },
    {
      src: "/images/cece-yara.png",
      alt: "Cece Yara",
    },
    {
      src: "/images/meningitis.png",
      alt: "Meningitis",
    },
  ];

  return (
    <div className="w-full h-[200px] bg-whitesmoke px-4 md:px-10 py-6 flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center">
      {/* Fixed "Our Partners" text */}
      <p className="font-source font-semibold text-xl md:text-3xl text-black whitespace-nowrap mb-3 md:mb-0">
        Our Partners
      </p>
      {/* Infinite sliding partners carousel with blur masks */}
      <div className="flex-1 overflow-hidden">
        <div className="relative w-full overflow-hidden" style={{ height: "80px" }}>
          {/* Left gradient mask */}
          <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-whitesmoke to-transparent z-10" />
          {/* Right gradient mask */}
          <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-whitesmoke to-transparent z-10" />
          
          {/* Slider track */}
          <div 
            ref={sliderRef}
            className="flex gap-3 items-center h-full"
            style={{
              width: 'max-content',
              transform: 'translateX(0%)',
              transition: 'transform 0.1s linear'
            }}
          >
            {/* First set of partners */}
            {partners.map((partner, idx) => (
              <div key={`first-${idx}`} className="flex-shrink-0 min-w-[200px] flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={200}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {partners.map((partner, idx) => (
              <div key={`second-${idx}`} className="flex-shrink-0 min-w-[200px] flex items-center justify-center">
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={200}
                  height={80}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
