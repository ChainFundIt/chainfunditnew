import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CollectionsHero from "@/components/collections/landing/CollectionsHero";
import CollectionsSteps from "@/components/collections/landing/CollectionsSteps";
import CollectionsHighlight from "@/components/collections/landing/CollectionsHighlight";
import CollectionsCta from "@/components/collections/landing/CollectionsCta";
import CollectionsMoments from "@/components/collections/landing/CollectionsMoments";
import CollectionsFaqs from "@/components/collections/landing/CollectionsFaqs";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Everyone chips in. Nobody gets left with the bill. From weddings and birthdays to group gifts, reunions and special occasions, collect money without chasing bank transfers.",
};

export default function CollectionsLandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <CollectionsHero />
      <CollectionsSteps />
      <CollectionsHighlight />
      <CollectionsCta />
      <CollectionsMoments />
      <CollectionsFaqs />
      <Footer />
    </main>
  );
}
