"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  collectionBody,
  collectionBodySmall,
  collectionBtnOutline,
  collectionBtnOutlineSmall,
  collectionBtnPrimary,
  collectionLabel,
  collectionPage,
  collectionSectionTitle,
  collectionValue,
} from "@/lib/collections/ui";

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

  const selectCategory = (id: CollectionCategoryId) => {
    setCategoryId(id);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    if (step === 1) {
      router.push("/collections");
      return;
    }
    setStep(step === 3 ? 2 : 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className={collectionPage}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <Button
          type="button"
          variant="ghost"
          className={`${collectionBtnOutlineSmall} mb-4`}
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <CollectionStepIndicator currentStep={step} />

        {step === 1 && (
          <div>
            <h1 className={`${collectionSectionTitle} text-center mb-3`}>
              What are you collecting for?
            </h1>
            <p className={`${collectionBody} text-center mb-8 px-2`}>
              Choose an occasion or activity. You can use ChainFundIt to collect
              contributions for almost anything.
            </p>

            <CollectionCategoryGrid
              selectedId={categoryId}
              onSelect={selectCategory}
            />
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h1 className="font-jakarta text-xl font-bold tracking-tight text-[#104109] md:text-2xl mb-1">
              Collection details
            </h1>
            {selectedCategory && (
              <p className={`${collectionBodySmall} mb-6`}>
                For:{" "}
                <span className={collectionValue}>
                  {selectedCategory.label}
                </span>
              </p>
            )}

            <form onSubmit={goToReview} className="space-y-5">
              <div>
                <Label className={collectionLabel} htmlFor="title">Title</Label>
                <Input
                  className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className={collectionLabel} htmlFor="organiserName">Organiser name</Label>
                <Input
                  className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                  id="organiserName"
                  value={organiserName}
                  onChange={(e) => setOrganiserName(e.target.value)}
                  placeholder="How contributors see you"
                />
              </div>
              <div>
                <Label className={collectionLabel} htmlFor="description">Tell people more (optional)</Label>
                <Textarea
                  className="rounded-2xl border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Suggested amounts, what the money is for, etc."
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className={collectionLabel} htmlFor="targetAmount">Target (optional)</Label>
                  <Input
                  className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                    id="targetAmount"
                    type="number"
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label className={collectionLabel} htmlFor="dueAt">Due by (optional)</Label>
                  <Input
                  className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
                    id="dueAt"
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className={collectionLabel} htmlFor="coverImage">Cover image URL (optional)</Label>
                <Input
                  className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
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
                  className={`${collectionBtnOutline} flex-1`}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className={`${collectionBtnPrimary} flex-1`}
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
              <h1 className="font-jakarta text-xl font-bold tracking-tight text-[#104109] md:text-2xl mb-1">
                Review your collection
              </h1>
              <p className={collectionBodySmall}>
                Double-check before you publish your link.
              </p>
            </div>

            <dl className={`space-y-4 ${collectionBodySmall}`}>
              <div>
                <dt>Occasion</dt>
                <dd className={collectionValue}>
                  {selectedCategory?.label}
                </dd>
              </div>
              <div>
                <dt>Title</dt>
                <dd className={collectionValue}>{title}</dd>
              </div>
              {organiserName && (
                <div>
                  <dt>Organiser</dt>
                  <dd className={collectionValue}>{organiserName}</dd>
                </div>
              )}
              {description && (
                <div>
                  <dt>Description</dt>
                  <dd className="text-[#1C1917]">{description}</dd>
                </div>
              )}
              {targetAmount && (
                <div>
                  <dt>Target</dt>
                  <dd className={collectionValue}>
                    {locationInfo?.currency.code || "USD"} {targetAmount}
                  </dd>
                </div>
              )}
              {dueAt && (
                <div>
                  <dt>Due by</dt>
                  <dd className={collectionValue}>
                    {new Date(dueAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>

            <p className="text-sm leading-relaxed text-[#78716C]">
              You need to be signed in to publish. Contributors can pay without
              an account.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className={`${collectionBtnOutline} flex-1`}
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                className={`${collectionBtnPrimary} flex-1`}
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