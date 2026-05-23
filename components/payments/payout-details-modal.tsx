"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Building2,
  AlertCircle,
  ExternalLink,
  Send,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";

interface PayoutDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    currencyCode: string;
    totalRaised: number;
    totalRaisedInNGN: number;
    totalPaidOut: number;
    totalPaidOutInNGN: number;
    availableAmount: number;
    availableAmountInNGN: number;
    payoutProvider: string | null;
    payoutConfig: any;
    chainerCommissionsTotal?: number;
    chainerCommissionsInNGN?: number;
  };
  userProfile?: {
    email?: string;
    accountVerified?: boolean;
    accountChangeRequested?: boolean;
  };
  onContinueToPayoutFlow: (
    campaign: PayoutDetailsModalProps["campaign"]
  ) => void;
  isProcessing?: boolean;
}

export function PayoutDetailsModal({
  isOpen,
  onClose,
  campaign,
  userProfile,
  onContinueToPayoutFlow,
  isProcessing = false,
}: PayoutDetailsModalProps) {
  const router = useRouter();

  const availableAmount = Math.max(campaign.availableAmount || 0, 0);
  const fees = useMemo(() => {
    const baseAmount = availableAmount;
    const rawChainerCommissions = campaign.chainerCommissionsTotal || 0;
    const chainerCommissions = Math.min(rawChainerCommissions, baseAmount);
    const chainfunditFeePercentage = 0.05; // 5%
    const chainfunditFee = baseAmount * chainfunditFeePercentage;
    
    // Provider fees (simplified)
    let providerFee = 0;
    let fixedFee = 0;
    
    if (campaign.payoutProvider === "paystack") {
      providerFee = chainfunditFee * 0.01; // 1% of chainfundit fee
      fixedFee = 0;
    } else if (campaign.payoutProvider === "paypal") {
      providerFee = chainfunditFee * 0.02;
      fixedFee = 0;
    }
    
    const netChainfunditFee = chainfunditFee - providerFee;
    const totalFees = netChainfunditFee + fixedFee;
    const netAmount = Math.max(baseAmount - totalFees - chainerCommissions, 0);

    return {
      baseAmount,
      chainfunditFee,
      providerFee,
      fixedFee,
      chainerCommissions,
      totalFees,
      netAmount,
    };
  }, [availableAmount, campaign.chainerCommissionsTotal, campaign.payoutProvider]);

  const isBlockedByProfile =
    userProfile?.accountChangeRequested ||
    (campaign.payoutProvider === "paypal" && !userProfile?.email) ||
    (campaign.payoutProvider === "paystack" && !userProfile?.accountVerified) ||
    campaign.payoutProvider === "stripe";

  const handleContinue = () => {
    if (!campaign.payoutProvider) {
      toast.error("Payout provider not configured");
      return;
    }
    if ((campaign.availableAmount || 0) <= 0) {
      toast.error("No funds available for payout");
      return;
    }
    onContinueToPayoutFlow(campaign);
  };

  if (!isOpen) {
    return null;
  }

  // Main modal content
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#104109]">
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Step 1 of 2: Review your payout details before choosing an amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{campaign.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Raised:</span>
                <span className="font-semibold">
                  {formatCurrency(campaign.totalRaised, campaign.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available for Payout:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    campaign.availableAmount || 0,
                    campaign.currencyCode
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already Paid Out:</span>
                <span className="font-medium text-gray-700">
                  {formatCurrency(
                    campaign.totalPaidOut || 0,
                    campaign.currencyCode
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <div className="flex items-center gap-2">
                  {campaign.payoutProvider === "paypal" ? (
                    <Send className="h-4 w-4 text-[#0070BA]" />
                  ) : (
                    <Building2 className="h-4 w-4 text-green-600" />
                  )}
                  <span className="capitalize">{campaign.payoutProvider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Payout Summary */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#104109]">
                <DollarSign className="h-5 w-5" />
                Payout Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Available Amount:</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(availableAmount, campaign.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Payout Provider:</span>
                <span className="font-semibold capitalize">
                  {campaign.payoutProvider}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                This estimate assumes a full withdrawal. You can choose full or custom amount in the next step.
              </p>
              
              <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fees & Deductions:</span>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(fees.totalFees, campaign.currencyCode)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pl-2">
                  <span>• Platform fee (5%)</span>
                  <span>-{formatCurrency(fees.chainfunditFee, campaign.currencyCode)}</span>
                </div>
                {fees.chainerCommissions > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 pl-2">
                    <span>• Ambassador commissions</span>
                    <span>-{formatCurrency(fees.chainerCommissions, campaign.currencyCode)}</span>
                  </div>
                )}
                {(fees.providerFee > 0 || fees.fixedFee > 0) && (
                  <div className="flex justify-between text-xs text-gray-500 pl-2">
                    <span>• Payment processing</span>
                    <span>-{formatCurrency((fees.providerFee || 0) + (fees.fixedFee || 0), campaign.currencyCode)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-xl text-[#104109]">Est. Receive (full):</span>
                <span className="font-bold text-2xl text-green-600">
                  {formatCurrency(fees.netAmount, campaign.currencyCode)}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Funds will arrive in {campaign.payoutConfig?.processingTime || "1-3 business days"}
              </p>
            </CardContent>
          </Card>

          {isBlockedByProfile && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-1">
                    Payout setup requires attention
                  </p>
                  <p className="text-sm text-amber-800 mb-3">
                    Please complete or verify your payout details in settings before continuing.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push("/dashboard/settings?tab=payments");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white hover:text-white border-amber-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Payment Settings
                  </Button>
                </div>
              </div>
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl p-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleContinue}
              className="flex-1 rounded-xl p-4 text-sm bg-[#104109] text-white"
              disabled={
                isProcessing ||
                !campaign.payoutProvider ||
                (campaign.availableAmount || 0) <= 0 ||
                isBlockedByProfile
              }
            >
              <>
                <Send className="h-4 w-4 mr-2" />
                Continue to Amount Selection
              </>
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}