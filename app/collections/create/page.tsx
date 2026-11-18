"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useGeolocationCurrency } from "@/hooks/use-geolocation-currency";
import { CollectionStepIndicator } from "@/components/collections/CollectionStepIndicator";
import { CollectionCategoryGrid } from "@/components/collections/CollectionCategoryGrid";
import {
  getCollectionCategory,
  type CollectionCategoryId,
} from "@/lib/collections/categories";

type Step = 1 | 2 | 3;

export default function CreateCollectionPage() {
  const router = useRouter();
  const { locationInfo } = useGeolocationCurrency();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  const [categoryId, setCategoryId] = useState<CollectionCategoryId | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organiserName, setOrganiserName] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueAt, setDueAt] = useState("");

  const selectedCategory = useMemo(
    () => getCollectionCategory(categoryId),
    [categoryId]
  );

  useEffect(() => {
    if (!selectedCategory) return;
    setTitle((prev) =>
      prev.trim() ? prev : selectedCategory.titlePlaceholder
    );
  }, [categoryId, selectedCategory]);

  const goToDetails = () => {
    if (!categoryId) {
      toast.error("Please choose an occasion or activity");
      return;
    }
    setStep(2);
  };

  const goToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setStep(3);
  };

  const handleCreate = async () => {
    if (!categoryId || !title.trim()) {
      toast.error("Complete all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: categoryId,
          description: description.trim() || null,
          organiserName: organiserName.trim() || undefined,
          coverImage: coverImage.trim() || null,
          currency: locationInfo?.currency.code || "USD",
          targetAmount: targetAmount || null,
          dueAt: dueAt || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          router.push(
            `/signin?redirect=${encodeURIComponent("/collections/create")}`
          );
          return;
        }
        throw new Error(data.error || "Failed to create collection");
      }

      toast.success("Collection created");
      router.push(`/collections/${data.collection.slug}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create collection"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 pt-24 pb-16">
        <Button asChild variant="ghost" className="mb-4 rounded-3xl -ml-2">
          <Link href="/collections">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <CollectionStepIndicator currentStep={step} />

        {step === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">
              What are you collecting for?
            </h1>
            <p className="text-center text-gray-600 text-sm sm:text-base mb-8 px-2">
              Choose an occasion or activity. You can use ChainFundIt to collect
              contributions for almost anything.
            </p>

            <CollectionCategoryGrid
              selectedId={categoryId}
              onSelect={setCategoryId}
            />

            <Button
              type="button"
              className="w-full mt-8 rounded-3xl h-auto py-3"
              size="lg"
              disabled={!categoryId}
              onClick={goToDetails}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Collection details
            </h1>
            {selectedCategory && (
              <p className="text-sm text-gray-600 mb-6">
                For:{" "}
                <span className="font-medium text-gray-900">
                  {selectedCategory.label}
                </span>
              </p>
            )}

            <form onSubmit={goToReview} className="space-y-5">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="organiserName">Organiser name</Label>
                <Input
                  id="organiserName"
                  value={organiserName}
                  onChange={(e) => setOrganiserName(e.target.value)}
                  placeholder="How contributors see you"
                />
              </div>
              <div>
                <Label htmlFor="description">Tell people more (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Suggested amounts, what the money is for, etc."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetAmount">Target (optional)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dueAt">Due by (optional)</Label>
                  <Input
                    id="dueAt"
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="coverImage">Cover image URL (optional)</Label>
                <Input
                  id="coverImage"
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-3xl h-auto py-3"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-3xl h-auto py-3"
                >
                  Review
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Review your collection
              </h1>
              <p className="text-sm text-gray-600">
                Double-check before you publish your link.
              </p>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Occasion</dt>
                <dd className="font-medium text-gray-900">
                  {selectedCategory?.label}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Title</dt>
                <dd className="font-medium text-gray-900">{title}</dd>
              </div>
              {organiserName && (
                <div>
                  <dt className="text-gray-500">Organiser</dt>
                  <dd className="font-medium text-gray-900">{organiserName}</dd>
                </div>
              )}
              {description && (
                <div>
                  <dt className="text-gray-500">Description</dt>
                  <dd className="text-gray-900">{description}</dd>
                </div>
              )}
              {targetAmount && (
                <div>
                  <dt className="text-gray-500">Target</dt>
                  <dd className="font-medium text-gray-900">
                    {locationInfo?.currency.code || "USD"} {targetAmount}
                  </dd>
                </div>
              )}
              {dueAt && (
                <div>
                  <dt className="text-gray-500">Due by</dt>
                  <dd className="font-medium text-gray-900">
                    {new Date(dueAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>

            <p className="text-xs text-gray-500">
              You need to be signed in to publish. Contributors can pay without
              an account.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-3xl h-auto py-3"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 rounded-3xl h-auto py-3"
                disabled={submitting}
                onClick={handleCreate}
              >
                {submitting ? "Creating..." : "Create collection"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}