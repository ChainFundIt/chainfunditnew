"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Send,
  HandCoins,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useShortenLink } from "@/hooks/use-shorten-link";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  shortUrl?: string;
}

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
}

const DonateModal: React.FC<DonateModalProps> = ({
  open,
  onOpenChange,
  campaign,
}) => {
  const [step, setStep] = useState<"donate" | "thankyou">("donate");
  const [period, setPeriod] = useState("one-time");
  const [amount, setAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [comments, setComments] = useState("");
  const [copied, setCopied] = useState(false);
  const [campaignUrl, setCampaignUrl] = useState("");
  const { shortenLink, isLoading } = useShortenLink();

  useEffect(() => {
    if (campaign && open) {
      const longUrl = `${window.location.origin}/campaign/${campaign.id}`;

      // If campaign already has a short URL, use it
      if (campaign.shortUrl) {
        setCampaignUrl(campaign.shortUrl);
      } else {
        // Otherwise, try to shorten the URL
        shortenLink(longUrl).then((shortUrl) => {
          setCampaignUrl(shortUrl || longUrl);
        });
      }
    }
  }, [campaign, open, shortenLink]);

  const handleDonate = () => {
    setStep("thankyou");
  };

  const handleCopyLink = () => {
    if (campaignUrl) {
      navigator.clipboard.writeText(campaignUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setStep("donate");
    setAmount("");
    setFullName("");
    setEmail("");
    setPhone("");
    setTaxNumber("");
    setAnonymous(false);
    setComments("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#E5ECDE] rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-3xl font-medium text-[#5F8555]">
              {step === "donate" && "Make a donation"}
              {step === "thankyou" && "Thank you for your donation!"}
            </h2>
            <p className="text-base font-normal text-[#5F8555] mt-1">
              {step === "donate" &&
                "Select a period and a payment channel to complete your donation."}
              {step === "thankyou" &&
                "We are glad you supported this campaign."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="hover:bg-none"
          >
            <XCircle size={24} color="#5F8555" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "donate" && (
            <div className="space-y-6">
              {/* Select Period */}
              <div>
                <Label className="text-base font-medium text-[#5F8555] mb-3 block">
                  Select period
                </Label>
                <div className="grid grid-cols-4 gap-2 bg-[#F5F5F5] rounded-2xl p-2">
                  {["One-time", "Monthly", "Quarterly", "Yearly"].map(
                    (option) => (
                      <Button
                        key={option}
                        variant={
                          period === option.toLowerCase().replace(" ", "-")
                            ? "default"
                            : "outline"
                        }
                        className={`p-5 text-[#5F8555] text-xl ${
                          period === option.toLowerCase().replace(" ", "-")
                            ? "bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] hover:bg-[#F2F1E9] hover:text-[#5F8555] shadow-none"
                            : "border-none bg-transparent shadow-none hover:bg-transparent hover:text-[#5F8555]"
                        }`}
                        onClick={() =>
                          setPeriod(option.toLowerCase().replace(" ", "-"))
                        }
                      >
                        {option}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label
                  htmlFor="amount"
                  className="text-base font-normal text-[#5F8555]"
                >
                  Amount
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-[#5F8555]">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="type in an amount"
                    className="pl-8 w-[300px] h-11 bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] text-[#5F8555] text-xl shadow-none"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="font-normal text-base text-[#5F8555]">
                  Contact details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full name
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      placeholder="Full name"
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2 h-11 bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] text-[#5F8555] placeholder:text-xl placeholder:text-[#5F8555] text-xl shadow-none"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      placeholder="Email"
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 h-11 bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] text-[#5F8555] placeholder:text-xl placeholder:text-[#5F8555] text-xl shadow-none"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      placeholder="Phone number"
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 h-11 bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] text-[#5F8555] placeholder:text-xl placeholder:text-[#5F8555] text-xl shadow-none"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="taxNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tax number
                    </Label>
                    <Input
                      id="taxNumber"
                      value={taxNumber}
                      placeholder="Tax number"
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="mt-2 h-11 bg-[#F2F1E9] rounded-lg border border-[#C0BFC4] text-[#5F8555] placeholder:text-xl placeholder:text-[#5F8555] text-xl shadow-none"
                    />
                  </div>
                </div>
              </div>

              {/* Anonymous Donation */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked: boolean) => setAnonymous(checked)}
                />
                <div className="">
                  <Label
                    htmlFor="anonymous"
                    className="text-base font-normal text-[#5F8555]"
                  >
                    Donate anonymously
                  </Label>
                  <p className="font-light text-xs text-[#5F8555]">
                    Your name will not be displayed on the campaign page, but a
                    record of your donation will be stored in our database.
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label
                  htmlFor="comments"
                  className="text-base font-normal text-[#5F8555]"
                >
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Support the fundraiser with nice words."
                  className="mt-2 min-h-[100px] bg-[#F2F1E9] border border-[#C0BFC4] text-sm text-[#5F8555] placeholder:text-sm placeholder:text-[#5F8555]"
                />
              </div>

              {/* Payment Instruction */}
              <div className="">
                <p className="text-xl font-medium text-[#104901]">
                  Complete by payment by clicking below and paying through
                  Stripe. (Charges may apply)
                </p>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                variant="default"
                className="w-[220px] h-16 bg-[#104901] text-2xl text-white flex justify-between items-center "
              >
                Donate <HandCoins size={24} />
              </Button>
            </div>
          )}

          {step === "thankyou" && (
            <div className="space-y-6">
              {/* View on Dashboard */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium text-[#104901]">
                  View on your Dashboard
                </span>
                <Button className="w-[185px] h-16 flex justify-between items-center font-medium text-2xl">
                  View <Send className="ml-2" size={16} />
                </Button>
              </div>

              {/* Share your donation */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium text-[#104901]">
                  Share your donation!
                </span>
                <div className="flex space-x-3">
                  <Link
                    href="https://www.facebook.com/sharer/sharer.php?u=https://www.google.com"
                    target="_blank"
                  >
                    <Facebook strokeWidth={1.5} size={32} />
                  </Link>
                  <Link
                    href="https://www.instagram.com/sharer/sharer.php?u=https://www.google.com"
                    target="_blank"
                  >
                    <Instagram strokeWidth={1.5} size={32} />
                  </Link>
                  <Link
                    href="https://www.twitter.com/sharer/sharer.php?u=https://www.google.com"
                    target="_blank"
                  >
                    <Twitter strokeWidth={1.5} size={32} />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/sharer/sharer.php?u=https://www.google.com"
                    target="_blank"
                  >
                    <Linkedin strokeWidth={1.5} size={32} />
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

export default DonateModal;
