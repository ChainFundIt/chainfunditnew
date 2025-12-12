"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Users,
  DollarSign,
  Image,
  Heart,
  Briefcase,
  Share2,
  Shield,
  AlertTriangle,
  Scale,
  Mail,
  Ban,
} from "lucide-react";
import Link from "next/link";

const tableOfContents = [
  { id: "a-introduction", label: "A. Introduction & Scope" },
  { id: "b-roles", label: "B. Roles & Obligations" },
  { id: "c-fees", label: "C. Fees & Payments" },
  { id: "d-media", label: "D. Media & Uploaded Content" },
  { id: "e-donors", label: "E. Donors & Donations" },
  { id: "f-organisers", label: "F. Campaign Organisers" },
  { id: "f1-prohibited", label: "F.1. Prohibited Campaigns" },
  { id: "g-ambassadors", label: "G. Chain Ambassadors" },
  { id: "h-suspension", label: "H. Account Suspension" },
  { id: "i-liability", label: "I. Liability & Risk" },
  { id: "j-changes", label: "J. Changes & Legal Terms" },
];

const sections = [
  {
    id: "a-introduction",
    title: "A. Introduction & Scope",
    icon: FileText,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <ul className="list-disc list-inside space-y-2">
              <li>
                ChainFundIt Limited ("ChainFundIt", "we", "us") is registered in
                England & Wales (Company No. 13253451), with its registered
                office at 71–75 Shelton Street, Covent Garden, London, England,
                WC2H 9JQ.
              </li>
              <li>
                ChainFundIt is a donation-based crowdfunding platform that
                enables individuals, groups, and organisations ("Organisers") to
                raise money for personal, charitable, and community-based
                causes.
              </li>
              <li>
                ChainFundIt does <strong>not</strong> offer loan-based or
                investment-based crowdfunding services.
              </li>
              <li>
                ChainFundIt is not regulated by the UK Financial Conduct
                Authority (FCA) or the Nigerian Securities and Exchange
                Commission (SEC). Users are encouraged to perform due diligence
                before donating.
              </li>
              <li>
                By using the platform, including opening an account, creating or
                donating to a campaign, or accessing ChainFundIt in any way, you
                agree to these Terms, the{" "}
                <Link
                  href="/privacy-policy"
                  className="text-[#104901] hover:underline "
                >
                  Privacy Policy
                </Link>
                , the{" "}
                <Link
                  href="/privacy-policy#cookies"
                  className="text-[#104901] hover:underline "
                >
                  Cookie Policy
                </Link>
                , and the applicable terms of any payment service provider used
                in connection with our platform.
              </li>
              <li>
                Users must be at least <strong>18 years old</strong> or the
                legal age of majority in their jurisdiction.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "b-roles",
    title: "B. Roles & Obligations",
    icon: Users,
    content: [
      {
        subtitle: "Our Role",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              We manage and operate the ChainFundIt platform, administer
              campaigns, process transactions, and provide support to users.
            </li>
            <li>
              We enable a feature known as the "chain," allowing users (called
              "Chain Ambassadors") to promote campaigns through personalised
              links and earn a commission on donations referred via those links.
            </li>
            <li>
              We are not a bank, payment provider, or financial intermediary. We
              work with licensed third-party payment providers to process
              donations.
            </li>
            <li>
              We reserve the right to approve, decline, suspend, or remove any
              campaign that violates our Terms or content policies.
            </li>
          </ul>
        ),
      },
      {
        subtitle: "Your Role",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              You must provide true, accurate, and complete information during
              account setup and keep your details up to date.
            </li>
            <li>
              You are responsible for maintaining the security of your login
              credentials and for all activity on your account.
            </li>
            <li>
              You agree to only use the platform in accordance with these Terms
              and applicable laws.
            </li>
            <li>
              You may not use ChainFundIt to fundraise for or promote any
              illegal, deceptive, or prohibited activity.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "c-fees",
    title: "C. Fees & Payments",
    icon: DollarSign,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>It is free to start a campaign.</li>
            <li>
              ChainFundIt charges a <strong>platform fee of up to 10%</strong>{" "}
              on each donation.
            </li>
            <li>
              If the "chain" feature is enabled, the Organiser can set a{" "}
              <strong>Chain Commission</strong> to reward Ambassadors promoting
              the campaign.
            </li>
            <li>
              Payment providers may charge additional fees for processing,
              currency conversion, or international transactions.
            </li>
            <li>
              ChainFundIt uses licensed third-party payment providers such as{" "}
              <strong>Paystack</strong>, <strong>Flutterwave</strong>, and
              others. Their terms also apply to transactions on the platform.
            </li>
            <li>
              Funds are typically transferred to verified Organisers within{" "}
              <strong>2 business days</strong>, though this may vary depending
              on provider timelines and security checks.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "d-media",
    title: "D. Media & Uploaded Content",
    icon: Image,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              Media and files uploaded to the platform will be retained for{" "}
              <strong>3 months</strong> after a campaign ends or is closed.
            </li>
            <li>
              After this period, ChainFundIt reserves the right to{" "}
              <strong>delete files</strong> without further notice.
            </li>
            <li>
              Users are responsible for backing up any media they wish to
              retain.
            </li>
            <li>
              By uploading media, you grant ChainFundIt a{" "}
              <strong>non-exclusive, royalty-free license</strong> to display,
              share, and use the content in connection with the campaign and
              platform.
            </li>
            <li>
              ChainFundIt reserves the right to remove or request changes to
              content that violates these Terms or content guidelines.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "e-donors",
    title: "E. Donors & Donations",
    icon: Heart,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              Donations are <strong>gifts</strong>, not payments for goods or
              services. Donors should not expect anything in return.
            </li>
            <li>
              Donations are <strong>non-refundable</strong>, except where
              required by law or under ChainFundIt's refund review process
              (e.g., proven fraud or mistake).
            </li>
            <li>
              ChainFundIt may refund a donation, redirect it to another
              campaign, or withhold it if the original campaign cannot receive
              the funds.
            </li>
            <li>
              Currency conversions may involve delays, fees, and exchange rate
              fluctuations.
            </li>
            <li>
              ChainFundIt does not guarantee that donation receipts are
              tax-deductible in your jurisdiction. Consult a tax advisor.
            </li>
            <li>
              Donors may choose to remain anonymous. In such cases, Organisers
              will not receive the donor's identity.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "f-organisers",
    title: "F. Campaign Organisers",
    icon: Briefcase,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                Organisers are responsible for ensuring that all campaign
                details are <strong>truthful, transparent, and legal</strong>.
              </li>
              <li>
                Organisers may not use ChainFundIt for campaigns involving:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Criminal activity</li>
                  <li>Money laundering or terrorism financing</li>
                  <li>False or misleading statements</li>
                  <li>Medical misinformation</li>
                  <li>Fraud or impersonation</li>
                </ul>
                See our <strong>Prohibited Campaigns Policy</strong> below for
                full details.
              </li>
              <li>
                ChainFundIt reserves the right to{" "}
                <strong>suspend, freeze, or delete</strong> any campaign
                suspected of violating these terms and to{" "}
                <strong>report such activity to authorities</strong>.
              </li>
              <li>
                Organisers must comply with{" "}
                <strong>applicable fundraising laws</strong>, tax obligations,
                and reporting rules.
              </li>
              <li>
                If a donor overpays or donates in error, the Organiser must
                issue a refund within <strong>2 business days</strong>.
              </li>
              <li>
                Organisers may propose an "Alternative Recipient" to receive
                campaign funds, but ChainFundIt must approve the change.
              </li>
              <li>
                Changes to a campaign's payment account must be requested
                through the dashboard and are subject to admin verification.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "f1-prohibited",
    title: "F.1. Prohibited Campaigns Policy",
    icon: Ban,
    content: [
      {
        subtitle:
          "At ChainFundIt, we're committed to supporting causes that are honest, transparent, and lawful. The following types of campaigns are strictly prohibited on our platform:",
        text: (
          <>
            <div className="space-y-4">
              <div>
                <h4 className=" text-gray-900 mb-2">
                  1. Illegal or Unlawful Activity
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Funding for terrorism, money laundering, drug trafficking,
                    or any other criminal enterprise.
                  </li>
                  <li>
                    Violations of financial regulations or sanctions laws.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  2. Harmful or Dangerous Causes
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>Weapons, explosives, or tools for violence.</li>
                  <li>
                    Promotion of hate speech, racism, xenophobia, or
                    discrimination.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  3. Misinformation or Misleading Claims
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Unverified or false medical claims (e.g., miracle cures).
                  </li>
                  <li>
                    Fake charitable appeals, impersonation of individuals or
                    groups.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  4. Adult or Inappropriate Content
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Pornography, adult services, or sexually explicit material.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  5. Gambling or Speculative Investments
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Lotteries, betting pools, pyramid schemes, or high-risk
                    financial solicitations.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  6. Political Manipulation
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Election-related fundraising that violates local campaign
                    finance laws or promotes disinformation.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className=" text-gray-900 mb-2">
                  7. Other Prohibited Purposes
                </h4>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    Campaigns with no clear use of funds or lack of
                    transparency.
                  </li>
                  <li>
                    Any content that violates our Terms & Conditions or local
                    laws.
                  </li>
                </ul>
              </div>

              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500">
                <p className="text-gray-900 ">
                  Violation of this policy may result in immediate campaign
                  removal, account suspension, or reporting to relevant
                  authorities.
                </p>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "g-ambassadors",
    title: "G. Chain Ambassadors",
    icon: Share2,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              Must be at least <strong>18 years old</strong> or legal adult age
              in their jurisdiction.
            </li>
            <li>
              May promote campaigns using unique "chain links" and are eligible
              for a <strong>chain commission</strong> (a % of donations referred
              through their link).
            </li>
            <li>Commissions are paid to verified accounts only.</li>
            <li>
              Chain Ambassadors must not misrepresent campaigns or engage in
              spam, coercion, or other deceptive practices.
            </li>
            <li>
              In cases of dispute over commission payments, ChainFundIt may
              withhold or reverse commissions during review.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "h-suspension",
    title: "H. Account Suspension, Campaign Closure & Termination",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              ChainFundIt may modify, suspend, or discontinue any aspect of the
              platform without prior notice.
            </li>
            <li>
              Accounts may be suspended or terminated for breach of Terms,
              inactivity, fraud, or legal concerns.
            </li>
            <li>
              <strong>Inactive accounts</strong> (no login for 12+ months) may
              be marked dormant and require re-verification.
            </li>
            <li>
              Upon account or campaign closure, remaining donations may be
              refunded or reallocated.
            </li>
            <li>
              Campaigns automatically close at the end of their designated
              duration.
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "i-liability",
    title: "I. Liability, Risk & Fund Protection",
    icon: Shield,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                You are responsible for losses caused to ChainFundIt by your
                actions, including breach, fraud, or failure to secure your
                account.
              </li>
              <li>
                ChainFundIt is not liable for:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Downtime, bugs, or errors</li>
                  <li>Cyberattacks or data breaches</li>
                  <li>Payment processor failures</li>
                  <li>Force majeure events (e.g. natural disasters, war)</li>
                </ul>
              </li>
              <li>
                Funds may be pooled in a holding account and are{" "}
                <strong>
                  not insured or protected by the Financial Services
                  Compensation Scheme (FSCS)
                </strong>{" "}
                or similar schemes.
              </li>
              <li>
                <strong>No interest will be paid</strong> to users on held
                funds.
              </li>
              <li>
                ChainFundIt reserves the right to{" "}
                <strong>withhold, freeze, or refund</strong> donations during
                dispute or investigation.
              </li>
              <li>
                You may not use the platform for any{" "}
                <strong>illegal, harmful, or prohibited purpose</strong>.
                ChainFundIt is not liable for losses resulting from such misuse.
              </li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: "j-changes",
    title: "J. Changes, Notifications & Legal Terms",
    icon: Scale,
    content: [
      {
        subtitle: "",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>
              ChainFundIt may update these Terms with at least{" "}
              <strong>5 days' notice</strong> via email or platform
              notification. Shorter notice may be provided in urgent cases.
            </li>
            <li>
              Continued use of the platform after changes constitutes
              acceptance.
            </li>
            <li>
              All communications will be delivered via the platform or your
              provided email. Keep your contact info up to date.
            </li>
            <li>
              These Terms are governed by the laws of{" "}
              <strong>England & Wales</strong>, and for users in Nigeria, local
              law may apply.
            </li>
            <li>
              If any provision of these Terms is found invalid, the remainder
              shall remain enforceable.
            </li>
          </ul>
        ),
      },
    ],
  },
];

export default function TermsAndConditionsPage() {
  const [activeSection, setActiveSection] = useState("a-introduction");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="font-jakarta bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="flex justify-center px-4 py-20 bg-[#FCFAF5]">
        {/* Right Corner Blur Overlay */}
        <div
          className="absolute top-0 right-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.2,
          }}
        ></div>

        {/* Left Corner Blur Overlay */}
        <div
          className="absolute top-0 left-0 pointer-events-none hidden md:flex"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1,
          }}
        ></div>

        {/* Center Content Container */}
        <div className="flex flex-col items-center justify-center gap-6 md:max-w-[80rem] w-full">
          {/* Trophy Icon Badge */}
          <div className="p-3 bg-[#ECFDF5] rounded-xl">
            <Shield className="h-8 w-8 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div className="font-extrabold text-[#022C22] text-[4rem] leading-[4rem] text-center">
            Terms and Conditions
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Please read these terms carefully before using ChainFundIt. By using
            our platform, you agree to be bound by these terms.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full  px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto ">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 ">
                  TABLE OF CONTENTS
                </h3>
                <nav className="space-y-1 ">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors  ${
                        activeSection === item.id
                          ? "bg-green-100 text-green-700 "
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8 ">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isGreenCard = [2, 5, 10].includes(index);

                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-20 "
                    onMouseEnter={() => setActiveSection(section.id)}
                  >
                    <Card
                      style={{
                        borderRadius: "16px",
                        padding: "0",
                        border: "none",
                      }}
                      className={isGreenCard ? "bg-[#104901]" : "bg-white"}
                    >
                      <CardContent className="p-6 ">
                        <div className="flex items-center gap-3 mb-6 ">
                          <div
                            className="p-3 rounded-full flex items-center justify-center  flex-shrink-0"
                            style={{
                              backgroundColor: "#1a5a2a", // Green background for icon in second card
                              width: "48px",
                              height: "48px",
                            }}
                          >
                            <Icon
                              className="h-5 w-5"
                              style={{
                                color: isGreenCard ? "#FFFFFF" : "white",
                              }}
                            />
                          </div>
                          <h2
                            className="font-bold "
                            style={{
                              fontSize: "18px",
                              color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                            }}
                          >
                            {section.title}
                          </h2>
                        </div>
                        <div className="space-y-6 ">
                          {section.content.map((item, contentIdx) => (
                            <div key={contentIdx} className="">
                              {item.subtitle && (
                                <h3
                                  className="text-base  mb-3 "
                                  style={{
                                    color: isGreenCard ? "#FFFFFF" : "#4b5563",
                                  }}
                                >
                                  {item.subtitle}
                                </h3>
                              )}
                              {item.text && (
                                <div
                                  className="leading-relaxed text-sm text-justify"
                                  style={{
                                    color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                                  }}
                                >
                                  {item.text}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}

              {/* Questions or Concerns Section */}
              <div className="mb-8 scroll-mt-20 ">
                <Card style={{ borderRadius: "16px", padding: "0" }}>
                  <CardContent className="p-6 ">
                    <div className="flex items-center gap-3 mb-6 ">
                      <div
                        className="p-3 rounded-full flex items-center justify-center  flex-shrink-0"
                        style={{
                          backgroundColor: "#f0fdf4",
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <h2
                        className="font-bold "
                        style={{
                          fontSize: "18px",
                          color: "#1a1a1a",
                        }}
                      >
                        Questions or Concerns?
                      </h2>
                    </div>
                    <p
                      className="leading-relaxed mb-4 "
                      style={{ color: "#4b5563" }}
                    >
                      Please contact:
                    </p>
                    <div className="space-y-2 " style={{ color: "#4b5563" }}>
                      <p>
                        <strong>Email:</strong>{" "}
                        <Link
                          href="mailto:campaigns@chainfundit.com"
                          className="text-[#104901] hover:underline "
                        >
                          campaigns@chainfundit.com
                        </Link>
                      </p>
                      <p>
                        <strong>Website:</strong>{" "}
                        <Link
                          href="https://www.chainfundit.com"
                          className="text-[#104901] hover:underline "
                        >
                          www.chainfundit.com
                        </Link>
                      </p>
                      <p>
                        <strong>Effective Date:</strong> November 19, 2025
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
