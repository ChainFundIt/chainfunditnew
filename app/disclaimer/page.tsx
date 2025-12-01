"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, FileText, Info } from "lucide-react";

const disclaimerSections = [
  {
    title: "Platform Disclaimer",
    icon: Shield,
    content: [
      {
        subtitle: "Service Provision",
        text: "ChainFundIt Limited operates a donation-based crowdfunding platform. We provide the technology and infrastructure to facilitate fundraising campaigns but do not guarantee the success of any campaign or the accuracy of campaign information provided by users.",
      },
      {
        subtitle: "No Endorsement",
        text: "The presence of a campaign on our platform does not constitute an endorsement by ChainFundIt. We do not verify the accuracy of campaign details, the legitimacy of causes, or the use of funds by campaign organizers.",
      },
      {
        subtitle: "User Responsibility",
        text: "Users are solely responsible for the content they post, the accuracy of their campaign information, and the use of funds raised. Donors should exercise due diligence before contributing to any campaign.",
      },
    ],
  },
  {
    title: "Campaign Management",
    icon: AlertTriangle,
    content: [
      {
        subtitle: "Right to Modify Campaigns",
        text: "We reserve the right to open, extend, shorten, or close a fundraising campaign if we suspect any misuse, fraudulent activity, violation of our terms, or for any other reason we deem necessary to protect our platform and users.",
      },
      {
        subtitle: "Verification Process",
        text: "While we may conduct verification checks on campaigns and users, we do not guarantee the authenticity of any campaign or user. Users should verify information independently before making donations.",
      },
      {
        subtitle: "Fund Disbursement",
        text: "Funds are disbursed according to our standard payout schedule and terms. ChainFundIt is not responsible for delays in fund disbursement due to payment processor issues, verification requirements, or other factors beyond our control.",
      },
    ],
  },
  {
    title: "Financial Disclaimer",
    icon: FileText,
    content: [
      {
        subtitle: "Payment Processing",
        text: "Payments are processed through third-party payment processors (Stripe, Paystack, etc.). ChainFundIt is not responsible for payment processing errors, declined transactions, or issues with payment processors.",
      },
      {
        subtitle: "Fees and Charges",
        text: "Platform fees and payment processing fees are clearly disclosed. All fees are non-refundable once a donation is processed. Refunds are subject to our refund policy and the policies of payment processors.",
      },
      {
        subtitle: "Tax Implications",
        text: "Users are responsible for understanding and complying with all applicable tax laws and regulations in their jurisdiction. ChainFundIt does not provide tax advice and recommends consulting with a tax professional.",
      },
    ],
  },
  {
    title: "Legal and Regulatory",
    icon: Info,
    content: [
      {
        subtitle: "Regulatory Compliance",
        text: "ChainFundIt has obtained a no-objection from the Financial Conduct Authority (FCA) to operate a donation-based crowdfunding platform in the UK. For US campaigns, ChainFundIt does not offer equity or lending-based services and is not subject to US SEC regulations for crowdfunding.",
      },
      {
        subtitle: "Jurisdiction",
        text: "ChainFundIt Limited is registered in England (13253451). All disputes will be governed by English law and subject to the jurisdiction of English courts.",
      },
      {
        subtitle: "Limitation of Liability",
        text: "To the maximum extent permitted by law, ChainFundIt shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.",
      },
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Disclaimer</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Important information about our platform, services, and your
            responsibilities as a user.
          </p>
          <p className="text-sm text-white/80 mt-4">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Important Notice */}
        <div className="mb-8">
          <Card className="border-2 border-yellow-300 bg-yellow-50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Important Notice
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Please read this disclaimer carefully before using ChainFundIt.
                    By using our platform, you acknowledge that you have read,
                    understood, and agree to be bound by this disclaimer and our
                    Terms and Conditions.
                  </p>
                  <p className="text-gray-700 leading-relaxed font-semibold">
                    We reserve the right to open, extend, shorten, or even close a
                    fundraising campaign if we suspect any misuse or fraudulent
                    activity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer Sections */}
        {disclaimerSections.map((section, index) => {
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

        {/* Additional Information */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Additional Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>No Warranty:</strong> ChainFundIt provides the platform
                  &quot;as is&quot; without warranties of any kind, either express
                  or implied. We do not guarantee that the platform will be
                  uninterrupted, secure, or error-free.
                </p>
                <p>
                  <strong>Third-Party Links:</strong> Our platform may contain
                  links to third-party websites. We are not responsible for the
                  content, privacy policies, or practices of third-party sites.
                </p>
                <p>
                  <strong>Changes to Services:</strong> We reserve the right to
                  modify, suspend, or discontinue any aspect of our services at
                  any time without prior notice.
                </p>
                <p>
                  <strong>User Content:</strong> Users are solely responsible for
                  all content they post on our platform. ChainFundIt does not
                  endorse or assume responsibility for user-generated content.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Questions or Concerns?
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this disclaimer or need to report
                suspicious activity, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong> support@chainfundit.com
                </p>
                <p>
                  <strong>Company:</strong> ChainFundIt Limited
                </p>
                <p>
                  <strong>Registration:</strong> England (13253451)
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

