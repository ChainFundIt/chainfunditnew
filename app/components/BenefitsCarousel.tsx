'use client';

import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const images = [
  "/images/main-3.png", // multi-currency
  "/images/teamwork.png", // two people lifting
  "/images/secure.png", // secure payments
];

const features = [
  {
    title: "Multi-currency is our thing",
    desc: "Raise donations anywhere, in your preferred currency. Explore our Crypto options and raise more donations",
    bg: "#104901",
    textColor: "text-white",
  },
  {
    title: "Chained campaigns",
    desc: "Our influencer network drives traffic to your campaigns to push your closer to your goal even faster",
    bg: "#5F8555",
    textColor: "text-[#C0BFC4]",
  },
  {
    title: "Secure payments",
    desc: "Industry-standard safety measures secure funds raised and your payouts",
    bg: "#5F8555",
    textColor: "text-[#C0BFC4]",
  },
];

const BenefitsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  const autoplay = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const interval = setInterval(autoplay, 4000);
    return () => clearInterval(interval);
  }, [autoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {
      setCurrent(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  return (
    <div className="w-full px-12 py-10 h-[650px] overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((img, idx) => (
          <div key={idx} className="flex gap-10 min-w-full">
            <section
              className="md:w-1/2 h-full bg-cover bg-no-repeat relative"
              style={{
                backgroundImage: `url(${img})`,
              }}
            >
              <div className="flex justify-center gap-4 mt-6 px-8 w-full absolute top-0 left-0">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className="w-[170px] h-[2px] bg-[#8E8C95] rounded overflow-hidden"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-500 ease-in-out ${
                        current === i ? "w-[70%]" : "w-0"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="md:w-1/2 h-[650px] flex flex-col mx-auto gap-5">
              <h4 className="font-source font-semibold text-4xl text-black">
                Maximise your fundraising efforts
              </h4>
              <p className="font-source font-normal text-xl text-black">
                We’ll handle the grueling campaign management, so you can do
                what matters most - getting donations
              </p>
              <ul className="flex flex-col gap-2">
                {features.map((item, i) => (
                  <li
                    key={i}
                    className="w-[500px] h-fit p-5 flex flex-col gap-2"
                    style={{ backgroundColor: item.bg }}
                  >
                    <p
                      className={`font-source font-medium text-xl ${item.textColor}`}
                    >
                      {item.title}
                    </p>
                    <span
                      className={`font-source font-normal text-base ${item.textColor}`}
                    >
                      {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenefitsCarousel;