import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Heart,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { db } from "@/lib/db";
import { careerOpenings } from "@/lib/schema";
import { asc, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const benefits = [
  {
    icon: DollarSign,
    title: "Competitive Salary",
    description:
      "We offer competitive compensation packages based on experience and location.",
    bg: "bg-[#DCFCE7]",
    iconColor: "text-[#166534]",
  },
  {
    icon: Heart,
    title: "Health & Wellness",
    description:
      "Comprehensive health insurance and wellness programs to keep you healthy.",
    bg: "bg-[#FEF9C3]",
    iconColor: "text-[#A16207]",
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description:
      "Remote work options and flexible hours to support work-life balance.",
    bg: "bg-[#FFEDD5]",
    iconColor: "text-[#EA580C]",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Opportunities for professional development and career advancement.",
    bg: "bg-[#DBEAFE]",
    iconColor: "text-[#1D4ED8]",
  },
  {
    icon: Users,
    title: "Great Team",
    description:
      "Work with a passionate, diverse team committed to making a difference.",
    bg: "bg-[#E0F2FE]",
    iconColor: "text-[#0F766E]",
  },
  {
    icon: Shield,
    title: "Impact",
    description:
      "Be part of a platform that helps people achieve their fundraising goals.",
    bg: "bg-[#EDE9FE]",
    iconColor: "text-[#6D28D9]",
  },
];

export default async function CareersPage() {
  const openings = await db
    .select()
    .from(careerOpenings)
    .where(eq(careerOpenings.isActive, true))
    .orderBy(asc(careerOpenings.sortOrder), desc(careerOpenings.createdAt));

  const ambassadorStartDate = new Date("2026-01-19T00:00:00.000Z");
  const ambassadorEndDate = new Date(ambassadorStartDate);
  ambassadorEndDate.setUTCDate(ambassadorEndDate.getUTCDate() + 21);
  const showAmbassadorRole = new Date() <= ambassadorEndDate;

  return (
    <>
      <Navbar />
      <div className="bg-[#FDFBF7]">
        <div className="flex flex-col gap-16 pt-16 pb-12 items-center justify-center">
          <div className="flex flex-col gap-6 md:px-8 items-center justify-center px-4">
            <div className="flex gap-2 px-4 py-2 bg-yellow-200 rounded-full items-center">
              <Briefcase className="h-4 w-4 text-[#A16207]" />
              <div className="font-jakarta font-bold text-[12px] leading-4 text-[#A16207]">
                CAREERS
              </div>
            </div>

            <div className="font-jakarta font-extrabold md:text-[54px] md:leading-[60px] text-center md:max-w-[62.5rem] text-[36px] leading-[40px]">
              Build the future of fundraising with ChainFundIt
            </div>


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                <div className="flex flex-col gap-4 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-[#A16207] text-xs font-bold w-fit mx-auto lg:mx-0">
                    OUR MISSION
                  </div>
                  <p className="font-jakarta font-normal md:text-[20px] md:leading-7 text-[#78716c] text-[18px] leading-[30px]">
                    Join a mission-driven team helping communities across Africa
                    access the support they need through modern crowdfunding.
                  </p>
                </div>

                <div className="flex justify-center lg:justify-end">
                  <Image
                    src="/images/careers.jpg"
                    alt="Careers at ChainFundIt"
                    width={560}
                    height={360}
                    className="w-full max-w-[560px] rounded-[48px] object-cover object-center"
                  />
                </div>
              </div>

            <Button
              className="bg-[#104109] px-8 py-4 rounded-full h-auto"
              asChild
            >
              <Link href="#open-roles">View Open Roles</Link>
            </Button>
          </div>


        </div>
      </div>

      <div className="py-20 md:px-20 flex items-center justify-center">
        <div className="md:px-8 px-4 md:max-w-[1280px] flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              WHY WORK WITH US
            </div>
            <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
              A mission, a team, and room to grow
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="md:w-[384px] h-[320px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white"
                >
                  <div
                    className={`w-[80px] h-[80px] rounded-[24px] ${benefit.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-8 w-8 ${benefit.iconColor}`} />
                  </div>
                  <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                    {benefit.title}
                  </div>
                  <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                    {benefit.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-20 md:px-20 flex items-center justify-center bg-[#FDFBF7]">
        <div
          className="md:px-8 px-4 md:max-w-[1280px] flex flex-col gap-12"
          id="open-roles"
        >
          <div className="flex flex-col gap-3 items-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              OPEN ROLES
            </div>
            <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
              Current openings
            </div>
            <div className="font-jakarta font-normal text-[18px] leading-[30px] text-center text-[#78716c] md:max-w-[57rem]">
              Explore our current job openings and find the perfect role for
              you.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {showAmbassadorRole && (
              <div className="rounded-[40px] border border-[#f5f5f4] bg-[#FDFBF7] p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:col-span-2">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-[#A16207] text-xs font-bold">
                    AMBASSADOR PROGRAM
                  </div>
                  <div className="font-jakarta font-bold text-[28px] leading-[34px] text-[#1C1917]">
                    ChainFundIt Ambassador (Doing Good Series)
                  </div>
                  <div className="text-[#78716c] max-w-[760px]">
                    Meet the storytellers behind the Doing Good Series. Learn more
                    about the role, responsibilities, and how to apply. Open for 3
                    weeks from today.
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="bg-[#104109] p-6 rounded-full">
                    <Link href="/doinggood">View Ambassador Role</Link>
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-[40px] border border-[#f5f5f4] bg-[#FDFBF7] p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:col-span-2">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-[#A16207] text-xs font-bold">
                  OPEN ROLE
                </div>
                <div className="font-jakarta font-bold text-[28px] leading-[34px] text-[#1C1917]">
                  Partnerships &amp; Growth Associate
                </div>
                <div className="text-[#78716c] max-w-[760px]">
                  Support the expansion of ChainFundIt by onboarding charities,
                  community organisations, and individual campaigners.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[#104109] p-6 rounded-full">
                  <Link href="/careers/partnerships-growth-associate">
                    View Role 
                  </Link>
                </Button>
              </div>
            </div>

            {openings.map((opening) => {
              const responsibilities = Array.isArray(opening.responsibilities)
                ? opening.responsibilities
                : [];
              const requirements = Array.isArray(opening.requirements)
                ? opening.requirements
                : [];
              const customFields = Array.isArray(opening.customFields)
                ? opening.customFields
                : [];

              return (
                <div
                  key={opening.id}
                  className="rounded-[40px] border border-[#f5f5f4] bg-white p-8 flex flex-col gap-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                        {opening.title}
                      </div>
                      {opening.department && (
                        <div className="text-sm text-[#78716c]">
                          {opening.department}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 text-[#166534] text-xs font-bold">
                      OPEN
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-[#78716c]">
                    {opening.location && (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#104109]" />
                        {opening.location}
                      </span>
                    )}
                    {opening.employmentType && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#104109]" />
                        {opening.employmentType}
                      </span>
                    )}
                  </div>

                  {opening.summary && (
                    <div className="text-[#78716c]">{opening.summary}</div>
                  )}

                  {responsibilities.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-[#1C1917] mb-2">
                        What you will do
                      </div>
                      <ul className="space-y-1 text-sm text-[#78716c]">
                        {responsibilities.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {requirements.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-[#1C1917] mb-2">
                        What we are looking for
                      </div>
                      <ul className="space-y-1 text-sm text-[#78716c]">
                        {requirements.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {customFields.length > 0 && (
                    <div className="space-y-2">
                      {customFields.map((field, index) => (
                        <div key={`${field.label}-${index}`} className="text-sm">
                          <span className="font-semibold text-[#1C1917]">
                            {field.label}:
                          </span>{" "}
                          <span className="text-[#78716c]">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <Button asChild className="bg-[#104109] rounded-full">
                      <a
                        href={
                          opening.applyUrl || "mailto:careers@chainfundit.com"
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Apply now
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {openings.length === 0 && !showAmbassadorRole && (
            <div className="rounded-[40px] border border-[#f5f5f4] bg-white p-10 text-center mt-8">
              <div className="font-jakarta font-bold text-[20px] text-[#1C1917] mb-2">
                No other open positions right now
              </div>
              <div className="font-jakarta text-[16px] leading-[26px] text-[#78716c]">
                Check back soon or send your resume to{" "}
                <a
                  href="mailto:careers@chainfundit.com"
                  className="text-[#104109] font-semibold"
                >
                  careers@chainfundit.com
                </a>
                .
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-[1100px] mx-auto bg-[#104109] rounded-[40px] p-10 md:p-14 text-white flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-3">
            <div className="font-jakarta font-bold text-[12px] leading-4 uppercase text-white/70">
              Get in touch
            </div>
            <div className="font-jakarta font-extrabold md:text-[36px] md:leading-[40px] text-[28px] leading-[34px]">
              Ready to make an impact?
            </div>
            <div className="font-jakarta text-[16px] leading-[26px] text-white/80">
              Email our team and we will keep you in mind for future
              opportunities.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* <Button
              asChild
              className="bg-white text-[#104109] hover:bg-gray-100 rounded-full px-8 py-4 h-auto"
            >
              <a href="mailto:careers@chainfundit.com">Contact careers</a>
            </Button> */}
            <Button
              asChild
              variant="outline"
              className="border-white text-white rounded-full px-8 py-4 h-auto"
            >
              <Link href="/about">Learn more about us</Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
