"use client";

import { useEffect, useState } from "react";

export type ImpactMetrics = {
  donationsCompleted: number;
  campaignsPublicActive: number;
  countriesReached: number;
  amountRaised: {
    currency: string;
    amount: number;
    originalCurrency: "GBP";
    originalAmount: number;
  };
  updatedAt: string;
};

export function useImpactMetrics(currency?: string | null) {
  const [data, setData] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const qp = currency ? `?currency=${encodeURIComponent(currency)}` : "";
        const res = await fetch(`/api/public/impact-metrics${qp}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load impact metrics (${res.status})`);
        }

        const json = (await res.json()) as ImpactMetrics;
        setData(json);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load impact metrics");
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [currency]);

  return { data, loading, error };
}


