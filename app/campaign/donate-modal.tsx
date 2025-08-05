"use client";

import React, { useState } from "react";
import { X, Copy, Facebook, Instagram, Twitter, Linkedin, Send, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DonateModal: React.FC<DonateModalProps> = ({ open, onOpenChange }) => {
  const [step, setStep] = useState<"donate" | "share" | "thankyou">("donate");
  const [period, setPeriod] = useState("one-time");
  const [amount, setAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [comments, setComments] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDonate = () => {
    setStep("share");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("chainfund.it/d1R3lly");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setStep("thankyou");
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
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-[#104901]">
              {step === "donate" && "Make a donation"}
              {step === "share" && "Campaigns do better when you share"}
              {step === "thankyou" && "Thank you for your donation!"}
            </h2>
            <p className="text-gray-600 mt-1">
              {step === "donate" && "Select a period and a payment channel to complete your donation."}
              {step === "share" && "Share this campaign on your favourite social networks."}
              {step === "thankyou" && "We are glad you supported this campaign."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "donate" && (
            <div className="space-y-6">
              {/* Select Period */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Select period
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {["One-time", "Monthly", "Quarterly", "Yearly"].map((option) => (
                    <Button
                      key={option}
                      variant={period === option.toLowerCase().replace(" ", "-") ? "default" : "outline"}
                      className={`h-10 ${
                        period === option.toLowerCase().replace(" ", "-")
                          ? "bg-[#104901] text-white"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setPeriod(option.toLowerCase().replace(" ", "-"))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount
                </Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="type in an amount"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full name
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="taxNumber" className="text-sm font-medium text-gray-700">
                    Tax number
                  </Label>
                  <Input
                    id="taxNumber"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Anonymous Donation */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked: boolean) => setAnonymous(checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
                    Donate anonymously
                  </Label>
                  <p className="text-xs text-gray-500">
                    Your name will not be displayed on the campaign page, but a record of your donation will be stored in our database.
                  </p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Comments
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Support the fundraiser with nice words."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              {/* Payment Instruction */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Complete by payment by clicking below and paying through Stripe. (charges may apply)
                </p>
              </div>

              {/* Donate Button */}
              <Button
                onClick={handleDonate}
                className="w-full bg-[#104901] text-white hover:bg-[#0a3a0a] h-12"
              >
                Donate <HandCoins className="ml-2" size={20} />
              </Button>
            </div>
          )}

          {step === "share" && (
            <div className="space-y-6">
              {/* Campaign Link */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Campaign Link
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value="chainfund.it/d1R3lly"
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white"
                  >
                    <Copy size={16} className="mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Share Campaign */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Share campaign
                </Label>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-600">
                    <Facebook size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-pink-600">
                    <Instagram size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-400">
                    <Twitter size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-700">
                    <Linkedin size={20} />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleShare}
                className="w-full bg-[#104901] text-white hover:bg-[#0a3a0a] h-12"
              >
                Continue
              </Button>
            </div>
          )}

          {step === "thankyou" && (
            <div className="space-y-6">
              {/* View on Dashboard */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700">View on your Dashboard</span>
                <Button variant="outline" className="text-[#104901] border-[#104901] hover:bg-[#104901] hover:text-white">
                  View <Send className="ml-2" size={16} />
                </Button>
              </div>

              {/* Share your donation */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Share your donation!
                </Label>
                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-600">
                    <Facebook size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-pink-600">
                    <Instagram size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-400">
                    <Twitter size={20} />
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-600 hover:text-blue-700">
                    <Linkedin size={20} />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-[#104901] text-white hover:bg-[#0a3a0a] h-12"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateModal; 