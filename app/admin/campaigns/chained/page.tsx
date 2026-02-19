"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Percent,
  Search,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { R2Image } from "@/components/ui/r2-image";

interface ChainedCampaign {
  id: string;
  slug?: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: "active" | "paused" | "completed" | "closed" | "under_review";
  complianceStatus?: "in_review" | "approved" | "blocked";
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  chainerCount: number;
  donationCount: number;
  isChained: boolean;
  chainerCommissionRate: number;
  coverImageUrl?: string;
}

interface ChainedStats {
  totalChainedCampaigns: number;
  activeChainedCampaigns: number;
  totalChainers: number;
  averageCommissionRate: number;
  totalChainedRaised: number;
}

export default function AdminChainedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<ChainedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<ChainedStats | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, [searchTerm]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "200",
        search: searchTerm,
        status: "all",
        category: "all",
      });

      const response = await fetch(
        `/api/admin/campaigns?${params.toString()}`
      );
      const data = await response.json();

      const all = (data.campaigns || []) as any[];
      const chained = all.filter(
        (c) =>
          c.isChained ||
          c.chainerCommissionRate > 0
      ) as ChainedCampaign[];

      setCampaigns(chained);

      if (chained.length === 0) {
        setStats({
          totalChainedCampaigns: 0,
          activeChainedCampaigns: 0,
          totalChainers: 0,
          averageCommissionRate: 0,
          totalChainedRaised: 0,
        });
        return;
      }

      const totalChainedCampaigns = chained.length;
      const activeChainedCampaigns = chained.filter(
        (c) => c.status === "active"
      ).length;
      const totalChainers = chained.reduce(
        (sum, c) => sum + (c.chainerCount || 0),
        0
      );
      const averageCommissionRate =
        chained.reduce(
          (sum, c) => sum + (c.chainerCommissionRate || 0),
          0
        ) / totalChainedCampaigns;
      const totalChainedRaised = chained.reduce(
        (sum, c) => sum + (c.currentAmount || 0),
        0
      );

      setStats({
        totalChainedCampaigns,
        activeChainedCampaigns,
        totalChainers,
        averageCommissionRate,
        totalChainedRaised,
      });
    } catch (error) {
      console.error("Error fetching chained campaigns:", error);
      toast.error("Failed to fetch chained campaigns");
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    if (!goal || goal <= 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const currencyToUse = currencyCode || "USD";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyToUse,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chained Campaigns
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor campaigns that allow ambassador chaining, commissions, and
            performance.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chained Campaigns
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalChainedCampaigns.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeChainedCampaigns} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Ambassadors
                </CardTitle>
                <Users className="h-4 w-4 text-brand-green-light" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalChainers.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total chainers across all campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Commission Rate
                </CardTitle>
                <Percent className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.averageCommissionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Average commission rate for chained campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Raised (Chained Campaigns)
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalChainedRaised)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sum of current amounts for chained campaigns
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search chained campaigns by title, creator, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chained Campaigns ({campaigns.length})</CardTitle>
            <CardDescription>
              Campaigns that have allowed ambassador chaining and their
              performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-dark mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Loading chained campaigns...
                  </p>
                </div>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 mb-2">
                  No chained campaigns found.
                </p>
                <p className="text-sm text-gray-500">
                  Campaigns will appear here once creators enable chaining and
                  set a commission rate.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Ambassadors</TableHead>
                      <TableHead>Donations</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {campaign.coverImageUrl ? (
                              <R2Image
                                src={campaign.coverImageUrl}
                                alt={campaign.title}
                                className="h-12 w-12 rounded-lg object-cover"
                                width={48}
                                height={48}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {campaign.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {campaign.description.slice(0, 60)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {campaign.creatorName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {campaign.creatorId.slice(0, 8)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-50 text-blue-800 border-blue-200">
                              <Percent className="h-3 w-3 mr-1" />
                              {campaign?.chainerCommissionRate?.toFixed(1)}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>
                                {formatCurrency(
                                  campaign.currentAmount,
                                  campaign.currency
                                )}
                              </span>
                              <span className="text-gray-500">
                                {getProgressPercentage(
                                  campaign.currentAmount,
                                  campaign.goalAmount
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${getProgressPercentage(
                                    campaign.currentAmount,
                                    campaign.goalAmount
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Users className="h-3 w-3 mr-1 text-blue-600" />
                            <span className="text-gray-600">
                              {campaign.chainerCount} ambassadors
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <DollarSign className="h-3 w-3 mr-1 text-brand-green-dark" />
                            <span className="text-gray-600">
                              {campaign.donationCount} donations
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {new Date(campaign.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

