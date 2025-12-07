"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUnifiedItems } from "@/hooks/use-unified-items";
import { UnifiedItemCard } from "@/components/campaign/UnifiedItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Heart,
  Share2,
  Eye,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import ClientToaster from "@/components/ui/client-toaster";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "./Navbar";
import { useGeolocation, useCampaignFiltering } from "@/hooks/use-geolocation";
import Footer from "@/components/layout/Footer";
import { getRelatedCategories } from "@/lib/utils/category-mapping";

// Combined categories for campaigns and charities
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
  "Health", // Charity category
  "Children", // Charity category
  "Children & Youth", // Charity category
  "Housing", // Charity category
  "Housing & Shelter", // Charity category
  "Environment", // Charity category
  "Arts", // Charity category
  "Disaster Relief", // Charity category
  "Employment & Training", // Charity category
  "Global", // Charity category
  "Uncategorized",
];

const campaignStatuses = ["active", "closed", "trending"];
const itemTypes = ["all", "campaign", "charity"];

export default function AllCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "campaign" | "charity">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "amount" | "popular"
  >("newest");
  const [timeoutError, setTimeoutError] = useState(false);

  const { items, loading, error, hasMore, loadMore, updateFilters } = useUnifiedItems();
  
  // Geolocation and filtering
  const { geolocation, loading: locationLoading, error: locationError } = useGeolocation();
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

      // Filter by type
      if (selectedType !== "all") {
        filtered = filtered.filter(item => item.type === selectedType);
      }

      // Filter by geolocation (only for campaigns with currency)
      if (geolocation && !locationLoading) {
        filtered = filtered.filter((item) => {
          if (item.type === 'campaign' && item.currency) {
            return shouldShowCampaign(item.currency);
          }
          // Charities are shown regardless of geolocation
          return item.type === 'charity';
        });
      }

      // Filter by search query
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase().trim();
        filtered = filtered.filter((item) => {
          try {
            return (
              (item.title?.toLowerCase() || '').includes(query) ||
              (item.description?.toLowerCase() || '').includes(query) ||
              (item.creatorName?.toLowerCase() || '').includes(query) ||
              (item.mission?.toLowerCase() || '').includes(query)
            );
          } catch (error) {
            console.warn('Error filtering item:', error, item);
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
            const amountA = a.type === 'campaign' 
              ? (a.currentAmount || 0)
              : (Number(a.totalReceived) || 0);
            const amountB = b.type === 'campaign'
              ? (b.currentAmount || 0)
              : (Number(b.totalReceived) || 0);
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
      console.error('Error filtering items:', error);
      return items;
    }
  }, [
    items,
    debouncedSearchQuery,
    selectedCategory,
    selectedStatus,
    selectedType,
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
      console.error('Error handling search input:', error);
      setSearchQuery("");
    }
  };

  const clearFilters = () => {
    try {
      setSearchQuery("");
      setDebouncedSearchQuery("");
      setSelectedCategory("");
      setSelectedStatus("");
      setSelectedType("all");
      setSortBy("newest");
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  useEffect(() => {
    updateFilters({ 
      status: selectedStatus && selectedStatus.trim() ? selectedStatus : undefined, 
      reason: selectedCategory && selectedCategory.trim() ? selectedCategory : undefined,
      category: selectedCategory && selectedCategory.trim() ? selectedCategory : undefined,
      type: selectedType,
    });
  }, [selectedStatus, selectedCategory, selectedType, updateFilters]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <Navbar />
      {/* Hero Section */}
      <div className="mt-20 relative bg-gradient-to-r from-brand-green-light to-brand-green-dark text-white py-16">
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Campaigns & Charities
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto">
            Support causes you care about and make a difference in people&apos;s
            lives
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Search Campaigns & Charities
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by title, description, or creator..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
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

            {/* Type Filter */}
            <div className="lg:w-48">
              <Label
                htmlFor="type"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Type
              </Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setSelectedType(value as "all" | "campaign" | "charity")}
              >
                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-dark">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {itemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
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
          {(searchQuery || selectedCategory || selectedStatus || selectedType !== "all") && (
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
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
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
                <p className="text-gray-600">Loading campaigns & charities...</p>
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
                : 'Try adjusting your search criteria or filters'}
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
      <ClientToaster />
      <Footer />
    </div>
  );
}
