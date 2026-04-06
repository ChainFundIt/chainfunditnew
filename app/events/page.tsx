"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  GraduationCap,
  Check,
  Users,
  Church,
  Building2,
  Sparkles,
  UsersRound,
  LogIn,
  Mail,
} from "lucide-react";

const CAMPAIGN_LINKS = [
  { label: "Education Access Fund", href: "https://chainfundit.com/c/70X3SHUH" },
  {
    label: "Book Drive Campaign",
    href: "https://www.chainfundit.com/campaign/book-drive-campaign",
  },
  {
    label: "The ChainFundIt Education Fund",
    href: "https://www.chainfundit.com/campaign/the-chainfundit-education-fund",
  },
];

/** Four-step “how to host” cards (layout inspired by charity fundraising pages; ChainFundIt copy). */
const HOW_HOST_CARDS = [
  {
    image: "/images/events/event5.png",
    alt: "Shared meal spread",
    title: "Register to host",
    before: "",
    linkLabel: "Sign up today",
    linkHref: "/events/register",
    after: " and we'll keep you updated with everything you need — from fundraising tips to hosting ideas.",
  },
  {
    image: "/images/events/event6.png",
    alt: "Community breakfast table",
    title: "Plan your event",
    before: "Set a date, choose your venue, and start spreading the word. We have lots of ",
    linkLabel: "free resources",
    linkHref: "/fundraising-tips",
    after: " to help make your hangout a success.",
  },
  {
    image: "/images/events/event1.png",
    alt: "Hosts around a table",
    title: "Host your hangout",
    before: "Serve your favourite meal and encourage your guests to ",
    linkLabel: "make a donation",
    linkHref: "/events",
    after: " through your fundraising page.",
  },
  {
    image: "/images/events/event7.png",
    alt: "Smiling host with food",
    title: "Support real impact",
    before: "",
    linkLabel: "",
    linkHref: "",
    after:
      "Every naira raised helps verified causes on ChainFundIt — education, medical support, and community relief.",
  },
] as const;

type ResourceDownload = { title: string; image: string; alt: string; href: string };

const RESOURCES_AT_HOME: ResourceDownload[] = [
  {
    title: "Host checklist",
    image: "/images/events/event2.png",
    alt: "Planning notes and meal ideas",
    href: "/fundraising-tips",
  },
  {
    title: "Food & table ideas",
    image: "/images/events/event5.png",
    alt: "Food spread inspiration",
    href: "/fundraising-ideas",
  },
  {
    title: "Social assets",
    image: "/images/events/event7.png",
    alt: "Share graphics inspiration",
    href: "/how-it-works",
  },
  {
    title: "Virtual call tips",
    image: "/images/events/event3.png",
    alt: "Gathering at home",
    href: "/faq",
  },
];

const RESOURCES_AT_WORK: ResourceDownload[] = [
  {
    title: "Team invite wording",
    image: "/images/events/event4.png",
    alt: "Colleagues at a table",
    href: "/fundraising-tips",
  },
  {
    title: "Office poster ideas",
    image: "/images/events/event6.png",
    alt: "Breakfast spread for work",
    href: "/how-it-works",
  },
  {
    title: "Social assets",
    image: "/images/events/event1.png",
    alt: "Community meal",
    href: "/join-the-chain-reaction",
  },
  {
    title: "Catering & timing",
    image: "/images/events/event5.png",
    alt: "Shared dishes",
    href: "/contact-us",
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

type MyHangout = { slug: string; hangoutName: string; paymentStatus: string };
type RecentDonor = { name: string; amount: number };

function ResourceGridBlock({
  heading,
  items,
  className = "",
}: {
  heading: string;
  items: ResourceDownload[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="font-jakarta mb-6 text-xl font-black uppercase tracking-tight text-[#0a0a0a] md:text-2xl">
        {heading}
      </h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {items.map((item) => (
          <article
            key={item.title}
            className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
          >
            <div className="relative aspect-square w-full sm:aspect-[4/3]">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
              <h4 className="font-bold text-[#0a0a0a]">{item.title}</h4>
              <Button
                asChild
                className="h-auto w-fit min-w-[5rem] rounded-full border-0 bg-[#104109] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#104109]"
              >
                <Link href={item.href}>View</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ImpactHangoutPage() {
  const [myHangouts, setMyHangouts] = useState<MyHangout[] | null>(null);
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([]);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessSending, setAccessSending] = useState(false);
  const [accessSent, setAccessSent] = useState(false);
  const [showAccessSentModal, setShowAccessSentModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  useEffect(() => {
    fetch("/api/events/impact-hangout/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { hangouts: [] }))
      .then((data) => setMyHangouts(data?.hangouts ?? []))
      .catch(() => setMyHangouts([]));
  }, []);

  useEffect(() => {
    fetch("/api/events/impact-hangout/recent-donors")
      .then((r) => (r.ok ? r.json() : { donors: [] }))
      .then((data) => setRecentDonors(data?.donors ?? []))
      .catch(() => setRecentDonors([]));
  }, []);

  async function handleSendAccessLink(e: React.FormEvent) {
    e.preventDefault();
    if (!accessEmail.trim() || accessSending) return;
    setAccessSending(true);
    try {
      await fetch("/api/events/impact-hangout/send-access-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accessEmail.trim() }),
      });
      setAccessSent(true);
      setShowAccessModal(false);
      setShowAccessSentModal(true);
    } finally {
      setAccessSending(false);
    }
  }

  return (
    <div className="font-jakarta min-h-screen bg-[var(--color-background)] text-[#1C1917]">
      <Navbar />

      {/* Modal: access link email sent */}
      <Dialog open={showAccessSentModal} onOpenChange={setShowAccessSentModal}>
        <DialogContent className="rounded-3xl max-w-md text-center sm:text-left border-none">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 sm:mx-0">
              <Mail className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl text-center sm:text-left pt-2">
              Check your email
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-justify text-sm">
            We&apos;ve sent a link to <strong>{accessEmail || "your email"}</strong>. Click the link in that email to access your Impact Hangout page.
          </p>
          <p className="text-gray-500 text-xs text-justify">
            If you don&apos;t see it, check your spam folder.
          </p>
        </DialogContent>
      </Dialog>

      {/* Modal: request access link by email */}
      <Dialog
        open={showAccessModal}
        onOpenChange={(open) => {
          setShowAccessModal(open);
          if (!open) setAccessSent(false);
        }}
      >
        <DialogContent className="rounded-3xl max-w-md border-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Already registered?</DialogTitle>
            <DialogDescription className="text-left text-[#57534E]">
              Enter the email you used to register and we&apos;ll send you a link to your Impact Hangout page.
            </DialogDescription>
          </DialogHeader>
          {myHangouts !== null && myHangouts.length > 0 && (
            <Button
              className="w-full rounded-full bg-[#104109] hover:bg-[#0d3607] p-8 h-auto text-base font-bold"
              asChild
            >
              <Link href={`/events/${encodeURIComponent(myHangouts[0].slug)}`} className="inline-flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" /> View my hangout
              </Link>
            </Button>
          )}
          <form onSubmit={handleSendAccessLink} className="space-y-4">
            <div>
              <label htmlFor="access-email-modal" className="sr-only">
                Email
              </label>
              <Input
                id="access-email-modal"
                type="email"
                placeholder="Your email"
                value={accessEmail}
                onChange={(e) => setAccessEmail(e.target.value)}
                className="h-12 rounded-full border-[#E7E5E4] bg-white text-[#1C1917] placeholder:text-[#78716C]"
                autoComplete="email"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full bg-[#104109] hover:bg-[#0d3607] p-8 h-auto text-base font-bold"
              disabled={accessSending || accessSent}
            >
              {accessSent ? "Check your email" : accessSending ? "Sending…" : "Send me the link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hero — full-bleed meal image */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event1.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#104109]/85 via-[#104109]/55 to-[#104109]/45" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center text-white">
          {recentDonors.length > 0 && (
            <motion.div
              className="mb-6 overflow-hidden rounded-full bg-white/10 backdrop-blur-sm border border-white/20 py-2 px-4 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-white/95 font-medium">
                {recentDonors[0].name} just donated ₦{recentDonors[0].amount.toLocaleString()}
                {recentDonors.length > 1 && (
                  <span className="ml-2 text-white/80">
                    · {recentDonors[1].name} donated ₦{recentDonors[1].amount.toLocaleString()}
                  </span>
                )}
              </p>
            </motion.div>
          )}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            THE IMPACT HANGOUT
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto text-justify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            This month, we&apos;re inviting people across the country to turn
            simple gatherings into moments of impact.
          </motion.p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
            <motion.div
              className="flex"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="p-8 min-w-[200px] h-12 bg-white text-[#104109] hover:bg-white/90 hover:text-[#104109] border-2 border-white text-base rounded-full font-bold shadow-lg"
                asChild
              >
                <Link href="/events/register" className="inline-flex items-center justify-center gap-2">
                  Host an Impact Hangout <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                type="button"
                onClick={() => {
                  setAccessSent(false);
                  setShowAccessModal(true);
                }}
                className="text-white/90 text-sm font-semibold underline-offset-4 hover:underline hover:text-white"
              >
                Already registered?
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Is — split: text + Nigerian spread image, staggered text */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center overflow-x-clip">
            <motion.div
              className="order-2 md:order-1 relative z-10 min-h-0"
              initial={{ opacity: 0.9, x: "22%", y: 16, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.28, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            >
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
              >
                <motion.h2
                  className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-6 leading-tight"
                  variants={fadeInUp}
                >
                  What is the Impact Hangout?
                </motion.h2>
                <motion.p
                  className="text-[#57534E] text-lg leading-relaxed mb-4 text-justify"
                  variants={fadeInUp}
                >
                  This month, we&apos;re inviting people across the country to turn
                  simple gatherings into moments of impact.
                </motion.p>
                <motion.p
                  className="text-[#57534E] text-lg leading-relaxed mb-4 text-justify"
                  variants={fadeInUp}
                >
                  It could be a relaxed breakfast with friends, an evening
                  hangout with small chops and suya, a campus meetup, or even an
                  office meal. Whatever the setting, your table can become a place
                  where real change begins.
                </motion.p>
                <motion.p
                  className="text-[#57534E] text-lg leading-relaxed mb-8 text-justify"
                  variants={fadeInUp}
                >
                  The Impact Hangout is all about bringing people together — not
                  just to eat and connect, but to support meaningful causes at the
                  same time.
                </motion.p>
                <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="px-8 py-4 h-auto min-h-12 text-base font-bold rounded-full bg-[#104109] hover:bg-[#0d3607]" asChild>
                    <Link href="/events/register">
                      Register to host <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="order-1 md:order-2 relative z-20 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0.9, x: "-14%", y: 16, scale: 0.94 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.28, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src="/images/events/event5.png"
                alt="Nigerian meal spread - jollof, grilled fish, skewers"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Host — full-bleed snacks/fabric background + staggered + hover, text left */}
      <section className="bg-[#59AD4A] relative min-h-[520px] md:min-h-[560px] flex items-start py-20 overflow-hidden">

        <motion.div
          className="relative z-10 w-full max-w-full pl-4 md:pl-8 pr-4 md:pr-8 ml-0 mr-auto text-white text-left"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.h2
            className="text-2xl md:text-4xl font-bold mb-4 tracking-tight"
            variants={fadeInUp}
          >
            Why Host an Impact Hangout?
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl font-medium mb-5 text-white/95"
            variants={fadeInUp}
          >
            Because gatherings happen all the time.
          </motion.p>
          <ul className="flex flex-nowrap gap-2.5 mb-8 overflow-x-auto scrollbar-hide pb-1 list-none">
            {[
              "A birthday dinner.",
              "A team breakfast at work.",
              "A campus meetup.",
              "A house fellowship.",
              "A Friday night hangout.",
            ].map((line) => (
              <motion.li
                key={line}
                variants={fadeInUp}
                whileHover={{ x: 4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-full bg-white/12 backdrop-blur-sm border border-white/25 px-4 py-2.5 text-white/95 text-sm md:text-base font-medium shrink-0 whitespace-nowrap"
              >
                {line}
              </motion.li>
            ))}
          </ul>
          <motion.p
            className="text-base md:text-lg leading-relaxed mb-6 text-white/90 max-w-3xl text-justify"
            variants={fadeInUp}
          >
            The difference is simple — your gathering can now help someone
            else. Funds raised during your hangout go toward important causes
            such as helping students stay in school, covering urgent medical
            needs, or supporting families facing difficult situations.
          </motion.p>
          <motion.p
            className="text-xl md:text-2xl font-bold text-white tracking-tight"
            variants={fadeInUp}
          >
            A small gathering can still make a powerful difference.
          </motion.p>
        </motion.div>
      </section>

      {/* How do I host — full-bleed band + four white cards (reference layout) */}
      <section className="relative bg-[#104109] py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.h2
            className="font-jakarta mb-10 text-center text-3xl font-black uppercase leading-[1.1] tracking-tight text-white sm:text-4xl md:mb-12 md:text-5xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            How do I host an Impact Hangout?
          </motion.h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {HOW_HOST_CARDS.map((card, i) => (
              <motion.article
                key={card.title}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-md"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="relative aspect-[4/3] w-full shrink-0">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
                  <h3 className="font-jakarta text-lg font-black uppercase tracking-tight text-[#0a0a0a] md:text-xl">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {card.before}
                    {card.linkLabel && card.linkHref ? (
                      <Link
                        href={card.linkHref}
                        className="font-bold text-[#104109] underline decoration-2 underline-offset-2"
                      >
                        {card.linkLabel}
                      </Link>
                    ) : null}
                    {card.after}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Where Do the Donations Go? + Who Can Host — shared event3 image, single container */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event3.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Where Do the Donations Go? — card over image */}
        <div className="relative z-10 py-20 md:py-28">
          <motion.div
            className="container mx-auto px-4 max-w-3xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-white/80 p-8 md:p-10">
              <motion.h2
                className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-6 leading-tight"
                variants={fadeInUp}
              >
                Where Do the Donations Go?
              </motion.h2>
              <motion.p
                className="text-[#57534E] text-lg leading-relaxed mb-4 text-justify"
                variants={fadeInUp}
              >
                Transparency matters.
              </motion.p>
              <motion.p
                className="text-[#57534E] text-lg leading-relaxed mb-6 text-justify"
                variants={fadeInUp}
              >
                All campaigns featured in the Impact Hangout are verified through
                ChainFundIt, and funds raised are sent directly to the appropriate
                institutions — such as schools, hospitals, or verified service
                providers.
              </motion.p>
              <motion.p
                className="text-[#57534E] text-lg mb-4"
                variants={fadeInUp}
              >
                This approach ensures:
              </motion.p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {["Accountability", "Transparency", "Donor trust", "Real, measurable impact"].map(
                  (item) => (
                    <motion.li
                      key={item}
                      className="flex items-center gap-2 text-gray-800 font-medium"
                      variants={fadeInUp}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Check className="h-5 w-5 text-[#104109] flex-shrink-0" />
                      {item}
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Who Can Host? — green overlay only over this block */}
        <div className="relative z-10 min-h-[480px] flex items-center py-20">
          <div className="absolute inset-0 bg-[#104109]/88 backdrop-blur-[2px]" />
          <motion.div
            className="relative z-10 container mx-auto px-4 max-w-3xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.h2
              className="text-2xl md:text-4xl font-bold text-white mb-3"
              variants={fadeInUp}
            >
              Who Can Host?
            </motion.h2>
            <motion.p
              className="text-white/90 text-lg md:text-xl mb-6 text-justify"
              variants={fadeInUp}
            >
              Anyone can host an Impact Hangout:
            </motion.p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {[
                { icon: Users, label: "Individuals" },
                { icon: GraduationCap, label: "Students" },
                { icon: Church, label: "Churches or faith groups" },
                { icon: Building2, label: "Corporate teams" },
                { icon: Sparkles, label: "Creators and influencers" },
                { icon: UsersRound, label: "Community organisations" },
              ].map(({ icon: Icon, label }) => (
                <motion.li
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-3 text-white font-medium"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.22)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 text-white/90" />
                  {label}
                </motion.li>
              ))}
            </ul>
            <motion.p
              className="text-white/95 text-lg mt-8"
              variants={fadeInUp}
            >
              If you can gather people, you can host.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* When Can I Host? — clean card with staggered lines */}
      <section className="py-20 md:py-24 bg-[#F8F9F7]">
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-6 leading-tight"
            variants={fadeInUp}
          >
            When Can I Host?
          </motion.h2>
          <motion.p
            className="text-[#57534E] text-lg leading-relaxed mb-4 text-justify"
            variants={fadeInUp}
          >
            The campaign runs all year round, but you can host whenever it
            works for you.
          </motion.p>
          <motion.p
            className="text-[#57534E] text-lg leading-relaxed mb-4 text-justify"
            variants={fadeInUp}
          >
            Morning or evening. Breakfast or dinner. Small circle or larger
            group.
          </motion.p>
          <motion.p
            className="text-[#57534E] text-lg leading-relaxed text-justify"
            variants={fadeInUp}
          >
            What matters most isn&apos;t how elaborate the gathering is — it&apos;s
            the purpose behind it.
          </motion.p>
        </motion.div>
      </section>

      {/* Get ready — centred intro + resource grids (reference layout) */}
      <section className="border-t border-neutral-200 bg-white py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.header
            className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="font-jakarta text-3xl font-black uppercase tracking-tight text-[#0a0a0a] md:text-4xl lg:text-5xl">
              Get ready for your Impact Hangout
            </h2>
            <p className="mt-4 text-base text-neutral-600 md:text-lg">
              Explore our free guides and ideas to help make your hangout a success.
            </p>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <ResourceGridBlock heading="I'm hosting at home:" items={RESOURCES_AT_HOME} />
          </motion.div>
          <motion.div
            className="mt-16 md:mt-20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <ResourceGridBlock heading="I'm hosting at work:" items={RESOURCES_AT_WORK} />
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center md:mt-14"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              className="h-auto min-h-12 rounded-full bg-[#104109] px-8 py-4 text-base font-bold text-white hover:bg-[#104109]"
              asChild
            >
              <Link href="/events/register">
                Register to host <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Turn Your Gathering Into Impact — CTA with event7 background + staggered CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event7.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#104109]/95 via-[#104109]/80 to-[#104109]/70" />
        </div>
        <motion.div
          className="relative z-10 container mx-auto px-4 max-w-3xl text-white"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="text-2xl md:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            Turn Your Gathering Into Impact
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-white/95 mb-4 text-justify"
            variants={fadeInUp}
          >
            A simple breakfast can help keep a student in school. An evening
            hangout can support someone&apos;s medical care. A shared meal can
            change a life.
          </motion.p>
          <motion.p
            className="text-lg text-white/90 mb-10 text-justify"
            variants={fadeInUp}
          >
            Start your Impact Hangout today. Register now, choose a cause, and
            begin raising funds.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="p-8 h-12 min-w-[200px] bg-white text-[#104109] hover:bg-white/90 border-2 border-white rounded-full font-bold"
                asChild
              >
                <Link href="/events/register" className="inline-flex items-center">
                  Host an Impact Hangout <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            {/* <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="p-8 h-12 min-w-[200px] border-2 border-white text-white hover:bg-white/10 hover:text-white rounded-full font-bold"
                asChild
              >
                <Link href="/campaigns">Support a cause</Link>
              </Button>
            </motion.div> */}
          </div>
        </motion.div>
      </section>

      {/* Featured Campaigns — staggered list */}
      <section className="py-20 md:py-24 bg-white border-t border-[#E7E5E4]">
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-6 leading-tight"
            variants={fadeInUp}
          >
            Featured Campaigns
          </motion.h2>
          <motion.p
            className="text-[#57534E] mb-8 text-justify"
            variants={fadeInUp}
          >
            Support verified causes on ChainFundIt. Every Naira goes to the
            cause.
          </motion.p>
          <ul className="space-y-4">
            {CAMPAIGN_LINKS.map((campaign) => (
              <motion.li
                key={campaign.href}
                variants={fadeInUp}
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <a
                  href={campaign.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#E7E5E4] hover:border-[#104109] hover:bg-[#F3F8F2] transition-colors text-[#104109] font-medium group"
                >
                  {campaign.label}
                  <ArrowRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
