import React from "react";
import Image from "next/image";
import {
  Megaphone,
  Users,
  Target,
  Camera,
  CheckCircle,
  Clock,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function AmbassadorPage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#FDFBF7]">
        <div className="flex flex-col gap-16 pt-16 pb-12 items-center justify-center">
          <div className="flex flex-col gap-6 md:px-8 items-center justify-center px-4">
            <div className="flex gap-2 px-4 py-2 bg-yellow-200 rounded-full items-center">
              <Megaphone className="h-4 w-4 text-[#A16207]" />
              <div className="font-jakarta font-bold text-[12px] leading-4 text-[#A16207]">
                AMBASSADOR ROLE
              </div>
            </div>

            <div className="font-jakarta font-extrabold md:text-[54px] md:leading-[60px] text-center md:max-w-[62.5rem] text-[36px] leading-[40px]">
              ChainFundIt Ambassador Program
            </div>

            <div className="font-jakarta font-normal md:text-[20px] md:leading-7 text-center text-[#78716c] pb-4 md:max-w-[57rem] text-[18px] leading-[30px]">
              Are you a Mass Communication student or graduate, a TikToker, IG
              storyteller, content creator, or community journalist with a
              passion for social impact? Join the Doing Good Series to spotlight
              real community needs and help Nigerians access support through
              powerful storytelling.
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-[#104109] px-8 py-4 rounded-full h-auto">
                <a
                  href="https://www.chainfundit.com/doinggood"
                  target="_blank"
                  rel="noreferrer"
                >
                  Apply Now
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="px-8 py-4 rounded-full h-auto border-[#104109] text-[#104109]"
              >
                <a href="mailto:careers@chainfundit.com">Ask a Question</a>
              </Button>
            </div>
          </div>

          <Image
            src="/images/Volunteer.jpg"
            alt="ChainFundIt ambassadors"
            width={1000}
            height={480}
            className="rounded-[48px] object-cover object-center w-full max-w-[1000px] px-4"
          />
        </div>
      </div>

      <div className="py-20 md:px-20 flex items-center justify-center">
        <div className="md:px-8 px-4 md:max-w-[1280px] flex flex-col gap-12">
          <div className="flex flex-col gap-3 items-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              ROLE SNAPSHOT
            </div>
            <div className="font-jakarta font-bold md:text-[36px] text-[30px] md:leading-10 leading-[36px] text-[#1C1917] text-center">
              Fully remote, flexible, and mission-driven
            </div>
          </div>

          <div className="flex gap-8 flex-wrap justify-center flex-col md:flex-row">
            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#DCFCE7] flex items-center justify-center">
                <Users className="h-8 w-8 text-[#166534]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Fully remote
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                Work from anywhere and connect with communities across Nigeria.
              </div>
            </div>

            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FEF9C3] flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#A16207]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Flexible projects
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                Take on story assignments that fit your schedule and strengths.
              </div>
            </div>

            <div className="md:w-[384px] h-[300px] w-full rounded-[40px] border border-[#f5f5f4] flex flex-col items-center justify-center gap-5 bg-white">
              <div className="w-[80px] h-[80px] rounded-[24px] bg-[#FFEDD5] flex items-center justify-center">
                <Target className="h-8 w-8 text-[#EA580C]" />
              </div>
              <div className="font-jakarta font-bold text-[24px] leading-8 text-[#1C1917]">
                Rolling recruitment
              </div>
              <div className="font-jakarta font-normal text-[16px] leading-[26px] text-center text-[#78716C] w-[280px]">
                We are always looking for storytellers who care about impact.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 md:px-24 px-4 bg-white flex justify-center items-center">
        <div className="flex flex-col md:flex-row gap-12 md:max-w-[1200px]">
          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              What You'll Do
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Capture stories that inspire giving
            </div>
            <ul className="flex flex-col gap-3 text-[#78716c]">
              {[
                "Identify individuals or charities in need of crowdfunding support.",
                "Conduct on-ground or virtual interviews to capture their story.",
                "Create short-form content (videos, captions, photos) for social media.",
                "Publish and promote campaigns via ChainFundIt and your own platforms.",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <CheckCircle className="h-5 w-5 text-[#104109] mt-0.5" />
                  <span className="font-jakarta text-[16px] leading-[26px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="font-jakarta px-3 py-1 bg-[#E7E5E4] rounded-lg font-bold text-[12px] leading-4 w-fit">
              What You Get
            </div>
            <div className="font-jakarta font-extrabold md:text-[40px] md:leading-[44px] text-[28px] leading-[34px]">
              Build your portfolio and impact
            </div>
            <ul className="flex flex-col gap-3 text-[#78716c]">
              {[
                "Remote, flexible opportunity - work from anywhere.",
                "Build your content, journalism, and storytelling portfolio.",
                "Help amplify important causes in your community.",
              ].map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <Camera className="h-5 w-5 text-[#104109] mt-0.5" />
                  <span className="font-jakarta text-[16px] leading-[26px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="py-16 px-4">
        <div className="max-w-[1100px] mx-auto bg-[#104109] rounded-[40px] p-10 md:p-14 text-white flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-3">
            <div className="font-jakarta font-bold text-[12px] leading-4 uppercase text-white/70">
              Apply Now
            </div>
            <div className="font-jakarta font-extrabold md:text-[36px] md:leading-[40px] text-[28px] leading-[34px]">
              Ready to join the Doing Good Series?
            </div>
            <div className="font-jakarta text-[16px] leading-[26px] text-white/80">
              Submit your interest and we will follow up with next steps.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              className="bg-white text-[#104109] hover:bg-gray-100 rounded-full px-8 py-4 h-auto"
            >
              <a
                href="https://www.chainfundit.com/doinggood"
                target="_blank"
                rel="noreferrer"
              >
                Apply Now
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white text-white rounded-full px-8 py-4 h-auto"
            >
              <a href="mailto:careers@chainfundit.com">Ask a Question</a>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
