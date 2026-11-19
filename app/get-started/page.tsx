import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Get started | ChainFundIt",
  description: "Start a campaign for a cause, or a collection for a group.",
};

export default function GetStartedPage() {
  return (
    <div className="font-jakarta min-h-screen bg-[var(--color-background)] text-[#1C1917]">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-16 md:px-6 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#104109] md:text-5xl">
            What are you starting?
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[#57534E]">
            A campaign is a public fundraiser for a cause. A collection is a
            shared pot for a group.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-3xl border border-[#E7E5E4] bg-white md:mt-16 md:grid-cols-2">
          <Link
            href="/dashboard/campaigns/create-campaign"
            className="group flex flex-col justify-between gap-10 p-8 transition-colors hover:bg-[#F7F6F5] md:p-12"
          >
            <div>
              <p className="text-sm font-semibold text-[#57534E]">For a cause</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#104109] md:text-3xl">
                Start a campaign
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#57534E] md:text-lg">
                Raise money for medical bills, school fees, or a community
                project. You sign in, set a goal, and share a public page.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-base font-bold text-[#104109]">
              Start a campaign
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/collections/create"
            className="group flex flex-col justify-between gap-10 border-t border-[#E7E5E4] bg-[#F3F8F2] p-8 transition-colors hover:bg-[#E7F0E4] md:border-l md:border-t-0 md:p-12"
          >
            <div>
              <p className="text-sm font-semibold text-[#57534E]">For a group</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#104109] md:text-3xl">
                Start a collection
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#57534E] md:text-lg">
                Collect for a gift, event, class, or team. Share the link and
                people chip in by card — no account needed to contribute.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-base font-bold text-[#104109]">
              Start a collection
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
