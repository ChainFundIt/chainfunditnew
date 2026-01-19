"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  Download,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { formatCurrency } from '@/lib/utils/currency';
import { CurrencyBreakdown } from "@/components/admin/currency-breakdown";

// Chart configuration
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Users",
    color: "hsl(var(--chart-2))",
  },
};

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalCampaigns: number;
    totalDonations: number;
    totalAmount: number;
    totalChainers: number;
    totalPayouts: number;
    platformRevenue: number;
    averageDonation: number;
    totalAmountByCurrency?: Array<{ currency: string; amount: number }>;
    platformRevenueByCurrency?: Array<{ currency: string; amount: number }>;
    averageDonationByCurrency?: Array<{ currency: string; amount: number }>;
  };
  growth: {
    userGrowth: Array<{ month: string; count: number }>;
    campaignGrowth: Array<{ month: string; count: number }>;
    donationGrowth: Array<{ month: string; count: number; amount: number }>;
    revenueGrowth: Array<{ month: string; amount: number }>;
  };
  performance: {
    campaignRevenue: Array<{
      id: string;
      title: string;
      donations: number;
      raised: number;
      platformRevenue: number;
      currency: string;
    }>;
    topCampaigns: Array<{
      id: string;
      title: string;
      amount: number;
      donations: number;
      chainers: number;
      currency?: string;
    }>;
    topChainers: Array<{
      id: string;
      name: string;
      referrals: number;
      raised: number;
      commission: number;
      currency?: string;
    }>;
    topDonors: Array<{
      id: string;
      name: string;
      totalDonated: number;
      donationCount: number;
      currency?: string;
    }>;
  };
  metrics: {
    conversionRates: {
      donationToChainer: number;
      clickToDonation: number;
      campaignSuccess: number;
    };
    engagement: {
      averageSessionTime: number;
      bounceRate: number;
      returnVisitorRate: number;
    };
    fraud: {
      fraudScore: number;
      suspiciousTransactions: number;
      blockedAttempts: number;
    };
  };
  charts: {
    revenueByCurrency: Array<{
      currency: string;
      amount: number;
      percentage: number;
    }>;
    donationsByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    campaignsByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    userActivity: Array<{ hour: number; activeUsers: number }>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAllCampaignRevenue, setShowAllCampaignRevenue] = useState(false);

  // Helper function to format chart data
  const formatChartData = (data: Array<{ month: string; count?: number; amount?: number }>) => {
    return data.map(item => ({
      date: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      value: item.count || item.amount || 0,
    }));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, refreshKey]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        range: timeRange,
      });

      const response = await fetch(`/api/admin/analytics?${params}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success("Analytics refreshed");
  };

  const handleExport = () => {
    toast.success("Export started - you will receive an email when ready");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const campaignRevenueTotals = analytics.performance.campaignRevenue.reduce(
    (acc, campaign) => {
      const key = (campaign.currency || "USD").toUpperCase();
      acc[key] = (acc[key] || 0) + campaign.platformRevenue;
      return acc;
    },
    {} as Record<string, number>
  );

  const campaignDonationTotals = analytics.performance.campaignRevenue.reduce(
    (acc, campaign) => {
      const key = (campaign.currency || "USD").toUpperCase();
      acc[key] = (acc[key] || 0) + campaign.raised;
      return acc;
    },
    {} as Record<string, number>
  );

  const campaignDonationCounts = analytics.performance.campaignRevenue.reduce(
    (acc, campaign) => {
      const key = (campaign.currency || "USD").toUpperCase();
      acc[key] = (acc[key] || 0) + campaign.donations;
      return acc;
    },
    {} as Record<string, number>
  );

  const campaignDonationCountsById = analytics.performance.campaignRevenue.reduce(
    (acc, campaign) => {
      acc[campaign.id] = (acc[campaign.id] || 0) + campaign.donations;
      return acc;
    },
    {} as Record<string, number>
  );

  const campaignRevenueTotalsList = Object.entries(campaignRevenueTotals)
    .map(([currencyCode, amount]) => ({
      currency: currencyCode,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const campaignDonationTotalsList = Object.entries(campaignDonationTotals)
    .map(([currencyCode, amount]) => ({
      currency: currencyCode,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const averageDonationByCurrency = Object.entries(campaignDonationTotals)
    .map(([currencyCode, amount]) => {
      const donationCount = campaignDonationCounts[currencyCode] || 0;
      return {
        currency: currencyCode,
        amount: donationCount > 0 ? amount / donationCount : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const totalCampaignDonations = Object.values(campaignDonationCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const totalCampaignRevenue = Object.values(campaignRevenueTotals).reduce(
    (sum, amount) => sum + amount,
    0
  );

  const revenuePerDonation =
    totalCampaignDonations > 0
      ? totalCampaignRevenue / totalCampaignDonations
      : 0;

  const renderSingleOrMultiCurrencyValue = (
    items: Array<{ currency: string; amount: number }>
  ) => {
    if (items.length === 1) {
      return formatCurrency(items[0].amount, items[0].currency);
    }
    // if (items.length === 0) {
    //   return formatCurrency(0, "USD");
    // }
    // return "Multiple currencies";
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive platform analytics and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.overview.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.totalDonations.toLocaleString()} completed donations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {renderSingleOrMultiCurrencyValue(campaignRevenueTotalsList)}
              </div>
              {campaignRevenueTotalsList.length > 1 ? (
                <CurrencyBreakdown
                  amounts={campaignRevenueTotalsList}
                  emptyLabel="No revenue yet"
                  className="mt-2"
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Avg platform fee per donation{" "}
                  {formatCurrency(
                    revenuePerDonation,
                    campaignRevenueTotalsList[0]?.currency || "USD"
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.overview.totalCampaigns.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.totalChainers} ambassadors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donations
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {renderSingleOrMultiCurrencyValue(campaignDonationTotalsList)}
              </div>
              {campaignDonationTotalsList.length > 1 ? (
                <CurrencyBreakdown
                  amounts={campaignDonationTotalsList}
                  emptyLabel="No totals yet"
                  className="mt-2"
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Avg donation{" "}
                  {formatCurrency(
                    averageDonationByCurrency[0]?.amount || 0,
                    averageDonationByCurrency[0]?.currency || "USD"
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Growth</CardTitle>
              <CardDescription>Monthly donation counts</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <AreaChart data={formatChartData(analytics.growth.revenueGrowth)}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [Number(value), 'Donations']}
                    />} 
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <LineChart data={formatChartData(analytics.growth.userGrowth)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [value, 'New Users']}
                    />} 
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Highest earning campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.topCampaigns
                  .slice(0, 5)
                  .map((campaign, index) => {
                    const donationCount =
                      campaignDonationCountsById[campaign.id] ??
                      campaign.donations;

                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between"
                      >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {campaign.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {donationCount} donations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            campaign.amount,
                            campaign.currency || "USD"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {campaign.chainers} ambassadors
                        </p>
                      </div>
                    </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Top Chainers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Ambassadors</CardTitle>
              <CardDescription>Highest performing ambassadors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.topChainers
                  .slice(0, 5)
                  .map((chainer, index) => (
                    <div
                      key={chainer.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{chainer.name}</p>
                          <p className="text-xs text-gray-500">
                            {chainer.referrals} referrals
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            chainer.raised,
                            chainer.currency || "USD"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(
                            chainer.commission,
                            chainer.currency || "USD"
                          )}{" "}
                          earned
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Donors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Most generous contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.topDonors
                  .slice(0, 5)
                  .map((donor, index) => (
                    <div
                      key={donor.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{donor.name}</p>
                          <p className="text-xs text-gray-500">
                            {donor.donationCount} donations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(
                            donor.totalDonated,
                            donor.currency || "USD"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Campaign */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle>Revenue by Campaign</CardTitle>
              <CardDescription>
                Platform earnings per campaign based on completed donations in range
              </CardDescription>
            </div>
            {analytics.performance.campaignRevenue.length > 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllCampaignRevenue((v) => !v)}
              >
                {showAllCampaignRevenue ? "Show top 10" : "View all"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Currency</TableHead>
                    <TableHead className="text-right">Donations</TableHead>
                    <TableHead className="text-right">Total Raised</TableHead>
                    <TableHead className="text-right">Platform Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAllCampaignRevenue
                    ? analytics.performance.campaignRevenue
                    : analytics.performance.campaignRevenue.slice(0, 10)
                  ).map((row) => (
                    <TableRow key={`${row.id}-${row.currency}`}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell className="text-right">{row.currency}</TableCell>
                      <TableCell className="text-right">{row.donations}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.raised, row.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.platformRevenue, row.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {analytics.performance.campaignRevenue.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                        No completed donations in this time range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {campaignRevenueTotalsList.length > 0 && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-sm font-medium">Total platform revenue in range</p>
                <div className="mt-2 grid gap-1 text-sm text-gray-600">
                  {campaignRevenueTotalsList.map((item) => (
                    <div key={item.currency}>
                      {formatCurrency(item.amount, item.currency)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analytics.performance.campaignRevenue.length > 10 && (
              <p className="mt-3 text-xs text-gray-500">
                Showing{" "}
                {showAllCampaignRevenue
                  ? analytics.performance.campaignRevenue.length
                  : Math.min(10, analytics.performance.campaignRevenue.length)}{" "}
                of {analytics.performance.campaignRevenue.length} campaigns
              </p>
            )}
          </CardContent>
        </Card>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Donation to Ambassador
                  </span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.conversionRates.donationToChainer}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Click to Donation</span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.conversionRates.clickToDonation}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Campaign Success</span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.conversionRates.campaignSuccess}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>User behavior insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Session Time</span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.engagement.averageSessionTime}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.engagement.bounceRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Return Visitors</span>
                  <span className="text-lg font-bold">
                    {analytics.metrics.engagement.returnVisitorRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Revenue by Currency</CardTitle>
            <CardDescription>
              Platform fees collected in each currency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {campaignRevenueTotalsList.length === 0 && (
                <p className="text-sm text-gray-500">No platform revenue yet.</p>
              )}
              {campaignRevenueTotalsList.map((currency) => (
                <div
                  key={currency.currency}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{currency.currency}</p>
                    <p className="text-sm text-gray-500">Platform revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(currency.amount, currency.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
