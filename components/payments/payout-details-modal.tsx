"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
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
    fullName: string;
    email: string;
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    accountName?: string;
    accountVerified?: boolean;
    accountChangeRequested?: boolean;
    accountChangeReason?: string;
    stripeAccountId?: string;
    stripeAccountReady?: boolean;
    // International bank account fields
    internationalBankAccountNumber?: string;
    internationalBankRoutingNumber?: string;
    internationalBankSwiftBic?: string;
    internationalBankCountry?: string;
    internationalBankName?: string;
    internationalAccountName?: string;
    internationalAccountVerified?: boolean;
  };
  onConfirmPayout: (
    campaignId: string,
    amount: number,
    currency: string,
    payoutProvider: string
  ) => Promise<void>;
  isProcessing?: boolean;
}

export function PayoutDetailsModal({
  isOpen,
  onClose,
  campaign,
  userProfile,
  onConfirmPayout,
  isProcessing = false,
}: PayoutDetailsModalProps) {
  const [banks, setBanks] = useState<any[]>([]);
  const [stripeOnboardingUrl, setStripeOnboardingUrl] = useState<string | null>(null);
  const [checkingStripe, setCheckingStripe] = useState(false);
  const router = useRouter();

  // Fetch banks when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchBanks = async () => {
        try {
          const response = await fetch("/api/banks");
          const result = await response.json();
          if (result.success) {
            setBanks(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching banks:", error);
        }
      };
      fetchBanks();
      
      // Check Stripe Connect status if using Stripe (only for legacy NGN payouts)
      // For foreign currencies, we use bank accounts instead
      const isForeignCurrency = campaign.currencyCode !== 'NGN';
      if (campaign.payoutProvider === 'stripe' && !isForeignCurrency) {
        checkStripeAccountStatus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, campaign.payoutProvider]);

  const checkStripeAccountStatus = async () => {
    if (userProfile?.stripeAccountReady) {
      return; // Already ready
    }

    setCheckingStripe(true);
    try {
      if (!userProfile?.stripeAccountId) {
        // No account yet - create one
        const response = await fetch('/api/stripe-connect/create-account', {
          method: 'POST',
        });
        const result = await response.json();
        if (result.success && result.onboardingUrl) {
          setStripeOnboardingUrl(result.onboardingUrl);
        }
      } else {
        // Check if account needs onboarding
        const response = await fetch('/api/stripe-connect/account-link');
        const result = await response.json();
        if (result.success && !result.ready && result.onboardingUrl) {
          setStripeOnboardingUrl(result.onboardingUrl);
        }
      }
    } catch (error) {
      console.error('Error checking Stripe account:', error);
    } finally {
      setCheckingStripe(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
    setStripeOnboardingUrl(null);
    }
  }, [isOpen]);

  // Calculate fees - simple, no loops
  const calculateFees = () => {
    const baseAmount = Math.max(campaign.availableAmount || 0, 0);
    const rawChainerCommissions = campaign.chainerCommissionsTotal || 0;
    const chainerCommissions = Math.min(rawChainerCommissions, baseAmount);
    const chainfunditFeePercentage = 0.05; // 5%
    const chainfunditFee = baseAmount * chainfunditFeePercentage;
    
    // Provider fees (simplified)
    let providerFee = 0;
    let fixedFee = 0;
    
    if (campaign.payoutProvider === "stripe") {
      providerFee = chainfunditFee * 0.025; // 2.5% of chainfundit fee
      fixedFee = 0.3; // $0.30
    } else if (campaign.payoutProvider === "paystack") {
      providerFee = chainfunditFee * 0.01; // 1% of chainfundit fee
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
  };

  const fees = calculateFees();

  const getBankName = () => {
    if (userProfile?.bankName) return userProfile.bankName;
    if (userProfile?.bankCode && banks.length > 0) {
      const bank = banks.find((b) => b.code === userProfile.bankCode);
      return bank?.name || "Unknown Bank";
    }
    return "N/A";
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleConfirmPayout = () => {
    if (!campaign.payoutProvider) {
      toast.error("Payout provider not configured");
      return;
    }
    if ((campaign.availableAmount || 0) <= 0) {
      toast.error("No funds available for payout");
      return;
    }

    onConfirmPayout(
      campaign.id,
      campaign.availableAmount,
      campaign.currencyCode,
      campaign.payoutProvider
    );
  };

  if (!isOpen) {
    return null;
  }

  // Main modal content
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#104109]">
            Request Payout
          </DialogTitle>
          <DialogDescription>
            Review your payout details before confirming
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
                  {campaign.payoutProvider === "stripe" ? (
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Building2 className="h-4 w-4 text-green-600" />
                  )}
                  <span className="capitalize">{campaign.payoutProvider}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simplified Payout Summary */}
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
                  {formatCurrency(fees.baseAmount, campaign.currencyCode)}
                </span>
              </div>
              
              <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fees & Deductions:</span>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(fees.totalFees, campaign.currencyCode)}
                  </span>
                </div>
                {fees.chainerCommissions > 0 && (
                  <div className="flex justify-between text-xs text-gray-500 pl-2">
                    <span>• Platform fee (5%)</span>
                    <span>-{formatCurrency(fees.chainfunditFee, campaign.currencyCode)}</span>
                  </div>
                )}
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

              <Separator className="my-2" />
              
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-xl text-[#104109]">You'll Receive:</span>
                <span className="font-bold text-2xl text-green-600">
                  {formatCurrency(fees.netAmount, campaign.currencyCode)}
                </span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Funds will arrive in {campaign.payoutConfig?.processingTime || "1-3 business days"}
              </p>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {campaign.currencyCode !== 'NGN' ? 'International Bank Account' : 'Bank Account'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const isForeignCurrency = campaign.currencyCode !== 'NGN';
                const isVerified = isForeignCurrency 
                  ? userProfile?.internationalAccountVerified 
                  : userProfile?.accountVerified;

                if (isVerified) {
                  if (isForeignCurrency) {
                    // Show international bank account details
                    return (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Account Verified
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Account Name</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-medium text-sm">{userProfile?.internationalAccountName || "N/A"}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(userProfile?.internationalAccountName || "", "Account name")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Account Number</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-mono font-medium text-sm">
                                {userProfile?.internationalBankAccountNumber || "N/A"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(userProfile?.internationalBankAccountNumber || "", "Account number")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Bank</span>
                            <p className="font-medium text-sm mt-1">{userProfile?.internationalBankName || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Country</span>
                            <p className="font-medium text-sm mt-1">{userProfile?.internationalBankCountry || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // Show Nigerian bank account details
                    return (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Account Verified
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-xs text-gray-500">Account Name</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-medium text-sm">{userProfile?.accountName || "N/A"}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(userProfile?.accountName || "", "Account name")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Account Number</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="font-mono font-medium text-sm">
                                {userProfile?.accountNumber || "N/A"}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => copyToClipboard(userProfile?.accountNumber || "", "Account number")}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs text-gray-500">Bank</span>
                            <p className="font-medium text-sm mt-1">{getBankName()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                } else {
                  // Not verified - show message to add bank account
                  return (
                    <div className="text-center py-6">
                      <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                      <p className="font-medium text-gray-900 mb-1">
                        {isForeignCurrency ? 'International Bank Account Required' : 'Bank Account Required'}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {isForeignCurrency 
                          ? 'Add and verify your international bank account to receive payouts in ' + campaign.currencyCode
                          : 'Complete your bank account setup to receive payouts.'}
                      </p>
                      <Button
                        onClick={() => {
                          onClose();
                          router.push("/dashboard/settings?tab=payments");
                        }}
                        className="bg-[#104109] text-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {isForeignCurrency ? 'Add Bank Account' : 'Set Up Bank Account'}
                      </Button>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>


          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl p-4 text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayout}
              className="flex-1 rounded-xl p-4 text-sm bg-[#104109] text-white"
              disabled={
                isProcessing ||
                !campaign.payoutProvider ||
                userProfile?.accountChangeRequested ||
                (campaign.payoutProvider === 'paystack' && !userProfile?.accountVerified) ||
                (campaign.payoutProvider === 'stripe' && campaign.currencyCode !== 'NGN' && !userProfile?.internationalAccountVerified) ||
                (campaign.payoutProvider === 'stripe' && campaign.currencyCode === 'NGN' && !userProfile?.stripeAccountReady)
              }
            >
              <>
                <Send className="h-4 w-4 mr-2" />
                Confirm Request
              </>
            </Button>
          </div>

          {/* Stripe Connect Account Required (only for legacy NGN payouts) */}
          {campaign.payoutProvider === 'stripe' && campaign.currencyCode === 'NGN' && !userProfile?.stripeAccountReady && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 mb-1">Stripe Account Required</p>
                  <p className="text-sm text-blue-800 mb-3">
                    You need to link your Stripe account to receive payouts via Stripe Connect.
                  </p>
                  {stripeOnboardingUrl ? (
                    <Button
                      onClick={() => window.open(stripeOnboardingUrl, '_blank')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Link Stripe Account
                    </Button>
                  ) : (
                    <Button
                      onClick={checkStripeAccountStatus}
                      size="sm"
                      disabled={checkingStripe}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {checkingStripe ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking...
                        </>
                      ) : (
                        'Set Up Stripe Account'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* International Bank Account Required for Foreign Currencies */}
          {campaign.payoutProvider === 'stripe' && campaign.currencyCode !== 'NGN' && !userProfile?.internationalAccountVerified && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-1">International Bank Account Required</p>
                  <p className="text-sm text-amber-800 mb-3">
                    You need to add and verify your international bank account details to receive payouts in {campaign.currencyCode}.
                  </p>
                  <Button
                    onClick={() => {
                      onClose();
                      router.push("/dashboard/settings");
                    }}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Account Change Request Pending Warning */}
          {userProfile?.accountChangeRequested && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900 mb-1">Bank Account Change Pending Review</p>
                  <p className="text-sm text-blue-800 mb-3">
                    Your request to change bank account details is being reviewed. You'll be able to request payouts once it's approved.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push("/dashboard/settings?tab=payments");
                    }}
                    className="border-blue-600 text-blue-700 hover:bg-blue-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Check Status
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Verification Required (for Paystack) */}
          {campaign.payoutProvider === 'paystack' && !userProfile?.accountVerified && !userProfile?.accountChangeRequested && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-1">Bank Account Verification Required</p>
                  <p className="text-sm text-amber-800 mb-3">
                    Please verify your bank account in settings before requesting a payout.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      router.push("/dashboard/settings?tab=payments");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Verify Bank Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}