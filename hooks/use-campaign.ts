import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface CampaignData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  reason: string;
  fundraisingFor: string;
  duration: string;
  videoUrl?: string;
  coverImageUrl?: string;
  galleryImages: string[];
  documents: string[];
  goalAmount: number;
  currency: string;
  minimumDonation: number;
  chainerCommissionRate: number;
  currentAmount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  stats: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  donationAmount?: string;
  donationCurrency?: string;
  isAnonymous?: boolean;
}

export function useCampaign(campaignId: string, initialData?: CampaignData) {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignData | null>(initialData || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaign data if not provided
  useEffect(() => {
    if (!initialData && campaignId) {
      fetchCampaign();
    }
  }, [campaignId, initialData]);

  // Fetch like status
  useEffect(() => {
    if (user && campaignId) {
      fetchLikeStatus();
    }
  }, [user, campaignId]);

  const fetchCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaign');
      }
      
      setCampaign(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign';
      setError(errorMessage);
      console.error('Error fetching campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (limit = 10, offset = 0) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch comments');
      }
      
      setComments(data.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const addComment = async (content: string) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment');
      }
      
      // Refresh comments
      await fetchComments();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      console.error('Error adding comment:', err);
      throw new Error(errorMessage);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/like`);
      const data = await response.json();
      
      if (response.ok) {
        setIsLiked(data.data.isLiked);
      }
    } catch (err) {
      console.error('Error fetching like status:', err);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      throw new Error('Authentication required');
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle like');
      }
      
      setIsLiked(data.data.isLiked);
      return data.data.isLiked;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle like';
      console.error('Error toggling like:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refreshCampaign = () => {
    fetchCampaign();
  };

  return {
    campaign,
    comments,
    isLiked,
    loading,
    error,
    fetchComments,
    addComment,
    toggleLike,
    refreshCampaign,
  };
} 