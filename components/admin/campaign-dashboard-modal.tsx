'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  BarChart3,
  Target,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { R2Image } from '@/components/ui/r2-image';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  coverImageUrl?: string;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  convertedAmount?: number | null;
  convertedCurrency?: string | null;
  exchangeRate?: number | null;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  paymentIntentId?: string | null;
  message?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  processedAt?: string | null;
  donorId: string;
  donorName: string;
  donorEmail?: string | null;
  chainerId?: string | null;
  chainerName?: string | null;
}

interface CampaignStats {
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  failedDonations: number;
  totalAmount: number;
  uniqueDonors: number;
  averageDonation: number;
}

interface CampaignDashboardModalProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
}

export function CampaignDashboardModal({
  campaignId,
  open,
  onOpenChange,
  currency: userCurrency,
}: CampaignDashboardModalProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (open && campaignId) {
      fetchCampaignData();
    } else {
      // Reset state when modal closes
      setCampaign(null);
      setDonations([]);
      setStats(null);
    }
  }, [open, campaignId]);

  const fetchCampaignData = async () => {
    if (!campaignId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: '1000',
      });

      const response = await fetch(`/api/admin/campaigns/${campaignId}/donations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaign data');

      const data = await response.json();
      if (data.success) {
        setCampaign(data.campaign);
        setDonations(data.donations || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && campaignId) {
      fetchCampaignData();
    }
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
    } as const;

    const icons = {
      pending: Clock,
      completed: CheckCircle,
      failed: XCircle,
    } as const;

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const filteredDonations = donations.filter(d => {
    if (statusFilter === 'all') return true;
    return d.paymentStatus === statusFilter;
  });

  const campaignCurrency = campaign?.currency || userCurrency || 'USD';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : campaign ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                {campaign.coverImageUrl && (
                  <R2Image
                    src={campaign.coverImageUrl}
                    alt={campaign.title}
                    className="h-20 w-20 rounded-lg object-cover"
                    width={80}
                    height={80}
                  />
                )}
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{campaign.title}</DialogTitle>
                  <DialogDescription className="mt-2 line-clamp-2">
                    {campaign.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="donations">Donations ({donations.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Campaign Stats */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(stats.totalAmount, campaignCurrency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          of {formatCurrency(campaign.goalAmount, campaignCurrency)} goal
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDonations}</div>
                        <p className="text-xs text-muted-foreground">
                          {stats.completedDonations} completed
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.uniqueDonors}</div>
                        <p className="text-xs text-muted-foreground">
                          Average: {formatCurrency(stats.averageDonation, campaignCurrency)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {getProgressPercentage(campaign.currentAmount, campaign.goalAmount)}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${getProgressPercentage(campaign.currentAmount, campaign.goalAmount)}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Campaign Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className="mt-1">{campaign.status.toUpperCase()}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium mt-1">{formatDate(campaign.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Goal Amount</p>
                        <p className="text-sm font-medium mt-1">
                          {formatCurrency(campaign.goalAmount, campaignCurrency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current Amount</p>
                        <p className="text-sm font-medium mt-1">
                          {formatCurrency(campaign.currentAmount, campaignCurrency)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status Breakdown */}
                {stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Donation Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">{stats.completedDonations}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium">{stats.pendingDonations}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-sm font-medium">{stats.failedDonations}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="donations" className="space-y-4">
                {/* Filters */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Donations Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Donations ({filteredDonations.length})</CardTitle>
                    <CardDescription>
                      All donations received for this campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredDonations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No donations found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Donor</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ambassador</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredDonations.map((donation) => (
                              <TableRow key={donation.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                                    </div>
                                    {!donation.isAnonymous && donation.donorEmail && (
                                      <div className="text-sm text-gray-500">
                                        {donation.donorEmail}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">
                                    {formatCurrency(donation.amount, donation.currency)}
                                  </div>
                                  {donation.convertedAmount && donation.convertedCurrency && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      ≈ {formatCurrency(donation.convertedAmount, donation.convertedCurrency)}
                                      {donation.exchangeRate && (
                                        <span className="ml-1">
                                          (Rate: {Number(donation.exchangeRate).toFixed(4)})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <CreditCard className="h-4 w-4" />
                                    <span className="text-sm capitalize">{donation.paymentMethod}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(donation.paymentStatus)}</TableCell>
                                <TableCell>
                                  {donation.chainerName ? (
                                    <div>
                                      <div className="font-medium">{donation.chainerName}</div>
                                      <div className="text-sm text-gray-500">Referred</div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Direct</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">{formatDate(donation.createdAt)}</div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Campaign not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
