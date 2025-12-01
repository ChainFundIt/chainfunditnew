"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    icon: FileText,
    content: [
      {
        subtitle: "Personal Information",
        text: "When you create an account, we collect information such as your name, email address, phone number, and payment details. This information is necessary to process donations and manage your campaigns.",
      },
      {
        subtitle: "Campaign Information",
        text: "We collect information about the campaigns you create, including descriptions, images, goals, and updates you post.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent on the site.",
      },
      {
        subtitle: "Device Information",
        text: "We may collect information about your device, including IP address, browser type, and operating system.",
      },
    ],
  },
  {
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        subtitle: "Service Provision",
        text: "We use your information to provide, maintain, and improve our services, process donations, and manage campaigns.",
      },
      {
        subtitle: "Communication",
        text: "We may use your contact information to send you updates about your campaigns, respond to inquiries, and provide customer support.",
      },
      {
        subtitle: "Legal Compliance",
        text: "We may use your information to comply with legal obligations, prevent fraud, and protect the rights and safety of our users.",
      },
      {
        subtitle: "Analytics",
        text: "We analyze usage data to understand how our platform is used and to improve user experience.",
      },
    ],
  },
  {
    title: "Data Security",
    icon: Lock,
    content: [
      {
        subtitle: "Encryption",
        text: "We use industry-standard encryption to protect your data during transmission and storage.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to your personal information is restricted to authorized personnel who need it to perform their duties.",
      },
      {
        subtitle: "Regular Audits",
        text: "We conduct regular security audits and assessments to identify and address potential vulnerabilities.",
      },
      {
        subtitle: "Payment Security",
        text: "Payment information is processed through secure, PCI-compliant payment processors. We do not store full credit card details on our servers.",
      },
    ],
  },
  {
    title: "Your Rights",
    icon: Shield,
    content: [
      {
        subtitle: "Access",
        text: "You have the right to access the personal information we hold about you.",
      },
      {
        subtitle: "Correction",
        text: "You can update or correct your personal information at any time through your account settings.",
      },
      {
        subtitle: "Deletion",
        text: "You may request deletion of your account and personal information, subject to legal and operational requirements.",
      },
      {
        subtitle: "Data Portability",
        text: "You can request a copy of your data in a machine-readable format.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of marketing communications at any time by updating your preferences or contacting us.",
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Your privacy is important to us. This policy explains how we collect,
            use, and protect your personal information.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Last updated: January 2025
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
                ChainFundIt Limited (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;) is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our crowdfunding platform
                and services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using ChainFundIt, you agree to the collection and use of
                information in accordance with this policy. If you do not agree
                with our policies and practices, please do not use our services.
              </p>
            </CardContent>
          </Card>
        </div>

        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div key={index} className="mb-8">
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
                        <p className="text-gray-700 leading-relaxed">
                          {item.text}
                        </p>
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
                Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track activity
                on our platform and store certain information. Cookies are files
                with a small amount of data that may include an anonymous unique
                identifier.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You can instruct your browser to refuse all cookies or to indicate
                when a cookie is being sent. However, if you do not accept cookies,
                you may not be able to use some portions of our service.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our platform may contain links to third-party websites or services
                that are not owned or controlled by ChainFundIt. We have no control
                over, and assume no responsibility for, the privacy policies or
                practices of any third-party sites or services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We use trusted third-party payment processors (such as Stripe and
                Paystack) to handle payment transactions. These processors have
                their own privacy policies governing the use of your payment
                information.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and maintained on computers
                located outside of your state, province, country, or other
                governmental jurisdiction where data protection laws may differ from
                those in your jurisdiction. By using our services, you consent to
                the transfer of your information to facilities located outside your
                jurisdiction.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of 18.
                We do not knowingly collect personal information from children. If
                you are a parent or guardian and believe your child has provided us
                with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify
                you of any changes by posting the new Privacy Policy on this page
                and updating the &quot;Last updated&quot; date. You are advised to
                review this Privacy Policy periodically for any changes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to
                exercise your rights, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong> privacy@chainfundit.com
                </p>
                <p>
                  <strong>Address:</strong> ChainFundIt Limited, Registered in
                  England (13253451)
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

