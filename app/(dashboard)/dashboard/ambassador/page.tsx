"use client";

import React, { useEffect, useState } from "react";
import Card from "../_components/Card/page";
import {
  Card as CardUI,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { R2Image } from "@/components/ui/r2-image";
import {
  ArrowRight,
  DollarSign,
  Gift,
  Link2,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";


interface AmbassadorChainer {
  id: string;
  campaignId: string;
  referralCode: string;
  totalRaised: string;
  totalReferrals: number;
  commissionEarned: string;
  commissionPaid: boolean;
  createdAt: string;
  campaignTitle: string;
  campaignCoverImage?: string | null;
  campaignGoal: string;
  campaignCurrent: string;
  campaignCurrency: string;
  campaignStatus: string;
  totalEarnings: number;
  totalDonations: number;
  progressPercentage: number;
}

interface AmbassadorStats {
  totalChained: number;
  totalEarnings: number;
  totalDonations: number;
  totalReferrals: number;
}

interface AmbassadorResponse {
  success: boolean;
  chainers: AmbassadorChainer[];
  stats: AmbassadorStats;
  error?: string;
}

export default function AmbassadorDashboardPage() {
  const [data, setData] = useState<AmbassadorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard/ambassador", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const json: AmbassadorResponse = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load ambassador stats");
      }

      setData(json);
    } catch (err) {
      console.error("Error fetching ambassador stats:", err);
      const message =
        err instanceof Error ? err.message : "Failed to load ambassador stats";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = async (referralCode: string) => {
    try {
      const base =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = `${base}/c/${referralCode}`;
      await navigator.clipboard.writeText(link);
      toast.success("Referral link copied");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const isLoadingState = loading || !data || !data.success;
  const { chainers, stats } = data || { chainers: [], stats: undefined as any };
  const hasChains = chainers && chainers.length > 0;

  return (
    <div className="font-jakarta bg-[#F0F7EF] p-6 flex flex-col gap-7 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
          Ambassador
        </div>
        <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
          Track how your referral links are helping campaigns raise funds and how much
          commission you&apos;ve earned.
        </div>
      </div>

      {isLoadingState ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#104901] mb-4" />
          <p className="text-gray-600 text-sm">
            Loading your ambassador dashboard...
          </p>
        </div>
      ) : !hasChains ? (
        <CardUI className="mb-8">
          <CardContent className="py-10 flex flex-col items-center text-center gap-4">
            <Gift className="h-10 w-10 text-[#104901]" />
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                You haven&apos;t chained any campaigns yet
              </p>
              <p className="text-gray-600 text-sm max-w-md">
                When you chain a campaign and share your referral link, you&apos;ll
                see your impact and earnings here.
              </p>
            </div>
            <Button
              className="bg-[#104901] text-white"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/campaigns/chained";
                }
              }}
            >
              Browse campaigns that allow chaining
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </CardUI>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <Card
              containerStyle={isMobile ? { width: "100%" } : {}}
              bgColor="var(--color-lightGreen)"
              value={stats?.totalChained || 0}
              text="CAMPAIGNS CHAINED"
              Icon={Link2}
            />

            <Card
              containerStyle={isMobile ? { width: "100%" } : {}}
              bgColor="#104109"
              value={formatCurrency(stats.totalDonations || 0, "NGN")}
              text="RAISED VIA YOUR LINKS"
              Icon={Gift}
            />

            <Card
              containerStyle={isMobile ? { width: "100%" } : {}}
              bgColor="var(--color-lightGreen)"
              value={formatCurrency(stats.totalEarnings || 0, "NGN")}
              text="YOUR COMMISSION EARNED"
              Icon={DollarSign}
            />

            <Card
              containerStyle={isMobile ? { width: "100%" } : {}}
              bgColor="#104109"
              value={stats?.totalReferrals || 0}
              text="TOTAL REFERRALS"
              Icon={Users}
            />

            {/* <Card
              containerStyle={isMobile ? { width: "100%" } : {}}
              bgColor="var(--color-lightGreen)"
              value={stats.totalReferrals || 0}
              text="PEOPLE REACHED THROUGH YOUR LINKS"
              Icon={Users}
            /> */}
          
          </div>

          {/* Per-campaign table */}
          <CardUI>
            <CardHeader>
              <CardTitle>Your Chained Campaigns</CardTitle>
              <CardDescription>
                Track how much you&apos;ve helped each campaign raise and your
                earnings from them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="py-3 pr-4 font-medium text-gray-500">
                        Campaign
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        You raised
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Your earnings
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Referrals
                      </th>
                      <th className="py-3 px-4 font-medium text-gray-500">
                        Progress
                      </th>
                      <th className="py-3 pl-4 font-medium text-gray-500">
                        Referral link
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chainers.map((chainer) => {
                      const progress = chainer.progressPercentage || 0;
                      const currency = chainer.campaignCurrency || "NGN";
                      const referralLink = `/c/${chainer.referralCode}`;

                      return (
                        <tr
                          key={chainer.id}
                          className="border-b border-gray-100 align-top"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              {chainer.campaignCoverImage ? (
                                <R2Image
                                  src={chainer.campaignCoverImage}
                                  alt={chainer.campaignTitle}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  No image
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {chainer.campaignTitle}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Started{" "}
                                  {new Date(
                                    chainer.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] uppercase"
                                  >
                                    {chainer.campaignStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-[#104901]">
                              {formatCurrency(
                                chainer.totalDonations || 0,
                                currency
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-blue-600">
                              {formatCurrency(
                                chainer.totalEarnings || 0,
                                currency
                              )}
                            </div>
                            {chainer.commissionPaid && (
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Included in payouts
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-medium text-gray-800">
                              {chainer.totalReferrals}
                            </div>
                          </td>
                          <td className="py-3 px-4 min-w-[180px]">
                            <div className="flex flex-col gap-1">
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#104901] to-green-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[11px] text-gray-500">
                                <span>{progress}%</span>
                                <span>
                                  {formatCurrency(
                                    Number(chainer.campaignCurrent) || 0,
                                    currency
                                  )}{" "}
                                  /{" "}
                                  {formatCurrency(
                                    Number(chainer.campaignGoal) || 0,
                                    currency
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pl-4 min-w-[200px]">
                            <div className="flex flex-col gap-1">
                              <code className="text-xs bg-gray-100 rounded px-2 py-1 break-all">
                                {referralLink}
                              </code>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() =>
                                    handleCopyLink(chainer.referralCode)
                                  }
                                >
                                  Copy link
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-[#104901]"
                                  onClick={() => {
                                    if (typeof window !== "undefined") {
                                      window.open(
                                        `/campaign/${chainer.campaignId}`,
                                        "_blank"
                                      );
                                    }
                                  }}
                                >
                                  View campaign
                                  <TrendingUp className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 text-xs text-gray-500">
                For detailed payout history, visit your{" "}
                <a
                  href="/dashboard/payouts/commissions"
                  className="text-[#104901] underline underline-offset-2"
                >
                  Commission Payouts
                </a>{" "}
                page.
              </div>
            </CardContent>
          </CardUI>
        </>
      )}
    </div>
  );
}

