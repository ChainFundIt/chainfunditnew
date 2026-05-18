"use client";

import React, { useState } from "react";
import {
  Link as LinkIcon,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ambassadorAgreementSections } from "@/app/ambassador-agreement/sections";
import { useChain } from "@/hooks/use-chain";
import { useAuth } from "@/hooks/use-auth";
import { useCharities } from "@/hooks/use-charities";
import { toast } from "sonner";
import { triggerPlatformReviewPrompt } from "@/lib/utils/review-prompt";
import { Whatsapp } from "iconsax-reactjs";

interface Campaign {
  id: string;
  title: string;
  shortUrl?: string;
  chainerCommissionRate?: number;
}

interface ChainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
  onChainCreated?: () => void;
}

const ChainModal: React.FC<ChainModalProps> = ({
  open,
  onOpenChange,
  campaign,
  onChainCreated,
}) => {
  const [step, setStep] = useState<"form" | "terms" | "success">("form");
  const [whyChainOption, setWhyChainOption] = useState("");
  const [whyChainCustom, setWhyChainCustom] = useState("");
  const [proceedsOption, setProceedsOption] = useState("give-back");
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmUnderstanding, setConfirmUnderstanding] = useState(false);
  
  const { user } = useAuth();
  const { createChain, loading, error } = useChain();
  const { charities: availableCharities, loading: charitiesLoading } = useCharities({
    active: true,
    limit: 50,
    sortBy: "name",
    sortOrder: "asc",
  });
  const isCharityDonation = proceedsOption === "donate-charity";
  
  // Import analytics for tracking
  const trackChainer = async (eventName: "chain_created" | "referral_link_copied", data: any) => {
    if (typeof window !== "undefined") {
      const { trackChainer: track } = await import("@/lib/analytics");
      track(eventName, data);
    }
  };

  const handleOpenTerms = () => {
    if (!user) {
      toast.error("Please sign in to chain this campaign");
      return;
    }

    if (!campaign) {
      toast.error("Campaign information is missing");
      return;
    }

    const finalWhyChain =
      whyChainOption === "other" ? whyChainCustom : whyChainOption;
    if (!finalWhyChain.trim()) {
      toast.error("Please explain why you want to chain this campaign");
      return;
    }

    if (isCharityDonation && !selectedCharityId) {
      toast.error("Please select the charity you would like to donate to");
      return;
    }

    // Move to terms & conditions step
    setStep("terms");
  };

  const handleChainCampaign = async () => {
    if (!user) {
      toast.error("Please sign in to chain this campaign");
      return;
    }

    if (!campaign) {
      toast.error("Campaign information is missing");
      return;
    }

    const finalWhyChain =
      whyChainOption === "other" ? whyChainCustom : whyChainOption;
    if (!finalWhyChain.trim()) {
      toast.error("Please explain why you want to chain this campaign");
      return;
    }

    if (!acceptTerms || !confirmUnderstanding) {
      toast.error("You need to agree to the ambassador agreement to continue");
      return;
    }

    if (isCharityDonation && !selectedCharityId) {
      toast.error("Please select the charity you would like to donate to");
      return;
    }

    // Map the proceeds option to the API format
    const commissionDestinationMap = {
      "give-back": "donate_back" as const,
      "receive-payout": "keep" as const,
      "donate-charity": "donate_other" as const,
    };

    const chainData = {
      userId: user.id,
      campaignId: campaign.id,
      commissionDestination:
        commissionDestinationMap[
          proceedsOption as keyof typeof commissionDestinationMap
        ],
      charityChoiceId: isCharityDonation ? selectedCharityId : undefined,
      whyChain: finalWhyChain,
    };
    try {
      const result = await createChain(chainData);
      
      if (result.success && result.data) {
        setReferralCode(result.data.referralCode);
        setStep("success");
        toast.success("Campaign chained successfully!");

        triggerPlatformReviewPrompt({
          reason: "campaign_chained",
          bypassCooldown: true,
        });
        
        // Track chain creation
        trackChainer("chain_created", {
          chainer_id: String(user.id),
          referral_code: result.data.referralCode,
          campaign_id: String(campaign.id),
          commission_rate: campaign.chainerCommissionRate,
        });
        
        // Call the callback to refresh chain count
        if (onChainCreated) {
          onChainCreated();
        }
      } else {
        toast.error(`Failed to chain campaign: ${result.error}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while chaining the campaign");
    }
  };

  const handleCopyLink = () => {
    const chainLink = `${window.location.origin}/c/${referralCode}`;
    navigator.clipboard.writeText(chainLink);
    setCopied(true);
    
    // Track referral link copy
    trackChainer("referral_link_copied", {
      chainer_id: user?.id?.toString(),
      referral_code: referralCode,
      campaign_id: campaign?.id?.toString(),
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("form");
    setWhyChainOption("");
    setWhyChainCustom("");
    setProceedsOption("give-back");
    setSelectedCharityId("");
    setReferralCode("");
    setAcceptTerms(false);
    setConfirmUnderstanding(false);
    onOpenChange(false);
  };

  if (!open) return null;

  const shareText = `Check out this campaign: ${campaign?.title}`;
  const shareUrl = `${window.location.origin}/c/${referralCode}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E5ECDE] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-medium text-[#5F8555]">
              {step === "form" 
                ? "Chain this campaign" 
                : step === "terms"
                ? "Ambassador Agreement"
                : "Congratulations!"}
            </h2>
            <p className="text-base text-[#5F8555] mt-1">
              {step === "form" 
                ? "Get your very own custom link you can share with your personal network."
                : step === "terms"
                ? "Please review and agree to the ambassador agreement before proceeding."
                : "You can now share this campaign with your personal network, using your own custom link."}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleClose}
          >
            <XCircle size={24} color="#5F8555" />
          </Button>
        </div>

        {/* Content */}
        <div className="mt-3">
          {step === "form" && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-normal text-[#5F8555]">
                  Why do you want to chain?
                </Label>
                <RadioGroup
                  value={whyChainOption}
                  onValueChange={setWhyChainOption}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="support-cause" id="support-cause" />
                    <Label htmlFor="support-cause" className="text-xl font-normal text-[#5F8555]">
                      I want to support this cause
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="share-with-network" id="share-with-network" />
                    <Label htmlFor="share-with-network" className="text-xl font-normal text-[#5F8555]">
                      I want to share this with my network
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="make-impact" id="make-impact" />
                    <Label htmlFor="make-impact" className="text-xl font-normal text-[#5F8555]">
                      I want to make a positive impact
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-xl font-normal text-[#5F8555]">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
                
                {whyChainOption === "other" && (
                  <div className="mt-3">
                    <Input
                      value={whyChainCustom}
                      onChange={(e) => setWhyChainCustom(e.target.value)}
                      placeholder="Please tell us why you want to chain this campaign..."
                      className="h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg shadow-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-normal text-[#5F8555]">
                  What will you do with the proceeds earned from this campaign?
                </Label>
                <RadioGroup
                  value={proceedsOption}
                  onValueChange={setProceedsOption}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="give-back" id="give-back" />
                    <Label htmlFor="give-back" className="text-xl font-normal text-[#5F8555]">
                      Give back to fundraiser
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="receive-payout" id="receive-payout" />
                    <Label htmlFor="receive-payout" className="text-xl font-normal text-[#5F8555]">
                      Receive as payout
                    </Label>
                  </div>
              <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg">
                <RadioGroupItem value="donate-charity" id="donate-charity" />
                <Label htmlFor="donate-charity" className="text-xl font-normal text-[#5F8555]">
                  Donate to a charity of your choice
                </Label>
              </div>
            </RadioGroup>
            {isCharityDonation && (
              <div className="mt-3 space-y-2">
                <Label className="text-base font-normal text-[#5F8555]">
                  Choose your charity
                </Label>
                <Select
                  value={selectedCharityId}
                  onValueChange={setSelectedCharityId}
                  disabled={charitiesLoading || (!charitiesLoading && availableCharities.length === 0)}
                >
                  <SelectTrigger className="h-12 p-5 bg-whitesmoke border border-[#C0BFC4] rounded-lg text-left text-[#5F8555]">
                    <SelectValue
                      placeholder={
                        charitiesLoading
                          ? "Loading charities..."
                          : availableCharities.length === 0
                          ? "No charities available"
                          : "Select a charity"
                      }
                    />
                  </SelectTrigger>
                  {availableCharities.length > 0 && (
                    <SelectContent>
                      {availableCharities.map((charity) => (
                        <SelectItem key={charity.id} value={charity.id}>
                          {charity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
                {!charitiesLoading && availableCharities.length === 0 && (
                  <p className="text-sm text-[#5F8555]">
                    We could not load charities right now. Please try again later.
                  </p>
                )}
              </div>
            )}
          </div>

            <p className="text-xl font-medium text-[#104901]">
                  Please Note: The campaign creator has approved only a {campaign?.chainerCommissionRate}% commission on this campaign.
                </p>

              <div className="space-y-2">
                <Button
                  onClick={handleOpenTerms}
                  disabled={loading || !whyChainOption.trim() || (whyChainOption === "other" && !whyChainCustom.trim())}
                  className="w-[300px] h-16 font-medium text-2xl flex justify-between items-center"
                  type="button"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Creating chain...
                    </>
                  ) : (
                    <>
                      Chain campaign <LinkIcon size={24} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "terms" && (
            <div className="space-y-5">
              <div className="bg-white/80 border border-[#C0BFC4] rounded-lg max-h-[70vh] overflow-y-auto p-4">
                <h3 className="text-lg font-semibold text-[#104901] mb-2">
                  ChainFundIt Chain Ambassador Agreement
                </h3>
                <p className="text-xs text-[#6b7280] mb-3">
                  This Agreement sets out the terms and conditions under which you may
                  participate as a Chain Ambassador. Please read the full Agreement
                  below before confirming your acceptance.
                </p>

                <div className="space-y-4 text-sm text-[#4b5563]">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-[#111827]">Contract Details</h4>
                    <p>
                      <strong>Parties:</strong> ChainFundIt Limited and Chain Ambassador
                    </p>
                    <p>
                      <strong>Effective Date:</strong> Upon acceptance of this Agreement
                    </p>
                    <p>
                      <strong>Contact:</strong>{" "}
                      <Link
                        href="mailto:ambassadors@chainfundit.com"
                        className="text-[#104901] font-semibold underline-offset-2 hover:underline"
                        target="_blank"
                      >
                        ambassadors@chainfundit.com
                      </Link>
                    </p>
                  </div>

                  {ambassadorAgreementSections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h4 className="font-semibold text-[#104901]">
                        {section.title}
                      </h4>
                      <div className="space-y-3">
                        {section.content.map(
                          (
                            item: {
                              subtitle?: string;
                              text: React.ReactNode;
                            },
                            idx: number
                          ) => (
                            <div key={idx} className="space-y-1">
                              {item.subtitle && (
                                <p className="font-medium text-[#111827]">
                                  {item.subtitle}
                                </p>
                              )}
                              <div className="space-y-1">{item.text}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}

                  <p className="text-xs text-[#059669] pt-1">
                    Date of Last Revision: November 19, 2025
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ambassador-understand"
                    checked={confirmUnderstanding}
                    onCheckedChange={(checked: boolean) =>
                      setConfirmUnderstanding(checked)
                    }
                  />
                  <Label
                    htmlFor="ambassador-understand"
                    className="text-sm text-[#374151]"
                  >
                    I confirm that I have read and understood the ambassador
                     agreement and how commissions work.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ambassador-agree"
                    checked={acceptTerms}
                    onCheckedChange={(checked: boolean) =>
                      setAcceptTerms(checked)
                    }
                  />
                  <Label
                    htmlFor="ambassador-agree"
                    className="text-sm text-[#374151]"
                  >
                    I agree to the ChainFundIt Chain Ambassador Agreement.
                  </Label>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-2">
                  <Button
                    onClick={handleChainCampaign}
                    disabled={
                      loading || !acceptTerms || !confirmUnderstanding
                    }
                    className="h-11 px-6 font-medium text-base flex items-center gap-2"
                    type="button"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Generating link...
                      </>
                    ) : (
                      <>
                        I agree, generate my link
                        <LinkIcon size={18} />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 px-4 text-sm"
                    onClick={() => {
                      setAcceptTerms(false);
                      setConfirmUnderstanding(false);
                      setStep("form");
                    }}
                  >
                    Go back
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6">
              <div className="">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-medium text-[#104901] break-all">
                    {referralCode
                      ? `${window.location.origin}/c/${referralCode}`
                      : "Generating link..."}
                  </span>
                  <Button
                    onClick={handleCopyLink}
                    disabled={!referralCode}
                    className="flex justify-between items-center text-2xl w-[150px] h-16"
                  >
                    {copied ? "Copied!" : "Copy"}
                    <Copy size={24} />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Label className="text-2xl font-medium text-[#104901]">
                  Share campaign
                </Label>
                <div className="flex space-x-5">
                  <Link
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="text-[#5F8555]"
                    onClick={(e) => !referralCode && e.preventDefault()}
                  >
                    <Facebook size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={`https://wa.me/?text=${encodeURIComponent(shareText)} ${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="text-[#104901]"
                    onClick={(e) => !referralCode && e.preventDefault()}
                  >
                    <Whatsapp size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={`https://www.twitter.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="text-[#104901]"
                    onClick={(e) => !referralCode && e.preventDefault()}
                  >
                    <Twitter size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={`https://www.linkedin.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    className="text-[#104901]"
                    onClick={(e) => !referralCode && e.preventDefault()}
                  >
                    <Linkedin size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChainModal; 
