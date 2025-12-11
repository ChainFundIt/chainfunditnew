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
import { getCharityFallbackImage } from "@/lib/utils/unified-items";
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
            We&apos;ve made it easy to simply select your favourite charity and
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
            {filteredCharities.map((charity) => {
              const CategoryIcon = categoryIcons[charity.category || 'General'] || Heart;
              return (
                <Card
                  key={charity.id}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white rounded-2xl"
                >
                  <CardContent className="p-0">
                    {/* Logo Section with Gradient Overlay */}
                    <div
                      className="relative h-48 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50"
                      style={{
                        backgroundImage: (charity.logo && !charity.logo.includes('logo.clearbit.com'))
                          ? `linear-gradient(135deg, rgba(16, 73, 1, 0.05) 0%, rgba(34, 197, 94, 0.05) 100%), url(${charity.logo})` 
                          : `linear-gradient(135deg, rgba(16, 73, 1, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%), url(${getCharityFallbackImage(charity.category)})`,
                        backgroundSize: (charity.logo && !charity.logo.includes('logo.clearbit.com')) ? 'contain' : 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {/* Animated gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 via-green-500/0 to-blue-500/0 group-hover:from-green-600/10 group-hover:via-green-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                      
                      {(!charity.logo || charity.logo.includes('logo.clearbit.com')) && (
                        <div className="text-center p-4 relative z-10">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                            <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full">
                              <Heart className="h-12 w-12 text-white" />
                            </div>
                          </div>
                          <p className="text-xs font-semibold text-gray-600 mt-3 max-w-[120px] mx-auto line-clamp-2">
                            {charity.name}
                          </p>
                        </div>
                      )}
                      
                      {charity.isVerified && (
                        <div className="absolute top-3 right-3 z-20">
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg backdrop-blur-sm px-2.5 py-1 flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Verified</span>
                          </Badge>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute bottom-3 left-3 z-20">
                        <Badge className="bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200 shadow-md px-3 py-1.5 flex items-center gap-1.5 hover:bg-white transition-colors">
                          <CategoryIcon className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs font-medium">
                            {charity.category || 'General'}
                          </span>
                        </Badge>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 bg-white">
                      <div className="mb-5">
                        <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
                          {charity.name}
                        </h3>
                        
                        {/* Decorative divider */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-0.5 bg-gradient-to-r from-green-500 to-transparent flex-1"></div>
                          <Heart className="h-4 w-4 text-red-400 fill-red-400" />
                          <div className="h-0.5 bg-gradient-to-l from-green-500 to-transparent flex-1"></div>
                        </div>
                      </div>

                      {/* Donate Button with enhanced design */}
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-green-600 to-[#104901] hover:text-white text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] shadow-md group/button"
                      >
                        <Link href={`/virtual-giving-mall/${charity.slug}`} className="flex items-center justify-center gap-2">
                          <span>Donate Now</span>
                          <Heart className="h-4 w-4 group-hover/button:scale-110 transition-transform duration-300" />
                        </Link>
                      </Button>
                    </div>

                    {/* Bottom accent border */}
                    <div className="h-1 bg-gradient-to-r from-green-500 via-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </CardContent>
                </Card>
              );
            })}
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
