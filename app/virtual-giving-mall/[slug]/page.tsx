"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Share2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useGeolocationCurrency } from "@/hooks/use-geolocation-currency";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  mission: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  category: string;
  focusAreas: string[];
  logo: string;
  coverImage: string;
  isVerified: boolean;
  totalReceived: string;
  registrationNumber: string;
}

interface CharityStats {
  totalDonations: number;
  totalAmount: number;
  successfulDonations: number;
}

export default function CharityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [charity, setCharity] = useState<Charity | null>(null);
  const [stats, setStats] = useState<CharityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);

  // Geolocation and currency detection
  const {
    locationInfo,
    loading: locationLoading,
    getPresetAmounts,
    formatAmount,
  } = useGeolocationCurrency();

  // Donation form state
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  // Get preset amounts based on user's currency
  const presetAmounts = locationInfo
    ? getPresetAmounts(locationInfo.currency.code)
    : ["25", "50", "100", "250", "500", "1000"];

  useEffect(() => {
    if (slug) {
      fetchCharity();
    }
  }, [slug]);

  const fetchCharity = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/charities/${slug}`);
      if (!response.ok) {
        throw new Error("Charity not found");
      }
      const data = await response.json();
      setCharity(data.charity);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching charity:", error);
      toast.error("Failed to load charity information");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const donationAmount = amount === "custom" ? customAmount : amount;

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setDonating(true);

    try {
      const currency = locationInfo?.currency.code || "USD";

      // Create payment intent
      const response = await fetch(
        `/api/charities/${charity?.id}/payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: donationAmount,
            currency,
            donorName: isAnonymous ? "Anonymous" : donorName,
            donorEmail,
            message,
            isAnonymous,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      // Handle payment based on method
      if (data.paymentMethod === "paystack") {
        // Redirect to Paystack payment page
        toast.success("Redirecting to payment...");
        window.location.href = data.authorizationUrl;
      } else if (data.paymentMethod === "stripe") {
        // Store client secret for Stripe Elements
        toast.success("Redirecting to payment...");

        // Redirect to Stripe payment page with client secret
        const stripeUrl = `/virtual-giving-mall/${charity?.slug}/checkout?client_secret=${data.clientSecret}&donation_id=${data.donationId}`;
        window.location.href = stripeUrl;
      }
    } catch (error: any) {
      console.error("Error creating donation:", error);
      toast.error(error.message || "Failed to process donation");
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Charity Not Found
          </h1>
          <Button asChild>
            <Link href="/virtual-giving-mall">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to the Mall
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Cover Image */}
      {charity.coverImage && (
        <div className="h-80 bg-gray-200 overflow-hidden mt-16">
          <Image
            src={charity.coverImage}
            alt={charity.name}
            className="w-full h-full object-cover"
            width={1200}
            height={320}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/virtual-giving-mall">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to the Mall
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                {charity.logo && (
                  <Image
                    src={charity.logo}
                    alt={charity.name}
                    className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                    width={80}
                    height={80}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {charity.name}
                    </h1>
                    {charity.isVerified && (
                      <Badge className="bg-[#59AD4A] flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  {charity.category && (
                    <Badge variant="outline" className="text-sm">
                      {charity.category}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-[#59AD4A]">
                      {formatAmount(
                        stats.totalAmount.toString(),
                        locationInfo?.currency.code || "USD"
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Total Raised</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-[#FFCF55]">
                      {stats.totalDonations}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Donations</p>
                  </div>
                  <div className="text-center py-4">
                    <p className="text-2xl font-bold text-[#FFCF55]">
                      {stats.successfulDonations}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Completed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mission & Description */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <div className="space-y-4">
                {charity.mission && (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {charity.mission}
                  </p>
                )}
                {charity.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {charity.description}
                  </p>
                )}
              </div>
            </div>

            {/* Focus Areas */}
            {charity.focusAreas && charity.focusAreas.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Focus Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {charity.focusAreas.map((area, index) => (
                    <p
                      key={index}
                      className="text-sm font-plusjakarta bg-green-100 text-green-600 rounded-lg px-3 py-1 inline-block"
                    >
                      {area}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                {charity.email && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <a
                      href={`mailto:${charity.email}`}
                      className="hover:text-blue-600 transition"
                    >
                      {charity.email}
                    </a>
                  </div>
                )}
                {charity.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <a
                      href={`tel:${charity.phone}`}
                      className="hover:text-blue-600 transition"
                    >
                      {charity.phone}
                    </a>
                  </div>
                )}
                {charity.website && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {(charity.address || charity.city || charity.country) && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      {charity.address && <p>{charity.address}</p>}
                      <p>
                        {[charity.city, charity.state, charity.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 sticky top-24 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Make a Donation
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Your support helps {charity.name} continue their important work
              </p>

              <form onSubmit={handleDonate} className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label className="text-gray-900">
                    Select Amount ({locationInfo?.currency.code || "USD"})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`py-3 px-2 rounded-lg text-sm transition-all border-2 ${
                          amount === preset
                            ? "border-[#59AD4A] bg-[#104109] text-white font-plusjakarta"
                            : "border-gray-300 bg-white text-gray-900 hover:border-[#59AD4A]"
                        }`}
                      >
                        {formatAmount(
                          preset,
                          locationInfo?.currency.code || "USD"
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAmount("custom")}
                    className={`w-full py-3 px-4 rounded-lg text-sm transition-all border-2 ${
                      amount === "custom"
                        ? "border-[#59AD4A] bg-[#104109] text-white font-plusjakarta"
                        : "border-gray-300 bg-white text-gray-900 hover:border-[#59AD4A]"
                    }`}
                  >
                    Custom Amount
                  </button>
                  {amount === "custom" && (
                    <Input
                      type="number"
                      placeholder={`Enter amount in ${locationInfo?.currency.code || "USD"}`}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      min="1"
                      step={
                        locationInfo?.currency.code === "NGN" ? "1" : "0.01"
                      }
                      className="mt-3"
                    />
                  )}
                </div>

                {/* Donor Information */}
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="donorName"
                      className="font-plusjakarta block mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#1a1a1a",
                      }}
                    >
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isAnonymous}
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
                        color: "#1a1a1a",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="donorEmail"
                      className="font-plusjakarta block mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#1a1a1a",
                      }}
                    >
                      Email Address <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="donorEmail"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="john@example.com"
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
                        color: "#1a1a1a",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="font-plusjakarta block mb-2"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#1a1a1a",
                      }}
                    >
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message of support..."
                      rows={3}
                      className="font-plusjakarta w-full"
                      style={{
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
                        overflow: "auto",
                      }}
                    />
                  </div>
                </div>

                {/* Anonymous Donation */}
                <div className="flex items-center space-x-3 py-3 border-y border-gray-200">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded w-4 h-4 border-gray-300 text-[#59AD4A]"
                  />
                  <Label
                    htmlFor="anonymous"
                    className="cursor-pointer text-sm text-gray-700"
                  >
                    Donate anonymously
                  </Label>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Payment Method
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-[#59AD4A] transition cursor-pointer">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label
                        htmlFor="stripe"
                        className="cursor-pointer text-sm text-gray-700 flex-1 m-0"
                      >
                        Credit/Debit Card (Stripe)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-[#59AD4A] transition cursor-pointer">
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label
                        htmlFor="paystack"
                        className="cursor-pointer text-sm text-gray-700 flex-1 m-0"
                      >
                        Paystack
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-xs text-white p-3 bg-[#59AD4A] rounded-lg">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>Secure and encrypted payment</span>
                </div>

                <button
                  type="submit"
                  disabled={donating || !amount}
                  className="font-plusjakarta flex items-center justify-center w-full"
                  style={{
                    height: "56px",
                    padding: "16px 0",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor:
                      donating || !amount ? "#9CA3AF" : "#104901",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: donating || !amount ? "not-allowed" : "pointer",
                    boxShadow:
                      "0px 4px 6px -4px rgba(6, 78, 59, 0.1), 0px 10px 15px -3px rgba(6, 78, 59, 0.1)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.5 5H12.5V2.5C12.5 2.1 12.2 1.8 11.8 1.8C11.4 1.8 11.1 2.1 11.1 2.5V5H8.9V2.5C8.9 2.1 8.6 1.8 8.2 1.8C7.8 1.8 7.5 2.1 7.5 2.5V5H2.5C1.1 5 0 6.1 0 7.5V16.5C0 18.9 1.6 20 2.5 20H17.5C18.9 20 20 18.9 20 17.5V7.5C20 6.1 18.9 5 17.5 5ZM18.3 17.5C18.3 18.1 17.9 18.5 17.3 18.5H2.7C2.1 18.5 1.7 18.1 1.7 17.5V9.2H18.3V17.5Z"
                      fill="white"
                    />
                  </svg>
                  <span
                    className="font-plusjakarta"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "24px",
                      textAlign: "center",
                    }}
                  >
                    {donating
                      ? "Processing..."
                      : `Donate ${amount && amount !== "custom" ? formatAmount(amount, locationInfo?.currency.code || "USD") : customAmount ? formatAmount(customAmount, locationInfo?.currency.code || "USD") : ""}`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
