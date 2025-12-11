"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Handshake,
  FileText,
  Scale,
  DollarSign,
  Shield,
  AlertTriangle,
  Gavel,
} from "lucide-react";
import Link from "next/link";

// ----------------------------
// CARD BACKGROUND OVERRIDES
// ----------------------------
// 2nd, 5th & 7th card (indexes 1, 4, 6) use dark green background #104901
const cardBgOverride = (index: number) => {
  return [1, 4, 6].includes(index)
    ? "bg-[#104901] text-white shadow-xl border-none"
    : "bg-white shadow-md";
};

// ----------------------------
// FULL SECTIONS ARRAY
// ----------------------------
const sections = [
  {
    title: "1. Interpretation",
    icon: FileText,
    content: [
      {
        subtitle: "1.1 Definitions",
        text: (
          <div className="space-y-3 text-gray-700">
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
              Words following “including” or similar expressions are
              illustrative and do not limit preceding terms.
            </p>
            <p>
              Singular includes plural; plural includes singular.
            </p>
            <p>
              <strong>"Referral"</strong> means introducing donors to the
              Platform.
            </p>
            <p>
              <strong>"Relevant Donation"</strong> means a cash donation properly
              attributed to a Chain Ambassador link.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "2. Commencement and Duration",
    icon: FileText,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-White">
            <p>This Agreement commences upon acceptance.</p>
            <p>
              This Agreement continues until terminated under Clause 7.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "3. Referrals and Assurance",
    icon: Handshake,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
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
            <p>
              Social media handles must be made available to ChainFundIt.
            </p>
            <p>
              Ambassador must follow and engage with ChainFundIt's social media.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "4. Commission and Payment",
    icon: DollarSign,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
            <p>
              Ambassador is entitled to Applicable Commission for donations made
              on their Chainfund.
            </p>
            <p>
              Commission disputes should be sent to{" "}
              <Link href="mailto:ambassadors@chainfundit.com" className="text-[#104901] font-semibold">
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
    title: "5. Data Protection",
    icon: Shield,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-White">
            <p>
              Both parties must comply with all Data Protection Legislation.
            </p>
            <p>
              Personal data is processed according to ChainFundIt's{" "}
              <Link href="/privacy-policy" className="text-[#104901] font-semibold">
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
    title: "6. Limitation of Liability",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-gray-700">
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
              ChainFundIt’s maximum liability is limited to 12 months of
              commission.
            </p>
            <p>
              Ambassador’s liability is limited to twice the commission paid.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "7. Termination",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "",
        text: (
          <div className="space-y-4 text-White">
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
            <p>
              Some clauses survive termination.
            </p>
            <p>
              ChainFundIt may deactivate the Chainfund if Ambassador is passive.
            </p>
          </div>
        ),
      },
    ],
  },
  {
    title: "8. General",
    icon: Gavel,
    content: [
      {
        subtitle: "8.1 Entire Agreement",
        text: (
          <p className="text-gray-700">
            This Agreement is the entire agreement between parties.
          </p>
        ),
      },
      {
        subtitle: "8.2 Assignment",
        text: (
          <p className="text-gray-700">
            Ambassador may not assign or transfer rights.
          </p>
        ),
      },

      // (content continues in Part 2)
    ],
  },
];
// (continuing inside section 8 content array…)

sections[7].content.push(
  {
    subtitle: "8.3 No partnership or agency",
    text: (
      <p className="text-gray-700">
        Nothing creates a partnership, agency, or employment relationship.
      </p>
    ),
  },
  {
    subtitle: "8.4 Variation",
    text: (
      <div className="text-gray-700 space-y-3">
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
    text: (
      <p className="text-gray-700">
        Delay in enforcing rights does not waive them.
      </p>
    ),
  },
  {
    subtitle: "8.6 Severance",
    text: (
      <p className="text-gray-700">
        Invalid terms are modified minimally or removed; remainder stays valid.
      </p>
    ),
  },
  {
    subtitle: "8.7 Notices",
    text: (
      <div className="text-gray-700 space-y-3">
        <p>Notices must be sent by email.</p>
        <p>Email notices are effective immediately or next business hour.</p>
      </div>
    ),
  },
  {
    subtitle: "8.8 Counterparty",
    text: <p className="text-gray-700">This Agreement may be executed in counterparts.</p>,
  },
  {
    subtitle: "8.9 Third Party Rights",
    text: (
      <p className="text-gray-700">
        Only ChainFundIt may enforce third-party rights.
      </p>
    ),
  },
  {
    subtitle: "8.10 Governing Law",
    text: (
      <div className="text-gray-700 space-y-3">
        <p>UK/US campaigns follow laws of England & Wales.</p>
        <p>Nigeria campaigns follow Nigerian law.</p>
      </div>
    ),
  },
  {
    subtitle: "8.11 Jurisdiction",
    text: (
      <div className="text-gray-700 space-y-3">
        <p>Arbitration seat is London or Nigeria depending on campaign origin.</p>
        <p>
          Courts of England & Wales have non-exclusive jurisdiction.
        </p>
      </div>
    ),
  }
);

// ----------------------------
// PAGE COMPONENT
// ----------------------------

export default function AmbassadorAgreementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 font-plusjakarta">
      <Navbar />

      {/* HERO WITH STRICT SIZING */}
      <div
        className="relative bg-gradient-to-r from-green-600 to-[#104901] text-white overflow-hidden rounded-3xl"
        style={{
          width: "1280px",
          height: "350px",
          marginLeft: "80px",
          marginRight: "80px",
          paddingBottom: "96px",
          boxSizing: "border-box",
        }}
      >
        {/* RIGHT BLUR */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.2,
          }}
        ></div>

        {/* LEFT BLUR */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #104109 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1,
          }}
        ></div>

        {/* CENTER CONTAINER */}
        <div
          className="relative mx-auto flex flex-col items-center justify-center"
          style={{
            width: "896px",
            maxWidth: "896px",
            height: "240px",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "70px",
            gap: "20px",
          }}
        >
          {/* ICON BADGE */}
          <div
            className="flex items-center justify-center"
            style={{
              backgroundColor: "#104109",
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              marginTop: "16px",
            }}
          >
            <Handshake className="h-14 w-14 text-white" />
          </div>

          {/* MAIN HEADING */}
          <h1
            className="font-plusjakarta text-center"
            style={{
              fontWeight: 800,
              fontSize: "60px",
              lineHeight: "60px",
            }}
          >
            Ambassador Agreement
          </h1>

          {/* SUBHEADING */}
          <p
            className="font-plusjakarta text-center"
            style={{
              fontWeight: 400,
              fontSize: "18px",
              color: "#D1FAE5CC",
              maxWidth: "700px",
              lineHeight: "1.5",
            }}
          >
            Terms & Conditions for Chain Ambassadors
          </p>
        </div>
      </div>

      {/* CONTENT WRAPPER */}
      <div
        className="font-plusjakarta"
        style={{
          width: "1440px",
          paddingLeft: "80px",
          paddingRight: "80px",
          paddingTop: "64px",
          paddingBottom: "96px",
        }}
      >
        <div style={{ width: "1280px", marginLeft: "auto", marginRight: "auto" }}>
          {/* CONTRACT DETAILS */}
          <div className="mb-8 font-plusjakarta">
            <Card style={{ borderRadius: "16px" }}>
              <CardContent className="p-8">
                <h2
                  className="font-plusjakarta font-bold"
                  style={{ fontSize: "24px", color: "#1a1a1a" }}
                >
                  Contract Details
                </h2>

                <div
                  style={{ fontSize: "16px", color: "#4b5563" }}
                  className="space-y-2 mt-4"
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

          {/* TERMS & CONDITIONS CARD */}
          <div className="mb-8 font-plusjakarta">
            <Card style={{ borderRadius: "16px" }}>
              <CardContent className="p-8">
                <h2
                  className="font-plusjakarta font-bold mb-4"
                  style={{ fontSize: "24px", color: "#1a1a1a" }}
                >
                  Terms & Conditions
                </h2>

                <p
                  style={{ fontSize: "16px", color: "#4b5563", lineHeight: "1.6" }}
                >
                  This Agreement sets out the terms and conditions under which
                  you may participate as a Chain Ambassador.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* DYNAMIC SECTION CARDS */}
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <div key={index} className="mb-8 font-plusjakarta">
                <Card
                  className={cardBgOverride(index)}
                  style={{ borderRadius: "16px", padding: 0 }}
                >
                  <CardContent className="p-8">
                    {/* CARD HEADER */}
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor:
                            index === 1 || index === 4 || index === 6
                              ? "#0e3c01"
                              : "#f0fdf4",
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{
                            color:
                              index === 1 || index === 4 || index === 6
                                ? "#ffffff"
                                : "#059669",
                          }}
                        />
                      </div>

                      <h2
                        className="font-plusjakarta font-bold"
                        style={{
                          fontSize: "22px",
                          color:
                            index === 1 || index === 4 || index === 6
                              ? "#ffffff"
                              : "#1a1a1a",
                        }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    {/* SECTION CONTENT */}
                      <div
                        className={`space-y-6 ${
                          [1, 4, 6].includes(index) ? "text-white" : "text-gray-700"
                        }`}
                        style={{ fontSize: "16px", lineHeight: "1.65" }}
                      >
                      {section.content.map((item, idx) => (
                        <div key={idx}>
                          {item.subtitle && (
                            <h3
                              className="font-plusjakarta font-semibold mb-2"
                              style={{
                                fontSize: "18px",
                                color:
                                  index === 1 || index === 4 || index === 6
                                    ? "#ffffff"
                                    : "#1a1a1a",
                              }}
                            >
                              {item.subtitle}
                            </h3>
                          )}

                          <div>{item.text}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* REVISION DATE */}
          <div
            className="text-center font-plusjakarta"
            style={{ fontSize: "14px", color: "#666", marginTop: "48px" }}
          >
            Date of Last Revision: November 19, 2025
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
