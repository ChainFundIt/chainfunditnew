import { useState, useEffect, useCallback, useRef } from "react";
import { UnifiedItem } from "@/lib/types/unified-item";
import { mergeAndSort } from "@/lib/utils/unified-items";

interface UseUnifiedItemsFilters {
  status?: string;
  reason?: string;
  category?: string;
  type?: 'all' | 'campaign' | 'charity';
  limit?: number;
  offset?: number;
}

export function useUnifiedItems() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<UseUnifiedItemsFilters>({
    limit: 20,
    offset: 0,
    type: 'all',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Fetch both campaigns and charities
  const fetchItems = useCallback(
    async (reset: boolean = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 15000);

      try {
        setLoading(true);
        setError(null);

        // Fetch campaigns and charities in parallel
        const campaignsParams = new URLSearchParams();
        if (filters.status && filters.status !== "trending") campaignsParams.append("status", filters.status);
        if (filters.reason) campaignsParams.append("reason", filters.reason);
        campaignsParams.append("limit", (filters.limit || 100).toString());
        campaignsParams.append("offset", reset ? "0" : (filters.offset?.toString() || "0"));

        const charitiesParams = new URLSearchParams();
        charitiesParams.append("limit", (filters.limit || 100).toString());
        charitiesParams.append("active", "true");
        charitiesParams.append("verified", "true");
        if (filters.category) charitiesParams.append("category", filters.category);

        const [campaignsResponse, charitiesResponse] = await Promise.all([
          fetch(`/api/campaigns?${campaignsParams.toString()}`, {
            signal: abortControllerRef.current.signal,
          }),
          fetch(`/api/charities?${charitiesParams.toString()}`),
        ]);

        clearTimeout(timeoutId);

        if (!campaignsResponse.ok) {
          throw new Error(`Failed to fetch campaigns: ${campaignsResponse.status}`);
        }

        const campaignsData = await campaignsResponse.json();
        const charitiesData = await charitiesResponse.json();

        if (!isMountedRef.current) return;

        const campaigns = Array.isArray(campaignsData.data) ? campaignsData.data : [];
        const charities = Array.isArray(charitiesData.charities) ? charitiesData.charities : [];
        
        // Merge campaigns and charities
        const mergedItems = mergeAndSort(campaigns, charities);
        
        // Apply type filter
        let filteredItems = mergedItems;
        if (filters.type === 'campaign') {
          filteredItems = mergedItems.filter(item => item.type === 'campaign');
        } else if (filters.type === 'charity') {
          filteredItems = mergedItems.filter(item => item.type === 'charity');
        }

        // Apply pagination
        const paginatedItems = filteredItems.slice(
          filters.offset || 0,
          (filters.offset || 0) + (filters.limit || 20)
        );

        if (reset) {
          setItems(paginatedItems);
        } else {
          setItems(prev => [...prev, ...paginatedItems]);
        }

        setHasMore(paginatedItems.length === (filters.limit || 20));
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Items fetch aborted');
          return;
        }
        console.error('Error fetching items:', err);
        if (isMountedRef.current) {
          setError(err.message || 'Failed to fetch items');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [filters]
  );

  // Fetch when filters change
  useEffect(() => {
    fetchItems(true);
  }, [filters, fetchItems]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20),
      }));
    }
  }, [loading, hasMore]);

  const updateFilters = useCallback((newFilters: Partial<UseUnifiedItemsFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset offset when filters change
    }));
  }, []);

  const refetch = useCallback(() => {
    fetchItems(true);
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    updateFilters,
    refetch,
    filters,
  };
}

