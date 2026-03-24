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
    type: 'campaign',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Fetch both campaigns and charities
  const fetchItems = useCallback(
    async (
      reset: boolean = false,
      activeFilters: UseUnifiedItemsFilters = filtersRef.current
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const requestController = new AbortController();
      abortControllerRef.current = requestController;
      const requestId = ++requestIdRef.current;
      const timeoutId = setTimeout(() => {
        if (!requestController.signal.aborted) {
          requestController.abort();
        }
      }, 15000);

      try {
        setLoading(true);
        setError(null);

        const limit = activeFilters.limit || 20;
        const offset = activeFilters.offset || 0;
        const shouldFetchCampaigns = activeFilters.type !== "charity";
        const shouldFetchCharities = activeFilters.type !== "campaign";

        const campaignsParams = new URLSearchParams();
        if (activeFilters.status && activeFilters.status !== "trending")
          campaignsParams.append("status", activeFilters.status);
        if (activeFilters.reason) campaignsParams.append("reason", activeFilters.reason);
        campaignsParams.append("limit", limit.toString());
        campaignsParams.append("offset", offset.toString());

        const charitiesParams = new URLSearchParams();
        charitiesParams.append("limit", limit.toString());
        charitiesParams.append("active", "true");
        charitiesParams.append("verified", "true");
        if (activeFilters.category)
          charitiesParams.append("category", activeFilters.category);

        const [campaignsResponse, charitiesResponse] = await Promise.all([
          shouldFetchCampaigns
            ? fetch(`/api/campaigns?${campaignsParams.toString()}`, {
                signal: requestController.signal,
              })
            : Promise.resolve(null),
          shouldFetchCharities
            ? fetch(`/api/charities?${charitiesParams.toString()}`, {
                signal: requestController.signal,
              })
            : Promise.resolve(null),
        ]);

        if (campaignsResponse && !campaignsResponse.ok) {
          throw new Error(`Failed to fetch campaigns: ${campaignsResponse.status}`);
        }
        if (charitiesResponse && !charitiesResponse.ok) {
          throw new Error(`Failed to fetch charities: ${charitiesResponse.status}`);
        }

        const campaignsData = campaignsResponse ? await campaignsResponse.json() : null;
        const charitiesData = charitiesResponse ? await charitiesResponse.json() : null;

        if (!isMountedRef.current || requestId !== requestIdRef.current) return;

        const campaigns = Array.isArray(campaignsData?.data) ? campaignsData.data : [];
        const charities = Array.isArray(charitiesData?.charities) ? charitiesData.charities : [];
        
        const mergedItems = mergeAndSort(campaigns, charities);

        if (reset) {
          setItems(mergedItems);
        } else {
          setItems((prev) => {
            const combined = [...prev, ...mergedItems];
            const seen = new Set<string>();
            return combined.filter((item) => {
              const key = `${item.type}-${item.id}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          });
        }

        if (activeFilters.type === "campaign") {
          setHasMore(campaigns.length === limit);
        } else if (activeFilters.type === "charity") {
          setHasMore(charities.length === limit);
        } else {
          setHasMore(campaigns.length === limit || charities.length === limit);
        }
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Items fetch aborted');
          return;
        }
        console.error('Error fetching items:', err);
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setError(err.message || 'Failed to fetch items');
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Fetch when filters change
  useEffect(() => {
    const isReset = (filters.offset || 0) === 0;
    fetchItems(isReset, filters);
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
    setFilters((prev) => {
      const next = {
        ...prev,
        ...newFilters,
        offset: 0, // Reset offset when filters change
      };

      const unchanged =
        prev.status === next.status &&
        prev.reason === next.reason &&
        prev.category === next.category &&
        prev.type === next.type &&
        prev.limit === next.limit &&
        prev.offset === next.offset;

      return unchanged ? prev : next;
    });
  }, []);

  const refetch = useCallback(() => {
    const nextFilters = { ...filtersRef.current, offset: 0 };
    setFilters(nextFilters);
  }, []);

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

