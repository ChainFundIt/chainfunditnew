"use client";

import {
  COLLECTION_CATEGORIES,
  type CollectionCategoryId,
} from "@/lib/collections/categories";
import { cn } from "@/lib/utils";

interface CollectionCategoryGridProps {
  selectedId: CollectionCategoryId | null;
  onSelect: (id: CollectionCategoryId) => void;
}

export function CollectionCategoryGrid({
  selectedId,
  onSelect,
}: CollectionCategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {COLLECTION_CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-4 sm:p-5 min-h-[7.5rem] text-center transition-all",
              "hover:border-[#104109] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#104109]",
              isSelected
                ? "border-[#104109] ring-2 ring-[#104109]/20 shadow-sm"
                : "border-[#E7E5E4]"
            )}
          >
            <Icon
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 stroke-[1.5]",
                isSelected ? "text-[#104109]" : "text-[#57534E]"
              )}
              aria-hidden
            />
            <span className="text-sm font-medium leading-snug text-[#1C1917]">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}