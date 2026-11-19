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
import {
  collectionBodySmall,
  collectionBtnInverse,
  collectionBtnPrimary,
  collectionCardTitle,
  collectionHeroBody,
  collectionHeroTitle,
  collectionPage,
} from "@/lib/collections/ui";

export default function BrowseCollectionsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { collections, loading, error } = useCollections({
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
    <div className={collectionPage}>
      <Navbar />
      <div className="bg-[#104109] py-20 md:py-28 flex items-center justify-center">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative z-0">
          <h1 className={`${collectionHeroTitle} text-center`}>
            Browse collections
          </h1>
          <p className={`${collectionHeroBody} text-center max-w-2xl`}>
            Chip in for gifts, events, class funds, and group goals. Pay with
            your card — no account needed to contribute.
          </p>
          <Button asChild size="lg" className={collectionBtnInverse}>
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-jakarta text-xl font-bold tracking-tight text-[#104109] md:text-2xl">
              {loading
                ? "Collections"
                : `${collections.length} active collection${collections.length === 1 ? "" : "s"}`}
            </h2>
            <div className="flex items-center gap-1 rounded-full border border-[#E7E5E4] bg-white p-1">
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className={
                  viewMode === "grid"
                    ? "h-10 w-10 rounded-full border-0 bg-[#104109] text-white shadow-none hover:bg-[#0d3507] hover:text-white"
                    : "h-10 w-10 rounded-full text-[#57534E] shadow-none hover:bg-[#F3F8F2] hover:text-[#104109]"
                }
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
                className={
                  viewMode === "list"
                    ? "h-10 w-10 rounded-full border-0 bg-[#104109] text-white shadow-none hover:bg-[#0d3507] hover:text-white"
                    : "h-10 w-10 rounded-full text-[#57534E] shadow-none hover:bg-[#F3F8F2] hover:text-[#104109]"
                }
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
              <h3 className={`${collectionCardTitle} mb-2`}>
                Could not load collections
              </h3>
              <p className={collectionBodySmall}>{error}</p>
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
                      <p className="text-sm font-medium text-[#57534E] line-clamp-1">
                        {categoryLabel || "Collection"}
                      </p>
                      <p className={`${collectionBodySmall} flex items-center gap-2`}>
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {item.organiserName}
                      </p>
                      <Link href={`/collections/${item.slug}`}>
                        <h3 className={`${collectionCardTitle} line-clamp-2`}>
                          {item.title}
                        </h3>
                      </Link>
                      {item.description && (
                        <p className={`${collectionBodySmall} md:text-base line-clamp-2`}>
                          {item.description}
                        </p>
                      )}
                      <div className="mt-auto pt-3 border-t border-[#E7E5E4] flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#104109]">
                          Raised {item.currency}{" "}
                          {parseFloat(item.totalRaised || "0").toLocaleString()}
                        </span>
                        {dueLabel && (
                          <span className="text-[#57534E] flex items-center gap-1">
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
              <Search className="h-16 w-16 mx-auto text-[#78716C] mb-4" />
              <h3 className={`${collectionCardTitle} mb-2`}>
                No collections yet
              </h3>
              <p className={`${collectionBodySmall} mb-6`}>
                Be the first to start one for your group.
              </p>
              <Button asChild className={collectionBtnPrimary}>
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
