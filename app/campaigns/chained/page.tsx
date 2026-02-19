"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { R2Image } from "@/components/ui/r2-image";
import { formatCurrency } from "@/lib/utils/currency";
import { getRelatedCategories } from "@/lib/utils/category-mapping";
import {
  ArrowRight,
  Link2,
  Percent,
  Search,
  Shield,
  Users,
} from "lucide-react";

type ChainedCampaign = {
  id: string;
  slug: string;
  title: string;
  description: string;
  reason: string | null;
  fundraisingFor: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[];
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  isActive: boolean;
  isChained: boolean;
  chainerCommissionRate: number;
  createdAt: string;
  updatedAt: string;
  creatorName?: string | null;
  creatorAvatar?: string | null;
  stats?: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
};

const allCategories = [
  "Emergency",
  "Business",
  "Memorials",
  "Education",
  "Sports",
  "Religion",
  "Family",
  "Medical",
  "Welfare",
  "Charity",
  "Community",
  "Creative",
  "Uncategorized",
];

type SortOption = "newest" | "amount" | "commission";

export default function ChainedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ChainedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("commission");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          status: "active",
          limit: "100",
        });

        const response = await fetch(`/api/campaigns?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`Failed to load campaigns (${response.status})`);
        }

        const data = await response.json();
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error("Unexpected response when loading campaigns");
        }

        const rawCampaigns = data.data as any[];
        const chainedOnly = rawCampaigns
          .filter((c) => c.isChained)
          .map<ChainedCampaign>((c) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            description: c.description,
            reason: c.reason ?? "Uncategorized",
            fundraisingFor: c.fundraisingFor ?? null,
            coverImageUrl: c.coverImageUrl ?? null,
            galleryImages: Array.isArray(c.galleryImages)
              ? c.galleryImages
              : [],
            goalAmount:
              typeof c.goalAmount === "string"
                ? parseFloat(c.goalAmount)
                : c.goalAmount,
            currentAmount:
              typeof c.currentAmount === "string"
                ? parseFloat(c.currentAmount)
                : c.currentAmount,
            currency: c.currency,
            status: c.status,
            isActive: c.isActive,
            isChained: Boolean(c.isChained),
            chainerCommissionRate:
              typeof c.chainerCommissionRate === "string"
                ? parseFloat(c.chainerCommissionRate)
                : c.chainerCommissionRate,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            creatorName: c.creatorName ?? null,
            creatorAvatar: c.creatorAvatar ?? null,
            stats: c.stats,
          }));

        setCampaigns(chainedOnly);
      } catch (err) {
        console.error("Error fetching chained campaigns:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load campaigns"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((campaign) => {
        const fields = [
          campaign.title,
          campaign.description,
          campaign.creatorName || "",
          campaign.reason || "",
          campaign.fundraisingFor || "",
        ];
        return fields.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    if (selectedCategory) {
      const relatedCategories = getRelatedCategories(selectedCategory);
      result = result.filter((campaign) =>
        relatedCategories.includes(campaign.reason || "Uncategorized")
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;
      case "amount":
        result.sort(
          (a, b) =>
            (b.currentAmount || 0) / Math.max(b.goalAmount || 1, 1) -
            (a.currentAmount || 0) / Math.max(a.goalAmount || 1, 1)
        );
        break;
      case "commission":
      default:
        result.sort(
          (a, b) =>
            (b.chainerCommissionRate || 0) -
            (a.chainerCommissionRate || 0)
        );
        break;
    }

    return result;
  }, [campaigns, searchQuery, selectedCategory, sortBy]);

  const totalCampaigns = campaigns.length;
  const averageCommission =
    totalCampaigns > 0
      ? campaigns.reduce(
        (sum, c) => sum + (c.chainerCommissionRate || 0),
        0
      ) / totalCampaigns
      : 0;
  const averageProgress =
    totalCampaigns > 0
      ? campaigns.reduce((sum, c) => {
        const progress =
          c.goalAmount > 0
            ? Math.min(
              100,
              Math.round((c.currentAmount / c.goalAmount) * 100)
            )
            : 0;
        return sum + progress;
      }, 0) / totalCampaigns
      : 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("commission");
  };

  return (
    <div className="font-jakarta">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#104109] py-[5rem] flex items-center justify-center">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative z-0">
          <div className="font-extrabold text-white text-[3rem] md:text-[4rem] leading-[3.2rem] md:leading-[4rem] text-center">
            Ambassador-Ready Campaigns
          </div>
          <div className="text-lg md:text-xl text-[#d1fae5] text-center max-w-2xl">
            Browse campaigns where creators have explicitly{" "}
            <span className="font-semibold">enabled chaining</span>{" "}
            so you can share, raise funds, and earn commissions as an
            ambassador.
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]" />
          <div className="md:flex hidden absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]" />
        </div>
      </div>

      <div className="bg-white px-4 py-16 flex justify-center relative">
        <div className="max-w-[80rem] w-full space-y-8">
          {/* How it works + quick stats */}
          <div className="bg-[#F0F9EC] border border-[#C6E7C0] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#104109] flex items-center justify-center">
                <Link2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-[#104109]">
                How chaining works
              </h2>
            </div>
            <p className="text-sm text-[#1f2937] mb-3">
              Creators can enable chaining for their campaigns in the
              admin dashboard. When chaining is allowed:
            </p>
            <ul className="list-disc list-inside text-sm text-[#1f2937] space-y-1">
              <li>You can be an ambassador and help promote the campaign.</li>
              <li>
                Share your unique referral link with your audience.
              </li>
              <li>
                Earn a commission on every successful donation you help
                bring in.
              </li>
            </ul>
          </div>

          {/* <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-[#104109]" />
                <span className="font-medium">
                  {totalCampaigns}{" "}
                  {totalCampaigns === 1 ? "campaign" : "campaigns"} open to
                  ambassadors
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Percent className="h-4 w-4 text-[#104109]" />
                <span>
                  Avg. commission:{" "}
                  <span className="font-semibold">
                    {averageCommission.toFixed(1)}%
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-[#104109]" />
                <span>
                  Avg. progress:{" "}
                  <span className="font-semibold">
                    {averageProgress.toFixed(0)}%
                  </span>{" "}
                  of goal reached
                </span>
              </div>
            </div> */}

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Search campaigns
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by title, description, creator..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-green-dark rounded-md shadow-none"
                  />
                </div>
              </div>

              <div className="lg:w-52">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {allCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:w-52">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sort by
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(value) =>
                    setSortBy(value as SortOption)
                  }
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="commission">
                        Highest commission first
                      </SelectItem>
                      <SelectItem value="amount">
                        Highest progress towards goal
                      </SelectItem>
                      <SelectItem value="newest">
                        Newest campaigns
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || selectedCategory || sortBy !== "commission") && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F8555] mb-4" />
              <p className="text-gray-600">Loading ambassador campaigns...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 max-w-xl mx-auto">
              <p className="text-red-600 font-medium mb-2">
                Failed to load campaigns
              </p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <Button
                className="bg-[#5F8555] text-white px-6"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // trigger re-fetch by resetting campaigns; useEffect runs on mount only,
                  // so just reload the page as a simple, reliable fallback
                  window.location.reload();
                }}
              >
                Try again
              </Button>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-20 max-w-xl mx-auto">
              <p className="text-xl font-semibold text-gray-700 mb-2">
                No ambassador-ready campaigns found
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Try adjusting your search or category filters, or check back
                later as more creators enable chaining from their admin
                dashboard.
              </p>
              <Button
                variant="outline"
                className="border-[#5F8555] text-[#104109]"
                onClick={handleClearFilters}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {filteredCampaigns.length}{" "}
                  {filteredCampaigns.length === 1 ? "campaign" : "campaigns"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCampaigns.map((campaign) => {
                  const progress =
                    campaign.goalAmount > 0
                      ? Math.min(
                        100,
                        Math.round(
                          (campaign.currentAmount / campaign.goalAmount) *
                          100
                        )
                      )
                      : 0;

                  const createdWithin7Days =
                    new Date().getTime() -
                    new Date(campaign.createdAt).getTime() <
                    7 * 24 * 60 * 60 * 1000;

                  const mainImage =
                    (campaign.galleryImages &&
                      campaign.galleryImages.find(
                        (img) => img && img !== "undefined"
                      )) ||
                    campaign.coverImageUrl ||
                    null;

                  return (
                    <a
                      key={campaign.id}
                      href={`/campaign/${campaign.slug}`}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#5F8555] hover:shadow-lg transition-all flex flex-col overflow-hidden"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        {mainImage ? (
                          <R2Image
                            src={mainImage}
                            alt={campaign.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            width={400}
                            height={160}
                          />
                        ) : (
                          <div className="h-full w-full bg-[#F0F9EC] flex items-center justify-center text-[#104109] text-sm">
                            No image
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {campaign.reason && (
                            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
                              {campaign.reason}
                            </span>
                          )}
                          {createdWithin7Days && (
                            <span className="inline-flex items-center rounded-full bg-[#104109] px-3 py-1 text-xs font-medium text-white shadow-sm">
                              New
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white gap-1">
                          <Percent className="h-3 w-3" />
                          <span>
                            {campaign.chainerCommissionRate.toFixed(1)}%{" "}
                            commission
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col p-4 space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {campaign.title}
                          </h3>
                          {campaign.creatorName && (
                            <p className="text-xs text-gray-500">
                              by {campaign.creatorName}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#5F8555]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span className="font-medium text-gray-800">
                              {formatCurrency(
                                campaign.currentAmount,
                                campaign.currency
                              )}
                            </span>
                            <span className="text-gray-500">
                              {progress}% of{" "}
                              {formatCurrency(
                                campaign.goalAmount,
                                campaign.currency
                              )}
                            </span>
                          </div>
                          {campaign.stats && (
                            <div className="flex justify-between items-center text-[11px] text-gray-500">
                              <span>
                                {campaign.stats.totalDonations} donations
                              </span>
                              <span>
                                {campaign.stats.uniqueDonors} supporters
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            className="w-full text-xs flex items-center justify-center gap-1 border-[#5F8555] text-[#104109] group-hover:bg-[#5F8555] group-hover:text-white"
                          >
                            View campaign
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

