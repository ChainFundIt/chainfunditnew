"use client";

import React, { useState } from "react";
import {
  Handshake,
  FileText,
  DollarSign,
  Shield,
  AlertTriangle,
  Gavel,
  Hand,
} from "lucide-react";
import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const tableOfContents = [
  { id: "section-1", label: "1. Interpretation" },
  { id: "section-2", label: "2. Commencement and Duration" },
  { id: "section-3", label: "3. Referrals and Assurance" },
  { id: "section-4", label: "4. Commission and Payment" },
  { id: "section-5", label: "5. Data Protection" },
  { id: "section-6", label: "6. Limitation of Liability" },
  { id: "section-7", label: "7. Termination" },
  { id: "section-8", label: "8. General" },
];

const sections = [
  {
    id: "section-1",
    title: "1. Interpretation",
    icon: FileText,
    content: [
      {
        subtitle: "1.1 Definitions",
        text: (
          <div className="space-y-3">
            <p>
              <strong>"Applicable Commission"</strong> means the applicable
              Commission payable on a Chained Fundraising Campaign.
            </p>
            <p>
              <strong>"Campaign Organizer"</strong> means anyone who creates a
              Fundraising Campaign on ChainFundIt for the purposes of raising
              funds either via crowdfunding or on a private basis.
            </p>
            <p>
              <strong>"Chain"</strong> or <strong>"Chaining"</strong> means the
              act of opting to share and promote a Fundraising Campaign by
              anyone other than the Campaign Organiser in exchange for a reward
              on successful donations.
            </p>
            <p>
              <strong>"Chainfund"</strong> means a fundraising campaign with
              chain functionality incorporated. Upon the acceptance of these
              terms and conditions, a replica page (i.e Chainfund) of the
              applicable Fundraising Campaign created to recognise the Chain
              Ambassador electronic identity will be created and sent across.
            </p>
            <p>
              <strong>"Chainfunding"</strong> means the practice of sharing or
              promoting a ChainfundIt Fundraising Campaign for the purpose of
              soliciting donations from an individual's network in exchange for
              a commission.
            </p>
            <p>
              <strong>"Chain Ambassador"</strong> means any individual or entity
              who opts to chain a Fundraising Campaign.
            </p>
            <p>
              <strong>"Chained Fundraising Campaign"</strong> means the replica
              page provided to a Chain Ambassador to share.
            </p>
            <p>
              <strong>"Commission"</strong> means commission calculated on
              successful donations, excluding donations by the Chain Ambassador.
            </p>
            <p>
              <strong>"Data Protection Legislation"</strong> includes UK GDPR,
              Data Protection Act 2018, and any applicable data regulations.
            </p>
            <p>
              <strong>"Donor"</strong> means an individual who makes a donation
              on the Platform.
            </p>
            <p>
              <strong>"Fundraising Campaign"</strong> means raising funds to
              achieve a goal.
            </p>
            <p>
              <strong>"Platform"</strong> means ChainFundIt's crowdfunding
              platform.
            </p>
            <p>
              Words following "including" or similar expressions are
              illustrative and do not limit preceding terms.
            </p>
            <p>Singular includes plural; plural includes singular.</p>
            <p>
              <strong>"Referral"</strong> means introducing donors to the
              Platform.
            </p>
            <p>
              <strong>"Relevant Donation"</strong> means a cash donation
              properly attributed to a Chain Ambassador link.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-2",
    title: "2. Commencement and Duration",
    icon: FileText,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>This Agreement commences upon acceptance.</p>
            <p>This Agreement continues until terminated under Clause 7.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-3",
    title: "3. Referrals and Assurance",
    icon: Handshake,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>ChainFundIt appoints the Chain Ambassador to make referrals.</p>
            <p>The Chain Ambassador must:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Act promptly on all lawful instructions.</li>
              <li>Act honestly and respectfully.</li>
              <li>Always comply with applicable laws.</li>
              <li>Avoid damaging ChainFundIt's reputation.</li>
              <li>Not mislead donors or pressure them.</li>
              <li>Comply with anti-bribery laws (BA 2010).</li>
              <li>Refrain from offenses outside UK equivalent to BA 2010.</li>
              <li>Report any request for undue benefits.</li>
            </ul>
            <p>
              The Chain Ambassador represents they are not convicted of criminal
              offences (excluding spent convictions).
            </p>
            <p>
              The Ambassador must not engage in obscene social media activity.
            </p>
            <p>Social media handles must be made available to ChainFundIt.</p>
            <p>
              Ambassador must follow and engage with ChainFundIt's social media.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-4",
    title: "4. Commission and Payment",
    icon: DollarSign,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>
              Ambassador is entitled to Applicable Commission for donations made
              on their Chainfund.
            </p>
            <p>
              Commission disputes should be sent to{" "}
              <Link href="mailto:ambassadors@chainfundit.com" className="">
                ambassadors@chainfundit.com
              </Link>
            </p>
            <p>Commission is paid in the campaign's currency.</p>
            <p>No commission is paid if donations are refunded.</p>
            <p>
              Taxes apply. ChainFundIt may request a refund if taxes were not
              withheld.
            </p>
            <p>ChainFundIt may set off amounts owed by the Ambassador.</p>
            <p>
              ChainFundIt reserves the right to charge admin fees up to 30%.
            </p>
            <p>
              Donations for charities go directly to the charity; ambassadors
              only receive commission.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-5",
    title: "5. Data Protection",
    icon: Shield,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>
              Both parties must comply with all Data Protection Legislation.
            </p>
            <p>
              Personal data is processed according to ChainFundIt's{" "}
              <Link href="/privacy-policy" className="">
                privacy policy
              </Link>
              .
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-6",
    title: "6. Limitation of Liability",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>Nothing limits liability for:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Death or injury from negligence</li>
              <li>Fraud</li>
            </ul>
            <p>
              ChainFundIt is not liable for losses from platform unavailability,
              data issues, or uncontrollable circumstances.
            </p>
            <p>
              Each party is liable for foreseeable loss due to breach or
              negligence.
            </p>
            <p>
              ChainFundIt's maximum liability is limited to 12 months of
              commission.
            </p>
            <p>
              Ambassador's liability is limited to twice the commission paid.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-7",
    title: "7. Termination",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4">
            <p>ChainFundIt may terminate immediately if:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Campaign goal reached</li>
              <li>No activity within 14 days</li>
              <li>Suspected abuse</li>
              <li>Campaign discontinued</li>
            </ul>
            <p>
              Ambassador may terminate anytime but will no longer earn
              commission.
            </p>
            <p>Some clauses survive termination.</p>
            <p>
              ChainFundIt may deactivate the Chainfund if Ambassador is passive.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "section-8",
    title: "8. General",
    icon: Gavel,
    content: [
      {
        subtitle: "8.1 Entire Agreement",
        text: <p>This Agreement is the entire agreement between parties.</p>,
      },
      {
        subtitle: "8.2 Assignment",
        text: <p>Ambassador may not assign or transfer rights.</p>,
      },
      {
        subtitle: "8.3 No partnership or agency",
        text: (
          <p>
            Nothing creates a partnership, agency, or employment relationship.
          </p>
        ),
      },
      {
        subtitle: "8.4 Variation",
        text: (
          <div className="space-y-3">
            <p>ChainFundIt may vary terms without consent when required by:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Changes in operations, policies, systems</li>
              <li>Law, regulation, court decisions</li>
            </ul>
            <p>
              ChainFundIt aims to notify 7 days prior, but may not always be
              possible.
            </p>
          </div>
        ),
      },
      {
        subtitle: "8.5 No automatic waiver",
        text: <p>Delay in enforcing rights does not waive them.</p>,
      },
      {
        subtitle: "8.6 Severance",
        text: (
          <p>
            Invalid terms are modified minimally or removed; remainder stays
            valid.
          </p>
        ),
      },
      {
        subtitle: "8.7 Notices",
        text: (
          <div className="space-y-3">
            <p>Notices must be sent by email.</p>
            <p>
              Email notices are effective immediately or next business hour.
            </p>
          </div>
        ),
      },
      {
        subtitle: "8.8 Counterparty",
        text: <p>This Agreement may be executed in counterparts.</p>,
      },
      {
        subtitle: "8.9 Third Party Rights",
        text: <p>Only ChainFundIt may enforce third-party rights.</p>,
      },
      {
        subtitle: "8.10 Governing Law",
        text: (
          <div className="space-y-3">
            <p>UK/US campaigns follow laws of England & Wales.</p>
            <p>Nigeria campaigns follow Nigerian law.</p>
          </div>
        ),
      },
      {
        subtitle: "8.11 Jurisdiction",
        text: (
          <div className="space-y-3">
            <p>
              Arbitration seat is London or Nigeria depending on campaign
              origin.
            </p>
            <p>Courts of England & Wales have non-exclusive jurisdiction.</p>
          </div>
        ),
      },
    ],
  },
];

export default function AmbassadorAgreementPage() {
  const [activeSection, setActiveSection] = useState("section-1");

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

      {/* HERO SECTION */}
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
            <Hand className="h-8 w-8 text-[#059669]" />
          </div>

          {/* Main Heading */}
          <div className="font-extrabold text-[#022C22] text-[4rem] leading-[4rem] text-center">
            Ambassador Agreement
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Terms & Conditions for Chain Ambassadors
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 py-20 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[80rem] w-full">
          {/* SIDEBAR - TABLE OF CONTENTS */}
          <div className="lg:col-span-1 md:mb-16">
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

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-8">
            {/* CONTRACT DETAILS */}
            <div className="">
              <Card
                style={{
                  borderRadius: "16px",
                  padding: "0",
                  backgroundColor: "#FFFFFF !important",
                }}
              >
                <CardContent className="p-8 ">
                  <h2
                    className=" font-bold"
                    style={{ fontSize: "24px", color: "#1a1a1a" }}
                  >
                    Contract Details
                  </h2>
                  <div
                    style={{ fontSize: "16px", color: "#4b5563" }}
                    className="space-y-2 mt-4 "
                  >
                    <p>
                      <strong>Parties:</strong> ChainFundIt Limited and Chain
                      Ambassador
                    </p>
                    <p>
                      <strong>Effective Date:</strong> Upon acceptance of this
                      Agreement
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      <Link
                        href="mailto:ambassadors@chainfundit.com"
                        style={{ color: "#104901", fontWeight: 600 }}
                      >
                        ambassadors@chainfundit.com
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TERMS & CONDITIONS INTRO */}
            <div className="">
              <Card
                style={{
                  borderRadius: "16px",
                  padding: "0",
                  backgroundColor: "#FFFFFF !important",
                }}
              >
                <CardContent className="p-8 ">
                  <h2
                    className=" font-bold mb-4"
                    style={{ fontSize: "24px", color: "#1a1a1a" }}
                  >
                    Terms & Conditions
                  </h2>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#4b5563",
                      lineHeight: "1.6",
                    }}
                    className=""
                  >
                    This Agreement sets out the terms and conditions under which
                    you may participate as a Chain Ambassador.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* DYNAMIC SECTIONS */}
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isGreenCard = [2, 4, 6].includes(index);

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
                      {/* CARD HEADER */}
                      <div className="flex items-center gap-3 mb-6 ">
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: isGreenCard
                              ? "#1a5a2a"
                              : "#f0fdf4",
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{
                              color: isGreenCard ? "#FFFFFF" : "#059669",
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

                      {/* SECTION CONTENT */}
                      <div
                        className="space-y-6 "
                        style={{
                          fontSize: "16px",
                          lineHeight: "1.65",
                          color: isGreenCard ? "#FFFFFF" : "#4b5563",
                        }}
                      >
                        {section.content.map((item, idx) => (
                          <div key={idx} className="">
                            {item.subtitle && (
                              <h3
                                className=" mb-2 "
                                style={{
                                  fontSize: "18px",
                                  color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                                }}
                              >
                                {item.subtitle}
                              </h3>
                            )}
                            <div className="text-justify">{item.text}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* REVISION DATE */}
            <div className="w-full flex justify-center">
            <div className="bg-[#ECFDF5] text-sm text-[#059669] h-8 w-fit flex items-center text-center px-2 rounded-md">
              Date of Last Revision: November 19, 2025
            </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
