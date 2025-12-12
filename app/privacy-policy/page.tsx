"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Users,
  Globe,
  CookieIcon,
  Check,
  ChevronRight,
  Info,
  Building,
} from "lucide-react";
import Link from "next/link";

// Table of Contents Items
const tableOfContents = [
  { id: "introduction", label: "Introduction" },
  { id: "who-we-are", label: "Who We Are" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-data", label: "How We Use Your Data" },
  { id: "legal-bases", label: "Legal Bases for Processing" },
  { id: "sharing-data", label: "Who We Share Your Data With" },
  { id: "international-transfers", label: "International Transfers" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-data-rights", label: "Your Data Rights" },
  { id: "security-measures", label: "Security Measures" },
  { id: "children-privacy", label: "Children's Privacy" },
  { id: "cookies", label: "Cookies" },
  { id: "policy-update", label: "Policy Update" },
  { id: "contact-us", label: "Contact Us" },
];

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: Info,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <p className="mb-4">
              ChainFundIt ("we", "our", or "us") is committed to protecting
              your privacy and personal data. This Privacy Policy explains
              what information we collect, how we use it, who we share it
              with, and your rights under applicable data protection laws,
              including the UK General Data Protection Regulation (UK GDPR)
              and the Nigeria Data Protection Regulation (NDPR).
            </p>
            <p className="">
              By using{" "}
              <Link
                href="https://www.chainfundit.com"
                className="text-green-600 hover:underline font-semibold"
              >
                www.chainfundit.com
              </Link>
              , you agree to this Privacy Policy, our Terms and Conditions,
              and our Cookie Policy.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "who-we-are",
    title: "Who We Are",
    icon: Building,
    content: [
      {
        subtitle: "",
        text: (
          <>
            <p className="">
              <strong>ChainFundIt Limited</strong>
              <br />
              Company No. 13253451
              <br />
              Registered in England & Wales
              <br />
              71–75 Shelton Street, Covent Garden, London, WC2H 9JQ
              <br />
              <br />
              <strong>General Support Email:</strong>{" "}
              <Link
                href="mailto:campaigns@chainfundit.com"
                className="text-green-600 hover:underline font-semibold"
              >
                campaigns@chainfundit.com
              </Link>
              <br />
              <strong>Privacy Matters Contact:</strong>{" "}
              <Link
                href="mailto:mngt@chainfundit.com"
                className="text-green-600 hover:underline font-semibold"
              >
                mngt@chainfundit.com
              </Link>
              <br />
              <br />
              We are the <strong>data controller</strong> for personal data
              collected through our platform.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: FileText,
    content: [
      {
        subtitle: "a. Account & Identity Data",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>Full Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Password (Encrypted)</li>
            <li>Date of birth</li>
            <li>
              Government-issued ID or verification documents (where required)
            </li>
          </ul>
        ),
      },
      {
        subtitle: "b. Campaign Data",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>Campaign name, description, and category</li>
            <li>Uploaded media (images, videos, documents)</li>
            <li>Bank account details (used for verifying payout recipients)</li>
            <li>Beneficiary name (if different from organiser)</li>
          </ul>
        ),
      },
      {
        subtitle: "c. Donation Data",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>Donation amount and currency</li>
            <li>Donor name (unless anonymous)</li>
            <li>Optional donor message</li>
            <li>Associated campaign</li>
            <li>Payment method (via our payment provider)</li>
          </ul>
        ),
      },
      {
        subtitle: "d. Technical Data",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>IP address</li>
            <li>Browser and device information</li>
            <li>Time zone and geolocation (approximate)</li>
            <li>Cookie data and session logs</li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "how-we-use-data",
    title: "How We Use Your Data",
    icon: Eye,
    content: [
      {
        subtitle: "We use your information to:",
        text: (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Register and manage your account</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Verify your identity and compliance (e.g. KYC, fraud screening)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Process donations through licensed payment partners</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Disburse funds to verified payout accounts</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Facilitate chain ambassador referrals and commission payouts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Respond to support requests and user inquiries</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Improve user experience and site functionality</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Meet legal, financial, and regulatory obligations</span>
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "legal-bases",
    title: "Legal Bases for Processing",
    icon: FileText,
    content: [
      {
        subtitle:
          "Under data protection laws (such as GDPR and NDPR), we process your data on the following legal grounds:",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>Consent - where you have opted in (e.g., email updates)</li>
            <li>
              Contract - to provide services like campaign hosting, payouts, or
              donation processing
            </li>
            <li>
              Legal Obligation - for identity verification, record keeping,
              fraud prevention
            </li>
            <li>
              Legitimate Interest - for platform security, analytics, and
              customer service
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "sharing-data",
    title: "Who We Share Your Data With",
    icon: Users,
    content: [
      {
        subtitle: "Your personal data may be shared with:",
        text: (
          <ul className="list-disc list-inside space-y-2">
            <li>Payment processors (e.g. Stripe, Paystack)</li>
            <li>Identity verification services</li>
            <li>Hosting services and media storage</li>
            <li>Email and notification platforms (e.g. Resend)</li>
            <li>
              Law enforcement or regulatory authorities, where legally required
            </li>
            <li>
              Other users, such as campaign creators viewing donor names (unless
              donor chooses anonymity)
            </li>
          </ul>
        ),
      },
    ],
  },
  {
    id: "international-transfers",
    title: "International Transfers",
    icon: Globe,
    content: [
      {
        subtitle:
          "Some of our service providers may be located outside your country of residence. In such cases, we rely on lawful mechanisms for cross-border data transfers (e.g. Standard Contractual Clauses).",
        text: "",
      },
    ],
  },
  {
    id: "data-retention",
    title: "Data Retention",
    icon: Lock,
    content: [
      {
        subtitle: "We retain personal data for the following periods:",
        text: (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Data Type
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                    Retention Period
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    Campaign data & media
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    3 months after campaign closure (as per Terms)
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    Financial/donation records
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    6 - 7 years (for legal, audit, and tax compliance)
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    Identity verification data
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    Up to 7 years (for AML/KYC documentation)
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    Support communications
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">
                    12 months after final correspondence
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
    ],
  },
  {
    id: "your-data-rights",
    title: "Your Data Rights",
    icon: Shield,
    content: [
      {
        subtitle: "Depending on your jurisdiction, you have the right to:",
        text: (
          <>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate or outdated information</li>
              <li>
                Request deletion of your data (subject to legal exceptions)
              </li>
              <li>Withdraw consent (for optional services or marketing)</li>
              <li>Object to or restrict certain types of processing</li>
              <li>Request a copy of your data (data portability)</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise these rights, email{" "}
              <Link
                href="mailto:mngt@chainfundit.com"
                className="text-green-600 hover:underline font-semibold"
              >
                mngt@chainfundit.com
              </Link>
              .
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "security-measures",
    title: "Security Measures",
    icon: Lock,
    content: [
      {
        subtitle:
          "We implement industry-standard safeguards to protect your data:",
        text: (
          <>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Encrypted transmission and payment processing</li>
              <li>Two-factor authentication for critical actions</li>
              <li>Role-based access controls</li>
              <li>Fraud and abuse monitoring</li>
              <li>KYC verification for campaign recipients</li>
            </ul>
            <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
              <strong>Note:</strong> Despite these measures, no online system is
              completely secure. We recommend that you use strong passwords and
              do not share your login credentials with anyone.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "children-privacy",
    title: "Children's Privacy",
    icon: Users,
    content: [
      {
        subtitle:
          "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children.",
        text: "If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies",
    icon: CookieIcon,
    content: [
      {
        subtitle:
          "This Cookie Policy explains how ChainFundIt Limited uses cookies and similar tracking technologies on our website.",
        text: (
          <>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website:{" "}
              <Link
                href="https://www.chainfundit.com"
                className="text-green-600 hover:underline font-semibold"
              >
                www.chainfundit.com
              </Link>
              .
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using our site, you agree to our use of cookies in accordance
              with this policy, unless you disable them through your browser
              settings or our cookie preference tools (where available).
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  1. What Are Cookies?
                </h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Cookies are small text files placed on your computer or device
                  when you visit a website. They help websites remember your
                  preferences, understand how you interact with pages, and
                  enhance your user experience.
                </p>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Cookies can be:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    <strong>Session cookies</strong> – deleted when you close
                    your browser
                  </li>
                  <li>
                    <strong>Persistent cookies</strong> – remain on your device
                    until they expire or are deleted manually
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  2. Types of Cookies We Use
                </h4>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We use the following categories of cookies:
                </p>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      a. Strictly Necessary Cookies
                    </h5>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      These cookies are essential to make the website function
                      properly and securely. They include:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Login session tokens</li>
                      <li>User authentication cookies</li>
                      <li>Security and fraud prevention cookies</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      Without these, the platform may not function.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      b. Performance & Analytics Cookies
                    </h5>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      These cookies help us understand how visitors interact
                      with the website, including:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Page views</li>
                      <li>Click patterns</li>
                      <li>Time spent on pages</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-2">
                      We use tools like <strong>Google Analytics</strong> to
                      monitor platform usage, improve performance, and identify
                      problems.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      c. Functionality Cookies
                    </h5>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      These cookies remember your settings and preferences to
                      provide a more personalized experience. For example:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      <li>Preferred language</li>
                      <li>Campaign filters or search history</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      d. Marketing & Third-Party Cookies
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      We do not use cookies to serve third-party advertising.
                      However, embedded content (e.g. YouTube, Twitter) may
                      place their own cookies, subject to their policies.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  3. How You Can Control Cookies
                </h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  You can manage or disable cookies in the following ways:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                  <li>
                    <strong>Browser Settings:</strong> Most browsers allow you
                    to block or delete cookies. Check your browser's Help
                    section for guidance.
                  </li>
                  <li>
                    <strong>Device Settings:</strong> Mobile operating systems
                    may have their own cookie controls.
                  </li>
                  <li>
                    <strong>Do Not Track:</strong> We honour DNT settings where
                    supported.
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  <strong>Note:</strong> Disabling cookies may affect the
                  functionality of certain features (e.g. login sessions or
                  donation tracking).
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  4. Third-Party Tools We Use
                </h4>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Some cookies may be set by third-party providers we use to
                  operate the platform:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                  <li>
                    <strong>Google Analytics</strong> – for anonymous traffic
                    and usage stats
                  </li>
                  <li>
                    <strong>SendGrid / Mailgun</strong> – for email and
                    engagement tracking
                  </li>
                  <li>
                    <strong>Cloudinary</strong> – for image performance
                    optimization
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  These providers may have access to some anonymized or
                  device-level data. Their privacy policies apply.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  5. Changes to This Cookie Policy
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time. When we
                  do, we'll revise the "Effective Date" above and may notify
                  users via email or banner.
                </p>
              </div>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: "policy-update",
    title: "Policy Update",
    icon: FileText,
    content: [
      {
        subtitle:
          "We may update this Privacy Policy from time to time. If significant changes are made, we will notify users via email or platform notifications.",
        text: "",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("introduction");

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
            Privacy Policy
          </div>

          {/* Subheading */}
          <div className="text-xl text-[#4B5563] text-center">
            Your trust is our top priority. Here's how we protect your data.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-20 flex justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-[80rem] w-full">
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
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === item.id
                        ? "bg-green-100 text-green-700 font-semibold"
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
          <div className="lg:col-span-3 space-y-8">
            {/* Dynamic Sections */}
            {sections.map((section, idx) => {
              const sectionNumber = idx + 1;
              const greenBgSections = [9, 11, 13];
              const isGreenBg = greenBgSections.includes(sectionNumber);
              const IconComponent = section.icon;

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-20"
                  onMouseEnter={() => setActiveSection(section.id)}
                >
                  <Card
                    style={{
                      borderRadius: "16px",
                      padding: "0",
                      border: "none",
                    }}
                    className={isGreenBg ? "bg-[#104901]" : "bg-white"}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className="p-3 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isGreenBg ? "#1a5a2a" : "#ECFDF5",
                            width: "48px",
                            height: "48px",
                          }}
                        >
                          <IconComponent
                            className="h-5 w-5"
                            style={{
                              color: isGreenBg ? "#FFFFFF" : "#059669",
                            }}
                          />
                        </div>
                        <h2
                          className="font-bold"
                          style={{
                            fontSize: "18px",
                            color: isGreenBg ? "#FFFFFF" : "#1a1a1a",
                          }}
                        >
                          {sectionNumber}. {section.title}
                        </h2>
                      </div>

                      <div className="space-y-6">
                        {section.content.map((item, contentIdx) => (
                          <div key={contentIdx}>
                            {item.subtitle && (
                              <h3
                                className="text-base mb-3 font-bold"
                                style={{
                                  color: isGreenBg ? "#FFFFFF" : "#4b5563",
                                }}
                              >
                                {item.subtitle}
                              </h3>
                            )}
                            {item.text && (
                              <div
                                className="leading-relaxed text-sm"
                                style={{
                                  color: isGreenBg ? "#FFFFFF" : "#1a1a1a",
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

            {/* Contact Us Section */}
            <div
              id="contact-us"
              className="scroll-mt-20"
              onMouseEnter={() => setActiveSection("contact-us")}
            >
              <Card
                style={{
                  borderRadius: "16px",
                  padding: "0",
                  border: "none",
                }}
                className="bg-white"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="p-3 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "#ECFDF5",
                        width: "48px",
                        height: "48px",
                      }}
                    >
                      <Shield
                        className="h-5 w-5"
                        style={{
                          color: "#059669",
                        }}
                      />
                    </div>
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: "18px",
                        color: "#1a1a1a",
                      }}
                    >
                      {sections.length + 1}. Contact Us
                    </h2>
                  </div>
                  <p className="mb-6" style={{ color: "#1a1a1a" }}>
                    If you have any questions about this Privacy Policy, please
                    contact our Data Protection Officer:
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href="mailto:privacy@chainfundit.com"
                      className="text-green-600 hover:underline font-semibold text-base flex items-center gap-2"
                    >
                      privacy@chainfundit.com
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
