"use client";

import React from "react";
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
} from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    icon: FileText,
    content: [
      {
        subtitle: "a. Account & Identity Data",
        text: (
          <ul className="list-disc list-inside">
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
          <ul className="list-disc list-inside">
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
          <ul className="list-disc list-inside">
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
          <ul className="list-disc list-inside">
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
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "We use your information to:",
        text: (
          <ul className="list-disc list-inside">
            <li>Register and manage your account</li>
            <li>
              Verify your identity and compliance (e.g. KYC, fraud screening)
            </li>
            <li>Process donations through licensed payment partners</li>
            <li>Disburse funds to verified payout accounts</li>
            <li>
              Facilitate chain ambassador referrals and commission payouts
            </li>
            <li>Respond to support requests and user inquiries</li>
            <li>Improve user experience and site functionality</li>
            <li>Meet legal, financial, and regulatory obligations</li>
          </ul>
        ),
      },
    ],
  },
  {
    title: "Legal Bases for Processing",
    icon: FileText,
    content: [
      {
        subtitle:
          "Under data protection laws (such as GDPR and NDPR), we process your data on the following legal grounds:",
        text: (
          <ul className="list-disc list-inside">
            <li>Consent - where you have opted in (e.g., email updates)</li>
            <li>
              Contract -to provide services like campaign hosting, payouts, or
              donation processing
            </li>
            <li>
              Legal Obligation - for identity verification, record keeping,
              fraud prevention{" "}
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
    title: "Who We Share Your Data With",
    icon: Users,
    content: [
      {
        subtitle: "Your personal data may be shared with:",
        text: (
          <ul className="list-disc list-inside">
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
    title: "Your Data Rights",
    icon: Shield,
    content: [
      {
        subtitle: "Depending on your jurisdiction, you have the right to:",
        text: (
          <>
            <ul className="list-disc list-inside">
              <li>Access your personal data</li>
              <li>Correct inaccurate or outdated information</li>
              <li>
                Request deletion of your data (subject to legal exceptions)
              </li>
              <li>Withdraw consent (for optional services or marketing)</li>
              <li>Object to or restrict certain types of processing</li>
              <li>Request a copy of your data (data portability)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To exercise these rights, email{" "}
              <Link
                href="mailto:mngt@chainfundit.com"
                className="text-[#104901]"
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
    title: "Security Measures",
    icon: Shield,
    content: [
      {
        subtitle:
          "We implement industry-standard safeguards to protect your data:",
        text: (
          <>
            <ul className="list-disc list-inside">
              <li>Encrypted transmission and payment processing</li>
              <li>Two-factor authentication for critical actions</li>
              <li>Role-based access controls</li>
              <li>Fraud and abuse monitoring</li>
              <li>KYC verification for campaign recipients</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Despite these measures, no online system is completely secure. We
              recommend that you use strong passwords and do not share your
              login credentials with anyone.
            </p>
          </>
        ),
      },
    ],
  },
  {
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
    title: "Cookies",
    icon: CookieIcon,
    content: [
      {
        subtitle:
          "This Cookie Policy explains how ChainFundIt Limited uses cookies and similar tracking technologies on our website: www.chainfundit.com.",
        text: (
          <>
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Last updated: 19 November 2025
            <br />
            Effective date: 19 November 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ChainFundIt is committed to protecting your privacy and personal
                data. This Privacy Policy explains what information we collect,
                how we use it, who we share it with, and your rights under
                applicable data protection laws, including the UK General Data
                Protection Regulation (UK GDPR), the Nigeria Data Protection
                Regulation (NDPR), and other relevant laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using <strong>www.chainfundit.com</strong>, you agree to this
                Privacy Policy, our <strong>Terms and Conditions</strong>, and
                our <strong>Cookie Policy</strong>.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Who We Are
              </h2>
              <p>
                ChainFundIt Limited <br /> Company No. 13253451 <br />{" "}
                Registered in England & Wales <br /> 71–75 Shelton Street,
                Covent Garden, London, WC2H 9JQ <br /> General Support
                Email: campaigns@chainfundit.com <br /> Privacy Matters
                Contact: mngt@chainfundit.com <br /> <br /> We are the{" "}
                <strong>data controller</strong> for personal data collected
                through our platform.
              </p>
            </CardContent>
          </Card>
        </div>

        {sections.map((section, index) => {
          const Icon = section.icon;
          const sectionId = section.title.toLowerCase().replace(/\s+/g, "-");
          return (
            <div key={index} id={sectionId === "cookies" ? "cookies" : undefined} className="mb-8 scroll-mt-20">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.subtitle}
                        </h3>
                        <div className="text-gray-700 leading-relaxed">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For general inquiries:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong>{" "}
                  <Link
                    href="mailto:campaigns@chainfundit.com"
                    className="text-[#104901]"
                  >
                    campaigns@chainfundit.com
                  </Link>
                </p>
                <p>
                  <strong>For data privacy matters or rights requests:</strong>{" "}
                  <Link
                    href="mailto:mngt@chainfundit.com"
                    className="text-[#104901]"
                  >
                    mngt@chainfundit.com
                  </Link>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <Link
                    href="https://www.chainfundit.com"
                    className="text-[#104901]"
                  >
                    www.chainfundit.com
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
