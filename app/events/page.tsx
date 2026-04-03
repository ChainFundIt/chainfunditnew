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

      {/* How It Works — steps with event6 as side accent */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#F5F7F3] to-[var(--color-background)]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-12 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-5 md:h-[540px] gap-10 items-stretch overflow-x-clip">
            <motion.div
              className="md:col-span-2 relative z-20 h-full min-h-[280px] rounded-2xl overflow-hidden hidden md:block shadow-lg"
              initial={{ opacity: 0.9, x: "22%", scale: 0.94 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.28, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/events/event6.png"
                alt="Food spread - rice, plantains, community meal"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0, 40vw (max-height: 768px) 0, 40vw"
              />
            </motion.div>
            <motion.div
              className="relative z-10 md:col-span-3 h-full min-h-0"
              initial={{ opacity: 0.9, x: "-14%", y: 16, scale: 0.96 }}
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.28, margin: "-10% 0px -10% 0px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
            >
              <motion.ol
                className="h-full flex flex-col justify-between space-y-6"
                variants={stagger}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.28, margin: "-10% 0px -10% 0px" }}
              >
                {[
                  {
                    step: 1,
                    title: "Register",
                    text: "Create your Impact Hangout page and get your personal fundraising link.",
                  },
                  {
                    step: 2,
                    title: "Choose a Cause",
                    text: "Select one of the verified causes to support: Education Access Fund, Medical Emergency Support, or Community Relief Fund.",
                  },
                  {
                    step: 3,
                    title: "Host Your Hangout",
                    text: "Invite your friends, colleagues, or community. Serve breakfast, dinner, or snacks — whatever fits your vibe.",
                  },
                  {
                    step: 4,
                    title: "Encourage Donations",
                    text: "Instead of gifts, invite your guests to support the cause by donating through your link.",
                  },
                  {
                    step: 5,
                    title: "Watch the Impact Grow",
                    text: "Track donations and see the difference your gathering is making in real time.",
                  },
                ].map((item) => (
                  <motion.li
                    key={item.step}
                    className="flex gap-4 p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E7E5E4] shadow-sm"
                    variants={fadeInUp}
                    whileHover={{ x: 6, boxShadow: "0 10px 40px -10px rgba(16, 73, 1, 0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="flex-shrink-0 w-11 h-11 rounded-full bg-[#104109] text-white font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg text-[#1C1917] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[#57534E] text-base text-justify">{item.text}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
          </div>
          <motion.div
            className="mt-24"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button size="lg" className="px-8 py-4 h-auto min-h-12 text-base font-bold rounded-full bg-[#104109] hover:bg-[#0d3607]" asChild>
              <Link href="/events/register">
                Register now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
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

      {/* Get ready for your Impact Hangout */}
      <section className="py-20 md:py-24 bg-[#FFCF55] border-t border-[#E7E5E4]">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-[#104109] mb-6 leading-tight"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Get ready for your Impact Hangout
          </motion.h2>
          <motion.p
            className="text-[#57534E] text-lg leading-relaxed mb-6 text-justify"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Set a date, choose your venue, and start spreading the word. Share your
            fundraising page with guests so they can donate before, during, or after
            your hangout. Every Naira raised goes to your chosen cause.
          </motion.p>
          <ul className="space-y-2 text-[#57534E]">
            {[
              "Share your page link with friends and family",
              "Add your hangout to the calendar and send reminders",
              "On the day, enjoy the gathering and encourage donations",
            ].map((item, i) => (
              <motion.li
                key={i}
                className="flex items-center gap-2 text-justify"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Check className="h-5 w-5 text-[#104109] flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
          <motion.div className="mt-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <Button size="lg" className="px-8 py-4 h-auto min-h-12 text-base font-bold rounded-full bg-[#104109] hover:bg-[#0d3607]" asChild>
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
