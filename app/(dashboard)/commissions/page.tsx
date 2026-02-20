"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card as UICard,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useIsMobile } from "@/hooks/useIsMobile";
import SummaryCard from "../dashboard/_components/Card/page";
import { PayoutsIcon } from "@/public/icons/PayoutsIcon";

interface CommissionPayout {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  destination: string;
  destinationCampaignId?: string;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
}

interface CommissionSummary {
  totalPending: number;
  totalCompleted: number;
  totalFailed: number;
  totalAmount: number;
}

type FilterValue = "all" | "pending" | "completed" | "failed";

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

const TrendingUpIcon = () => <TrendingUp size={24} color="white" />;
const DollarSignIcon = () => <DollarSign size={24} color="white" />;
const ClockIcon = () => <Clock size={24} color="white" />;
const CheckCircleIcon = () => <CheckCircle size={24} color="white" />;
const XCircleIcon = () => <XCircle size={24} color="white" />;

const CommissionsPage = () => {
  const isMobile = useIsMobile();
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [summary, setSummary] = useState<CommissionSummary>({
    totalPending: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");

  useEffect(() => {
    fetchCommissionPayouts({ preserveLayout: hasLoadedOnceRef.current });
  }, [filter]);

  const fetchCommissionPayouts = async ({
    preserveLayout = false,
  }: {
    preserveLayout?: boolean;
  } = {}) => {
    try {
      if (preserveLayout) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const statusParam = filter === "all" ? "" : filter;
      const url = `/api/commissions/payouts${
        statusParam ? `?status=${statusParam}` : ""
      }`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setPayouts(result.data.payouts);
        setSummary(result.data.summary);
        if (!hasLoadedOnceRef.current) {
          hasLoadedOnceRef.current = true;
          setHasLoadedOnce(true);
        }
      } else {
        setError(result.error || "Failed to fetch commission payouts");
      }
    } catch (err) {
      setError("Failed to fetch commission payouts");
      console.error("Error:", err);
    } finally {
      if (preserveLayout) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDestinationLabel = (destination: string) => {
    switch (destination) {
      case "keep":
        return "Keep Commission";
      case "donate_back":
        return "Donate Back to Campaign";
      case "donate_other":
        return "Donate to Another Campaign";
      default:
        return destination;
    }
  };

  const completedCount = payouts.filter(
    (payout) => payout.status === "completed"
  ).length;
  const pendingCount = payouts.filter(
    (payout) => payout.status === "pending"
  ).length;
  const failedCount = payouts.filter(
    (payout) => payout.status === "failed"
  ).length;

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-[#F0F7EF] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-white/60 rounded-3xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-white/60 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 bg-white/60 rounded-3xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !hasLoadedOnce) {
    return (
      <div className="min-h-screen bg-[#F0F7EF] p-6 flex items-center justify-center">
        <UICard className="max-w-lg w-full border border-red-100 bg-red-50">
          <CardHeader className="text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-2xl font-bold">
              Error Loading Commissions
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={() => fetchCommissionPayouts({ preserveLayout: true })}
              className="bg-[var(--color-darkGreen)] text-white rounded-full"
            >
              Try Again
            </Button>
          </CardContent>
        </UICard>
      </div>
    );
  }

  return (
    <div className="font-jakarta bg-[#F0F7EF] p-6 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col gap-7">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
            Ambassador Commissions
          </div>
          <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
            Track commission payouts you&apos;ve earned by chaining and sharing
            campaigns.
          </div>
        </div>

        {/* Summary Banner */}
        <div className="flex flex-col gap-4 items-center justify-between bg-[--color-darkGreen] p-7 rounded-3xl">
          <div className="flex justify-between w-full">
            <div className="p-2 bg-[#FFFFFF1A] rounded-xl">
              <PayoutsIcon color="#FFCF55" height="32" width="32" />
            </div>
            <div className="bg-[#FFCF5533] border border-[#FFCF5533] text-[#FFCF55] py-1 px-3 rounded-full h-fit">
              Ambassador
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between w-full gap-6">
            <div className="flex flex-col gap-2 text-[#DCFCE7]">
              <div className="text-2xl font-bold">Commission Summary</div>
              <div className="text-lg opacity-80">
                {payouts.length} payout{payouts.length === 1 ? "" : "s"} •{" "}
                {pendingCount} pending review
              </div>
              <div className="text-sm opacity-70">
                Completed: {completedCount} • Failed: {failedCount}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-[#DCFCE7] md:text-right">
              <div className="text-3xl font-bold">
                {formatCurrency(summary.totalAmount, "USD")}
              </div>
              <div className="text-sm opacity-60">Total Earned</div>
              <div className="text-xl font-semibold mt-2">
                {formatCurrency(summary.totalPending, "USD")}
              </div>
              <div className="text-xs opacity-60">Pending payouts</div>
              <div className="text-sm opacity-70">
                Paid out: {formatCurrency(summary.totalCompleted, "USD")}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="flex gap-5 md:flex-row flex-col">
          <SummaryCard
            containerStyle={isMobile ? { width: "100%" } : {}}
            bgColor="var(--color-lightGreen)"
            value={formatCurrency(summary.totalCompleted, "USD")}
            text="Completed Payouts"
            Icon={CheckCircleIcon}
          />
          <SummaryCard
            containerStyle={isMobile ? { width: "100%" } : {}}
            bgColor="#104109"
            value={formatCurrency(summary.totalPending, "USD")}
            text="Pending Review"
            Icon={ClockIcon}
          />
          <SummaryCard
            containerStyle={isMobile ? { width: "100%" } : {}}
            bgColor="var(--color-lightGreen)"
            value={formatCurrency(summary.totalFailed, "USD")}
            text="Failed Transfers"
            Icon={XCircleIcon}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-white border border-emerald-50 rounded-full p-2 w-full md:w-auto">
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 font-semibold transition ${
                filter === option.value
                  ? "bg-[var(--color-darkGreen)] text-white shadow-lg"
                  : "bg-white text-[#104901] border border-[#D1D5DB] hover:border-[var(--color-darkGreen)]"
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating payouts...
          </div>
        )}

        {error && hasLoadedOnce && (
          <UICard className="border border-amber-200 bg-amber-50 rounded-2xl">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Unable to refresh payouts
                </p>
                <p className="text-sm text-amber-800">{error}</p>
              </div>
              <div className="ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-200 text-amber-900"
                  onClick={() =>
                    fetchCommissionPayouts({ preserveLayout: hasLoadedOnceRef.current })
                  }
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </UICard>
        )}

        {/* Payouts List */}
        {payouts.length === 0 ? (
          <UICard className="border border-dashed border-emerald-200 bg-white/70 rounded-3xl">
            <CardContent className="pt-10 pb-10">
              <div className="text-center flex flex-col items-center gap-4">
                <TrendingUp className="h-12 w-12 text-emerald-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Commission Payouts
                  </h3>
                  <p className="text-gray-600 max-w-lg mx-auto">
                    {filter === "all"
                      ? "You have not received any commission payouts yet. Share campaigns to start earning."
                      : `There are no ${filter} commission payouts right now.`}
                  </p>
                </div>
              </div>
            </CardContent>
          </UICard>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <UICard
                key={payout.id}
                className="border border-white/40 bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl"
              >
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1 text-[#104109]">
                        {payout.campaignTitle}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {new Date(payout.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-lg font-semibold text-[#111827]">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Destination</p>
                      <p className="text-sm font-medium text-[#111827]">
                        {getDestinationLabel(payout.destination)}
                      </p>
                    </div>
                    {payout.processedAt && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Processed</p>
                        <p className="text-sm text-[#111827]">
                          {new Date(payout.processedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {payout.transactionId && (
                    <div className="mt-6 pt-4 border-t border-dashed border-emerald-100">
                      <p className="text-sm text-gray-600 mb-1">
                        Transaction ID
                      </p>
                      <p className="text-sm font-mono text-[#0F172A]">
                        {payout.transactionId}
                      </p>
                    </div>
                  )}

                  {payout.notes && (
                    <div className="mt-4 pt-4 border-t border-dashed border-emerald-100">
                      <p className="text-sm text-gray-600 mb-1">Notes</p>
                      <p className="text-sm text-[#111827]">{payout.notes}</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-emerald-50 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-emerald-200 text-[#104901] hover:bg-emerald-50"
                      onClick={() =>
                        window.open(`/campaign/${payout.campaignId}`, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Campaign
                    </Button>
                  </div>
                </CardContent>
              </UICard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionsPage;
