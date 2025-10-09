import { useState, useEffect } from 'react';

export interface Charity {
  id: string;
  name: string;
  slug: string;
  description: string;
  mission: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  category: string;
  focusAreas: string[];
  logo: string;
  coverImage: string;
  isVerified: boolean;
  isActive: boolean;
  totalReceived: string;
  totalPaidOut: string;
  pendingAmount: string;
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CharityFilters {
  search?: string;
  category?: string;
  country?: string;
  verified?: boolean;
  active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created' | 'donations';
  sortOrder?: 'asc' | 'desc';
}

export interface CharityPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export function useCharities(filters: CharityFilters = {}) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [pagination, setPagination] = useState<CharityPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharities();
  }, [
    filters.search,
    filters.category,
    filters.country,
    filters.verified,
    filters.active,
    filters.page,
    filters.limit,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const fetchCharities = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.country) params.append('country', filters.country);
      if (filters.verified !== undefined) params.append('verified', filters.verified.toString());
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/charities?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch charities');
      }

      const data = await response.json();
      setCharities(data.charities || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching charities:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCharities();
  };

  return {
    charities,
    pagination,
    loading,
    error,
    refetch,
  };
}

export function useCharity(idOrSlug: string) {
  const [charity, setCharity] = useState<Charity | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idOrSlug) {
      fetchCharity();
    }
  }, [idOrSlug]);

  const fetchCharity = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/charities/${idOrSlug}`);
      
      if (!response.ok) {
        throw new Error('Charity not found');
      }

      const data = await response.json();
      setCharity(data.charity);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching charity:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCharity();
  };

  return {
    charity,
    stats,
    loading,
    error,
    refetch,
  };
}

export function useCharityCategories() {
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/charities/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
  };
}

