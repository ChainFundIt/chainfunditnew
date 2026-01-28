import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, TrendingUp } from "lucide-react";
import PartnershipsApplicationForm from "@/components/partnerships/PartnershipsApplicationForm";

export default function PartnershipsGrowthAssociatePage() {
  return (
    <>
      <Navbar />
      <div className="bg-[#FDFBF7]">
        <div className="flex flex-col gap-10 pt-16 pb-12 items-center justify-center px-4">
          <div className="flex flex-col gap-4 items-center text-center">
            <div className="flex gap-2 px-4 py-2 bg-yellow-200 rounded-full items-center">
              <Briefcase className="h-4 w-4 text-[#A16207]" />
              <div className="font-jakarta font-bold text-[12px] leading-4 text-[#A16207]">
                OPEN ROLE
              </div>
            </div>
            <div className="font-jakarta font-extrabold md:text-[48px] md:leading-[52px] text-[34px] leading-[40px]">
              Partnerships & Growth Associate
            </div>
            <p className="font-jakarta text-[18px] leading-[28px] text-[#78716c] max-w-[760px]">
              Support the expansion of ChainFundIt by onboarding charities,
              community organisations, and individual campaigners.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[#78716c] justify-center">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#104109]" />
                Fully remote (Nigeria)
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#104109]" />
                Part-time or Full-time
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#104109]" />
                Junior / Early Career
              </span>
            </div>
            <Button asChild className="bg-[#104109] px-6 py-3 rounded-full">
              <a href="#application-form">Apply Now</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="py-16 md:px-20 px-4 flex justify-center">
        <div className="max-w-[960px] w-full space-y-10">
          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              About ChainFundIt
            </h2>
            <p className="font-jakarta text-[16px] leading-[28px] text-[#78716c]">
              ChainFundIt is a Nigeria-focused crowdfunding platform designed to
              enable individuals, charities, and community organisations to raise
              funds transparently and efficiently for verified causes, including
              medical needs, education, emergencies, and community initiatives.
            </p>
            <p className="font-jakarta text-[16px] leading-[28px] text-[#78716c]">
              Our mission is to strengthen trust in giving by providing a
              structured, accountable, and locally relevant alternative to
              informal fundraising methods.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              Role Overview
            </h2>
            <p className="font-jakarta text-[16px] leading-[28px] text-[#78716c]">
              We are seeking a highly motivated Partnerships & Growth Associate to
              support the expansion of the ChainFundIt platform through the
              onboarding of charities, community organisations, and individual
              campaigners. This role is responsible for building strategic
              relationships, guiding partners through the onboarding process, and
              contributing to platform growth through defined monthly targets.
              The position also includes coordination and oversight of field-level
              brand ambassadors.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              Key Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#78716c] text-[16px] leading-[28px]">
              <li>Identify, engage, and onboard charities, NGOs, and community-based organisations onto the ChainFundIt platform.</li>
              <li>Identify individuals and groups seeking crowdfunding support and guide them through campaign setup and onboarding.</li>
              <li>Explain the value of structured crowdfunding, including transparency, accountability, and donor confidence.</li>
              <li>Maintain relationships with partners and stakeholders throughout the onboarding lifecycle.</li>
              <li>Support, coordinate, and monitor ChainFundIt Ambassadors to ensure consistent outreach.</li>
              <li>Track onboarding activity, maintain accurate records, and work toward monthly growth targets.</li>
              <li>Provide updates and feedback to internal teams on partnership progress, challenges, and opportunities.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              Candidate Profile
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#78716c] text-[16px] leading-[28px]">
              <li>Strong verbal and written communication skills.</li>
              <li>Confidence engaging stakeholders via phone, email, social media, and virtual meetings.</li>
              <li>Results-oriented mindset with comfort working toward targets.</li>
              <li>Ability to explain complex concepts clearly and persuasively.</li>
              <li>High organisation, attention to detail, and follow-through.</li>
              <li>Genuine interest in social impact, community development, and ethical fundraising.</li>
              <li>Ability to work independently in a remote environment.</li>
            </ul>
            <p className="font-jakarta text-[16px] leading-[28px] text-[#78716c]">
              Prior experience in partnerships, sales, outreach, community
              management, or business development is an advantage but not
              mandatory.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              Role Details
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#78716c] text-[16px] leading-[28px]">
              <li>Location: Fully remote (Nigeria)</li>
              <li>Employment Type: Part-time or Full-time (depending on availability and performance)</li>
              <li>Level: Junior / Early Career</li>
              <li>Reporting Line: Growth / Partnerships Lead</li>
              <li>Compensation: Competitive base compensation with performance-based incentives aligned to onboarding targets</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="font-jakarta font-bold text-[28px] text-[#1C1917]">
              Why Join ChainFundIt
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-[#78716c] text-[16px] leading-[28px]">
              <li>Contribute to a platform designed to strengthen trust and transparency in giving.</li>
              <li>Gain hands-on experience in partnerships, growth, and stakeholder engagement.</li>
              <li>Work in a purpose-driven environment with measurable social impact.</li>
              <li>Flexible working arrangement with opportunities for growth and progression.</li>
            </ul>
          </section>
        </div>
      </div>

      <div
        id="application-form"
        className="py-16 md:px-24 px-4 bg-white flex justify-center"
      >
        <div className="md:max-w-[1100px] w-full rounded-[40px] border border-[#f5f5f4] bg-white p-8 md:p-12 space-y-6">
          <div className="space-y-3 text-center">
            <div className="font-jakarta font-bold text-[14px] leading-5 text-[#A8A29E]">
              APPLICATION FORM
            </div>
            <div className="font-jakarta font-bold md:text-[32px] text-[26px] md:leading-10 leading-[32px] text-[#1C1917]">
              Partnerships & Growth Associate
            </div>
            <p className="font-jakarta text-[16px] leading-[26px] text-[#78716c]">
              Applications are reviewed on a rolling basis. Early applications
              are encouraged.
            </p>
          </div>

          <PartnershipsApplicationForm />
        </div>
      </div>

      <Footer />
    </>
  );
}
