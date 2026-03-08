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
  ArrowRight,
  GraduationCap,
  HeartPulse,
  UtensilsCrossed,
  Check,
  Users,
  Church,
  Building2,
  Sparkles,
  UsersRound,
  LogIn,
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

export default function ImpactHangoutPage() {
  const [myHangouts, setMyHangouts] = useState<MyHangout[] | null>(null);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessSending, setAccessSending] = useState(false);
  const [accessSent, setAccessSent] = useState(false);

  useEffect(() => {
    fetch("/api/events/impact-hangout/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { hangouts: [] }))
      .then((data) => setMyHangouts(data?.hangouts ?? []))
      .catch(() => setMyHangouts([]));
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
    } finally {
      setAccessSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero — full-bleed meal image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event1.png"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/40" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-4xl text-center text-white">
          <motion.h1
            className="font-jakarta text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            THE IMPACT HANGOUT
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            This March, we&apos;re inviting people across the country to turn
            simple gatherings into moments of impact.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              className="bg-white text-brand-green-dark hover:bg-white/90 hover:text-brand-green-dark border-2 border-white text-base px-8 py-6 rounded-none font-semibold shadow-lg"
              asChild
            >
              <Link href="/events/register">
                Register Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
          <motion.div
            className="mt-6 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white/90 text-sm">Already registered?</p>
            {myHangouts !== null && myHangouts.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-none border-white text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href={`/events/${encodeURIComponent(myHangouts[0].slug)}`}>
                  <LogIn className="mr-2 h-4 w-4" /> View my hangout
                </Link>
              </Button>
            ) : (
              <form onSubmit={handleSendAccessLink} className="flex flex-wrap items-center justify-center gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  className="max-w-[220px] rounded-none border-white/80 bg-white/10 text-white placeholder:text-white/70 focus:ring-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={accessSending || accessSent}
                  className="rounded-none border-white text-white hover:bg-white/10 hover:text-white"
                >
                  {accessSent ? "Check your email" : accessSending ? "Sending…" : "Send me the link"}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* What Is — split: text + Nigerian spread image, staggered text */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <motion.div
              className="order-2 md:order-1"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
            >
              <motion.h2
                className="font-jakarta text-2xl md:text-4xl font-bold text-brand-green-dark mb-6"
                variants={fadeInUp}
              >
                What is the Impact Hangout?
              </motion.h2>
              <motion.p
                className="text-gray-700 text-lg leading-relaxed mb-4"
                variants={fadeInUp}
              >
                This March, we&apos;re inviting people across the country to turn
                simple gatherings into moments of impact.
              </motion.p>
              <motion.p
                className="text-gray-700 text-lg leading-relaxed mb-4"
                variants={fadeInUp}
              >
                It could be a relaxed breakfast with friends, an evening
                hangout with small chops and suya, a campus meetup, or even an
                office meal. Whatever the setting, your table can become a place
                where real change begins.
              </motion.p>
              <motion.p
                className="text-gray-700 text-lg leading-relaxed mb-8"
                variants={fadeInUp}
              >
                The Impact Hangout is all about bringing people together — not
                just to eat and connect, but to support meaningful causes at the
                same time.
              </motion.p>
              <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" className="rounded-none" asChild>
                  <Link href="/events/register">
                    Register to host <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="order-1 md:order-2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
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
      <section className="relative min-h-[520px] md:min-h-[560px] flex items-start py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/events/event2.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70 backdrop-blur-sm" />
        </div>
        <motion.div
          className="relative z-10 w-full max-w-full pl-4 md:pl-8 pr-4 md:pr-8 ml-0 mr-auto text-white text-left"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          <motion.h2
            className="font-jakarta text-2xl md:text-4xl font-bold mb-4 tracking-tight"
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
            className="text-base md:text-lg leading-relaxed mb-6 text-white/90 max-w-3xl"
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
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-amber-50/40 to-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h2
            className="font-jakarta text-2xl md:text-4xl font-bold text-brand-green-dark mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-5 gap-10 items-start">
            <motion.div
              className="md:col-span-2 relative aspect-[3/4] rounded-2xl overflow-hidden hidden md:block"
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/events/event6.png"
                alt="Food spread - rice, plantains, community meal"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 0, 40vw"
              />
            </motion.div>
            <motion.ol
              className="md:col-span-3 space-y-6"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-60px" }}
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
                  icons: true,
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
                  className="flex gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white shadow-sm"
                  variants={fadeInUp}
                  whileHover={{ x: 6, boxShadow: "0 10px 40px -10px rgba(16, 73, 1, 0.2)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <span className="flex-shrink-0 w-11 h-11 rounded-full bg-brand-green-dark text-white font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-jakarta font-semibold text-lg text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-base">{item.text}</p>
                    {item.icons && (
                      <div className="flex gap-3 mt-2 text-brand-green-dark">
                        <GraduationCap className="h-5 w-5" />
                        <HeartPulse className="h-5 w-5" />
                        <UtensilsCrossed className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </div>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button size="lg" className="rounded-none" asChild>
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
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/80 p-8 md:p-10">
              <motion.h2
                className="font-jakarta text-2xl md:text-4xl font-bold text-brand-green-dark mb-6"
                variants={fadeInUp}
              >
                Where Do the Donations Go?
              </motion.h2>
              <motion.p
                className="text-gray-700 text-lg leading-relaxed mb-4"
                variants={fadeInUp}
              >
                Transparency matters.
              </motion.p>
              <motion.p
                className="text-gray-700 text-lg leading-relaxed mb-6"
                variants={fadeInUp}
              >
                All campaigns featured in the Impact Hangout are verified through
                ChainFundIt, and funds raised are sent directly to the appropriate
                institutions — such as schools, hospitals, or verified service
                providers.
              </motion.p>
              <motion.p
                className="text-gray-700 text-lg mb-4"
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
                      <Check className="h-5 w-5 text-brand-green-dark flex-shrink-0" />
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
          <div className="absolute inset-0 bg-brand-green-dark/88 backdrop-blur-[2px]" />
          <motion.div
            className="relative z-10 container mx-auto px-4 max-w-3xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
          >
            <motion.h2
              className="font-jakarta text-2xl md:text-4xl font-bold text-white mb-3"
              variants={fadeInUp}
            >
              Who Can Host?
            </motion.h2>
            <motion.p
              className="text-white/90 text-lg md:text-xl mb-6"
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
      <section className="py-20 md:py-24 bg-gray-50">
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="font-jakarta text-2xl md:text-4xl font-bold text-brand-green-dark mb-6"
            variants={fadeInUp}
          >
            When Can I Host?
          </motion.h2>
          <motion.p
            className="text-gray-700 text-lg leading-relaxed mb-4"
            variants={fadeInUp}
          >
            The campaign runs throughout March, but you can host whenever it
            works for you.
          </motion.p>
          <motion.p
            className="text-gray-700 text-lg leading-relaxed mb-4"
            variants={fadeInUp}
          >
            Morning or evening. Breakfast or dinner. Small circle or larger
            group.
          </motion.p>
          <motion.p
            className="text-gray-700 text-lg leading-relaxed"
            variants={fadeInUp}
          >
            What matters most isn&apos;t how elaborate the gathering is — it&apos;s
            the purpose behind it.
          </motion.p>
        </motion.div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-brand-green-dark/95 via-brand-green-dark/80 to-brand-green-dark/70" />
        </div>
        <motion.div
          className="relative z-10 container mx-auto px-4 max-w-3xl text-white"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="font-jakarta text-2xl md:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            Turn Your Gathering Into Impact
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-white/95 mb-4"
            variants={fadeInUp}
          >
            A simple breakfast can help keep a student in school. An evening
            hangout can support someone&apos;s medical care. A shared meal can
            change a life.
          </motion.p>
          <motion.p
            className="text-lg text-white/90 mb-10"
            variants={fadeInUp}
          >
            Start your Impact Hangout today. Register now. Choose a cause.
            Begin raising funds.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="bg-white text-brand-green-dark hover:bg-white/90 border-2 border-white rounded-none font-semibold"
                asChild
              >
                <Link href="/events/register" className="inline-flex items-center">
                  Register Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 hover:text-white rounded-none"
                asChild
              >
                <Link href="/campaigns">Choose Your Cause</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeInUp} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 hover:text-white rounded-none"
                asChild
              >
                <Link href="/campaigns">Start Raising Funds</Link>
              </Button>
            </motion.div>
          </div>
          </motion.div>
      </section>

      {/* Featured Campaigns — staggered list */}
      <section className="py-20 md:py-24 bg-white border-t border-gray-100">
        <motion.div
          className="container mx-auto px-4 max-w-3xl"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            className="font-jakarta text-2xl md:text-4xl font-bold text-brand-green-dark mb-6"
            variants={fadeInUp}
          >
            Featured Campaigns
          </motion.h2>
          <motion.p
            className="text-gray-700 mb-8"
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
                  className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 hover:border-brand-green-dark hover:bg-green-50/50 transition-colors text-brand-green-dark font-medium group"
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
