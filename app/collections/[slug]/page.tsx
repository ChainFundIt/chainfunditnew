"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  ArrowLeft,
  Share2,
  Shield,
  Users,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useGeolocationCurrency } from "@/hooks/use-geolocation-currency";
import { getSupportedProviders } from "@/lib/payments/config";
import { PayPalOrderButtons } from "@/components/payments/paypal-order-buttons";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { CollectionFaq } from "@/components/collections/CollectionFaq";
import { cn } from "@/lib/utils";
import { getCollectionCategory, getCollectionCategoryLabel } from "@/lib/collections/categories";
import {
  collectionBody,
  collectionBodySmall,
  collectionBtnOutlineSmall,
  collectionBtnPrimary,
  collectionCardTitle,
  collectionLabel,
  collectionPage,
  collectionSectionTitle,
} from "@/lib/collections/ui";

interface Collection {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  organiserName: string;
  coverImage: string | null;
  currency: string;
  targetAmount: string | null;
  totalRaised: string;
  dueAt: string | null;
  status: string;
}

interface CollectionStats {
  totalContributions: number;
  totalRaised: number;
  successfulContributions: number;
}

interface RecentContribution {
  id: string;
  contributorName: string | null;
  amount: string;
  currency: string;
  message: string | null;
  isAnonymous: boolean | null;
  paymentStatus: string;
  createdAt: string;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [recentContributions, setRecentContributions] = useState<
    RecentContribution[]
  >([]);
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
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  // Get preset amounts based on user's currency
  const presetAmounts = locationInfo
    ? getPresetAmounts(locationInfo.currency.code)
    : ["25", "50", "100", "250", "500", "1000"];
  const currencyCode = locationInfo?.currency.code || "USD";
  const supportedPaymentMethods = getSupportedProviders(currencyCode);
  const paymentOptionsReady = !locationLoading;
  const activePaymentMethod =
    paymentOptionsReady && supportedPaymentMethods.includes(paymentMethod as any)
      ? paymentMethod
      : paymentOptionsReady
        ? supportedPaymentMethods[0]
        : null;

  useEffect(() => {
    if (!paymentOptionsReady || !activePaymentMethod) return;
    if (paymentMethod !== activePaymentMethod) {
      setPaymentMethod(activePaymentMethod);
    }
  }, [paymentOptionsReady, paymentMethod, activePaymentMethod]);

  useEffect(() => {
    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  const fetchCollection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${slug}`);
      if (!response.ok) {
        throw new Error("Collection not found");
      }
      const data = await response.json();
      setCollection(data.collection);
      setStats(data.stats);

      try {
        const contributionsResponse = await fetch(
          `/api/collections/${data.collection.id}/contributions?limit=12`
        );
        if (contributionsResponse.ok) {
          const contributionsData = await contributionsResponse.json();
          setRecentContributions(contributionsData.contributions || []);
        }
      } catch {
        setRecentContributions([]);
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
      toast.error("Failed to load collection");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activePaymentMethod === "paypal" || !activePaymentMethod) {
      return;
    }

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
      const currency = currencyCode;

      // Create payment intent
      const response = await fetch(
        `/api/collections/${collection?.id}/payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: donationAmount,
            currency,
            contributorName: isAnonymous ? "Anonymous" : donorName,
            contributorEmail: donorEmail,
            message,
            isAnonymous,
            paymentMethod: activePaymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment intent");
      }

      // Handle payment based on method
      if (data.paymentMethod === "paystack") {
        toast.success("Redirecting to payment...");
        window.location.href = data.authorizationUrl;
      }
    } catch (error: any) {
      console.error("Error creating donation:", error);
      toast.error(error.message || "Failed to process donation");
      setDonating(false);
    }
  };

  const createPayPalOrder = async () => {
    const donationAmount = amount === "custom" ? customAmount : amount;
    const response = await fetch(`/api/collections/${collection?.id}/payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: donationAmount,
        currency: currencyCode,
        contributorName: isAnonymous ? "Anonymous" : donorName,
        contributorEmail: donorEmail,
        message,
        isAnonymous,
        paymentMethod: "paypal",
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.orderId) {
      throw new Error(data?.error || "Failed to initialize PayPal donation.");
    }

    return {
      orderId: data.orderId,
      donationId: data.donationId,
    };
  };

  const capturePayPalOrder = async (orderId: string) => {
    const response = await fetch(
      `/api/collections/verify-payment?reference=${encodeURIComponent(orderId)}&method=paypal`
    );
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      throw new Error(data?.error || data?.message || "Failed to capture PayPal donation.");
    }

    window.location.href = `/collections/${collection?.slug}/payment-success?contribution_id=${data.contribution?.id || data.donation?.id}`;
  };

  const selectedContributionAmount =
    amount === "custom"
      ? customAmount
      : amount || "";
  const formattedSelectedAmount =
    selectedContributionAmount && parseFloat(selectedContributionAmount) > 0
      ? formatAmount(selectedContributionAmount, currencyCode)
      : formatAmount("0", currencyCode);

  const handleShareCollection = async () => {
    if (!collection) return;
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/collections/${collection.slug}`
        : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: collection.title,
          text: collection.description || collection.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Collection link copied");
      }
    } catch {
      toast.error("Could not share this collection");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f2] py-24 px-4">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-96 bg-gray-200 rounded-3xl" />
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#f4f7f2] py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className={`${collectionSectionTitle} mb-4`}>
            Collection not found
          </h1>
          <Button asChild className={collectionBtnPrimary}>
            <Link href="/collections">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to collections
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const heroImage = collection.coverImage;
  const categoryMeta = getCollectionCategory(collection.category);
  const categoryLabel = getCollectionCategoryLabel(collection.category);
  const CategoryIcon = categoryMeta?.icon;
  const dueLabel = collection.dueAt
    ? new Date(collection.dueAt).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className={`${collectionPage} bg-[#f4f7f2]`}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <nav className={`flex items-center gap-2 ${collectionBodySmall}`}>
            <Link href="/collections" className="font-semibold text-[#104109]">
              Collections
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-[#1C1917] line-clamp-1">
              {collection.title}
            </span>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className={collectionBtnOutlineSmall}>
              <Link href="/collections/browse">
                <ArrowLeft className="h-4 w-4" />
                All collections
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={collectionBtnOutlineSmall}
              onClick={handleShareCollection}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <section className="bg-white border border-[#e5ebe3] rounded-3xl shadow-sm overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <p className={`${collectionBodySmall} mb-2`}>
                    {categoryLabel || "Active collection"}
                  </p>
                  <h1 className={collectionSectionTitle}>
                    {collection.title}
                  </h1>
                  {categoryMeta && CategoryIcon && (
                    <div className={`mt-3 inline-flex items-center gap-2 ${collectionBodySmall}`}>
                      <CategoryIcon className="h-4 w-4 text-[#104109]" />
                      <span>{categoryMeta.label}</span>
                    </div>
                  )}
                  <div className={`mt-4 flex flex-wrap gap-4 ${collectionBodySmall}`}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#59AD4A]" />
                      <span>
                        Organiser:{" "}
                        <span className="font-semibold">
                          {collection.organiserName}
                        </span>
                      </span>
                    </div>
                    {dueLabel && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#59AD4A]" />
                        <span>
                          Due by:{" "}
                          <span className="font-semibold">{dueLabel}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {stats && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#f0f7ed] px-4 py-3">
                        <p className={collectionBodySmall}>Raised so far</p>
                        <p className="text-xl font-bold text-[#104109]">
                          {formatAmount(
                            stats.totalRaised.toString(),
                            collection.currency
                          )}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#fff8e8] px-4 py-3">
                        <p className={collectionBodySmall}>Contributors</p>
                        <p className="text-xl font-bold text-[#b8860b]">
                          {stats.successfulContributions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative min-h-[220px] md:min-h-full bg-gradient-to-br from-[#e8f2e4] to-[#d2e5cb]">
                  {heroImage ? (
                    <Image
                      src={heroImage}
                      alt={collection.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      width={640}
                      height={480}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart className="h-16 w-16 text-[#59AD4A]/40" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#e5ebe3] p-6 md:p-8">
                <h2 className={`${collectionCardTitle} mb-3`}>
                  About this collection
                </h2>
                {collection.description && (
                  <p className={collectionBody}>
                    {collection.description}
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white border border-[#e5ebe3] rounded-3xl shadow-sm p-6 md:p-8">
              <h2 className={`${collectionCardTitle} mb-4`}>
                Recent contributions
              </h2>
              {recentContributions.length === 0 ? (
                <p className={collectionBodySmall}>
                  Be the first to contribute to this collection.
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentContributions.map((contribution) => (
                    <li
                      key={contribution.id}
                      className="rounded-xl border border-gray-100 bg-[#fafcfa] px-4 py-3"
                    >
                      <p className={`${collectionBodySmall} text-[#1C1917]`}>
                        <span className="font-semibold">
                          {contribution.isAnonymous
                            ? "Anonymous supporter"
                            : contribution.contributorName || "Supporter"}
                        </span>{" "}
                        contributed{" "}
                        <span className="font-semibold text-[#104109]">
                          {formatAmount(
                            contribution.amount,
                            contribution.currency
                          )}
                        </span>
                      </p>
                      {contribution.message && (
                        <p className={`${collectionBodySmall} mt-1`}>
                          {contribution.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <CollectionFaq />
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e5ebe3] shadow-md lg:sticky lg:top-24">
              <p className={`${collectionBodySmall} mb-1`}>
                Payment
              </p>
              <h2 className="font-jakarta text-xl font-bold tracking-tight text-[#104109] md:text-2xl mb-1">
                Your contribution
              </h2>
              <p className={`${collectionBodySmall} mb-4`}>
                Contribution to {collection.organiserName}
              </p>
              <p className="text-3xl font-bold text-[#104109] mb-6">
                {formattedSelectedAmount}
              </p>

              <form onSubmit={handleDonate} className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label className={collectionLabel}>
                    Select Amount ({locationInfo?.currency.code || "USD"})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetAmounts.map((preset) => (
                      <Button
                        key={preset}
                        type="button"
                        variant={amount === preset ? "default" : "outline"}
                        className={cn(
                          "h-10 rounded-full px-2 text-sm font-semibold shadow-none",
                          amount === preset
                            ? "border-0 bg-[#104109] text-white hover:bg-[#0d3507] hover:text-white"
                            : "border-2 border-[#104109] bg-transparent text-[#104109] hover:bg-[#F3F8F2] hover:text-[#104109]"
                        )}
                        onClick={() => setAmount(preset)}
                      >
                        {formatAmount(
                          preset,
                          locationInfo?.currency.code || "USD"
                        )}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant={amount === "custom" ? "default" : "outline"}
                    className={cn(
                      "h-10 w-full rounded-full text-sm font-semibold shadow-none",
                      amount === "custom"
                        ? "border-0 bg-[#104109] text-white hover:bg-[#0d3507] hover:text-white"
                        : "border-2 border-[#104109] bg-transparent text-[#104109] hover:bg-[#F3F8F2] hover:text-[#104109]"
                    )}
                    onClick={() => setAmount("custom")}
                  >
                    Custom amount
                  </Button>
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
                      className="mt-3 h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                    />
                  )}
                </div>

                {/* Donor Information */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="donorName" className={collectionLabel}>Your name (optional)</Label>
                    <Input
                      type="text"
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="John Doe"
                      disabled={isAnonymous}
                      className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donorEmail" className={collectionLabel}>
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      id="donorEmail"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className={collectionLabel}>Message (optional)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message of support..."
                      rows={3}
                      className="rounded-2xl border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
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
                    className="cursor-pointer text-sm font-medium text-[#57534E]"
                  >
                    Donate anonymously
                  </Label>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label className={collectionLabel}>
                    Payment Method
                  </Label>
                  {!paymentOptionsReady || !activePaymentMethod ? (
                    <p className={collectionBodySmall}>
                      Loading payment options…
                    </p>
                  ) : (
                  <RadioGroup
                    value={activePaymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    {supportedPaymentMethods.includes("paystack") && (
                      <div className="flex items-center space-x-3 p-3 border border-[#E7E5E4] rounded-full hover:border-[#104109] transition cursor-pointer">
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label
                          htmlFor="paystack"
                          className="cursor-pointer text-sm font-medium text-[#1C1917] flex-1 m-0"
                        >
                          Paystack
                        </Label>
                      </div>
                    )}
                    {supportedPaymentMethods.includes("paypal") && (
                      <div className="flex items-center space-x-3 p-3 border border-[#E7E5E4] rounded-full hover:border-[#104109] transition cursor-pointer">
                        <RadioGroupItem value="paypal" id="payment-method-paypal" />
                        <Label
                          htmlFor="payment-method-paypal"
                          className="cursor-pointer text-sm font-medium text-[#1C1917] flex-1 m-0"
                        >
                          PayPal
                        </Label>
                      </div>
                    )}
                  </RadioGroup>
                  )}
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm font-medium text-[#104109] p-3 border border-[#104109]/20 bg-[#F3F8F2] rounded-full">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>Secure and encrypted payment</span>
                </div>

                {activePaymentMethod === "paypal" ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <p className={`mb-3 ${collectionBodySmall}`}>
                      Complete your donation with PayPal below.
                    </p>
                    <PayPalOrderButtons
                      amount={amount === "custom" ? customAmount : amount}
                      currency={currencyCode}
                      label={collection?.title || "Collection contribution"}
                      disabled={!amount || !donorEmail}
                      createOrderRequest={createPayPalOrder}
                      captureOrderRequest={capturePayPalOrder}
                      onError={(message) => toast.error(message)}
                    />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={donating || !amount || !paymentOptionsReady}
                    className={`${collectionBtnPrimary} w-full`}
                    size="lg"
                  >
                    {donating
                      ? "Processing..."
                      : `Contribute ${amount && amount !== "custom" ? formatAmount(amount, currencyCode) : customAmount ? formatAmount(customAmount, currencyCode) : ""}`}
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
