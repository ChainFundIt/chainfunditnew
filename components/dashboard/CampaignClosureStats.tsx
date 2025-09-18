"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface CampaignClosureStats {
  totalActive: number;
  goalReached: number;
  expired: number;
  totalClosed: number;
}

export function CampaignClosureStats() {
  const [stats, setStats] = useState<CampaignClosureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [closingCampaigns, setClosingCampaigns] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/campaigns/close');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error('Failed to fetch campaign stats');
      }
    } catch (error) {
      toast.error('Error fetching campaign stats');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCampaigns = async () => {
    setClosingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close_all' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Closed ${data.data.summary.totalClosed} campaigns`);
        await fetchStats(); // Refresh stats
      } else {
        toast.error(data.error || 'Failed to close campaigns');
      }
    } catch (error) {
      toast.error('Error closing campaigns');
    } finally {
      setClosingCampaigns(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Closure Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-[#5F8555]" />
            <span className="ml-2 text-[#5F8555]">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Closure Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Failed to load campaign stats
          </div>
        </CardContent>
      </Card>
    );
  }

  const needsAttention = stats.goalReached + stats.expired;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Campaign Closure Stats
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {needsAttention > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleCloseCampaigns}
                disabled={closingCampaigns}
                className="bg-[#5F8555] hover:bg-[#104901]"
              >
                {closingCampaigns ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Closing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Close Eligible ({needsAttention})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Active */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-[#104901]">{stats.totalActive}</div>
            <div className="text-sm text-gray-600">Active Campaigns</div>
          </div>

          {/* Goal Reached */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.goalReached}</div>
            <div className="text-sm text-gray-600">Goal Reached</div>
            {stats.goalReached > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Ready to Close
              </Badge>
            )}
          </div>

          {/* Expired */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
            <div className="text-sm text-gray-600">Expired</div>
            {stats.expired > 0 && (
              <Badge variant="destructive" className="mt-1 text-xs">
                Needs Closure
              </Badge>
            )}
          </div>

          {/* Total Closed */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.totalClosed}</div>
            <div className="text-sm text-gray-600">Total Closed</div>
          </div>
        </div>

        {needsAttention > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {needsAttention} campaign{needsAttention !== 1 ? 's' : ''} need{needsAttention === 1 ? 's' : ''} attention
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {stats.goalReached > 0 && `${stats.goalReached} campaign${stats.goalReached !== 1 ? 's' : ''} reached their goal`}
              {stats.goalReached > 0 && stats.expired > 0 && ', '}
              {stats.expired > 0 && `${stats.expired} campaign${stats.expired !== 1 ? 's' : ''} expired`}
            </p>
          </div>
        )}

        {needsAttention === 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">All campaigns are up to date</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              No campaigns need closure at this time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
