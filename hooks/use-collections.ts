"use client";

import { useCallback, useEffect, useState } from "react";

export interface CollectionRecord {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  organiserName: string;
  coverImage: string | null;
  currency: string;
  targetAmount: string | null;
  totalRaised: string;
  dueAt: string | null;
  status: string;
  createdAt: string;
}

interface CollectionsFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "raised";
}

export function useCollections(filters: CollectionsFilters = {}) {
  const [collections, setCollections] = useState<CollectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);

      const response = await fetch(`/api/collections?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load collections");
      }

      setCollections(data.collections || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.page, filters.limit, filters.sortBy]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, total, refetch: fetchCollections };
}