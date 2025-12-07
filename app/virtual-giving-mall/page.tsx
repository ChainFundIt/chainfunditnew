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
                <div
                  key={charity.id}
                  className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
                    {charity.logo ? (
                      <img
                        src={charity.logo}
                        alt={charity.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                          <div className="relative bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-full">
                            <CategoryIcon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="font-jakarta font-bold text-xs text-[#104901] uppercase tracking-wider">
                        {charity.category || 'Charity'}
                      </span>
                    </div>
                    {charity.isVerified && (
                      <div className="absolute top-4 right-4 bg-[#59AD4A] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Shield className="h-3 w-3" />
                        <span className="font-jakarta font-bold text-xs">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-5 md:p-6 flex flex-col gap-4 flex-grow">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-jakarta font-regular text-xs text-[#999999] uppercase tracking-wider">
                          Charity <b className="text-black">{charity.category || 'Organization'}</b>
                        </p>
                      </div>
                      <Link href={`/virtual-giving-mall/${charity.slug}`}>
                        <h3 className="font-jakarta font-bold text-lg text-black mb-2 hover:text-[#104901] transition-colors">
                          {charity.name.length > 50
                            ? `${charity.name.slice(0, 50)}...`
                            : charity.name}
                        </h3>
                      </Link>
                      <p className="font-jakarta font-regular text-sm text-[#666666] line-clamp-2">
                        {charity.mission || charity.description}
                      </p>
                    </div>
                    <div className="flex-grow" />
                    <div className="border-t border-[#E8E8E8] pt-4">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center gap-2">
                          {/* <div className="h-0.5 bg-gradient-to-r from-[#59AD4A] to-transparent flex-1 w-8"></div> */}
                          <Heart className="h-0 w-0 text-red-400 fill-red-400" />
                          {/* <div className="h-0.5 bg-gradient-to-l from-[#59AD4A] to-transparent flex-1 w-8"></div> */}
                        </div>
                      </div>
                      <Link href={`/virtual-giving-mall/${charity.slug}`}>
                        <button
                          className="w-full py-2.5 px-4 bg-white text-black font-jakarta font-semibold text-sm rounded-lg hover:bg-[#59AD4A] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2 border border-gray-200"
                        >
                          <Heart className="h-0 w-0" />
                          Donate Now
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
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