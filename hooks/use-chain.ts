import { useState } from 'react';

interface ChainData {
  userId: string;
  campaignId: string;
  commissionDestination: 'keep' | 'donate_back' | 'donate_other';
  charityChoiceId?: string;
}

interface ChainResponse {
  success: boolean;
  data?: {
    id: string;
    referralCode: string;
    commissionDestination: string;
    totalRaised: string;
    totalReferrals: number;
    clicks: number;
    conversions: number;
    commissionEarned: string;
    commissionPaid: boolean;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export const useChain = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChain = async (chainData: ChainData): Promise<ChainResponse> => {
    try {
      console.log('🚀 useChain: Starting chain creation');
      setLoading(true);
      setError(null);

      console.log('📡 useChain: Making API call to /api/chainers');
      const response = await fetch('/api/chainers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chainData),
      });

      console.log('📥 useChain: Response status:', response.status);
      console.log('📥 useChain: Response headers:', response.headers);

      const result = await response.json();
      console.log('📥 useChain: Response body:', result);

      if (!response.ok) {
        console.log('❌ useChain: API error:', result.error);
        throw new Error(result.error || 'Failed to create chain');
      }

      console.log('✅ useChain: Chain created successfully');
      return result;
    } catch (err) {
      console.error('💥 useChain: Error occurred:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chain';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      console.log('🏁 useChain: Loading finished');
    }
  };

  const getChainers = async (campaignId?: string, userId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (campaignId) params.append('campaignId', campaignId);
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/chainers?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch chainers');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chainers';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createChain,
    getChainers,
    loading,
    error,
  };
};
