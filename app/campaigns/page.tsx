"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUnifiedItems } from "@/hooks/use-unified-items";
import { UnifiedItemCard } from "@/components/campaign/UnifiedItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Grid3X3, List, MapPin } from "lucide-react";
import ClientToaster from "@/components/ui/client-toaster";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeolocation, useCampaignFiltering } from "@/hooks/use-geolocation";
import Footer from "@/components/layout/Footer";
import { getRelatedCategories } from "@/lib/utils/category-mapping";
import Navbar from "@/components/layout/Navbar";

// Campaign categories only
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

const campaignStatuses = ["active", "closed", "trending"];
const itemTypes = ["campaign"];

export default function AllCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "campaign" | "charity"
  >("campaign");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "amount" | "popular"
  >("newest");
  const [timeoutError, setTimeoutError] = useState(false);

  const { items, loading, error, hasMore, loadMore, updateFilters } =
    useUnifiedItems();

  // Geolocation and filtering
  const {
    geolocation,
    loading: locationLoading,
    error: locationError,
  } = useGeolocation();
  const { shouldShowCampaign } = useCampaignFiltering(geolocation);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          setTimeoutError(true);
          console.warn(
            "Campaigns loading timeout - taking longer than expected"
          );
        }
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setTimeoutError(false);
    }
  }, [loading]);

  const filteredItems = useMemo(() => {
    try {
      let filtered = [...items];

      // Filter by type - only show campaigns
      filtered = filtered.filter((item) => item.type === "campaign");

      // Filter by geolocation (only for campaigns with currency)
      if (geolocation && !locationLoading) {
        filtered = filtered.filter((item) => {
          if (item.type === "campaign" && item.currency) {
            return shouldShowCampaign(item.currency);
          }
          return true;
        });
      }

      // Filter by search query
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase().trim();
        filtered = filtered.filter((item) => {
          try {
            return (
              (item.title?.toLowerCase() || "").includes(query) ||
              (item.description?.toLowerCase() || "").includes(query) ||
              (item.creatorName?.toLowerCase() || "").includes(query) ||
              (item.mission?.toLowerCase() || "").includes(query)
            );
          } catch (error) {
            console.warn("Error filtering item:", error, item);
            return false;
          }
        });
      }

      // Filter by category/reason
      if (selectedCategory) {
        const relatedCategories = getRelatedCategories(selectedCategory);
        filtered = filtered.filter((item) =>
          relatedCategories.includes(item.category)
        );
      }

      // Filter by status (only for campaigns)
      if (selectedStatus === "trending") {
        filtered = filtered.filter(
          (item) =>
            item.type === "campaign" &&
            item.status === "active" &&
            (item.stats?.totalDonations || 0) > 10
        );
      } else if (selectedStatus && selectedStatus !== "trending") {
        filtered = filtered.filter(
          (item) => item.type === "campaign" && item.status === selectedStatus
        );
      }

      // Sort
      switch (sortBy) {
        case "newest":
          filtered = filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          filtered = filtered.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "amount":
          filtered = filtered.sort((a, b) => {
            const amountA =
              a.type === "campaign"
                ? a.currentAmount || 0
                : Number(a.totalReceived) || 0;
            const amountB =
              b.type === "campaign"
                ? b.currentAmount || 0
                : Number(b.totalReceived) || 0;
            return amountB - amountA;
          });
          break;
        case "popular":
          filtered = filtered.sort((a, b) => {
            const donationsA = a.stats?.totalDonations || 0;
            const donationsB = b.stats?.totalDonations || 0;
            return donationsB - donationsA;
          });
          break;
      }

      return filtered;
    } catch (error) {
      console.error("Error filtering items:", error);
      return items;
    }
  }, [
    items,
    debouncedSearchQuery,
    selectedCategory,
    selectedStatus,
    sortBy,
    geolocation,
    shouldShowCampaign,
    locationLoading,
  ]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;
      setSearchQuery(value);
    } catch (error) {
      console.error("Error handling search input:", error);
      setSearchQuery("");
    }
  };

  const clearFilters = () => {
    try {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSelectedCategory("");
      setSelectedStatus("");
      setSelectedType("campaign");
      setSortBy("newest");
    } catch (error) {
      console.error("Error clearing filters:", error);
    }
  };

  useEffect(() => {
    updateFilters({
      status:
        selectedStatus && selectedStatus.trim() ? selectedStatus : undefined,
      reason:
        selectedCategory && selectedCategory.trim()
          ? selectedCategory
          : undefined,
      category:
        selectedCategory && selectedCategory.trim()
          ? selectedCategory
          : undefined,
      type: "campaign",
    });
  }, [selectedStatus, selectedCategory, updateFilters]);

  return (
    <div className="font-jakarta">
      <Navbar />
      {/* Hero Section */}
      <div className="bg-[#104109] py-[5rem] flex items-center justify-center">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative z-0">
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            Discover Campaigns
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Support causes you care about and make a difference in people&apos;s
            lives
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="md:flex hidden  absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>
      <div className="bg-white px-4 py-20 flex justify-center relative" style={{zIndex: "5"}}>
        <div className="max-w-[80rem] w-full">
          {/* Location Indicator */}
          {geolocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">
                  Showing campaigns for {geolocation.country}
                </span>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Search Campaigns
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Search by title, description, or creator..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md shadow-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="lg:w-48">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                    <SelectValue placeholder="All Categories" />
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

              {/* Status Filter */}
              <div className="lg:w-48">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Status
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {campaignStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <Label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Sort By
                </Label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="amount">Highest Amount</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || selectedStatus) && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "item" : "items"} found
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#5F8555] text-white"
                    : "text-[#104901]"
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-[#5F8555] text-white"
                    : "text-[#104901]"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Campaigns Grid/List */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              {timeoutError ? (
                <>
                  <div className="text-orange-500 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-plusjakarta text-gray-600 mb-2">
                    Loading is taking longer than expected
                  </h3>
                  <p className="text-gray-500 mb-4">
                    This might be due to a slow database connection or network
                    issue
                  </p>
                  <Button
                    onClick={() => {
                      setTimeoutError(false);
                      loadMore();
                    }}
                    className="bg-[#5F8555] text-white"
                  >
                    Retry Loading
                  </Button>
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F8555] mb-4"></div>
                  <p className="text-gray-600">Loading campaigns...</p>
                </>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-plusjakarta text-gray-600 mb-2">
                No items found
              </h3>
              <p className="text-gray-500 mb-2">
                {items.length > 0
                  ? `${items.length} item(s) were filtered out. Try adjusting your search criteria or filters.`
                  : "Try adjusting your search criteria or filters"}
              </p>
              {error && (
                <p className="text-red-500 text-sm mt-2">Error: {error}</p>
              )}
            </div>
          ) : (
            <>
              <div
                className={`${
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }`}
              >
                {filteredItems.map((item) => (
                  <UnifiedItemCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    viewMode={viewMode}
                    geolocation={geolocation}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={loadMore}
                    className="bg-[#5F8555] text-white px-8 py-3"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ClientToaster />
      <Footer />
    </div>
  );
}
