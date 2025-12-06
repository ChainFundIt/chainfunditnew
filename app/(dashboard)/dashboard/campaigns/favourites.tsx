"use client";

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Link as LinkIcon, Users, Heart } from "lucide-react";
import Link from "next/link";
import { UnifiedItem } from '@/lib/types/unified-item';
import { UnifiedItemCard } from '@/components/campaign/UnifiedItemCard';
import { formatCurrency } from "@/lib/utils/currency";

const Favourites = () => {
  const [favourites, setFavourites] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/favourites');
        const data = await response.json();
        
        if (data.success) {
          setFavourites(data.data || []);
        } else {
          setError(data.error || 'Failed to load favourites');
        }
      } catch (err) {
        console.error('Error fetching favourites:', err);
        setError('Failed to load favourites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  const isEmpty = favourites.length === 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104901] mb-4"></div>
        <p className="text-[#104901] text-lg font-medium">Loading favourites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-bold text-2xl text-red-600 mb-3">Error Loading Favourites</h3>
        <p className="text-red-500 text-center mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#104901] hover:bg-[#0d3d01] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-4 2xl:container 2xl:mx-auto">
        <section className="relative w-fit">
          <Image src="/images/frame.png" alt="" width={232} height={216} />
          <section
            className="absolute -top-5 -right-4 w-[70px] h-[78px] bg-white flex items-center justify-center font-bold text-[64px] text-[#C0BFC4] rounded-2xl"
            style={{ boxShadow: "0px 4px 10px 0px #00000040" }}
          >
            0
          </section>
        </section>

        <section>
          <h3 className="font-semibold text-3xl text-[#104901]">
            No favourites yet
          </h3>
          <p className="font-normal text-xl text-[#104901]">
            Start favouriting campaigns and charities you care about by clicking the heart icon.
          </p>
        </section>

        <div className="flex gap-4">
          <Link href="/campaigns">
            <Button className="w-[300px] h-16 flex justify-between font-semibold text-2xl items-center">
              Browse Campaigns <Plus size={24} />
            </Button>
          </Link>
          <Link href="/virtual-giving-mall">
            <Button className="w-[300px] h-16 flex justify-between font-semibold text-2xl items-center">
              Browse Charities <Heart size={24} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-source 2xl:container 2xl:mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favourites.map((item) => (
          <UnifiedItemCard
            key={`${item.type}-${item.id}`}
            item={item}
            viewMode="grid"
          />
        ))}
      </div>
    </div>
  );
}

export default Favourites