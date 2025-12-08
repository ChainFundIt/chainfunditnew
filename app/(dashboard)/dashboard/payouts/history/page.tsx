"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  CreditCard,
  Building2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

interface PayoutHistoryItem {
  id: string;
  type: 'campaign' | 'commission';
  campaignId: string;
  campaignTitle: string;
  amount: number;
  netAmount: number;
  fees: number;
  currency: string;
  status: string;
  payoutProvider?: string;
  reference?: string;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
  failureReason?: string;
}

interface PayoutSummary {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  rejected: number;
  totalAmount: number;
  totalNetAmount: number;
}

const PayoutHistoryPage = () => {
  const [payouts, setPayouts] = useState<PayoutHistoryItem[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    rejected: 0,
    totalAmount: 0,
    totalNetAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'campaign' | 'commission'>('all');

  useEffect(() => {
    fetchPayoutHistory();
  }, [filter, typeFilter]);

  const fetchPayoutHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/payouts/history?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPayouts(result.data.payouts);
        setSummary(result.data.summary);
      } else {
        setError(result.error || 'Failed to fetch payout history');
      }
    } catch (err) {
      setError('Failed to fetch payout history');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'campaign' ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <DollarSign className="h-4 w-4" />
    );
  };

  const getProviderIcon = (provider?: string) => {
    if (!provider) return null;
    return provider === 'stripe' ? (
      <CreditCard className="h-4 w-4 text-blue-600" />
    ) : (
      <Building2 className="h-4 w-4 text-green-600" />
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#104901]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#104901] mb-2">Payout History</h1>
        <p className="text-gray-600">View all your payout requests and commission payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.totalNetAmount, 'USD')} paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed/Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.failed + summary.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Unsuccessful payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Status:</span>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
            className={filter === 'all' ? 'bg-[#104901] text-white' : ''}
          >
            All
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
            className={filter === 'pending' ? 'bg-[#104901] text-white' : ''}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
            className={filter === 'completed' ? 'bg-[#104901] text-white' : ''}
          >
            Completed
          </Button>
          <Button
            variant={filter === 'failed' ? 'default' : 'outline'}
            onClick={() => setFilter('failed')}
            size="sm"
            className={filter === 'failed' ? 'bg-[#104901] text-white' : ''}
          >
            Failed
          </Button>
        </div>

        <div className="flex gap-2 ml-4">
          <span className="text-sm font-medium text-gray-700 self-center">Type:</span>
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            size="sm"
            className={typeFilter === 'all' ? 'bg-[#104901] text-white' : ''}
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'campaign' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('campaign')}
            size="sm"
            className={typeFilter === 'campaign' ? 'bg-[#104901] text-white' : ''}
          >
            Campaign
          </Button>
          <Button
            variant={typeFilter === 'commission' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('commission')}
            size="sm"
            className={typeFilter === 'commission' ? 'bg-[#104901] text-white' : ''}
          >
            Commission
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payouts List */}
      {payouts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payout History</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "You don't have any payout history yet. Request a payout or earn commissions to see them here."
                  : `No ${filter} payouts found.`}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <Card key={payout.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(payout.type)}
                      <CardTitle className="text-lg">
                        {payout.type === 'campaign' ? 'Campaign Payout' : 'Commission Payout'}
                      </CardTitle>
                      {getProviderIcon(payout.payoutProvider)}
                    </div>
                    <CardDescription>
                      {payout.campaignTitle} •{' '}
                      {new Date(payout.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(payout.amount, payout.currency)}
                    </p>
                  </div>
                  {payout.fees > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fees</p>
                      <p className="text-sm font-medium text-red-600">
                        -{formatCurrency(payout.fees, payout.currency)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(payout.netAmount, payout.currency)}
                    </p>
                  </div>
                </div>

                {(payout.reference || payout.transactionId) && (
                  <div className="mt-4 pt-4 border-t">
                    {payout.reference && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">Reference</p>
                        <p className="text-sm font-mono">{payout.reference}</p>
                      </div>
                    )}
                    {payout.transactionId && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                        <p className="text-sm font-mono">{payout.transactionId}</p>
                      </div>
                    )}
                  </div>
                )}

                {(payout.rejectionReason || payout.failureReason) && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-red-600 font-medium mb-1">Reason</p>
                    <p className="text-sm text-red-700">
                      {payout.rejectionReason || payout.failureReason}
                    </p>
                  </div>
                )}

                {payout.processedAt && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Processed</p>
                    <p className="text-sm">
                      {new Date(payout.processedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/campaign/${payout.campaignId}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PayoutHistoryPage;

