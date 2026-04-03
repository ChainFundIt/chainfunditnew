"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Shield,
  FileText,
  BadgeCheck,
  DollarSign,
  Building2,
  Scale,
  Flag,
  AlertTriangle,
  Users,
  CheckCircle,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

type CampaignPayload = {
  id: string;
  title: string;
  creatorId: string;
  isVerified: boolean;
  verifiedPendingAt: string | null;
  slug: string;
};

const tableOfContents = [
  { id: "v-intro", label: "Introduction" },
  { id: "v-1", label: "1. Accuracy & Authenticity" },
  { id: "v-2", label: "2. Use of Funds" },
  { id: "v-3", label: "3. Direct Disbursement" },
  { id: "v-4", label: "4. Funding Threshold" },
  { id: "v-5", label: "5. Campaign Status & Rights" },
  { id: "v-6", label: "6. Inability to Fulfil" },
  { id: "v-7", label: "7. Cooperation" },
  { id: "v-8", label: "8. Acknowledgement" },
  { id: "v-accept", label: "Accept agreement" },
];

const linkClass = "text-[#104901] hover:underline";
const bodyTextClass =
  "leading-relaxed text-sm text-justify text-[#1a1a1a]";
const listClass = "list-disc list-inside space-y-2";

const verifiedAgreementSections: {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  content: React.ReactNode;
}[] = [
  {
    id: "v-intro",
    title: "ChainFundIt Verified Campaign Agreement",
    icon: FileText,
    content: (
      <p>
        By requesting and/or accepting the &quot;Verified&quot; status on your
        campaign, you (&quot;Campaign Organiser&quot;) agree to the following
        terms in addition to ChainFundIt&apos;s general{" "}
        <Link href="/terms-and-conditions" className={linkClass}>
          Terms &amp; Conditions
        </Link>
        :
      </p>
    ),
  },
  {
    id: "v-1",
    title: "1. Accuracy & Authenticity",
    icon: BadgeCheck,
    content: (
      <>
        <p>You confirm that:</p>
        <ul className={listClass}>
          <li>
            All information provided in your campaign is true, accurate, and
            not misleading
          </li>
          <li>
            You have the right and authority to raise funds for the stated
            purpose
          </li>
          <li>
            Any documents or evidence submitted are genuine and verifiable
          </li>
        </ul>
        <p>
          ChainFundIt reserves the right to request additional documentation at
          any time to support verification.
        </p>
      </>
    ),
  },
  {
    id: "v-2",
    title: "2. Use of Funds",
    icon: DollarSign,
    content: (
      <>
        <p>You agree that:</p>
        <ul className={listClass}>
          <li>
            Funds raised will be used solely for the stated purpose of the
            campaign
          </li>
          <li>
            Funds will not be diverted, misused, or applied to unrelated
            purposes
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "v-3",
    title: "3. Direct Disbursement to Institutions",
    icon: Building2,
    content: (
      <>
        <p>As a condition of verification:</p>
        <ul className={listClass}>
          <li>
            All funds raised will be paid directly by ChainFundIt to the
            relevant institution (e.g. hospital, school, landlord, or verified
            service provider)
          </li>
          <li>
            Funds will not be paid directly to you or the beneficiary, except at
            ChainFundIt&apos;s discretion in exceptional circumstances
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "v-4",
    title: "4. Funding Threshold & Disbursement Conditions",
    icon: Scale,
    content: (
      <>
        <p>
          Where the total funds raised are insufficient to meet the required
          cost of the stated purpose:
        </p>
        <ul className={listClass}>
          <li>
            ChainFundIt may withhold disbursement until you provide satisfactory
            evidence that the remaining balance has been secured from other
            sources
          </li>
          <li>You agree to provide such evidence upon request</li>
        </ul>
        <p>
          If sufficient funding cannot be demonstrated and no communication or
          supporting evidence is received from the campaign organiser within 28
          days (4 weeks) of ChainFundIt&apos;s request for such information:
        </p>
        <ul className={listClass}>
          <li>The campaign may be marked as inactive</li>
          <li>
            Funds may be subject to refund or reallocation in accordance with
            ChainFundIt&apos;s Terms &amp; Conditions
          </li>
        </ul>
        <p>
          ChainFundIt shall not be obligated to release funds where doing so
          would not reasonably achieve the stated purpose of the campaign.
        </p>
      </>
    ),
  },
  {
    id: "v-5",
    title: "5. Campaign Status & Platform Rights",
    icon: Flag,
    content: (
      <>
        <p>
          You acknowledge and agree that ChainFundIt may, at its discretion:
        </p>
        <ul className={listClass}>
          <li>
            Mark your campaign as inactive, suspend, or remove it where concerns
            arise
          </li>
          <li>Withhold funds pending investigation or verification</li>
          <li>
            Take appropriate action where the campaign cannot fulfil its stated
            purpose
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "v-6",
    title: "6. Inability to Fulfil Campaign Purpose",
    icon: AlertTriangle,
    content: (
      <>
        <p>
          A campaign may be considered unable to proceed or fulfil its intended
          purpose where:
        </p>
        <ul className={listClass}>
          <li>The beneficiary is deceased</li>
          <li>
            The required treatment, service, or objective is no longer needed or
            possible
          </li>
          <li>
            The total funds required cannot be met and no additional funding is
            secured
          </li>
          <li>Required documentation or verification is not provided</li>
          <li>
            Any other circumstance prevents the funds from being applied to the
            stated purpose
          </li>
        </ul>
        <p>
          In such cases, ChainFundIt may, acting reasonably and in good faith:
        </p>
        <ul className={listClass}>
          <li>
            Allow donors to request refunds in accordance with platform Terms
          </li>
          <li>
            Reallocate funds to similar verified campaigns or causes
          </li>
          <li>
            Apply funds toward outstanding obligations related to the original
            purpose
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "v-7",
    title: "7. Cooperation & Ongoing Obligations",
    icon: Users,
    content: (
      <>
        <p>You agree to:</p>
        <ul className={listClass}>
          <li>Respond promptly to ChainFundIt communications</li>
          <li>Provide updates and documentation where required</li>
          <li>Cooperate fully with verification and compliance checks</li>
        </ul>
        <p>Failure to comply may result in:</p>
        <ul className={listClass}>
          <li>Removal of &quot;Verified&quot; status</li>
          <li>Suspension of the campaign</li>
          <li>Withholding or redirection of funds</li>
        </ul>
      </>
    ),
  },
  {
    id: "v-8",
    title: "8. Acknowledgement",
    icon: CheckCircle,
    content: (
      <>
        <p>By accepting the Verified status:</p>
        <ul className={listClass}>
          <li>
            You acknowledge that verification is granted at ChainFundIt&apos;s
            discretion
          </li>
          <li>
            You agree to comply with this Agreement and the platform Terms
          </li>
          <li>
            You understand that verification does not guarantee fundraising
            success or full funding of your campaign
          </li>
        </ul>
      </>
    ),
  },
];

function TermsStyleHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative flex justify-center px-4 py-12 sm:py-16 md:py-20 bg-[#FCFAF5] overflow-hidden">
      <div
        className="absolute top-0 right-0 pointer-events-none hidden md:flex"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #104109 0%, transparent 70%)",
          filter: "blur(64px)",
          opacity: 0.2,
        }}
      />
      <div
        className="absolute top-0 left-0 pointer-events-none hidden md:flex"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
          filter: "blur(64px)",
          opacity: 0.1,
        }}
      />
      <div className="relative flex flex-col items-center justify-center gap-4 sm:gap-6 w-full max-w-[80rem] z-[1]">
        <div className="p-3 bg-[#ECFDF5] rounded-xl">
          <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-[#059669]" />
        </div>
        <h1 className="font-extrabold text-[#022C22] text-center text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[4rem] lg:leading-[1.05] px-2">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-[#4B5563] text-center max-w-3xl px-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function VerifiedCampaignContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeSection, setActiveSection] = useState("v-intro");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [campaign, setCampaign] = useState<CampaignPayload | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const loadCampaign = useCallback(async () => {
    if (!campaignId) {
      setFetchError(
        "Missing campaign link. Open the link from your email or notification."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) {
        setFetchError(json.error || "Could not load campaign.");
        setCampaign(null);
        return;
      }
      const d = json.data;
      setCampaign({
        id: d.id,
        title: d.title,
        creatorId: d.creatorId,
        isVerified: Boolean(d.isVerified),
        verifiedPendingAt: d.verifiedPendingAt ?? null,
        slug: d.slug,
      });
    } catch {
      setFetchError("Could not load campaign.");
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (!authLoading && user) {
      loadCampaign();
    }
    if (!authLoading && !user) {
      setLoading(false);
      setFetchError("Please sign in to continue.");
    }
  }, [authLoading, user, loadCampaign]);

  const isOwner = user && campaign && campaign.creatorId === user.id;
  const needsAcceptance =
    campaign && campaign.verifiedPendingAt && !campaign.isVerified;

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  async function handleAccept() {
    if (!campaign || !agreed) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/campaigns/${campaign.id}/accept-verification`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error || "Something went wrong.");
        return;
      }
      toast.success("Your campaign is now verified.");
      router.push("/dashboard/campaigns");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="font-jakarta bg-white w-full min-h-[calc(100vh-122px)]">
      <TermsStyleHero
        title="Verified Campaign Agreement"
        subtitle="Please read this agreement carefully. By accepting, you activate the verified badge on your campaign and agree to these terms in addition to our general Terms & Conditions."
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {authLoading || loading ? (
            <div className="flex justify-center items-center gap-2 py-20 text-[#6B7280]">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading…
            </div>
          ) : fetchError ? (
            <Card
              style={{ borderRadius: "16px", padding: "0", border: "none" }}
              className="bg-white shadow-sm border border-gray-100"
            >
              <CardContent className="p-6">
                <p className="text-red-700 text-sm leading-relaxed">{fetchError}</p>
              </CardContent>
            </Card>
          ) : !isOwner ? (
            <Card
              style={{ borderRadius: "16px", padding: "0", border: "none" }}
              className="bg-white shadow-sm border border-gray-100"
            >
              <CardContent className="p-6">
                <p className={`${bodyTextClass}`}>
                  This page is only available to the campaign creator.
                </p>
              </CardContent>
            </Card>
          ) : campaign?.isVerified ? (
            <Card
              style={{ borderRadius: "16px", padding: "0", border: "none" }}
              className="bg-white shadow-sm border border-gray-100"
            >
              <CardContent className="p-6">
                <p className="font-medium text-[#104901] leading-relaxed">
                  This campaign is already verified. No further action is needed.
                </p>
              </CardContent>
            </Card>
          ) : !needsAcceptance ? (
            <Card
              style={{ borderRadius: "16px", padding: "0", border: "none" }}
              className="bg-white shadow-sm border border-gray-100"
            >
              <CardContent className="p-6">
                <p className={`${bodyTextClass}`}>
                  This campaign is not waiting for verification acceptance. If
                  you believe this is a mistake, contact{" "}
                  <Link
                    href="mailto:campaigns@chainfundit.com"
                    className={linkClass}
                  >
                    campaigns@chainfundit.com
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {campaign && (
                <div className="mb-8 px-1">
                  <p className="text-sm text-[#4b5563]">
                    <span className="font-semibold text-[#1a1a1a]">
                      Campaign:
                    </span>{" "}
                    {campaign.title}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <div className="sticky top-24 bg-gray-50 rounded-lg p-6 border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                      TABLE OF CONTENTS
                    </h3>
                    <nav className="space-y-1">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === item.id
                              ? "bg-green-100 text-green-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                  {verifiedAgreementSections.map((section, index) => {
                    const Icon = section.icon;
                    const isGreenCard = [2, 5, 8].includes(index);

                    return (
                      <div
                        key={section.id}
                        id={section.id}
                        className="scroll-mt-24"
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
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div
                                className="p-3 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: "#1a5a2a",
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
                                className="font-bold"
                                style={{
                                  fontSize: "18px",
                                  color: isGreenCard ? "#FFFFFF" : "#1a1a1a",
                                }}
                              >
                                {section.title}
                              </h2>
                            </div>
                            <div
                              className={`space-y-4 leading-relaxed text-sm text-justify ${
                                isGreenCard
                                  ? "text-white [&_li]:marker:text-white"
                                  : "text-[#1a1a1a]"
                              }`}
                            >
                              {section.content}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}

                  <div
                    id="v-accept"
                    className="scroll-mt-24 mb-8"
                    onMouseEnter={() => setActiveSection("v-accept")}
                  >
                    <Card
                      style={{ borderRadius: "16px", padding: "0", border: "none" }}
                      className="bg-white"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className="p-3 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: "#f0fdf4",
                              width: "48px",
                              height: "48px",
                            }}
                          >
                            <PenLine className="h-5 w-5 text-green-600" />
                          </div>
                          <h2
                            className="font-bold text-[18px] text-[#1a1a1a]"
                          >
                            Accept agreement
                          </h2>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer mb-6">
                          <Checkbox
                            checked={agreed}
                            onCheckedChange={(v) => setAgreed(v === true)}
                            className="mt-0.5"
                          />
                          <span className="text-sm text-[#1a1a1a] font-medium leading-snug">
                            I agree to the ChainFundIt Verified Campaign
                            Agreement
                          </span>
                        </label>

                        <div
                          className="space-y-2 text-sm border-t border-gray-200 pt-4 mb-6"
                          style={{ color: "#4b5563" }}
                        >
                          <p>
                            <strong>Name:</strong>{" "}
                            <span className="text-[#1a1a1a]">
                              {user?.fullName || "—"}
                            </span>
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            <span className="text-[#1a1a1a]">
                              {user?.email || "—"}
                            </span>
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            <span className="text-[#1a1a1a]">
                              {new Intl.DateTimeFormat("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }).format(new Date())}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            disabled={!agreed || submitting}
                            onClick={handleAccept}
                            className="bg-[#104901] text-white"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting…
                              </>
                            ) : (
                              "Accept and verify my campaign"
                            )}
                          </Button>
                          <Button type="button" variant="outline" asChild>
                            <Link href="/dashboard/campaigns">
                              Back to campaigns
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifiedCampaignPage() {
  return (
    <Suspense
      fallback={
        <div className="font-jakarta bg-white min-h-[calc(100vh-122px)]">
          <TermsStyleHero
            title="Verified Campaign Agreement"
            subtitle="Loading…"
          />
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
          </div>
        </div>
      }
    >
      <VerifiedCampaignContent />
    </Suspense>
  );
}
