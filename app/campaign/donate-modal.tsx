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
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useDonations, DonationResult } from "@/hooks/use-donations";
import { getSupportedProviders, getIntelligentProviders, PROVIDER_DESCRIPTIONS, PaymentProvider } from "@/lib/payments/config";
import { getCurrencyCode } from "@/lib/utils/currency";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import StripePaymentForm from "@/components/payments/StripePaymentForm";
import Image from "next/image";
import { trackDonation, track } from "@/lib/analytics";

interface Campaign {
  id: string;
  slug: string;
  title: string;
  shortUrl?: string;
  currency: string;
  minimumDonation: string;
}

interface DonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign;
  referralChainer?: {
    id: string;
    referralCode: string;
  } | null;
}

const DonateModal: React.FC<DonateModalProps> = ({
  open,
  onOpenChange,
  campaign,
  referralChainer,
}) => {
  const [step, setStep] = useState<"donate" | "payment" | "stripe-payment" | "thankyou">("donate");
  const [period, setPeriod] = useState("one-time");
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [emailError, setEmailError] = useState(""); 
  const [comments, setComments] = useState("");
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("stripe");
  const [supportedProviders, setSupportedProviders] = useState<PaymentProvider[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stripePaymentData, setStripePaymentData] = useState<{
    clientSecret: string;
    donationId: string;
    amount: number;
    currency: string;
  } | null>(null);
  
  const { loading: donationLoading, error: donationError, initializeDonation } = useDonations();

  useEffect(() => {
    if (campaign && open) {
      const showThankYouModal = sessionStorage.getItem('showThankYouModal');
      if (showThankYouModal === 'true') {
        setStep("thankyou");
        sessionStorage.removeItem('showThankYouModal');
        return;
      }

      setSelectedCurrency(campaign.currency || "₦");
      
      const currencyCode = getCurrencyCode(campaign.currency);
      const { primary, alternatives } = getIntelligentProviders(currencyCode);
      
      const allProviders = primary ? [primary, ...alternatives] : alternatives;
      setSupportedProviders(allProviders);
      
      if (primary) {
        setPaymentProvider(primary);
      } else if (alternatives.length > 0) {
        setPaymentProvider(alternatives[0]);
      }
    }
  }, [campaign, open]);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    
    const currencyCode = getCurrencyCode(currency);
    const { primary, alternatives } = getIntelligentProviders(currencyCode);
    
    const allProviders = primary ? [primary, ...alternatives] : alternatives;
    setSupportedProviders(allProviders);
    
    if (primary) {
      setPaymentProvider(primary);
    } else if (alternatives.length > 0) {
      setPaymentProvider(alternatives[0]);
    }
  };

  const handleDonate = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (campaign && amount) {
      trackDonation("donation_started", {
        campaign_id: campaign.id,
        amount: parseFloat(amount),
        currency: selectedCurrency || campaign.currency,
        is_anonymous: anonymous,
      });
    }
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!campaign || !amount) return;

    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(campaign.minimumDonation);

    if (amountNum < minAmount) {
      alert(`Minimum donation amount is ${selectedCurrency} ${minAmount}`);
      return;
    }

    try {
      const currencyCode = getCurrencyCode(selectedCurrency);
      const isRecurring = period !== 'one-time';

      track("payment_initiated", {
        campaign_id: campaign.id,
        donation_amount: amountNum,
        donation_currency: currencyCode,
        payment_method: paymentProvider,
        is_anonymous: anonymous,
        period: period,
      });

      if (isRecurring) {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (!session || !session.user) {
          toast.error("You must be logged in to set up recurring donations. Please sign in first.");
          return;
        }

        const subscriptionResponse = await fetch('/api/payments/subscriptions/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: campaign.id,
            amount: amountNum,
            currency: currencyCode,
            paymentProvider,
            period: period,
            message: comments,
            isAnonymous: anonymous,
            email: email || undefined,
            chainerId: referralChainer?.id || null,
          }),
        });

        const subscriptionResult = await subscriptionResponse.json();

        if (subscriptionResult.success) {
          if (subscriptionResult.provider === 'paystack' && subscriptionResult.authorizationUrl) {
            window.location.href = subscriptionResult.authorizationUrl;
          } else if (subscriptionResult.provider === 'stripe' && subscriptionResult.clientSecret) {
            setStripePaymentData({
              clientSecret: subscriptionResult.clientSecret,
              donationId: subscriptionResult.subscriptionId,
              amount: amountNum,
              currency: selectedCurrency,
            });
            setStep("stripe-payment");
          } else {
            toast.success("Recurring donation subscription created successfully!");
            setStep("thankyou");
          }
        } else {
          toast.error(subscriptionResult.error || "Failed to create subscription. Please try again.");
        }
        return;
      }

      const donationData = {
        campaignId: campaign.id,
        amount: amountNum,
        currency: currencyCode,
        paymentProvider,
        message: comments,
        isAnonymous: anonymous,
        email: email || undefined,
        chainerId: referralChainer?.id || null,
      };

      const result = await initializeDonation(donationData, false);

      if (result && result.success) {
        if (result.provider === 'paystack' && result.authorization_url) {
          window.location.href = result.authorization_url;
        } else if (result.provider === 'stripe' && result.clientSecret && result.donationId) {
          setStripePaymentData({
            clientSecret: result.clientSecret,
            donationId: result.donationId,
            amount: amountNum,
            currency: selectedCurrency,
          });
          setStep("stripe-payment");
        }
      } else if (result && !result.success) {
        trackDonation("donation_failed", {
          campaign_id: campaign.id,
          amount: amountNum,
          currency: currencyCode,
          payment_method: paymentProvider,
        });
        toast.error(result.error || "Donation failed. Please try again.");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("An error occurred while processing your donation. Please try again.");
    }
  };

  const handleStripePaymentSuccess = () => {
    if (campaign && stripePaymentData) {
      trackDonation("donation_completed", {
        donation_id: stripePaymentData.donationId,
        campaign_id: campaign.id,
        amount: stripePaymentData.amount,
        currency: stripePaymentData.currency,
        payment_method: "stripe",
        is_anonymous: anonymous,
      });
    }
    setStep("thankyou");
  };

  const handleStripePaymentError = (error: string) => {
    toast.error(error);
    setStep("payment");
    setStripePaymentData(null);
  };

  const handleStripePaymentCancel = () => {
    setStep("payment");
    setStripePaymentData(null);
  };

  const handleClose = () => {
    setStep("donate");
    setAmount("");
    setSelectedCurrency("");
    setFullName("");
    setEmail("");
    setPhone("");
    setAnonymous(false);
    setComments("");
    setLinkCopied(false);
    setStripePaymentData(null);
    onOpenChange(false);
  };

  const handleViewDashboard = () => {
    window.open('/dashboard', '_blank');
  };

  const handleCopyLink = async () => {
    if (!campaign) return;
    
    const campaignUrl = campaign.shortUrl 
      ? `https://chainfundit.com/c/${campaign.shortUrl}`
      : `https://chainfundit.com/campaign/${campaign.slug}`;
    
    try {
      await navigator.clipboard.writeText(campaignUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      const textArea = document.createElement('textarea');
      textArea.value = campaignUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const generateShareUrl = (platform: string) => {
    if (!campaign) return '#';
    
    const campaignUrl = campaign.shortUrl 
      ? `https://chainfundit.com/c/${campaign.shortUrl}`
      : `https://chainfundit.com/campaign/${campaign.slug}`;
    
    const shareText = `I just donated ${selectedCurrency} ${amount} to "${campaign.title}"! Help support this cause: `;
    
    const encodedUrl = encodeURIComponent(campaignUrl);
    const encodedText = encodeURIComponent(shareText);
    
    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case 'twitter':
        return `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&summary=${encodedText}`;
      case 'instagram':
        return '#';
      default:
        return '#';
    }
  };

  const handleInstagramShare = () => {
    if (!campaign) return;
    
    const campaignUrl = campaign.shortUrl 
      ? `https://chainfundit.com/c/${campaign.shortUrl}`
      : `https://chainfundit.com/campaign/${campaign.slug}`;
    
    const shareText = `I just donated ${selectedCurrency} ${amount} to "${campaign.title}"! Help support this cause: ${campaignUrl}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('Share text copied! Paste it in your Instagram story or post.');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share text copied! Paste it in your Instagram story or post.');
    });
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
              {step === "payment" && "Choose Payment Method"}
              {step === "stripe-payment" && "Complete Payment"}
              {step === "thankyou" && "Thank you for your donation!"}
            </h2>
            <p className="text-base font-normal text-[#5F8555] mt-1">
              {step === "donate" &&
                "Select a period and a payment channel to complete your donation."}
              {step === "payment" &&
                "Select your preferred payment provider to complete the donation."}
              {step === "stripe-payment" &&
                "Enter your card details to complete the donation securely."}
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
                            ? "bg-[#104901] text-white rounded-lg border border-[#104901] hover:bg-[#104901] hover:text-white shadow-none"
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
                <div className="flex gap-3 mt-2">
                  {/* Currency Selector */}
                  <div className="relative">
                    <Select
                      value={selectedCurrency}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger className="h-11 bg-whitesmoke rounded-lg border border-[#C0BFC4] text-[#5F8555] text-xl shadow-none appearance-none cursor-pointer hover:border-[#104901] transition-colors">
                        <SelectValue placeholder="$" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₦">₦</SelectItem>
                        <SelectItem value="$">$</SelectItem>
                        <SelectItem value="£">£</SelectItem>
                        <SelectItem value="€">€</SelectItem>
                        <SelectItem value="C$">C$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Amount Input */}
                  <div className="relative flex-1">
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="type in an amount"
                      className="w-full h-11 bg-whitesmoke rounded-lg border border-[#C0BFC4] text-[#5F8555] text-xl shadow-none"
                    />
                  </div>
                </div>
              </div>

              {/* Anonymous Donation Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked: boolean) => {
                    setAnonymous(checked);
                    if (checked) {
                      setFullName("");
                      setPhone("");
                    }
                  }}
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

              {/* Contact Details */}
              <div>
                <h3 
                  className="font-plusjakarta block mb-3"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#1a1a1a"
                  }}
                >
                  Contact Details
                </h3>
                {anonymous ? (
                  // Anonymous: Only show email field
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="email"
                        className="font-plusjakarta block mb-2"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 700,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#1a1a1a"
                        }}
                      >
                        Email Address <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        placeholder="john@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="font-plusjakarta w-full"
                        style={{
                          height: "48px",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#1a1a1a"
                        }}
                      />
                      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                  </div>
                ) : (
                  // Not anonymous: Show full contact details
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="fullName"
                        className="font-plusjakarta block mb-2"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 700,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#1a1a1a"
                        }}
                      >
                        Your Name (Optional)
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        placeholder="John Doe"
                        onChange={(e) => setFullName(e.target.value)}
                        className="font-plusjakarta w-full"
                        style={{
                          height: "48px",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#1a1a1a"
                        }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="font-plusjakarta block mb-2"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 700,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#1a1a1a"
                        }}
                      >
                        Email Address <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        placeholder="john@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="font-plusjakarta w-full"
                        style={{
                          height: "48px",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#1a1a1a"
                        }}
                      />
                      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="font-plusjakarta block mb-2"
                        style={{
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 700,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "#1a1a1a"
                        }}
                      >
                        Phone Number (Optional)
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        placeholder="john@example.com"
                        onChange={(e) => setPhone(e.target.value)}
                        className="font-plusjakarta w-full"
                        style={{
                          height: "48px",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontFamily: "Plus Jakarta Sans",
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "#1a1a1a"
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="comments"
                  className="font-plusjakarta block mb-2"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 700,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#1a1a1a"
                  }}
                >
                  Message (Optional)
                </label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Leave a message of support..."
                  className="font-plusjakarta w-full"
                  style={{
                    height: "120px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F9FAFB",
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#1a1a1a",
                    resize: "none",
                    overflow: "auto"
                  }}
                />
              </div>

              {/* Payment Instruction */}
              <div>
                <p 
                  className="font-plusjakarta"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: "#666666"
                  }}
                >
                  Complete your payment by clicking below and paying through Stripe or Paystack. (Charges may apply)
                </p>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleDonate}
                className="font-plusjakarta flex items-center justify-center w-full"
                style={{
                  height: "56px",
                  padding: "16px 0",
                  gap: "8px",
                  borderRadius: "12px",
                  backgroundColor: "#104901",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0px 4px 6px -4px rgba(6, 78, 59, 0.1), 0px 10px 15px -3px rgba(6, 78, 59, 0.1)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0d3a00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#104901";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="font-plusjakarta"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 700,
                    fontSize: "16px",
                    lineHeight: "24px",
                    textAlign: "center"
                  }}
                >
                  Continue
                </span>
              </button>
            </div>
          )}
          {step === "payment" && (
            <div className="space-y-6">
              {/* Donation Summary */}
              <div className="bg-whitesmoke rounded-lg p-4 border border-[#C0BFC4]">
                <h3 className="font-semibold text-lg text-[#104901] mb-2">Donation Summary</h3>
                <div className="space-y-1">
                  <p className="text-[#5F8555]">Amount: <span className="font-semibold">{selectedCurrency} {amount}</span></p>
                  <p className="text-[#5F8555]">Period: <span className="font-semibold">{period}</span></p>
                  {!anonymous && <p className="text-[#5F8555]">Name: <span className="font-semibold">{fullName}</span></p>}
                  {anonymous && <p className="text-[#5F8555]">Anonymous donation</p>}
                </div>
              </div>

              {/* Payment Provider Selection */}
              <div>
                <Label className="text-base font-medium text-[#5F8555] mb-3 block">
                  Select Payment Provider
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {supportedProviders.length > 0 ? (
                    supportedProviders.map((provider, index) => {
                      const currencyCode = getCurrencyCode(selectedCurrency);
                      const { primary } = getIntelligentProviders(currencyCode);
                      const isRecommended = provider === primary;
                      
                      return (
                        <Button
                          key={provider}
                          variant={paymentProvider === provider ? "default" : "outline"}
                          className={`p-4 h-auto text-left flex items-center gap-3 relative ${
                            paymentProvider === provider
                              ? "bg-whitesmoke border border-[#C0BFC4] hover:bg-whitesmoke text-[#5F8555]"
                              : "border border-[#C0BFC4] bg-transparent hover:bg-whitesmoke text-[#5F8555]"
                          }`}
                          onClick={() => setPaymentProvider(provider)}
                        >
                          {provider === "stripe" && <Image src='/icons/stripe.png' alt='Stripe' width={16} height={16}/>}
                          {provider === "paystack" && <Image src='/icons/paystack.png' alt='Paystack' width={16} height={16}/>}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-semibold capitalize">{provider}</div>
                              {isRecommended && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-sm opacity-70">
                              {PROVIDER_DESCRIPTIONS[provider]}
                            </div>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-[#5F8555]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104901] mx-auto mb-3"></div>
                      <p>Loading payment providers...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {donationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {donationError}
                </div>
              )}

              {/* Payment Button */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("donate")}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-[#5F8555] text-[#5F8555] hover:bg-[#5F8555] hover:text-white rounded-full"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={donationLoading}
                  variant="default"
                  className="flex-1 h-12 bg-[#104901] text-white hover:bg-[#104901] hover:text-white flex items-center justify-center gap-2 rounded-full"
                >
                  {donationLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Pay Now <HandCoins size={20} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "stripe-payment" && stripePaymentData && (
            <div className="space-y-6">
              <StripePaymentForm
                clientSecret={stripePaymentData.clientSecret}
                amount={stripePaymentData.amount}
                currency={stripePaymentData.currency}
                donationId={stripePaymentData.donationId}
                onSuccess={handleStripePaymentSuccess}
                onError={handleStripePaymentError}
                onCancel={handleStripePaymentCancel}
              />
            </div>
          )}

          {step === "thankyou" && (
            <div className="space-y-6">
              {/* View on Dashboard */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium text-[#104901]">
                  View on your Dashboard
                </span>
                <Button 
                  onClick={handleViewDashboard}
                  className="w-[185px] h-16 flex justify-between items-center font-medium text-2xl bg-[#104901] text-white hover:bg-[#0d3d01] hover:text-white"
                >
                  View <Send className="ml-2" size={16} />
                </Button>
              </div>

              {/* Copy Campaign Link */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium text-[#104901]">
                  Copy Campaign Link
                </span>
                <Button 
                  onClick={handleCopyLink}
                  className="w-[185px] h-16 flex justify-between items-center font-medium text-2xl bg-[#5F8555] text-white hover:bg-[#4a6b42] hover:text-white"
                >
                  {linkCopied ? (
                    <>
                      <Check className="mr-2" size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2" size={16} />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Share your donation */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-medium text-[#104901]">
                  Share your donation!
                </span>
                <div className="flex space-x-3">
                  <Link
                    href={generateShareUrl('facebook')}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Facebook strokeWidth={1.5} size={32} className="text-[#104901]" />
                  </Link>
                  <button
                    onClick={handleInstagramShare}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Instagram strokeWidth={1.5} size={32} className="text-[#104901]" />
                  </button>
                  <Link
                    href={generateShareUrl('twitter')}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Twitter strokeWidth={1.5} size={32} className="text-[#104901]" />
                  </Link>
                  <Link
                    href={generateShareUrl('linkedin')}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Linkedin strokeWidth={1.5} size={32} className="text-[#104901]" />
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