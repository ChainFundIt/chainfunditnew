"use client";

import React, { useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Users,
  Target,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Lightbulb,
  HandHeart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import AboutUsIcon from "@/public/icons/AboutUsIcon";
import Image from "next/image";
import ShieldIcon from "@/public/icons/ShieldIcon";
import BulbIcon from "@/public/icons/BulbIcon";
import AboutUsImpact from "@/public/icons/AboutUsImpact";
import OurJourney from "@/public/icons/OurJourney";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";

const stats = [
  { label: "Campaigns Funded", value: "50+", icon: Target },
  { label: "Successful Donotions", value: "521+", icon: Users },
  { label: "Amount Raised", value: "£20,250+", icon: TrendingUp },
  { label: "Countries Reached", value: "2+", icon: Globe },
];

const values = [
  {
    icon: Shield,
    title: "Transparency",
    description:
      "We believe in complete transparency in all transactions and campaign management.",
  },
  {
    icon: Heart,
    title: "Impact",
    description:
      "Every donation makes a real difference in the lives of those who need it most.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a global community of changemakers and supporters.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "Committed to providing the best possible platform and user experience.",
  },
];

const timeline = [
  {
    year: "2020",
    title: "Founded",
    description:
      "ChainFundIt was born from a vision to make fundraising more accessible and transparent.",
  },
  {
    year: "2021",
    title: "First Campaign",
    description:
      "Launched our first successful campaign, raising $10,000 for a local community project.",
  },
  {
    year: "2022",
    title: "Platform Growth",
    description: "Reached 1,000 active campaigns and expanded to 10 countries.",
  },
  {
    year: "2023",
    title: "Global Expansion",
    description:
      "Introduced advanced features and reached $1M in total funds raised.",
  },
  {
    year: "2024",
    title: "Innovation",
    description: "Launched AI-powered campaign recommendations and mobile app.",
  },
];

export default function AboutPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const journeyRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <Navbar />

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
              clear communication and creative promotion. From medical needs to
              emergencies, our platform fuels donation-based campaigns—and our
              unique “Chainfunding” feature accelerates growth through shared
              momentum.
            </div>

            <Button
              className="bg-[#1C1917] px-8 py-4 rounded-full h-auto"
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
                Every donation makes a real difference in the lives of those who
                need it most.
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
              className="rounded-[40px] md:w-[576px] md:h-[384px] w-[358px] h-[238px]"
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
          <div className="flex flex-col gap-6 md:items-start items-center md:text-left text-center">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              Our Mission
            </div>

            <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[48px] text-[30px] leading-[38px]">
              Work made possible by a dedicated community
            </div>

            <div className="font-jakarta font-normal text-[18px] leading-[30px] text-[#78716c]">
              We value transparency and keep our supporters informed about the
              tangible outcomes of their contributions. ChainFundit empowers
              campaign organizers with clear communication and consistent
              engagement.
            </div>

            <div className="font-jakarta font-normal text-[18px] leading-[30px] text-[#78716c] pb-2">
              Its unique "Chainfunding" feature accelerates fundraising by
              enabling users to share campaigns, spark interest, and track
              progressâ€”positioning ChainFundit as the future of crowdfunding.
            </div>

            <Button
              className="bg-[#1C1917] px-8 py-4 rounded-full h-auto w-fit"
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
                Our Journey
              </div>
            </div>

            <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[48px]  text-[30px] leading-[36px]text-center text-[#1C1917]">
              How we've grown
            </div>
          </div>

          {/* Cards Row */}
          <div className="flex gap-8 md:flex-row flex-col">
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/Founded.png"
                alt="Founded"
                width={280}
                height={380}
                className="object-cover object-center rounded-[32px] brightness-75 transition-transform duration-300 hover:scale-110 md:w-[280px] w-[358px]"
              />
              <div className="absolute bottom-8 left-6 z-10 font-jakarta font-bold text-[20px] leading-[28px] flex flex-col gap-1">
                <div className="text-yellow-400">2020</div>
                <div className="text-white">Founded</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/FirstCampaign.png"
                alt="First Campaign"
                width={280}
                height={380}
                className="object-cover object-center rounded-[32px] brightness-75 transition-transform duration-300 hover:scale-110 md:w-[280px] w-[358px]"
              />
              <div className="absolute bottom-8 left-6 z-10 font-jakarta font-bold text-[20px] leading-[28px] flex flex-col gap-1">
                <div className="text-yellow-400">2021</div>
                <div className="text-white">First Campaign</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/GlobalExpansion.png"
                alt="Global Expansion"
                width={280}
                height={380}
                className="object-cover object-center rounded-[32px] brightness-75 transition-transform duration-300 hover:scale-110 md:w-[280px] w-[358px]"
              />
              <div className="absolute bottom-8 left-6 z-10 font-jakarta font-bold text-[20px] leading-[28px] flex flex-col gap-1">
                <div className="text-yellow-400">2023</div>
                <div className="text-white">Global Expansion</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative overflow-hidden rounded-[32px]">
              <Image
                src="/images/Innovation.png"
                alt="Innovation"
                width={280}
                height={380}
                className="object-cover object-center rounded-[32px] brightness-75 transition-transform duration-300 hover:scale-110 md:w-[280px] w-[358px] "
              />
              <div className="absolute bottom-8 left-6 z-10 font-jakarta font-bold text-[20px] leading-[28px] flex flex-col gap-1">
                <div className="text-yellow-400">2024</div>
                <div className="text-white">Innovation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About ChainFundIt
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8">
            We&apos;re on a mission to democratize fundraising and make it
            easier for people to support causes they care about, anywhere in the
            world.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
              <Heart className="h-4 w-4 mr-2" />
              Making Impact Together
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
              <Globe className="h-4 w-4 mr-2" />
              Global Community
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
              <Shield className="h-4 w-4 mr-2" />
              Trusted Platform
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p>
                  Our innovative platform is dedicated to promoting a clear
                  message to inspire action, as well as creative and constant
                  promotion and consistent communication between campaign
                  organizers (i.e., family members, friends, colleagues, social
                  groups, individuals, and businesses), campaign ambassadors,
                  and campaign donors.
                </p>
                <p>
                  ChainFundIt promotes donation-based campaigns to raise funds
                  for medical and life emergencies, business and financial
                  support, funeral expenses, and birthday gifts.
                </p>
                <p>
                  The innovative and unique â€œChainfundingâ€ feature of
                  ChainFundIt is poised to become the â€œuberâ€ of the crowdfunding
                  world. It is a technological enabler for accelerating
                  donation-based fundraising campaigns, introducing the chain
                  feature by â€œchainingâ€ (sharing a campaign to generate
                  interest), and providing regular progress updates.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button className=" text-white px-8 py-3">
                    Join Our Mission
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="p-3 bg-white rounded-xl w-fit mx-auto mb-3">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in the power of collective action to create positive
              change in the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-6">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  To democratize fundraising by providing a transparent,
                  accessible, and secure platform that connects passionate
                  individuals with meaningful causes, enabling positive impact
                  at scale.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  A world where anyone can easily support causes they care
                  about, where fundraising is transparent and accessible, and
                  where collective action creates lasting positive change.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape our commitment
              to our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to global impact - here&apos;s how
              we&apos;ve grown.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-600 to-blue-600 rounded-full"></div>

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-1/2 ${
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
                    }`}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            {item.year}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-4 border-green-600 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind ChainFundIt, dedicated to making
              a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl text-center ">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center">
                    {member.name}
                  </h3>
                  <p className="text-green-600 font-medium text-center mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm text-left">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div> 

        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join chainfunders in making a difference through ChainFundIt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-campaign">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                <HandHeart className="h-5 w-5 mr-2" />
                Start a Campaign
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                <Heart className="h-5 w-5 mr-2" />
                Browse Causes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer /> */}
    </>
  );
}
