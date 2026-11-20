"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Search, Users, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCollections } from "@/hooks/use-collections";
import { getCollectionCategoryLabel } from "@/lib/collections/categories";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CollectionsPreview = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { collections, loading, error } = useCollections({
    limit: 6,
    sortBy: "recent",
  });

  const query = searchQuery.trim().toLowerCase();
  const visible = query
    ? collections.filter((item) => {
        const category = getCollectionCategoryLabel(item.category) || "";
        return (
          item.title.toLowerCase().includes(query) ||
          item.organiserName.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        );
      })
    : collections;

  return (
    <div className="font-jakarta bg-[#F5F2EA80] py-24 px-4 flex justify-center items-center">
      <div className="flex flex-col gap-12 w-full max-w-[80rem]">
        <motion.div
          className="flex flex-col md:flex-row md:justify-between gap-6 items-end"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col gap-4">
            <div className="font-bold text-4xl leading-10 text-[#1C1917]">
              Collections happening now
            </div>
            <div className="font-normal text-base leading-6 text-[#78716C] max-w-xl">
              From weddings and birthdays to group gifts, reunions and special
              occasions. Find one to join, or start your own.
            </div>
          </div>

          <div className="relative md:w-64 w-full rounded-xl bg-white border-2 border-transparent focus-within:border-[#104109] transition-colors">
            <Search
              color="#A8A29E"
              size={18}
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-10 w-full rounded-xl focus:outline-none text-[#1C1917] placeholder:text-[#A8A29E] bg-transparent"
            />
          </div>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center w-full py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901]" />
            <p className="text-[#104901] text-lg ml-4 font-medium">
              Loading collections...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center w-full py-16">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((item) => {
              const categoryLabel =
                getCollectionCategoryLabel(item.category) || "Collection";
              const raised = parseFloat(item.totalRaised || "0");
              const target = item.targetAmount
                ? parseFloat(item.targetAmount)
                : 0;
              const progress =
                target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
              const dueLabel = item.dueAt
                ? new Date(item.dueAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={item.id}
                  className="group rounded-3xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                  onClick={() => router.push(`/collections/${item.slug}`)}
                >
                  <div className="relative overflow-hidden h-[220px] bg-gradient-to-br from-[#e8f2e4] to-[#d2e5cb]">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Wallet className="h-12 w-12 text-[#59AD4A]/50" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full">
                      <span className="font-bold text-xs leading-4">
                        {categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-6 flex-grow">
                    <div className="flex flex-col gap-3 flex-grow">
                      <p className="font-bold text-xs text-[#A8A29E] uppercase flex items-center gap-1">
                        Organised by{" "}
                        <b className="font-bold text-xs text-[#292524]">
                          {item.organiserName}
                        </b>
                      </p>
                      <div className="font-bold text-xl text-[#1C1917] line-clamp-2">
                        {item.title}
                      </div>
                      <div className="font-normal text-sm text-[#78716C] line-clamp-2">
                        {item.description ||
                          "Chip in with the group. No account needed to contribute."}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <hr className="border-[#E8E8E8]" />
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-jakarta font-bold text-[#1ABD73]">
                          {item.currency} {raised.toLocaleString()} raised
                        </span>
                        {target > 0 && (
                          <span className="font-jakarta text-[#999999] text-sm">
                            {item.currency} {target.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {target > 0 && (
                        <div className="w-full bg-[#E8E8E8] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#1ABD73] h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm text-[#78716C] pt-2">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Group pot
                        </span>
                        {dueLabel && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {dueLabel}
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/collections/${item.slug}`);
                        }}
                        className="bg-white px-0 py-3 rounded-full h-auto text-[#104109] font-bold text-base leading-6 border-2 border-transparent hover:border-[#104109] transition-colors"
                      >
                        View collection
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full py-16">
            <p className="text-[#666666] text-center">
              {collections.length === 0
                ? "No collections yet. Be the first to start one for your group."
                : "No collections match that search."}
            </p>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button
            asChild
            className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none"
          >
            <Link href="/collections/browse">View more collections</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollectionsPreview;
