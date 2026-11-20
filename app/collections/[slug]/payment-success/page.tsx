"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  collectionBody,
  collectionBodySmall,
  collectionBtnOutline,
  collectionBtnPrimary,
  collectionPage,
  collectionSectionTitle,
  collectionValue,
} from "@/lib/collections/ui";

interface Contribution {
  id: string;
  amount: string;
  currency: string;
  contributorName: string | null;
  contributorEmail: string | null;
  paymentStatus: string;
  createdAt: string;
}

interface Collection {
  id: string;
  title: string;
  slug: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const slug = params.slug as string;
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const contributionId =
      searchParams.get("contribution_id") || searchParams.get("donation_id");

    if (contributionId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      fetchDetails(contributionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchDetails = async (contributionId: string) => {
    try {
      const res = await fetch(`/api/collections/contributions/${contributionId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load contribution");
      }
      setContribution(data.contribution);
      setCollection(data.collection);
    } catch (error) {
      console.error("Error fetching contribution:", error);
      toast.error("Could not load contribution details");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const target = collection || { title: "this collection", slug };
    const url = `${window.location.origin}/collections/${target.slug}`;
    if (navigator.share) {
      navigator.share({
        title: `I contributed to ${target.title}`,
        text: `I just chipped in to ${target.title}.`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className={`${collectionPage} py-12 px-4 flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104109]" />
      </div>
    );
  }

  return (
    <div className={`${collectionPage} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        <Card className="border-[#E7E5E4] shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-[#F3F8F2] rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-[#104109]" />
            </div>
            <CardTitle className={collectionSectionTitle}>
              Thank you!
            </CardTitle>
            <CardDescription className={`${collectionBody} mt-2 text-[#57534E]`}>
              Your contribution was processed successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-[#E7E5E4] bg-[#F3F8F2] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className={collectionBodySmall}>Amount</span>
                <span className="text-2xl font-bold text-[#104109]">
                  {contribution?.currency === "NGN"
                    ? "₦"
                    : contribution?.currency === "GBP"
                      ? "£"
                      : contribution?.currency === "EUR"
                        ? "€"
                        : "$"}
                  {parseFloat(contribution?.amount || "0").toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={collectionBodySmall}>Collection</span>
                <span className={`${collectionValue} text-right`}>
                  {collection?.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={collectionBodySmall}>Reference</span>
                <span className="font-mono text-sm text-[#57534E]">
                  {contribution?.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            {contribution?.contributorEmail && (
              <div className="rounded-2xl border border-[#E7E5E4] bg-[#F3F8F2] p-4 text-sm font-medium text-[#104109]">
                Confirmation sent to{" "}
                <span className="font-medium">
                  {contribution.contributorEmail}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className={`${collectionBtnOutline} w-full`}
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share collection
              </Button>
              <Button
                variant="outline"
                className={`${collectionBtnOutline} w-full`}
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4" />
                Receipt
              </Button>
            </div>

            <div className="pt-4">
              <Button
                asChild
                className={`${collectionBtnPrimary} w-full`}
                size="lg"
              >
                <Link href={`/collections/${collection?.slug || slug}`}>
                  Back to collection
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}