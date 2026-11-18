"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Shield,
  Users,
  Calendar,
  Plus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCollections } from "@/hooks/use-collections";
import { getCollectionCategoryLabel } from "@/lib/collections/categories";

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { collections, loading, error } = useCollections({
    search: searchQuery || undefined,
    limit: 100,
    sortBy: "recent",
  });
  const router = useRouter();

  const formatDueDate = (value: string | null) => {
    if (!value) return null;
    return new Date(value).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="font-jakarta">
      <Navbar />
      <div className="bg-[#104109] py-[5rem] flex items-center justify-center">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative z-0">
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            Collections
          </div>
          <div className="text-xl text-[#d1fae5] text-center max-w-2xl">
            Chip in for gifts, events, class funds, and group goals. Pay with
            your card — no account needed to contribute.
          </div>
          <Button asChild size="lg" className="rounded-3xl h-auto py-3">
            <Link href="/collections/create">
              <Plus className="h-4 w-4" />
              Start a collection
            </Link>
          </Button>
        </div>
      </div>

      <div
        className="bg-white px-4 py-20 flex justify-center relative"
        style={{ zIndex: "5" }}
      >
        <div className="max-w-[80rem] w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by title or organiser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green-dark focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {collections.length} active collections
            </h2>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="rounded-md"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                  <div className="bg-current rounded-sm" />
                </div>
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="rounded-md"
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <div className="flex flex-col gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-1" />
                  <div className="bg-current rounded-sm h-1" />
                  <div className="bg-current rounded-sm h-1" />
                </div>
              </Button>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-0">
                    <div className="bg-gray-200 h-40 rounded-t-lg" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <Shield className="h-16 w-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Could not load collections
              </h3>
              <p className="text-gray-500">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {collections.map((item) => {
                const dueLabel = formatDueDate(item.dueAt);
                const categoryLabel = getCollectionCategoryLabel(item.category);
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/collections/${item.slug}`)}
                    className="group rounded-2xl overflow-hidden bg-white border border-[#E8E8E8] hover:border-[#104901] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative w-full h-[180px] bg-gradient-to-br from-[#e8f2e4] to-[#d2e5cb] overflow-hidden flex items-center justify-center">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Wallet className="h-12 w-12 text-[#59AD4A]/50" />
                      )}
                    </div>
                    <div className="p-5 md:p-6 flex flex-col gap-3 flex-grow">
                      <p className="text-xs uppercase tracking-wider text-gray-500 line-clamp-1">
                        {categoryLabel || "Collection"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {item.organiserName}
                      </p>
                      <Link href={`/collections/${item.slug}`}>
                        <h3 className="font-bold text-lg text-gray-900 hover:text-[#104109] line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#104109]">
                          Raised {item.currency}{" "}
                          {parseFloat(item.totalRaised || "0").toLocaleString()}
                        </span>
                        {dueLabel && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {dueLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && collections.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No collections yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to start one for your group.
              </p>
              <Button asChild className="rounded-3xl h-auto py-3">
                <Link href="/collections/create">Start a collection</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}