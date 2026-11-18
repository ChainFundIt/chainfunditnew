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
              "hover:border-brand-green-dark hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green-dark",
              isSelected
                ? "border-brand-green-dark ring-2 ring-brand-green-dark/20 shadow-sm"
                : "border-gray-200"
            )}
          >
            <Icon
              className={cn(
                "h-8 w-8 sm:h-9 sm:w-9 stroke-[1.5]",
                isSelected ? "text-brand-green-dark" : "text-gray-800"
              )}
              aria-hidden
            />
            <span className="text-xs sm:text-sm font-medium text-gray-900 leading-snug">
              {category.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}