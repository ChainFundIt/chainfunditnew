"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAllCampaigns } from "@/hooks/use-all-campaigns";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Grid3X3, List, Heart, Share2, Eye } from "lucide-react";
import { toast } from "sonner";

const campaignReasons = [
  "Medical Emergencies",
  "Business",
  "Memorials", 
  "Events & Weddings",
  "Education",
  "Sports",
  "Charity"
];

const campaignStatuses = [
  "active",
  "completed",
  "paused",
  "cancelled"
];

export default function AllCampaignsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount" | "popular">("newest");
  
  const { campaigns, loading, error, fetchCampaigns, hasMore, loadMore } = useAllCampaigns();

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by reason
    if (selectedReason) {
      filtered = filtered.filter(campaign => campaign.reason === selectedReason);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    // Filter by active tab
    if (activeTab === "Live") {
      filtered = filtered.filter(campaign => campaign.status === "active");
    } else if (activeTab === "Completed") {
      filtered = filtered.filter(campaign => campaign.status === "completed");
    } else if (activeTab === "Trending") {
      // Show campaigns with high engagement (you can customize this logic)
      filtered = filtered.filter(campaign => 
        campaign.status === "active" && 
        (campaign.stats?.totalDonations || 0) > 10
      );
    }

    // Sort campaigns
    switch (sortBy) {
      case "newest":
        filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered = filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "amount":
        filtered = filtered.sort((a, b) => (b.stats?.totalAmount || 0) - (a.stats?.totalAmount || 0));
        break;
      case "popular":
        filtered = filtered.sort((a, b) => (b.stats?.totalDonations || 0) - (a.stats?.totalDonations || 0));
        break;
    }

    return filtered;
  }, [campaigns, searchQuery, selectedReason, selectedStatus, activeTab, sortBy]);

  // Handle search with debouncing
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedReason("");
    setSelectedStatus("");
    setSortBy("newest");
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error("Failed to load campaigns. Please try again.");
    }
  }, [error]);

  const tabs = ["All", "Live", "Completed", "Trending"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Campaigns
          </h1>
          <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
            Support causes you care about and make a difference in people's lives
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                Search Campaigns
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

            {/* Reason Filter */}
            <div className="lg:w-48">
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </Label>
              <select
                id="reason"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                {campaignReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:w-48">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                {campaignStatuses.map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <Label htmlFor="sort" className="text-sm font-medium text-gray-700 mb-2 block">
                Sort By
              </Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedReason || selectedStatus) && (
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-green-100 text-green-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Campaigns Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No campaigns found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}>
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  Load More Campaigns
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}