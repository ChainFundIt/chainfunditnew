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
  Target,
  Heart,
  CheckCircle2,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-gray-500">Loading your hangout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hangout) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[50vh] text-center">
          <p className="text-gray-700 mb-4">
            {error === "Hangout not found" ? "This Impact Hangout could not be found." : error}
          </p>
          <Button className="rounded-full" asChild>
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

  return (
    <div className="min-h-screen bg-white">
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
          <div className="absolute inset-0 bg-gradient-to-t from-brand-green-dark/80 via-brand-green-dark/60 to-transparent" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-sm mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Impact Hangout
          </Link>

          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Fundraising progress
              </h2>
              <div className="flex items-center gap-2">
                <Dialog open={donateOpen} onOpenChange={setDonateOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="h-12 rounded-full gap-2 bg-brand-green-dark font-semibold"
                    >
                      <Heart className="h-4 w-4" />
                      Donate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-xl max-w-md" onClick={(e) => e.stopPropagation()}>
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
                                  ? "border-brand-green-dark bg-green-50 text-brand-green-dark"
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
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Event donations are currently charged in NGN, so this flow uses Paystack automatically.
                      </div>
                      {donateError && (
                        <p className="text-sm text-red-600">{donateError}</p>
                      )}
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full bg-brand-green-dark"
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
                    className="h-12 rounded-full gap-2 bg-brand-green-dark"
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
                <span className="text-gray-600">
                  ₦{raisedFormatted} raised
                </span>
                <span className="text-gray-600">
                  Goal: ₦{goalFormatted}
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-green-dark transition-all duration-500"
                  style={{ width: `${Math.min(100, hangout.progressPercent)}%` }}
                />
              </div>
              <p className="text-center text-sm font-medium text-brand-green-dark">
                {hangout.progressPercent}% of goal
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600 text-sm text-justify">
                Share this page with friends and family so they can support your
                Impact Hangout. Every donation brings your goal closer.
              </p>
              <Button
                size="lg"
                className="mt-4 h-12 rounded-full w-full sm:w-auto gap-2 bg-brand-green-dark"
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
