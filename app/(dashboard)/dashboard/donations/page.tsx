"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  CircleCheckBig,
  Clock,
  RefreshCw,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard, useDonations } from "@/hooks/use-dashboard";
import {
  getNextRetryTime,
  getStatusMessage,
  isRetryable,
} from "@/lib/utils/donation-status";
import { toast } from "sonner";

const tabs = ["Received", "Pending", "Failed"];

const DonationsPage = () => {
  const [activeTab, setActiveTab] = React.useState<string>(tabs[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingDonation, setRetryingDonation] = useState<string | null>(null);
  const { stats } = useDashboard();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const statusMap: any = {
    Received: "completed",
    Pending: "pending",
    Failed: "failed",
  };

  const { donations, loading, error, pagination, refreshDonations } =
    useDonations(statusMap[activeTab], currentPage);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDonations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetryPayment = async (donationId: string) => {
    setRetryingDonation(donationId);
    try {
      const response = await fetch("/api/payments/retry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ donationId }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh donations to show updated status
        await refreshDonations();
      } else {
        console.error("Retry failed:", result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Retry error:", error);
      toast.error("An error occurred while retrying the payment");
    } finally {
      setRetryingDonation(null);
    }
  };

  const ActionButton = () => {
    if (activeTab == "Received") {
      const totalAmount = stats?.totalDonations || 0;
      return (
        <div className="font-jakarta bg-[#f0fdf4] border border-[#DCFCE7] flex  rounded-full px-5  py-1 w-fit font-bold text-md text-[#15803d]">
          <div>Total Amount (NGN):</div>₦{totalAmount.toLocaleString()}
        </div>
      );
    }
    if (activeTab == "Pending" || activeTab == "Failed") {
      return (
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-[var(--color-darkGreen)] rounded-[10.5px] justify-center py-3 h-auto md:w-fit w-full "
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      );
    }
  };

  const EmptyDonations = () => {
    if (activeTab === "Received") {
      return (
        <div className="flex flex-col pt-8 justify-center items-center gap-2 overflow-hidden md:w-full w-[20rem]">
          <h3 className="font-semibold text-3xl text-[#104901]">
            No donations received
          </h3>
          <p className="font-normal text-xl text-[#104901]">
            Keep sharing your campaigns on social media and offline channels to
            increase the success of your fundraiser.
          </p>
        </div>
      );
    }
    if (activeTab == "Pending") {
      return (
        <div className="flex flex-col pt-8 justify-center items-center gap-2">
          <h3 className="font-semibold text-3xl text-[#104901]">
            No Pending Donations
          </h3>
          <p className="font-normal text-xl text-[#104901]">
            All your donations have been processed.
          </p>
        </div>
      );
    }
    if (activeTab == "Failed") {
      return (
        <div className="flex flex-col pt-8 justify-center items-center gap-2">
          <h3 className="font-semibold text-3xl text-[#104901]">
            No failed donations
          </h3>
          <p className="font-normal text-xl text-[#104901]">
            All your donations have been processed successfully.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="bg-[#F0F7Ef] p-6 font-jakarta min-h-[calc(100vh-122px)] ">
      <div className="flex flex-col gap-7">
        {/* Dashboard Heading */}
        <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-5">
          <div className="flex flex-col">
            <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
              Donations
            </div>
            <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
              Track and manage your incoming contributions.
            </div>
          </div>
        </div>

        <div>
          {/* Buttons */}
          <div className="flex md:flex-row flex-col bg-white p-5 md:justify-between gap-2 items-center rounded-tl-[21px] rounded-tr-[21px]">
            <div className="flex p-1  bg-[#f3f4f6] w-fit border rounded-[11px]">
              {tabs.map((data, index) => {
                const isSelected = activeTab == data;
                return (
                  <div
                    className={`${isSelected ? "bg-white text-[#104109]" : "text-[#6b7280]"} text-[12px] leading-[18px] cursor-pointer font-bold py-2 px-5 rounded-[7px]`}
                    key={index}
                    onClick={() => {
                      setActiveTab(data);
                    }}
                  >
                    {data}
                  </div>
                );
              })}
            </div>
            <ActionButton />
          </div>
          {/* Table */}
          <div className="overflow-y-hidden w-full">
            <div className="flex flex-col border border-[#f3f4f6] rounded-bl-[21px] rounded-br-[21px] md:w-full">
              {loading && !error && (
                <div className="flex pt-8 justify-center items-center gap-4 overflow-hidden">
                  <Loader color="#104109" />
                  <div
                    style={{
                      fontSize: "28px",
                      lineHeight: "20px",
                      fontWeight: "700",
                      color: "#104109",
                    }}
                  >
                    Loading Donations ...
                  </div>
                </div>
              )}

              {error && (
                <div className="flex pt-8 justify-center items-center gap-4 overflow-hidden">
                  <div
                    className="text-red-700"
                    style={{
                      fontSize: "28px",
                      lineHeight: "20px",
                      fontWeight: "700",
                    }}
                  >
                    Error Loading Donations: {error}
                  </div>
                </div>
              )}

              {!loading && !error && donations.length == 0 && (
                <div className="overflow-hidden flex-wrap md:w-full text-center px-8">
                  <EmptyDonations />
                </div>
              )}

              {!loading && !error && donations.length > 0 && (
                <>
                  <div className="bg-white">
                    <Table className="min-w-max overflow-auto">
                      <TableHeader className="bg-[#Fcfdfd]">
                        <TableRow className="border-t">
                          <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                            DONOR
                          </TableHead>
                          <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                            AMOUNT
                          </TableHead>
                          <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                            CAMPAIGN
                          </TableHead>
                            <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                            DATE
                          </TableHead>
                          <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                            STATUS
                          </TableHead>
                          {(activeTab == "Failed" || activeTab == "Pending") && (
                            <TableHead className="py-3 px-5 text-[#6b7280] text-[11px] leading-[14px] font-bold w-[10rem]">
                              ACTIONS
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((data, index) => {
                          const canRetry = isRetryable(data as any);
                          const nextRetryTime = getNextRetryTime(data as any);
                          return (
                            <TableRow key={index} className="border-t bg-white">
                              {/* Donor */}
                              <TableCell className="py-3 px-5 w-[10rem]">
                                <div className="flex gap-4 items-center truncate">
                                  {data.donorAvatar ? (
                                    <Image
                                      src={data.donorAvatar}
                                      alt={
                                        data.isAnonymous
                                          ? "Anonymous"
                                          : data.donorName || "Donor"
                                      }
                                      width={35}
                                      height={35}
                                      style={{
                                        border: "1px solid #f3f4f6",
                                        borderRadius: "999px",
                                      }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#104109] to-[#59ad4a] rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                                      {data.isAnonymous
                                        ? "A"
                                        : (
                                            data.donorName?.[0] || "D"
                                          ).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex flex-col min-w-0">
                                    <div className="text-[16px] font-bold leading-[30px] text-[#111827] truncate">
                                      {data.isAnonymous
                                        ? "Anonymous Donation"
                                        : data.donorName || "Donor"}
                                    </div>
                                    <div className="text-[11px] leading-[14px] text-[#6b7280]">
                                      Via{" "}
                                      <span className="capitalize">
                                        {data.paymentProvider}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              {/* Amount */}
                              <TableCell className="py-3 px-5 font-bold text-[#104109] text-[16px] leading-[25px] w-[10rem] truncate">
                                {formatCurrency(data.amount, data.currency)}
                              </TableCell>
                              {/* Campaign */}
                              <TableCell className="py-3 px-5 font-medium text-[12px] leading-[18px] text-[#4b5563] w-[10rem] truncate">
                                {data.campaignTitle}
                              </TableCell>
                              {/* Date */}
                              <TableCell className="py-3 px-5 text-[12px] leading-[18px] text-[#6b7280] w-[10rem] truncate">
                                {new Date(data.createdAt).toLocaleDateString()}
                              </TableCell>
                              {/* Status */}
                              <TableCell className="py-3 px-5 w-[10rem]">
                                {activeTab == "Received" && (
                                  <div className="bg-[#f0fdf4] border border-[#DCFCE7] flex gap-2 items-center rounded-full px-5 py-1 w-fit">
                                    <CircleCheckBig color="#15803d" size={12} />
                                    <div className="font-bold text-[11px] leading-[14px] text-[#15803d] capitalize">
                                      {data.paymentStatus}
                                    </div>
                                  </div>
                                )}
                                {activeTab == "Pending" && (
                                  <div className="flex flex-col gap-1">
                                    <div className="bg-yellow-100 border border-yellow-800 flex gap-2 items-center rounded-full px-5 py-1 w-fit">
                                      <Clock color="#854d0e" size={12} />
                                      <div className="font-bold text-[11px] leading-[14px] text-yellow-800 capitalize">
                                        {data.paymentStatus}
                                      </div>
                                    </div>
                                    <div className="text-[10px] leading-[14px] text-[#6b7280]">
                                      {getStatusMessage(data as any)}
                                    </div>
                                  </div>
                                )}
                                {activeTab == "Failed" && (
                                  <div className="bg-destructive border border-transparent flex gap-2 items-center rounded-full px-5 py-1 w-fit">
                                    <XCircle color="white" size={12} />
                                    <div className="font-bold text-[11px] leading-[14px] text-destructive-foreground capitalize">
                                      {data.paymentStatus}
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                              {/* Actions */}
                              {activeTab == "Failed" && (
                                <TableCell className="py-3 px-5 w-[10rem] text-[12px] leading-[18px] text-[#6b7280]">
                                  {canRetry ? (
                                    <Button
                                      onClick={() => handleRetryPayment(data.id)}
                                      disabled={retryingDonation === data.id}
                                      className="flex items-center gap-2 rounded-[10.5px] text-xs justify-center py-3 md:w-fit w-full text-[#104109] bg-white border-[#104109]"
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      {retryingDonation === data.id
                                        ? "Retrying..."
                                        : "Retry Payment"}
                                    </Button>
                                  ) : nextRetryTime ? (
                                    <p className="text-xs text-orange-600 mt-2">
                                      Can retry after{" "}
                                      {nextRetryTime.toLocaleDateString()}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-gray-500 mt-2">
                                      Cannot retry
                                    </p>
                                  )}
                                </TableCell>
                              )}
                              {activeTab === "Pending" && (
                                <TableCell className="py-3 px-5 w-[10rem]">
                                  <p className="text-xs text-orange-600 mt-1">
                                    {data.retryAttempts &&
                                    data.retryAttempts > 0
                                      ? `Retry attempt ${data.retryAttempts} of 3`
                                      : "No Actions Yet"}
                                  </p>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Load More Button */}
        {pagination && pagination.totalPages > pagination.page && (
          <div className="flex justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                       items-center justify-center py-3 h-auto md:w-fit w-full"
            >
              Load More ({pagination.total - pagination.page * pagination.limit}{" "}
              remaining)
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="text-center text-sm text-gray-500 ">
            Showing {donations.length} of {pagination.total} donations
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationsPage;
