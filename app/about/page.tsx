"use client";

import React, { useRef } from "react";
import { Users, Target, Globe, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import AboutUsIcon from "@/public/icons/AboutUsIcon";
import ShieldIcon from "@/public/icons/ShieldIcon";
import BulbIcon from "@/public/icons/BulbIcon";
import AboutUsImpact from "@/public/icons/AboutUsImpact";
import OurJourney from "@/public/icons/OurJourney";
import { useIsMobile } from "@/hooks/use-mobile";

const stats = [
  { label: "Campaigns Funded", value: "50+", icon: Target },
  { label: "Successful Donotions", value: "521+", icon: Users },
  { label: "Amount Raised", value: "£20,250+", icon: TrendingUp },
  { label: "Countries Reached", value: "2+", icon: Globe },
];

export default function AboutPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const journeyRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <Navbar />
      <div>
        <div className="bg-[#FDFBF7]">
          <div className="flex flex-col gap-16 pt-16 pb-12 items-center justify-center">
            <div className="flex flex-col gap-6 md:px-8 items-center justify-center px-4">
              <div className="flex gap-2 px-4 py-2 bg-yellow-200 rounded-full items-center">
                <AboutUsIcon width="14px" height="14px" color="#A16207" />
                <div className="font-jakarta font-bold text-[12px] leading-4 text-[#A16207]">
                  ABOUT US
                </div>
              </div>

              <div className="font-jakarta font-extrabold md:text-[54px] md:leading-[60px] text-center md:max-w-[62.5rem] text-[36px] leading-[40px]">
                Empowering Modern Fundraising Through ChainFundIt
              </div>

              <div className="font-jakarta font-normal md:text-[20px] md:leading-7 text-center text-[#78716c] pb-4 md:max-w-[57rem] text-[18px] leading-[30px]">
                ChainFundIt empowers organizers, ambassadors, and donors with
                clear communication and creative promotion. From medical needs
                to emergencies, our platform fuels donation-based campaigns—and
                our unique “Chainfunding” feature accelerates growth through
                shared momentum.
              </div>

              <Button
                className="bg-[#104109] px-8 py-4 rounded-full h-auto"
                onClick={() => {
                  journeyRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="font-jakarta font-bold text-[18px] leading-7 ">
                  Learn More
                </div>
              </Button>
            </div>

            {!isMobile && (
              <Image
                src={"/images/AboutUs.png"}
                alt="About Our Journey"
                width={1000}
                height={400}
                className="rounded-[48px] object-cover object-center  "
              />
            )}
            {isMobile && (
              <Image
                src={"/images/AboutUs.png"}
                alt="About Our Journey"
                width={358}
                height={400}
                className="rounded-[48px] w-full h-auto px-4"
              />
            )}
          </div>
        </div>

        <div className="py-24 md:px-20 flex items-center justify-center">
          <div className="md:px-8 px-4 md:max-w-[1280px] flex flex-col gap-16">
            {/* Header */}
            <div className="flex flex-col gap-3 items-center ">
              <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
                OUR VALUES
              </div>
              <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
                ChainFundit's trusted core values
              </div>
            </div>

            {/* Values Cards */}
            <div className="flex gap-8 flex-wrap justify-center flex-col md:flex-row">
              {/* Card 1 */}
              <div className="md:w-[384px] h-[320px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#DCFCE7] flex items-center justify-center">
                  <ShieldIcon />
                </div>
                <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                  Transparency
                </div>
                <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  We believe in complete transparency in all transactions and
                  campaign management
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:w-[384px] h-[320px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FEF9C3] flex items-center justify-center">
                  <BulbIcon />
                </div>
                <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                  Impact
                </div>
                <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  Every donation makes a real difference in the lives of those
                  who need it most.
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:w-[384px] h-[320px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5">
                <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FFEDD5] flex items-center justify-center">
                  <AboutUsIcon width="36px" height="36px" color="#EA580C" />
                </div>
                <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                  Community
                </div>
                <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                  Building a global community of changemakers and supporters.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="py-24 md:px-20 flex items-center justify-center bg[#FFCF55] "
          style={{
            background:
              "linear-gradient(to bottom,#FFFFFF 0%, #FFCF55 15%, #FFCF55 100%)",
          }}
        >
          <div className="md:px-8 px-4 flex flex-col gap-16 md:max-w-[1280px]">
            {/* Header Section */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <div className="flex gap-2 px-4 py-2 border border-[#FFFFFF33] rounded-full items-center justify-center bg-[#FFFFFF66]">
                <AboutUsImpact />
                <div className="font-jakarta font-bold text-[12px] leading-4 text-[#9A3412]">
                  Our Impact
                </div>
              </div>

              <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[48px] text-center text-[36px] leading-[45px]">
                Since our founding, ChainFundit has made an extensive impact
              </div>
            </div>

            {/* Impact Numbers */}
            <div className="flex md:gap-12 md:flex-row flex-col gap-6">
              <div className="flex md:gap-[48px] justify-between ">
                {/* Item 1 and 2 */}
                {stats.slice(0, 2).map((data, index) => {
                  return (
                    <div
                      className="flex flex-col gap-2 items-center justify-center md:w-[268px] w-[163px]"
                      key={index}
                    >
                      <div className="font-jakarta font-extrabold md:text-[60px] text-[36px] md:leading-[60px] leading-[40px]">
                        {data.value}
                      </div>
                      <div className="font-jakarta font-medium text-[16px] leading-6">
                        {data.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex md:gap-[48px] justify-between ">
                {/* Item 3 and 4*/}
                {stats.slice(2).map((data, index) => {
                  return (
                    <div
                      className="flex flex-col gap-2 items-center justify-center md:w-[268px] w-[163px]"
                      key={index}
                    >
                      <div className="font-jakarta font-extrabold md:text-[60px] text-[36px] md:leading-[60px] leading-[40px]">
                        {data.value}
                      </div>
                      <div className="font-jakarta font-medium text-[16px] leading-6">
                        {data.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="py-24 md:px-28 px-4 bg-[#FDFBF7] flex justify-center items-center">
          <div className="flex justify-center items-center gap-16 flex-col md:flex-row">
            {/* Left Image + Card */}
            <div className="relative flex-shrink-0">
              <Image
                src={"/images/Volunteer.jpg"}
                alt="Our Mission Image"
                height={384}
                width={576}
                className="rounded-[40px] md:w-[700px] md:h-[466px] w-[358px] h-[238px]"
              />

              {!isMobile && (
                <div className="flex flex-col gap-4 p-6 border border-[#f5f5f4] rounded-[24px] absolute right-[-25px] bottom-[-15px] bg-white">
                  <div className="font-jakarta font-bold text-[12px] leading-4 text-[#78716C]">
                    Donation Growth
                  </div>

                  <Image
                    src={"/images/DonationGrowth.png"}
                    alt="Donation Growth"
                    height={96}
                    width={128}
                  />
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="flex flex-col gap-6 md:items-start items-center md:text-left text-center md:w-[45rem]">
              <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
                Our Mission and Vision
              </div>

              <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[48px] text-[30px] leading-[38px]">
                Work made possible by a dedicated community
              </div>

              <div className="font-jakarta font-normal text-[18px] leading-[30px] text-[#78716c]">
                To democratize fundraising by providing a transparent,
                accessible, and secure platform that connects passionate
                individuals with meaningful causes, enabling positive impact at
                scale.
              </div>

              <div className="font-jakarta font-normal text-[18px] leading-[30px] text-[#78716c] pb-2">
                A world where anyone can easily support causes they care about,
                where fundraising is transparent and accessible, and where
                collective action creates lasting positive change.
              </div>

              <Button
                className="bg-[#104109] px-8 py-4 rounded-full h-auto w-fit"
                onClick={() => {
                  router.push("/signup");
                }}
              >
                <div className="font-jakarta font-bold text-[18px] leading-7">
                  Join Our Mission
                </div>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="md:px-20 py-24 flex justify-center items-center"
          ref={journeyRef}
        >
          <div className="md:px-8 px-4 flex flex-col items-center justify-center gap-16">
            {/* Heading */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex gap-2 px-4 py-2 bg-red-50 rounded-full">
                <OurJourney />
                <div className="font-jakarta text-red-500 font-bold text-[12px] leading-4">
                  Your safety is our priority.
                </div>
              </div>

              <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[48px]  text-[30px] leading-[36px] text-center text-[#1C1917]">
                Donor Trust & Safety Statement
              </div>
              <div className="font-jakarta font-normal md:text-[20px] md:leading-7 text-center text-[#78716c]  md:max-w-[57rem] text-[18px] leading-[30px]">
                At ChainFundIt, we believe in building a trusted space for
                donors and fundraisers alike. Here’s how we help keep your
                giving safe and impactful.
              </div>
            </div>

            {/* Cards Row */}
            <div className="flex gap-8 md:flex-row flex-col">
              {/* Card 1 */}
              <div className="relative overflow-hidden rounded-[32px] group">
                <Image
                  src="/images/Founded.jpg"
                  alt="First Campaign"
                  width={280}
                  height={380}
                  className="object-cover md:h-[390px]  object-center rounded-[32px] brightness-75 transition-transform duration-300 group-hover:scale-110 md:w-[280px] w-[358px]"
                />
                <div className="absolute left-6 right-6 bottom-6 z-10 font-jakarta font-bold md:text-[20px] text-[24px] leading-[28px] flex text-center flex-col gap-1 transition-transform duration-500 translate-y-[calc(100%-28px)] group-hover:translate-y-0 overflow-hidden">
                  <div className="text-yellow-400">We Review Campaigns</div>
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-normal break-words">
                    Every campaign goes through platform checks to ensure it
                    aligns with our content guidelines and legal standards.
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative overflow-hidden rounded-[32px] group">
                <Image
                  src="/images/FirstCampaign.jpg"
                  alt="First Campaign"
                  width={280}
                  height={380}
                  className="object-cover md:h-[390px]  object-center rounded-[32px] brightness-75 transition-transform duration-300 group-hover:scale-110 md:w-[280px] w-[358px]"
                />
                <div className="absolute left-6 right-6 bottom-6 z-10 font-jakarta font-bold  md:text-[20px] text-[24px] leading-[28px] flex text-center flex-col gap-1 transition-transform duration-500 translate-y-[calc(100%-28px)] group-hover:translate-y-0 overflow-hidden">
                  <div className="text-yellow-400">Require Verification</div>
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-normal break-words">
                    Organisers must provide verified bank details and identity
                    documentation before receiving funds.
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative overflow-hidden rounded-[32px] group">
                <Image
                  src="/images/GlobalExpansion.jpg"
                  alt="First Campaign"
                  width={280}
                  height={380}
                  className="object-cover md:h-[390px]  object-center rounded-[32px] brightness-75 transition-transform duration-300 group-hover:scale-110 md:w-[280px] w-[358px]"
                />
                <div className="absolute left-6 right-6 bottom-6 z-10 font-jakarta font-bold  md:text-[20px] text-[24px] leading-[28px] flex text-center flex-col gap-1 transition-transform duration-500 translate-y-[calc(100%-28px)] group-hover:translate-y-0 overflow-hidden">
                  <div className="text-yellow-400">Addressing Concerns</div>
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-normal break-words">
                    If a campaign looks suspicious or misuses donations, our
                    team investigates and may suspend or remove it. You can
                    report any campaign through the platform.
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="relative overflow-hidden rounded-[32px] group">
                <Image
                  src="/images/Innovation.jpg"
                  alt="First Campaign"
                  width={280}
                  height={380}
                  className="object-cover md:h-[390px]  object-center rounded-[32px] brightness-75 transition-transform duration-300 group-hover:scale-110 md:w-[280px] w-[358px]"
                />
                <div className="absolute left-6 right-6 bottom-6 z-10 font-jakarta font-bold  md:text-[20px] text-[24px] leading-[28px] flex text-center flex-col gap-1 transition-transform duration-500 translate-y-[calc(100%-28px)] group-hover:translate-y-0 overflow-hidden">
                  <div className="text-yellow-400">Refund Review Policy</div>
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-normal break-words">
                    While donations are typically final, we review refund
                    requests if there’s evidence of fraud, error, or clear
                    policy violations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
