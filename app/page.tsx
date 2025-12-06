import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Main from "@/components/homepage/Main";
import Partners from "@/components/homepage/Partners";
import Hero from "@/components/homepage/Hero";
import CustomerStories from "@/components/homepage/CustomerStories";
import FAQs from "@/components/homepage/faqs";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Partners />
      <Main />
      <CustomerStories />
      <FAQs />
      <Footer />

      {/* Floating Create Campaign Button - Mobile Only */}
      <Link href="/create-campaign" className="md:hidden">
        <Button className="fixed bottom-3 z-50 w-full h-14 px-6 bg-[#104901] text-white shadow-lg shadow-black/20 flex items-center gap-2 font-semibold text-base">
          <Plus className="h-5 w-5" />
          Create Campaign
        </Button>
      </Link>
    </main>
  );
}
