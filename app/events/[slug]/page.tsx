"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import {
  Share2,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Clock3,
  MapPin,
  Target,
  Heart,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Whatsapp } from "iconsax-reactjs";

const DONATE_AMOUNTS = [5_000, 10_000, 20_000, 50_000] as const;
const MIN_DONATE = 1_000;

type HangoutData = {
  id: string;
  slug: string;
  hangoutName: string;
  hostName: string;
  eventType?: string;
  cause?: string;
  fundraisingGoalNgn: number;
  amountRaisedNgn: number;
  progressPercent: number;
  shortPitch?: string;
  story?: string;
  eventDate?: string;
  eventEndDate?: string;
  timezone?: string;
  locationType?: "in_person" | "virtual" | "hybrid";
  venueName?: string;
  venueAddress?: string;
  meetingLink?: string;
  impactTiers?: { amountNgn: number; impact: string }[];
  faqs?: { question: string; answer: string }[];
};

export default function HangoutEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slugOrId = params?.slug as string | undefined;
  const [hangout, setHangout] = useState<HangoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState<number>(10_000);
  const [donateCustomInput, setDonateCustomInput] = useState("10000");
  const [donateEmail, setDonateEmail] = useState("");
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState<string | null>(null);
  const [quickDonateDetails, setQuickDonateDetails] = useState<{
    accountName: string;
    accountNumber: string;
    bankName: string;
    amountNgn: number;
  } | null>(null);
  const [quickDonateAccountCopied, setQuickDonateAccountCopied] = useState(false);
  const [recentDonors, setRecentDonors] = useState<{ name: string; amount: number }[]>([]);

  useEffect(() => {
    fetch("/api/events/impact-hangout/recent-donors")
      .then((r) => (r.ok ? r.json() : { donors: [] }))
      .then((data) => setRecentDonors(data?.donors ?? []))
      .catch(() => setRecentDonors([]));
  }, []);

  useEffect(() => {
    if (searchParams.get("donation") === "success") {
      setDonationSuccess(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false);
      setError("Invalid link");
      return;
    }
    fetch(`/api/events/impact-hangout/${encodeURIComponent(slugOrId)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) setError("Hangout not found");
          else setError("Something went wrong");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        setHangout(data ?? null);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const pageSlug = hangout?.slug ?? slugOrId ?? "";
  const shareUrl =
    typeof window !== "undefined" && pageSlug
      ? `${window.location.origin}/events/${encodeURIComponent(pageSlug)}`
      : "";
  const shareTitle = hangout?.hangoutName ?? "My Impact Hangout";
  const shareText = `Check out my Impact Hangout: ${shareTitle}. Help me reach my fundraising goal!`;

  function openShare(platform: "facebook" | "linkedin" | "whatsapp" | "email" | "sms") {
    if (!shareUrl) return;
    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
          "_blank"
        );
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
        break;
      case "sms":
        window.location.href = `sms:?body=${encodeURIComponent(shareText + " " + shareUrl)}`;
        break;
    }
  }

  function getDonateAmount(): number {
    const custom = parseInt(donateCustomInput.replace(/\D/g, ""), 10);
    if (Number.isFinite(custom) && custom >= MIN_DONATE) return custom;
    return donateAmount;
  }

  async function handleDonateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pageSlug) return;
    const amount = getDonateAmount();
    if (amount < MIN_DONATE) {
      setDonateError(`Minimum donation is ₦${MIN_DONATE.toLocaleString()}.`);
      return;
    }
    if (!donateEmail.trim()) {
      setDonateError("Please enter your email.");
      return;
    }
    setDonateError(null);
    setQuickDonateDetails(null);
    setDonateLoading(true);
    try {
      const res = await fetch("/api/events/impact-hangout/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: pageSlug,
          amountInNaira: amount,
          donorEmail: donateEmail.trim(),
          paymentProvider: "paystack",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDonateError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
      setDonateError("Something went wrong. Please try again.");
    } catch {
      setDonateError("Something went wrong. Please try again.");
    } finally {
      setDonateLoading(false);
    }
  }

  async function handleQuickDonate() {
    if (!pageSlug) return;
    const amount = getDonateAmount();
    if (amount < MIN_DONATE) {
      setDonateError(`Minimum donation is ₦${MIN_DONATE.toLocaleString()}.`);
      return;
    }
    setDonateError(null);
    setDonateLoading(true);
    try {
      const res = await fetch("/api/events/impact-hangout/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: pageSlug,
          amountInNaira: amount,
          quickDonate: true,
          paymentProvider: "paystack",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDonateError(data?.error || "Could not generate quick donate account.");
        return;
      }
      if (data?.virtualAccount?.accountNumber) {
        setQuickDonateAccountCopied(false);
        setQuickDonateDetails({
          accountName: data.virtualAccount.accountName,
          accountNumber: data.virtualAccount.accountNumber,
          bankName: data.virtualAccount.bankName,
          amountNgn: data.virtualAccount.amountNgn ?? amount,
        });
        return;
      }
      setDonateError("Could not generate quick donate account.");
    } catch {
      setDonateError("Could not generate quick donate account.");
    } finally {
      setDonateLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="font-jakarta min-h-screen bg-[var(--color-background)] text-[#1C1917]">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-[#78716C]">Loading your hangout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hangout) {
    return (
      <div className="font-jakarta min-h-screen bg-[var(--color-background)] text-[#1C1917]">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-[#57534E] mb-4">
            {error === "Hangout not found" ? "This Impact Hangout could not be found." : error}
          </p>
          <Button className="rounded-full bg-[#104109]  px-8 py-4 text-base font-bold" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Impact Hangout
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const goalFormatted = hangout.fundraisingGoalNgn.toLocaleString();
  const raisedFormatted = hangout.amountRaisedNgn.toLocaleString();
  const dateLabel = hangout.eventDate
    ? new Date(hangout.eventDate).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: hangout.timezone || "Africa/Lagos",
      })
    : null;
  const endDateLabel = hangout.eventEndDate
    ? new Date(hangout.eventEndDate).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: hangout.timezone || "Africa/Lagos",
      })
    : null;
  const locationLabel =
    hangout.locationType === "virtual"
      ? "Virtual event"
      : hangout.locationType === "hybrid"
        ? "Hybrid event"
        : hangout.locationType === "in_person"
          ? "In-person event"
          : null;

  return (
    <div className="font-jakarta min-h-screen bg-[var(--color-background)] text-[#1C1917]">
      <Navbar />

      <div className="relative">
        <div className="absolute inset-0 h-64 md:h-80">
          <Image
            src="/images/events/event3.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#104109]/85 via-[#104109]/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Impact Hangout
          </Link>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 drop-shadow-md leading-tight">
            {hangout.hangoutName}
          </h1>
          <p className="text-white/90 text-lg mb-6">
            Hosted by {hangout.hostName}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
            {hangout.eventType && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {hangout.eventType}
              </span>
            )}
            {hangout.cause && (
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4" />
                {hangout.cause}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-20 pb-20">
        {recentDonors.length > 0 && (
          <div className="max-w-2xl mx-auto mb-4 overflow-hidden rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 py-2.5 px-4 shadow-sm">
            <p className="text-sm text-gray-700 font-medium text-center">
              {recentDonors[0].name} just donated ₦{recentDonors[0].amount.toLocaleString()}
              {recentDonors.length > 1 && (
                <span className="text-gray-600">
                  {" "}· {recentDonors[1].name} donated ₦{recentDonors[1].amount.toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}
        {donationSuccess && (
          <div className="max-w-2xl mx-auto mb-4 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
            <p className="text-sm font-medium text-justify">Thank you for your donation. Every contribution helps reach the goal.</p>
          </div>
        )}
        <div className="bg-white rounded-3xl shadow-xl border border-[#E7E5E4] overflow-hidden max-w-2xl mx-auto">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-[#1C1917]">
                Fundraising progress
              </h2>
              <div className="flex items-center gap-2">
                <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="h-12 rounded-full gap-2 bg-[#104109]  font-bold min-w-[180px]"
                    >
                      <Heart className="h-4 w-4" />
                      Donate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl max-w-md border-none" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Support this hangout</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDonateSubmit} className="space-y-4 mt-2">
                      <div>
                        <Label className="text-sm font-medium">Amount (₦)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {DONATE_AMOUNTS.map((a) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => {
                                setDonateAmount(a);
                                setDonateCustomInput(String(a));
                              }}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                getDonateAmount() === a
                                  ? "border-[#104109] bg-[#F3F8F2] text-[#104109]"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              ₦{a.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Custom amount"
                          value={donateCustomInput}
                          onChange={(e) => setDonateCustomInput(e.target.value)}
                          className="mt-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="donate-email" className="text-sm font-medium">Your email</Label>
                        <Input
                          id="donate-email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={donateEmail}
                          onChange={(e) => setDonateEmail(e.target.value)}
                          className="mt-1 rounded-lg"
                        />
                      </div>
                      <div className="rounded-lg border border-[#D6E7D4] bg-[#F3F8F2] px-3 py-2 text-xs text-[#2f5530]">
                        In a hurry? Use quick donate to get a Paystack virtual account instantly and transfer without filling details.
                      </div>
                      {/* <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Event donations are currently charged in NGN, so this flow uses Paystack automatically.
                      </div> */}
                      {quickDonateDetails && (
                        <div className="rounded-lg border border-[#D6E7D4] bg-[#F8FBF7] p-3 space-y-1.5">
                          <p className="text-sm font-semibold text-[#1C1917]">Quick Donate account details</p>
                          <p className="text-sm text-[#44403C]">
                            Bank: <span className="font-medium">{quickDonateDetails.bankName}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-[#44403C]">
                            <span>
                              Account Number:{" "}
                              <span className="font-semibold tracking-wide">
                                {quickDonateDetails.accountNumber}
                              </span>
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-full border-[#104109]/40 text-[#104109] hover:bg-[#F3F8F2]"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    quickDonateDetails.accountNumber
                                  );
                                  setQuickDonateAccountCopied(true);
                                  window.setTimeout(
                                    () => setQuickDonateAccountCopied(false),
                                    2000
                                  );
                                } catch {
                                  setDonateError(
                                    "Could not copy. Select the account number manually."
                                  );
                                }
                              }}
                              aria-label="Copy account number"
                            >
                              {quickDonateAccountCopied ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-[#44403C]">
                            Account Name: <span className="font-medium">{quickDonateDetails.accountName}</span>
                          </p>
                          <p className="text-sm text-[#44403C]">
                            Transfer Amount: <span className="font-semibold">₦{quickDonateDetails.amountNgn.toLocaleString()}</span>
                          </p>
                        </div>
                      )}
                      {donateError && (
                        <p className="text-sm text-red-600">{donateError}</p>
                      )}
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="w-full rounded-full h-11 text-sm font-semibold border-[#104109] text-[#104109]"
                        onClick={handleQuickDonate}
                        disabled={donateLoading}
                      >
                        {donateLoading ? "Preparing virtual account..." : `Quick Donate ₦${getDonateAmount().toLocaleString()}`}
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full bg-[#104109]  h-12 text-base font-bold"
                        disabled={donateLoading}
                      >
                        {donateLoading ? "Redirecting to payment..." : `Donate ₦${getDonateAmount().toLocaleString()}`}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    className="h-12 rounded-full gap-2 bg-[#104109]  min-w-[180px] font-bold"
                  >
                    <Share2 className="h-4 w-4" />
                    Share my page
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg">
                  <DropdownMenuItem
                    onClick={() => openShare("facebook")}
                    className="cursor-pointer gap-2"
                  >
                    <Facebook className="h-4 w-4 text-[#1877F2]" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openShare("linkedin")}
                    className="cursor-pointer gap-2"
                  >
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openShare("whatsapp")}
                    className="cursor-pointer gap-2"
                  >
                    <Whatsapp size={20} className="text-[#25D366]" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openShare("email")}
                    className="cursor-pointer gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => openShare("sms")}
                    className="cursor-pointer gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    SMS
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#78716C]">
                  ₦{raisedFormatted} raised
                </span>
                <span className="text-[#78716C]">
                  Goal: ₦{goalFormatted}
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#104109] transition-all duration-500"
                  style={{ width: `${Math.min(100, hangout.progressPercent)}%` }}
                />
              </div>
              <p className="text-center text-sm font-medium text-[#104109]">
                {hangout.progressPercent}% of goal
              </p>
            </div>

            {(hangout.shortPitch || hangout.story) && (
              <div className="mt-8 pt-6 border-t border-[#E7E5E4] space-y-4">
                {hangout.shortPitch && (
                  <p className="text-[#44403C] text-base md:text-lg font-medium text-justify">
                    {hangout.shortPitch}
                  </p>
                )}
                {hangout.story && (
                  <p className="text-[#57534E] text-sm leading-7 whitespace-pre-line text-justify">
                    {hangout.story}
                  </p>
                )}
              </div>
            )}

            {(dateLabel ||
              locationLabel ||
              hangout.venueName ||
              hangout.venueAddress ||
              hangout.meetingLink) && (
              <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
                <h3 className="text-base font-semibold text-[#1C1917] mb-4">Event details</h3>
                <div className="space-y-3 text-sm text-[#57534E]">
                  {dateLabel && (
                    <p className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-0.5 text-[#104109] shrink-0" />
                      <span>{dateLabel}</span>
                    </p>
                  )}
                  {endDateLabel && (
                    <p className="flex items-start gap-2">
                      <Clock3 className="h-4 w-4 mt-0.5 text-[#104109] shrink-0" />
                      <span>Ends {endDateLabel}</span>
                    </p>
                  )}
                  {locationLabel && (
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-[#104109] shrink-0" />
                      <span>{locationLabel}</span>
                    </p>
                  )}
                  {hangout.venueName && (
                    <p className="pl-6">
                      <span className="font-medium text-[#292524]">{hangout.venueName}</span>
                      {hangout.venueAddress ? `, ${hangout.venueAddress}` : ""}
                    </p>
                  )}
                  {hangout.meetingLink && (
                    <p className="pl-6">
                      <a
                        href={hangout.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#104109] underline underline-offset-2"
                      >
                        Join online event
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {hangout.impactTiers && hangout.impactTiers.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
                <h3 className="text-base font-semibold text-[#1C1917] mb-4">How donations help</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hangout.impactTiers.map((tier) => (
                    <div
                      key={`${tier.amountNgn}-${tier.impact}`}
                      className="rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] p-4"
                    >
                      <p className="text-[#104109] font-bold text-base">
                        ₦{tier.amountNgn.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#57534E] mt-1">{tier.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#E7E5E4]">
              <p className="text-[#78716C] text-sm text-justify">
                Share this page with friends and family so they can support your
                Impact Hangout. Every donation brings your goal closer.
              </p>
              <Button
                size="lg"
                className="mt-4 h-12 rounded-full w-full sm:w-auto gap-2 bg-[#104109]  px-8 text-base font-bold"
                asChild
              >
                <Link href="/events">
                  Learn more about The Impact Hangout
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
