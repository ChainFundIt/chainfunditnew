"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Send } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";

interface PayoutAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: {
    id: string;
    title: string;
    currencyCode: string;
    availableAmount: number;
    payoutProvider: string | null;
    payoutConfig: any;
    chainerCommissionsTotal?: number;
    effectivePlatformFeePercent?: number;
    providerFeePercent?: number;
  };
  userProfile?: {
    email?: string;
    accountVerified?: boolean;
    accountChangeRequested?: boolean;
  };
  isProcessing?: boolean;
  onConfirmPayout: (
    campaignId: string,
    amount: number,
    currency: string,
    payoutProvider: string
  ) => Promise<void>;
}

export function PayoutAmountModal({
  isOpen,
  onClose,
  campaign,
  userProfile,
  isProcessing = false,
  onConfirmPayout,
}: PayoutAmountModalProps) {
  const [withdrawalType, setWithdrawalType] = useState<"full" | "partial">(
    "full"
  );
  const [partialAmount, setPartialAmount] = useState("");

  const availableAmount = Math.max(campaign.availableAmount || 0, 0);

  useEffect(() => {
    if (isOpen) {
      setWithdrawalType("full");
      setPartialAmount("");
    }
  }, [isOpen, campaign.id]);

  const sanitizeAmountInput = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    const [intPart = "", decimalPart] = cleaned.split(".");
    const normalizedInt = intPart.replace(/^0+(?=\d)/, "");

    if (decimalPart === undefined) {
      return normalizedInt;
    }

    return `${normalizedInt || "0"}.${decimalPart.slice(0, 2)}`;
  };

  const parsedPartialAmount = Number(partialAmount.replace(/,/g, ""));
  const hasPartialAmountInput = partialAmount.trim().length > 0;

  const requestedAmount = useMemo(() => {
    if (withdrawalType === "full") {
      return availableAmount;
    }
    if (hasPartialAmountInput && Number.isFinite(parsedPartialAmount)) {
      return parsedPartialAmount;
    }
    return 0;
  }, [withdrawalType, availableAmount, hasPartialAmountInput, parsedPartialAmount]);

  const normalizedRequestedAmount = Number(requestedAmount.toFixed(2));

  const amountValidationError = useMemo(() => {
    if (withdrawalType === "full") {
      if (availableAmount <= 0) {
        return "No funds available for payout";
      }
      return null;
    }

    if (!hasPartialAmountInput) {
      return "Enter an amount to withdraw";
    }

    if (!Number.isFinite(parsedPartialAmount)) {
      return "Enter a valid number";
    }

    if (parsedPartialAmount <= 0) {
      return "Amount must be greater than zero";
    }

    if (parsedPartialAmount > availableAmount) {
      return `Amount cannot exceed ${formatCurrency(
        availableAmount,
        campaign.currencyCode
      )}`;
    }

    return null;
  }, [
    withdrawalType,
    availableAmount,
    hasPartialAmountInput,
    parsedPartialAmount,
    campaign.currencyCode,
  ]);

  const fees = useMemo(() => {
    const baseAmount = Math.max(normalizedRequestedAmount, 0);
    const rawChainerCommissions = campaign.chainerCommissionsTotal || 0;
    const availableRatio =
      availableAmount > 0 ? Math.min(baseAmount / availableAmount, 1) : 0;
    const chainerCommissions = Math.min(
      rawChainerCommissions * availableRatio,
      baseAmount
    );

    const platformFeePercent = campaign.effectivePlatformFeePercent ?? 5;
    const providerFeePercent = campaign.providerFeePercent ?? 2;
    const chainfunditFee = (baseAmount * platformFeePercent) / 100;
    const providerFee = (baseAmount * providerFeePercent) / 100;
    let fixedFee = 0;

    const totalFees = chainfunditFee + providerFee + fixedFee;
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
  }, [
    normalizedRequestedAmount,
    campaign.chainerCommissionsTotal,
    campaign.payoutProvider,
    availableAmount,
  ]);

  const isBlockedByProfile =
    userProfile?.accountChangeRequested ||
    (campaign.payoutProvider === "paypal" && !userProfile?.email) ||
    (campaign.payoutProvider === "paystack" && !userProfile?.accountVerified) ||
    campaign.payoutProvider === "stripe";

  const handleConfirm = () => {
    if (!campaign.payoutProvider) {
      toast.error("Payout provider not configured");
      return;
    }
    if (amountValidationError) {
      toast.error(amountValidationError);
      return;
    }

    onConfirmPayout(
      campaign.id,
      normalizedRequestedAmount,
      campaign.currencyCode,
      campaign.payoutProvider
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#104109]">
            Complete Payout Request
          </DialogTitle>
          <DialogDescription>
            Step 2 of 2: Choose how much to withdraw and confirm your request.
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-[#104109]">
              <DollarSign className="h-5 w-5" />
              Amount Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">
              Campaign: <span className="font-semibold">{campaign.title}</span>
            </p>
            <p className="text-sm text-gray-600">
              Available:{" "}
              <span className="font-semibold">
                {formatCurrency(availableAmount, campaign.currencyCode)}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Provider: <span className="capitalize">{campaign.payoutProvider}</span>
              {" • "}
              Processing time: {campaign.payoutConfig?.processingTime || "1-3 business days"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant={withdrawalType === "full" ? "default" : "outline"}
                className="justify-start rounded-md"
                onClick={() => setWithdrawalType("full")}
              >
                Withdraw all
              </Button>
              <Button
                type="button"
                variant={withdrawalType === "partial" ? "default" : "outline"}
                className="justify-start rounded-md"
                onClick={() => setWithdrawalType("partial")}
              >
                Withdraw custom amount
              </Button>
            </div>

            {withdrawalType === "partial" && (
              <div className="space-y-1">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={partialAmount}
                  onChange={(e) =>
                    setPartialAmount(sanitizeAmountInput(e.target.value))
                  }
                  placeholder={`Enter amount in ${campaign.currencyCode}`}
                />
                {amountValidationError && (
                  <p className="text-xs text-red-600">{amountValidationError}</p>
                )}
              </div>
            )}

            <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requested Amount:</span>
                <span className="font-medium">
                  {formatCurrency(normalizedRequestedAmount, campaign.currencyCode)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fees & Deductions:</span>
                <span className="text-red-600 font-medium">
                  -{formatCurrency(fees.totalFees, campaign.currencyCode)}
                </span>
              </div>
              {fees.chainerCommissions > 0 && (
                <div className="flex justify-between text-xs text-gray-500 pl-2">
                  <span>• Ambassador commissions</span>
                  <span>
                    -{formatCurrency(fees.chainerCommissions, campaign.currencyCode)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-[#104109]">You'll Receive:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(fees.netAmount, campaign.currencyCode)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={onClose} variant="outline" className="flex-1 rounded-xl p-4 text-sm">
            Back to Review
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl p-4 text-sm bg-[#104109] text-white"
            disabled={
              isProcessing ||
              !campaign.payoutProvider ||
              !!amountValidationError ||
              isBlockedByProfile
            }
          >
            <Send className="h-4 w-4 mr-2" />
            Confirm Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
