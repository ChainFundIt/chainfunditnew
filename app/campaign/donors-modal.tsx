"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { CampaignDonation } from "@/hooks/use-campaign-donations";

interface DonorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donations: CampaignDonation[];
  loading: boolean;
}

const DonorsModal: React.FC<DonorsModalProps> = ({
  open,
  onOpenChange,
  donations,
  loading,
}) => {
  if (!open) return null;

  // Filter to only show successful donations
  const successfulDonations = donations.filter(
    (donation) => donation.paymentStatus === "completed"
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh]">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-[#104901] rounded-3xl blur opacity-20"></div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#104901]">
              All Donors ({successfulDonations.length})
            </h2>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104901] mx-auto mb-4"></div>
                  <p className="text-[#757575]">Loading donors...</p>
                </div>
              </div>
            ) : successfulDonations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#5F8555] text-lg">No successful donations yet</p>
                <p className="text-[#757575] text-sm mt-1">
                  Be the first to support this campaign!
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {successfulDonations.map((donation) => (
                  <li
                    key={donation.id}
                    className="flex gap-4 items-center p-4 bg-white border border-[#C0BFC4] rounded-2xl hover:shadow-md transition-shadow"
                  >
                    {donation.donorAvatar && !donation.isAnonymous ? (
                      <Image
                        src={donation.donorAvatar}
                        alt={donation.donorName || "Donor"}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#E7EDE6] rounded-full flex items-center justify-center text-[#104901] font-semibold text-xl flex-shrink-0">
                        {donation.isAnonymous
                          ? "?"
                          : donation.donorName?.charAt(0).toUpperCase() || "D"}
                      </div>
                    )}
                    <section className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-normal text-xl text-[#5F8555] truncate">
                          {donation.isAnonymous
                            ? "Anonymous Donor"
                            : donation.donorName || "Donor"}
                        </p>
                      </div>
                      <p className="font-medium text-xl text-black">
                        {formatCurrency(
                          parseFloat(donation.amount),
                          donation.currency
                        )}{" "}
                        •{" "}
                        <span className="font-normal text-lg text-[#5F8555]">
                          {new Date(donation.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </p>
                      {donation.message && (
                        <p className="font-normal text-sm text-[#757575] italic mt-2">
                          &quot;{donation.message}&quot;
                        </p>
                      )}
                    </section>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorsModal;
