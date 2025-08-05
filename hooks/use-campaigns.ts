import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  reason: string;
  fundraisingFor: string;
  duration: string;
  videoUrl: string;
  coverImageUrl: string;
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
  closedAt: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  stats?: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
}

interface CampaignFormData {
  title: string;
  subtitle: string;
  visibility: "public" | "private";
  reason: string;
  fundraisingFor: string;
  currency: string;
  goal: number;
  duration: string;
  video: string;
  documents: File[];
  images: File[];
  coverImage: File | null;
  story: string;
}

interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string;
  creatorAvatar: string;
}

interface CampaignComment {
  id: string;
  campaignId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userAvatar: string;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async (filters?: {
    status?: string;
    reason?: string;
    creatorId?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.reason) params.append('reason', filters.reason);
      if (filters?.creatorId) params.append('creatorId', filters.creatorId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data);
      } else {
        setError(data.error || 'Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (formData: CampaignFormData): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);

      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images" || key === "documents") {
          (value as File[]).forEach((file) => payload.append(key, file));
        } else if (key === "coverImage" && value) {
          payload.append("coverImage", value as File);
        } else {
          payload.append(key, value as string);
        }
      });

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign');
      }

      return data.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>): Promise<Campaign | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update campaign');
      }

      // Update local state
      setCampaigns(prev => prev.map(campaign => 
        campaign.id === campaignId ? { ...campaign, ...data.data } : campaign
      ));

      return data.data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to update campaign');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete campaign');
      }

      // Remove from local state
      setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));

      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
}

export function useCampaign(campaignId: string) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}`);
      const data = await response.json();

      if (data.success) {
        setCampaign(data.data);
      } else {
        setError(data.error || 'Failed to load campaign');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  return {
    campaign,
    loading,
    error,
    fetchCampaign,
  };
}

export function useCampaignUpdates(campaignId: string) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}/updates`);
      const data = await response.json();

      if (data.success) {
        setUpdates(data.data);
      } else {
        setError(data.error || 'Failed to load updates');
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  const createUpdate = async (updateData: { title: string; content: string; mediaUrl?: string }): Promise<CampaignUpdate | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create update');
      }

      // Add to local state
      setUpdates(prev => [data.data, ...prev]);

      return data.data;
    } catch (error) {
      console.error('Error creating update:', error);
      setError(error instanceof Error ? error.message : 'Failed to create update');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchUpdates();
    }
  }, [campaignId]);

  return {
    updates,
    loading,
    error,
    fetchUpdates,
    createUpdate,
  };
}

export function useCampaignComments(campaignId: string) {
  const [comments, setComments] = useState<CampaignComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchComments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}/comments?page=${page}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setComments(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (content: string): Promise<CampaignComment | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/campaigns/${campaignId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create comment');
      }

      // Add to local state
      setComments(prev => [data.data, ...prev]);

      return data.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to create comment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchComments();
    }
  }, [campaignId]);

  return {
    comments,
    loading,
    error,
    pagination,
    fetchComments,
    createComment,
  };
} 