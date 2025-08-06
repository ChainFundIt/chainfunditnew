"use client";

import React, { useState } from "react";
import { Link as LinkIcon, Copy, Facebook, Instagram, Twitter, Linkedin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  shortUrl?: string;
}

interface ChainModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | null;
}

const ChainModal: React.FC<ChainModalProps> = ({ open, onOpenChange, campaign }) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [whyChain, setWhyChain] = useState("");
  const [proceedsOption, setProceedsOption] = useState("give-back");
  const [copied, setCopied] = useState(false);

  const handleChainCampaign = () => {
    setStep("success");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("chainfund.it/d1R3lly?ref=t3mfl1k");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep("form");
    setWhyChain("");
    setProceedsOption("give-back");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E5ECDE] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-medium text-[#5F8555]">
              {step === "form" ? "Chain this campaign" : "Congratulations!"}
            </h2>
            <p className="text-base text-[#5F8555] mt-1">
              {step === "form" 
                ? "Get your very own custom link you can share with your personal network."
                : "You can now share this campaign with your personal network, using your own custom link."
              }
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
          {step === "form" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="why-chain" className="text-base font-normal text-[#5F8555]">
                  Why do you want to chain?
                </Label>
                <Input
                  id="why-chain"
                  value={whyChain}
                  onChange={(e) => setWhyChain(e.target.value)}
                  placeholder="Tell us why you want to chain this campaign..."
                  className="mt-2 h-12 p-5 bg-[#F2F1E9] border border-[#C0BFC4] rounded-lg shadow-none"
                />
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
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-[#F2F1E9] border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="give-back" id="give-back" />
                    <Label htmlFor="give-back" className="text-xl font-normal text-[#5F8555]">
                      Give back to fundraiser
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-[#F2F1E9] border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="receive-payout" id="receive-payout" />
                    <Label htmlFor="receive-payout" className="text-xl font-normal text-[#5F8555]">
                      Receive as payout
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 w-fit h-12 p-5 bg-[#F2F1E9] border border-[#C0BFC4] rounded-lg">
                    <RadioGroupItem value="donate-charity" id="donate-charity" />
                    <Label htmlFor="donate-charity" className="text-xl font-normal text-[#5F8555]">
                      Donate to a charity of your choice
                    </Label>
                  </div>
                </RadioGroup>
              </div>

                <p className="text-xl font-medium text-[#104901]">
                  Please Note: The campaign creator has approved only a 5% commission on this campaign.
                </p>

              <Button
                onClick={handleChainCampaign}
                className="w-[300px] h-16 font-medium text-2xl flex justify-between items-center"
              >
                Chain campaign <LinkIcon size={24} />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-medium text-[#104901]">
                    chainfund.it/d1R3lly?ref=t3mfl1k
                  </span>
                  <Button
                    onClick={handleCopyLink}
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
                  <Link href="https://www.facebook.com/sharer/sharer.php?u=https://www.google.com" target="_blank" className="text-[#5F8555]">
                        <Facebook size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link href="https://www.instagram.com/sharer/sharer.php?u=https://www.google.com" target="_blank" className="text-[#104901]">
                    <Instagram size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link href="https://www.twitter.com/sharer/sharer.php?u=https://www.google.com" target="_blank" className="text-[#104901]">
                    <Twitter size={32} color="#104901" strokeWidth={1.5} />
                  </Link>
                  <Link href="https://www.linkedin.com/sharer/sharer.php?u=https://www.google.com" target="_blank" className="text-[#104901]">
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