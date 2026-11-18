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
import { CheckCircle, Download, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import confetti from "canvas-confetti";

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
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-600">
              Thank you!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Your contribution was processed successfully
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="text-2xl font-bold text-green-600">
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
                <span className="text-gray-600">Collection</span>
                <span className="font-medium text-gray-900 text-right">
                  {collection?.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reference</span>
                <span className="font-mono text-sm text-gray-600">
                  {contribution?.id.slice(0, 8)}...
                </span>
              </div>
            </div>

            {contribution?.contributorEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Confirmation sent to{" "}
                <span className="font-medium">
                  {contribution.contributorEmail}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full rounded-3xl h-auto py-3"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Share collection
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-3xl h-auto py-3"
                onClick={() => window.print()}
              >
                <Download className="h-4 w-4" />
                Receipt
              </Button>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                asChild
                className="w-full rounded-3xl h-auto py-3"
                size="lg"
              >
                <Link href={`/collections/${collection?.slug || slug}`}>
                  Back to collection
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full rounded-3xl h-auto py-3"
              >
                <Link href="/collections">
                  <ArrowLeft className="h-4 w-4" />
                  Browse collections
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