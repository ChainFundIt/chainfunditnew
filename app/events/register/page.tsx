"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Users, Briefcase, ArrowRight, Lock, X } from "lucide-react";

const CAUSES = [
  "Education Access Fund",
  "Medical Emergency Support",
  "Community Relief Fund",
];

const PLANNED_WHEN = ["March 2026", "April 2026 or later", "Not sure yet"];
const EVENT_TYPES = ["Brunch", "Dinner", "Coffee morning", "Virtual gathering", "Other"];

const KICKSTART_OPTIONS = [
  { amount: 10_000, label: "₦10,000", description: "Helps provide essential learning materials for a student." },
  { amount: 15_000, label: "₦15,000", description: "Contributes toward medical support for someone in urgent need." },
  { amount: 20_000, label: "₦20,000", description: "Supports families through community relief initiatives." },
] as const;

const MIN_KICKSTART = 1_000;

type HostingWith = "friends-family" | "colleagues" | "";

const STORAGE_KEY = "impactHangoutRegistrationId";

function ImpactHangoutRegisterContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationSlug, setRegistrationSlug] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completedRegistrationId, setCompletedRegistrationId] = useState<string | null>(null);
  const [completedRegistrationSlug, setCompletedRegistrationSlug] = useState<string | null>(null);
  const [optedOutOfPayment, setOptedOutOfPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    hostingWith: "" as HostingWith,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    plannedWhen: "",
    cause: "",
    receiveUpdates: true,
    termsAccepted: false,
    photoConsent: false,
    eventType: "",
    hangoutName: "",
    fundraisingGoal: "",
    kickstartAmount: 10_000,
    customAmountInput: "10000",
  });
  const [recentDonors, setRecentDonors] = useState<{ name: string; amount: number }[]>([]);
  const [existingHangout, setExistingHangout] = useState<{ slug: string; hangoutName: string } | null>(null);
  const [dismissExistingBanner, setDismissExistingBanner] = useState(false);
  const [activeHangoutSlugForLink, setActiveHangoutSlugForLink] = useState<string | null>(null);

  const fullName = [form.firstName, form.lastName].filter(Boolean).join(" ");
  const hostTypeLabel =
    form.hostingWith === "friends-family"
      ? "Friends & family"
      : form.hostingWith === "colleagues"
        ? "Colleagues"
        : undefined;

  // Handle return from Paystack: success → show success screen; failed → step 3 + retry
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      const slug = searchParams.get("slug");
      if (slug) setCompletedRegistrationSlug(slug);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/events/register");
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setSubmitted(true);
      return;
    }
    if (payment === "failed") {
      const err = searchParams.get("error") || "Payment could not be completed.";
      const msg =
        err === "verification_failed"
          ? "Payment verification failed. Please try again."
          : err === "callback_error"
            ? "Something went wrong. Please try again."
            : "Payment could not be completed. You can try again below.";
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/events/register");
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRegistrationId(stored);
          setStep(3);
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }
      setError(msg);
    }
  }, [searchParams]);

  useEffect(() => {
    if (step !== 3) return;
    fetch("/api/events/impact-hangout/recent-donors")
      .then((r) => r.json())
      .then((data) => setRecentDonors(data?.donors ?? []))
      .catch(() => setRecentDonors([]));
  }, [step]);

  useEffect(() => {
    if (submitted) return;
    fetch("/api/events/impact-hangout/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { hangouts: [], activeHangout: null }))
      .then((data) => {
        const active = data?.activeHangout ?? null;
        setExistingHangout(active);
      })
      .catch(() => {});
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!form.termsAccepted) {
        setError("Please agree to the Terms & Conditions to continue.");
        return;
      }
      setError(null);
      setStep(2);
      return;
    }
    if (step === 2) {
      setError(null);
      setLoading(true);
      try {
        const goalNgn = form.fundraisingGoal.trim()
          ? parseInt(form.fundraisingGoal.replace(/\D/g, ""), 10)
          : undefined;
        const res = await fetch("/api/events/impact-hangout/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: form.email,
            phone: form.phone || undefined,
            hostType: hostTypeLabel || undefined,
            plannedWhen: form.plannedWhen || undefined,
            cause: form.cause || undefined,
            receiveUpdates: form.receiveUpdates,
            eventType: form.eventType || undefined,
            hangoutName: form.hangoutName.trim() || undefined,
            fundraisingGoalNgn: Number.isFinite(goalNgn) && goalNgn !== undefined && goalNgn > 0 ? goalNgn : undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || "Something went wrong. Please try again.");
          setActiveHangoutSlugForLink(res.status === 409 && data?.slug ? data.slug : null);
          return;
        }
        setActiveHangoutSlugForLink(null);
        if (data.id) setRegistrationId(data.id);
        if (data.slug) setRegistrationSlug(data.slug);
        setStep(3);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
  }

  async function handlePay() {
    if (!registrationId) return;
    const amount = getPayAmount();
    if (amount < MIN_KICKSTART) {
      setError(`Minimum amount is ₦${MIN_KICKSTART.toLocaleString()}.`);
      return;
    }
    setError(null);
    setPaymentLoading(true);
    try {
      const res = await fetch("/api/events/impact-hangout/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, amountInNaira: amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to start payment. Please try again.");
        return;
      }
      if (data.authorizationUrl) {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY, registrationId);
        }
        window.location.href = data.authorizationUrl;
        return;
      }
      setError("Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  }

  function getPayAmount(): number {
    const fromCustom = parseInt(form.customAmountInput.replace(/\D/g, ""), 10);
    if (Number.isFinite(fromCustom) && fromCustom >= MIN_KICKSTART) return fromCustom;
    return form.kickstartAmount;
  }

  const step1Valid =
    form.hostingWith &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.termsAccepted;

  if (submitted) {
    return (
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event3.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <motion.div
            className="container mx-auto px-4 pt-28 pb-20 max-w-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="mx-auto h-16 w-16 text-brand-green-dark mb-6" />
            <h1 className="text-2xl md:text-3xl font-bold text-brand-green-dark mb-4">
              You&apos;re registered!
            </h1>
            <p className="text-gray-700 text-lg mb-4 text-justify max-w-lg mx-auto">
              We&apos;ll send you your personalised fundraising link and next
              steps by email. Get ready to turn your table into impact.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 max-w-md mx-auto text-left">
              <h2 className="font-semibold text-gray-900 mb-3">What happens next</h2>
              <ul className="space-y-2 text-gray-700 text-sm text-justify">
                <li className="flex gap-2">
                  <span className="font-bold text-brand-green-dark">1.</span>
                  We&apos;ve sent your unique fundraising page link to your email.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-green-dark">2.</span>
                  Share your page with friends and family so they can donate.
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-brand-green-dark">3.</span>
                  Host your hangout and watch your goal grow.
                </li>
              </ul>
            </div>
            {completedRegistrationSlug && (
              <p className="text-gray-700 text-sm mb-4 text-justify">
                Your fundraising page:{" "}
                <Link
                  href={`/events/${encodeURIComponent(completedRegistrationSlug)}`}
                  className="text-brand-green-dark font-medium underline"
                  target="_blank"
                >
                  View my page
                </Link>
              </p>
            )}
            {optedOutOfPayment && (
              <p className="text-gray-600 text-sm mb-6 text-justify max-w-lg mx-auto">
                When you&apos;re ready, complete your kickstart payment from your
                page or the link we sent you to start raising.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 rounded-full" asChild>
                <Link href={completedRegistrationSlug ? `/events/${encodeURIComponent(completedRegistrationSlug)}` : "/events"}>
                  {completedRegistrationSlug ? "Go to my page" : "Back to Impact Hangout"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* <div className="absolute inset-0">
        <Image
          src="/images/events/event2.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-green-dark/70 via-brand-green-dark/50 to-brand-green-dark/40" />
      </div> */}

      <div className="relative z-10">
        <Navbar />
        <div className="container mx-auto flex flex-col justify-center items-center px-4 pt-24 pb-20">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-white font-medium hover:text-white/90 mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Impact Hangout
          </Link>

          <motion.div
            className="w-full max-w-full overflow-hidden rounded-2xl border border-white/20 bg-white/95 backdrop-blur-md md:max-w-[min(100%,60vw)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {existingHangout && !dismissExistingBanner && (
              <div className="flex items-center justify-between gap-3 bg-green-50 border-b border-green-200 px-4 py-3">
                <p className="text-sm text-gray-800">
                  You have an active hangout: <strong>{existingHangout.hangoutName}</strong>. Reach your goal before creating another.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="rounded-full h-8" asChild>
                    <Link href={`/events/${encodeURIComponent(existingHangout.slug)}`}>
                      View my page
                    </Link>
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDismissExistingBanner(true)}
                    className="p-1 rounded hover:bg-green-100 text-gray-500"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            {/* Intro line (King's Trust style: "Sign up today and we'll keep you updated") */}
            <div className="px-6 pt-5 pb-1 md:px-8">
              <p className="text-gray-600 text-sm text-justify">
                Sign up today and we&apos;ll create your personal fundraising page and send you the link by email.
              </p>
            </div>
            {/* Step progress */}
            <div className="flex border-b border-gray-200 bg-gray-50/80">
              <div
                className={`flex-1 py-3 text-center text-sm font-medium ${step === 1
                    ? "text-brand-green-dark border-b-2 border-brand-green-dark bg-white"
                    : "text-gray-500"
                  }`}
              >
                1 — Personal & terms
              </div>
              <div
                className={`flex-1 py-3 text-center text-sm font-medium ${step === 2
                    ? "text-brand-green-dark border-b-2 border-brand-green-dark bg-white"
                    : "text-gray-500"
                  }`}
              >
                 2 — Your event & goal
              </div>
              <div
                className={`flex-1 py-3 text-center text-sm font-medium ${step === 3
                    ? "text-brand-green-dark border-b-2 border-brand-green-dark bg-white"
                    : "text-gray-500"
                  }`}
              >
                 3 — Kickstart donation
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <h1 className="text-xl md:text-2xl font-bold text-brand-green-dark">
                      Register to host an Impact Hangout
                    </h1>
                    <p className="text-gray-600 text-sm text-justify">
                      Sign up to host your own Impact Hangout. We need a few details about you and your event so we can create your fundraising page.
                    </p>

                    {/* Who are you hosting with? */}
                    <div className="space-y-3">
                      <Label className="text-gray-800">Who are you hosting with? *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, hostingWith: "friends-family" }))
                          }
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-colors ${form.hostingWith === "friends-family"
                              ? "border-brand-green-dark bg-green-50/80 text-brand-green-dark"
                              : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                        >
                          <Users className="h-6 w-6" />
                          <span className="font-medium text-sm">With friends and family</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, hostingWith: "colleagues" }))
                          }
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-left transition-colors ${form.hostingWith === "colleagues"
                              ? "border-brand-green-dark bg-green-50/80 text-brand-green-dark"
                              : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                        >
                          <Briefcase className="h-6 w-6" />
                          <span className="font-medium text-sm">With colleagues</span>
                        </button>
                      </div>
                    </div>

                    {/* Personal details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name *</Label>
                        <Input
                          id="firstName"
                          required
                          placeholder="First name"
                          value={form.firstName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, firstName: e.target.value }))
                          }
                          className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name *</Label>
                        <Input
                          id="lastName"
                          required
                          placeholder="Last name"
                          value={form.lastName}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, lastName: e.target.value }))
                          }
                          className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+234..."
                        value={form.phone}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>When are you planning to host? (optional)</Label>
                      <Select
                        value={form.plannedWhen || undefined}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, plannedWhen: v }))
                        }
                      >
                        <SelectTrigger className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PLANNED_WHEN.map((w) => (
                            <SelectItem key={w} value={w}>
                              {w}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Which cause do you want to support?</Label>
                      <Select
                        value={form.cause || undefined}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, cause: v }))
                        }
                      >
                        <SelectTrigger className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CAUSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Stay in touch */}
                    <div className="space-y-3 rounded-xl bg-gray-50/80 p-4">
                      <p className="text-sm font-medium text-gray-800">
                        Let&apos;s stay in touch
                      </p>
                      <p className="text-sm text-gray-600 text-justify">
                        We&apos;d love to keep you informed about The Impact Hangout,
                        other ways to support causes, and updates from ChainFundIt.
                      </p>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="receiveUpdates"
                          checked={form.receiveUpdates}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              receiveUpdates: e.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-green-dark focus:ring-brand-green-dark"
                        />
                        <Label
                          htmlFor="receiveUpdates"
                          className="font-normal cursor-pointer text-sm text-gray-700 text-justify"
                        >
                          I&apos;m happy to hear from ChainFundIt by email about
                          our work and ways to support.
                        </Label>
                      </div>
                      <p className="text-xs text-gray-500">
                        We&apos;ll still email you about your Impact Hangout and
                        fundraising link even if you opt out. See our{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-brand-green-dark underline"
                          target="_blank"
                        >
                          privacy policy
                        </Link>
                        .
                      </p>
                    </div>

                    {/* Terms */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="termsAccepted"
                          checked={form.termsAccepted}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              termsAccepted: e.target.checked,
                            }))
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-green-dark focus:ring-brand-green-dark"
                        />
                        <Label
                          htmlFor="termsAccepted"
                          className="font-normal cursor-pointer text-sm text-gray-700 text-justify"
                        >
                          I agree to the{" "}
                          <Link
                            href="/terms-and-conditions"
                            className="text-brand-green-dark underline"
                            target="_blank"
                          >
                            Terms & Conditions
                          </Link>{" "}
                          of hosting an Impact Hangout. *
                        </Label>
                      </div>
                    </div>

                    {/* Photo consent (optional) */}
                    <div className="space-y-2 rounded-xl bg-gray-50/80 p-4">
                      <p className="text-sm text-gray-600 text-justify">
                        We may use photos from Impact Hangouts for promotion. Are you
                        happy for ChainFundIt to use photos you share (e.g. on social
                        media) for this?
                      </p>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="photoConsent"
                            checked={form.photoConsent === true}
                            onChange={() =>
                              setForm((f) => ({ ...f, photoConsent: true }))
                            }
                            className="border-gray-300 text-brand-green-dark focus:ring-brand-green-dark"
                          />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="photoConsent"
                            checked={form.photoConsent === false}
                            onChange={() =>
                              setForm((f) => ({ ...f, photoConsent: false }))
                            }
                            className="border-gray-300 text-brand-green-dark focus:ring-brand-green-dark"
                          />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-12 py-4 rounded-full font-semibold"
                      disabled={!step1Valid}
                    >
                      Next step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <h1 className="text-xl md:text-2xl font-bold text-brand-green-dark">
                      Your event & goal
                    </h1>
                    <p className="text-gray-600 text-sm text-justify">
                      Tell us about your hangout and how much you&apos;d like to raise. Your page will show this so supporters know what they&apos;re contributing to.
                    </p>

                    <div className="space-y-2">
                      <Label>What kind of event will you be hosting? *</Label>
                      <Select
                        value={form.eventType || undefined}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, eventType: v }))
                        }
                      >
                        <SelectTrigger className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hangoutName">Impact Hangout name *</Label>
                      <Input
                        id="hangoutName"
                        placeholder="e.g. Aisha&apos;s Brunch for Education"
                        value={form.hangoutName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, hangoutName: e.target.value }))
                        }
                        className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fundraisingGoal">Fundraising goal (₦) *</Label>
                      <Input
                        id="fundraisingGoal"
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 500000"
                        value={form.fundraisingGoal}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fundraisingGoal: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                      />
                      <p className="text-xs text-gray-500">
                        How much would you like to raise in total?
                      </p>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg space-y-2">
                        <p>{error}</p>
                        {activeHangoutSlugForLink && (
                          <Link
                            href={`/events/${encodeURIComponent(activeHangoutSlugForLink)}`}
                            className="inline-flex items-center font-medium text-brand-green-dark hover:underline"
                          >
                            View your active hangout →
                          </Link>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-12 rounded-full flex-1"
                        onClick={() => {
                          setStep(1);
                          setError(null);
                          setActiveHangoutSlugForLink(null);
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 flex-1 rounded-full font-semibold"
                        disabled={loading || !form.eventType || !form.hangoutName.trim() || !form.fundraisingGoal.trim()}
                      >
                        {loading ? "Submitting..." : "Next step"}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <h1 className="text-xl md:text-2xl font-bold text-brand-green-dark">
                      Be the First to Give
                    </h1>
                    <p className="text-gray-700 text-sm text-justify">
                      Starting your fundraiser with a personal donation helps build
                      momentum and encourages others to contribute. Every donation brings your goal closer. Make the first gift and inspire others to join you.
                    </p>
                    <p className="text-gray-800 font-medium">
                      Choose an amount to get your fundraiser started.
                    </p>

                    {/* Amount options with descriptions */}
                    <div className="space-y-2">
                      {KICKSTART_OPTIONS.map((opt) => {
                        const isSelected = getPayAmount() === opt.amount;
                        return (
                          <div
                            key={opt.amount}
                            className={`rounded-xl border-2 p-3 transition-colors ${isSelected
                                ? "border-brand-green-dark bg-green-50/80"
                                : "border-gray-200 bg-white"
                              }`}
                          >
                            <p className="text-sm text-gray-700 text-justify">
                              <span className="font-semibold text-brand-green-dark">
                                {opt.label}
                                {opt.amount === 15_000 && (
                                  <span className="ml-1 text-xs">⭐ Most Popular</span>
                                )}
                              </span>
                              <br />
                              {opt.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Preset amount buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {KICKSTART_OPTIONS.map((opt) => {
                        const isSelected = getPayAmount() === opt.amount;
                        return (
                          <button
                            key={opt.amount}
                            type="button"
                            onClick={() => {
                              setForm((f) => ({
                                ...f,
                                kickstartAmount: opt.amount,
                                customAmountInput: String(opt.amount),
                              }));
                              setError(null);
                            }}
                            className={`rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${isSelected
                                ? "border-brand-green-dark bg-brand-green-dark text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:border-brand-green-dark/50"
                              }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Other amount */}
                    <div className="space-y-2">
                      <Label className="text-gray-800">Or enter another amount</Label>
                      <div className="flex items-center gap-2">
                        <span className="flex h-10 items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-gray-600">
                          ₦
                        </span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={form.customAmountInput}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "");
                            setForm((f) => ({
                              ...f,
                              customAmountInput: raw,
                              kickstartAmount:
                                raw === ""
                                  ? 10_000
                                  : parseInt(raw, 10) || 10_000,
                            }));
                          }}
                          className="rounded-lg h-12 border-gray-300 focus:ring-2 focus:ring-brand-green-dark"
                        />
                      </div>
                    </div>

                    {/* Donor carousel */}
                    {recentDonors.length > 0 && (
                      <div className="overflow-hidden rounded-xl bg-gray-50/80 p-3">
                        <p className="mb-2 text-xs font-medium text-gray-600">
                          Recent kickstart donations
                        </p>
                        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
                          {recentDonors.map((d, i) => (
                            <span
                              key={i}
                              className="shrink-0 rounded-lg bg-white px-3 py-2 text-sm text-gray-800 shadow-sm"
                            >
                              <span className="font-medium">{d.name}</span> donated{" "}
                              <span className="font-semibold text-brand-green-dark">
                                ₦{Number(d.amount).toLocaleString()}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-gray-200">
                        <Lock className="h-2.5 w-2.5" />
                      </span>
                      All payments are secure and encrypted.
                    </p>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        {error}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-12 rounded-full flex-1"
                        onClick={() => {
                          setStep(2);
                          setError(null);
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        className="h-12 flex-1 rounded-full font-semibold"
                        disabled={paymentLoading || !registrationId}
                        onClick={handlePay}
                      >
                        {paymentLoading
                          ? "Redirecting..."
                          : `Pay ₦${getPayAmount().toLocaleString()}`}
                      </Button>
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (registrationId) {
                            setCompletedRegistrationId(registrationId);
                            if (registrationSlug) setCompletedRegistrationSlug(registrationSlug);
                            setOptedOutOfPayment(true);
                            setSubmitted(true);
                          }
                        }}
                        className="text-sm text-brand-green-dark underline hover:no-underline font-medium"
                      >
                        No, thanks — I&apos;ll complete my kickstart payment later
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function ImpactHangoutRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <ImpactHangoutRegisterContent />
    </Suspense>
  );
}
