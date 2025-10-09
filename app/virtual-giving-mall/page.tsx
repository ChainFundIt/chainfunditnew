"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Search,
  Filter,
  Globe,
  Shield,
  Users,
  Stethoscope,
  GraduationCap,
  Home,
  TreePine,
  Music,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCharities, useCharityCategories } from "@/hooks/use-charities";
import Footer from "@/components/layout/Footer";

// Category icon mapping
const categoryIcons: Record<string, any> = {
  "Health": Stethoscope,
  "Children": Users,
  "Children & Youth": Users,
  "Education": GraduationCap,
  "Community": Home,
  "Environment": TreePine,
  "Arts": Music,
  "Housing": Home,
  "Housing & Shelter": Home,
  "Global": Globe,
  "Disaster Relief": Shield,
  "Hunger & Poverty": Heart,
  "Employment & Training": BookOpen,
};

export default function VirtualGivingMallPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { charities, loading, error } = useCharities({
    search: searchQuery || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    verified: true,
    active: true,
    limit: 100,
  });

  const { categories: apiCategories } = useCharityCategories();

  const categories = [
    { id: "all", name: "All Categories", icon: Globe },
    ...apiCategories.map((cat) => ({
      id: cat.category,
      name: cat.category,
      icon: categoryIcons[cat.category] || Heart,
      count: cat.count,
    })),
  ];

  const filteredCharities = charities;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Donate to Your Favourite Charity
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            We've made it easy to simply select your favourite charity and
            support causes close to your heart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search charities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(1).map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1 items-end">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredCharities.length} Charities Found
            </h2>
            <p className="text-gray-600">
              {selectedCategory !== "all"
                ? `in ${
                    categories.find((c) => c.id === selectedCategory)?.name
                  }`
                : ""}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col gap-1 w-4 h-4">
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
                <div className="bg-current rounded-sm h-1"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="bg-gray-200 h-36 rounded-t-lg"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-400 mb-4">
              <Shield className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Error loading charities
            </h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Charities Grid/List */}
        {!loading && !error && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredCharities.map((charity) => (
              <Card
                key={charity.id}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-0">
                  {/* Logo Section */}
                  <div
                    className="bg-white h-36 rounded-t-lg flex items-center justify-center relative overflow-hidden bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: charity.logo ? `url(${charity.logo})` : 'none',
                      backgroundColor: charity.logo ? 'white' : '#f3f4f6',
                    }}
                  >
                    {!charity.logo && (
                      <div className="text-gray-400 text-center p-4">
                        <Heart className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-xs font-medium">{charity.name}</p>
                      </div>
                    )}
                    
                    {charity.isVerified && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-white/90 backdrop-blur-sm text-green-600 border-green-600 shadow-sm">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                        {charity.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {charity.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-500" />
                        </span>
                      </div>
                    </div>

                    {/* Donate Button */}
                    <Button
                      asChild
                      className="w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
                    >
                      <Link href={`/virtual-giving-mall/${charity.slug}`}>
                        Donate Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCharities.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No charities found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
