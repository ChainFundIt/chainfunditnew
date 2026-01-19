"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Download,
  Clock,
  CreditCard,
  Users,
  BarChart3,
  Heart,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/currency";
import { CurrencyBreakdown } from "@/components/admin/currency-breakdown";
import Link from "next/link";

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  convertedAmount?: number | null;
  convertedCurrency?: string | null;
  exchangeRate?: number | null;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  chainerId?: string;
  chainerName?: string;
  createdAt: string;
  processedAt?: string;
  transactionId: string;
}

interface CharityDonation {
  id: string;
  charityId: string;
  amount: string;
  currency: string;
  donorName: string;
  donorEmail: string;
  paymentStatus: string;
  paymentMethod: string;
  payoutStatus: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
  charity?: {
    name: string;
    slug: string;
  };
}

interface DonationStats {
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  failedDonations: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  refundedAmount?: number;
  averageDonation: number;
  totalAmountByCurrency?: Array<{ currency: string; amount: number }>;
  completedAmountByCurrency?: Array<{ currency: string; amount: number }>;
  pendingAmountByCurrency?: Array<{ currency: string; amount: number }>;
  refundedAmountByCurrency?: Array<{ currency: string; amount: number }>;
  averageDonationByCurrency?: Array<{ currency: string; amount: number }>;
  recentDonations: Donation[];
}

interface DonationDetails {
  id: string;
  campaignId: string;
  donorId: string;
  amount: number | string;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  chainerId?: string | null;
  createdAt: string;
  processedAt?: string | null;
  paymentIntentId?: string | null;
  isAnonymous?: boolean | null;
  donorName?: string | null;
  donorEmail?: string | null;
  donorUserName?: string | null;
  donorUserEmail?: string | null;
  campaignTitle?: string | null;
  chainerInfo?: {
    id: string;
    userId: string;
    totalReferrals: number;
    totalRaised: number;
    commissionEarned: number;
    chainerName?: string | null;
  } | null;
  fraudScore?: number;
  suspiciousActivity?: boolean;
  donorHistory?: Array<{
    id: string;
    amount: number | string;
    currency: string;
    paymentStatus: string;
    createdAt: string;
    campaignTitle?: string | null;
  }>;
  failureReason?: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [charityDonations, setCharityDonations] = useState<CharityDonation[]>(
    []
  );
  const [charities, setCharities] = useState<any[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [charityLoading, setCharityLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [charityStatusFilter, setCharityStatusFilter] = useState("all");
  const [selectedCharity, setSelectedCharity] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [selectedDonations, setSelectedDonations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null
  );
  const [selectedDonationDetails, setSelectedDonationDetails] =
    useState<DonationDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
    fetchCharities();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, currencyFilter]);

  // Fetch charity donations only when needed (not on every filter change)
  useEffect(() => {
    fetchCharityDonations();
  }, [charityStatusFilter, selectedCharity]);

  const fetchDonations = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        currency: currencyFilter,
      });

      const response = await fetch(`/api/admin/donations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch donations");

      const data = await response.json();
      setDonations(data.donations || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  const fetchCharityDonations = async () => {
    setCharityLoading(true);
    try {
      // Use the optimized admin endpoint that fetches all donations in a single query
      const params = new URLSearchParams({
        charityId: selectedCharity,
        status: charityStatusFilter,
        limit: "1000",
      });

      const response = await fetch(`/api/admin/charities/donations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch charity donations");

      const data = await response.json();
      setCharityDonations(data.donations || []);
    } catch (error) {
      console.error("Error fetching charity donations:", error);
      setCharityDonations([]);
      toast.error("Failed to fetch charity donations");
    } finally {
      setCharityLoading(false);
    }
  };

  const fetchCharities = async () => {
    try {
      const response = await fetch("/api/charities?limit=100");
      const data = await response.json();
      setCharities(data.charities || []);
    } catch (error) {
      console.error("Error fetching charities:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/donations/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDonations.length === 0) {
      toast.error("Please select donations to perform bulk action");
      return;
    }

    try {
      const response = await fetch("/api/admin/donations/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationIds: selectedDonations,
          action,
        }),
      });

      if (!response.ok) throw new Error("Failed to perform bulk action");

      const data = await response.json();
      toast.success(data.message);
      setSelectedDonations([]);
      fetchDonations();
      fetchStats();
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to perform bulk action");
    }
  };

  const handleDonationAction = async (
    donationId: string,
    action: string,
    reason?: string
  ) => {
    if (action === "view") {
      handleViewDonation(donationId);
      return;
    }

    // Handle other actions that modify data
    try {
      const response = await fetch(`/api/admin/donations/${donationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to perform action");
      }

      const data = await response.json();
      toast.success(data.message || `Donation ${action} successful`);
      fetchDonations();
      fetchStats();
    } catch (error) {
      console.error("Error performing action:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to perform action";
      toast.error(errorMessage);
    }
  };

  const handleExportDonations = async () => {
    try {
      toast.info("Exporting donations data...");
      setTimeout(() => {
        toast.success("Donations data exported successfully!");
      }, 2000);
    } catch (error) {
      toast.error("Failed to export donations data");
    }
  };

  const handleViewDonation = (donationId: string) => {
    fetchDonationDetails(donationId);
  };

  const fetchDonationDetails = async (donationId: string) => {
    setSelectedDonationId(donationId);
    setSelectedDonationDetails(null);
    setDetailsLoading(true);
    try {
      const response = await fetch(`/api/admin/donations/${donationId}`);
      if (!response.ok) throw new Error("Failed to fetch donation details");
      const data = await response.json();
      setSelectedDonationDetails(data);
    } catch (error) {
      console.error("Error fetching donation details:", error);
      toast.error("Failed to load donation details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      completed: "default",
      failed: "destructive",
    } as const;

    const icons = {
      pending: Clock,
      completed: CheckCircle,
      failed: XCircle,
    } as const;

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCharityStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCharityCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.max(0, Math.floor(diff / (1000 * 60)));
    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Filter charity donations
  const filteredCharityDonations = charityDonations.filter((d) => {
    if (selectedCharity !== "all" && d.charityId !== selectedCharity)
      return false;
    if (
      charityStatusFilter !== "all" &&
      d.paymentStatus !== charityStatusFilter
    )
      return false;
    return true;
  });

  // Calculate charity stats
  const charityStats = {
    total: filteredCharityDonations.length,
    totalAmount: filteredCharityDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount),
      0
    ),
    completed: filteredCharityDonations.filter(
      (d) => d.paymentStatus === "completed"
    ).length,
    pending: filteredCharityDonations.filter(
      (d) => d.paymentStatus === "pending"
    ).length,
  };

  const charityTotalsByCurrency = filteredCharityDonations.reduce<
    Array<{ currency: string; amount: number }>
  >((acc, donation) => {
    const currency = donation.currency || "USD";
    const amount = parseFloat(donation.amount);
    const existing = acc.find((entry) => entry.currency === currency);
    if (existing) {
      existing.amount += amount;
    } else {
      acc.push({ currency, amount });
    }
    return acc;
  }, []);

  if (loading && charityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Donations Management</h1>
            <p className="text-gray-600">
              Track and manage all platform donations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportDonations}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="campaign-donations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaign-donations">
              Campaign Donations
            </TabsTrigger>
            <TabsTrigger value="charity-donations">
              Charity Donations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaign-donations" className="space-y-6">
            {/* Campaign Donations Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Campaign Donations</h2>
                <p className="text-gray-600">
                  Track and manage campaign donations
                </p>
              </div>
            </div>

            {/* Campaign Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Donations
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-brand-green-dark">
                      {stats.completedDonations}
                      <span className="text-xs text-muted-foreground ml-1">
                        completed
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalDonations}
                      <span className="text-xs text-muted-foreground ml-1">
                        total
                      </span>
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
                    <CurrencyBreakdown
                      amounts={stats.completedAmountByCurrency}
                      emptyLabel="No completed amounts"
                      className="mt-1"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Donation
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <CurrencyBreakdown
                      amounts={stats.averageDonationByCurrency}
                      emptyLabel="No averages yet"
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaign Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search donations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={currencyFilter}
                    onValueChange={setCurrencyFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Donations Table */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Donations</CardTitle>
                <CardDescription>
                  Monitor and manage all campaign donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedDonations.length ===
                            (donations || []).length &&
                            (donations || []).length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDonations(
                                (donations || []).map((d) => d.id)
                              );
                            } else {
                              setSelectedDonations([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ambassador</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(donations || []).map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDonations.includes(donation.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDonations([
                                  ...selectedDonations,
                                  donation.id,
                                ]);
                              } else {
                                setSelectedDonations(
                                  selectedDonations.filter(
                                    (id) => id !== donation.id
                                  )
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {donation.donorName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donation.donorEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {donation.campaignTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(donation.amount, donation.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-sm capitalize">
                              {donation.paymentMethod}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(donation.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          {donation.chainerName ? (
                            <div>
                              <div className="font-medium">
                                {donation.chainerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Referred
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Direct</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleDonationAction(donation.id, "view")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charity-donations" className="space-y-6">
            {/* Charity Donations Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Charity Donations</h2>
                <p className="text-gray-600">
                  View and manage all charity donations
                </p>
              </div>
            </div>

            {/* Charity Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Donations
                  </CardTitle>
                  <Heart className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{charityStats.total}</div>
                  <p className="text-xs text-gray-500 mt-1">All donations</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <CurrencyBreakdown
                    amounts={charityTotalsByCurrency}
                    emptyLabel="No totals yet"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {charityStats.completed}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Successfully processed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Users className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {charityStats.pending}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
                </CardContent>
              </Card>
            </div>

            {/* Charity Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                value={selectedCharity}
                onValueChange={setSelectedCharity}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filter by charity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Charities</SelectItem>
                  {charities.map((charity) => (
                    <SelectItem key={charity.id} value={charity.id}>
                      {charity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={charityStatusFilter}
                onValueChange={setCharityStatusFilter}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={fetchCharityDonations} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Charity Donations Table */}
            {charityLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">
                  Loading charity donations...
                </p>
              </div>
            ) : filteredCharityDonations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No charity donations found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Charity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Donor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCharityDonations.map((donation) => (
                        <tr key={donation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="font-medium text-gray-900">
                                {donation.charity?.name || "Unknown Charity"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {donation.paymentMethod}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-sm text-gray-900">
                                {donation.isAnonymous
                                  ? "Anonymous"
                                  : donation.donorName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {donation.isAnonymous
                                  ? "Hidden"
                                  : donation.donorEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900">
                              {formatCharityCurrency(
                                donation.amount,
                                donation.currency
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {donation.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCharityStatusBadge(donation.paymentStatus)}
                            <div className="text-xs text-gray-500 mt-1">
                              Payout: {donation.payoutStatus}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(donation.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                href={`/virtual-giving-mall/${donation.charity?.slug}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Charity
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog
          open={Boolean(selectedDonationId)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDonationId(null);
              setSelectedDonationDetails(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Donation Details</DialogTitle>
              <DialogDescription>
                {selectedDonationDetails?.id
                  ? `Donation ${selectedDonationDetails.id}`
                  : "Loading donation details"}
              </DialogDescription>
            </DialogHeader>

            {detailsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : selectedDonationDetails ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="text-sm font-semibold">Donation</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(selectedDonationDetails.amount),
                          selectedDonationDetails.currency
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span>{getStatusBadge(selectedDonationDetails.paymentStatus)}</span>
                    </div>
                    {selectedDonationDetails.paymentStatus === "failed" && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Failure Reason</span>
                        <span>{selectedDonationDetails.failureReason || "Unknown"}</span>
                      </div>

                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Method</span>
                      <span className="text-right capitalize">
                        {selectedDonationDetails.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(selectedDonationDetails.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Processed</span>
                      <span>
                        {selectedDonationDetails.processedAt
                          ? formatDate(selectedDonationDetails.processedAt)
                          : "Not processed"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment Intent</span>
                      <span className="truncate max-w-[200px]">
                        {selectedDonationDetails.paymentIntentId || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="text-sm font-semibold">Donor</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span>
                        {selectedDonationDetails.isAnonymous
                          ? "Anonymous"
                          : selectedDonationDetails.donorName ||
                          selectedDonationDetails.donorUserName ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <span>
                        {selectedDonationDetails.isAnonymous
                          ? "Hidden"
                          : selectedDonationDetails.donorEmail ||
                          selectedDonationDetails.donorUserEmail ||
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Donor ID</span>
                      <span className="truncate max-w-[200px]">
                        {selectedDonationDetails.donorId}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Anonymous</span>
                      <span>
                        {selectedDonationDetails.isAnonymous ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="text-sm font-semibold">Campaign</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Title</span>
                      <span className="text-right">
                        {selectedDonationDetails.campaignTitle || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Campaign ID</span>
                      <span className="truncate max-w-[200px]">
                        {selectedDonationDetails.campaignId}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-2">
                    <h3 className="text-sm font-semibold">Chained</h3>
                    {selectedDonationDetails.chainerInfo ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Name</span>
                          <span>
                            {selectedDonationDetails.chainerInfo.chainerName ||
                              "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Referrals</span>
                          <span>
                            {selectedDonationDetails.chainerInfo.totalReferrals}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Raised</span>
                          <span>
                            {formatCurrency(
                              Number(
                                selectedDonationDetails.chainerInfo.totalRaised
                              ),
                              selectedDonationDetails.currency
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Commission</span>
                          <span>
                            {formatCurrency(
                              Number(
                                selectedDonationDetails.chainerInfo
                                  .commissionEarned
                              ),
                              selectedDonationDetails.currency
                            )}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Direct donation
                      </p>
                    )}
                  </div>
                </div>

                {/* <div className="rounded-lg border p-4 space-y-2">
                  <h3 className="text-sm font-semibold">Risk Assessment</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fraud Score</span>
                    <span>{selectedDonationDetails.fraudScore ?? 0}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Suspicious Activity</span>
                    <span>
                      {selectedDonationDetails.suspiciousActivity ? "Yes" : "No"}
                    </span>
                  </div>
                </div> */}

                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Recent Donor Activity</h3>
                  {selectedDonationDetails.donorHistory &&
                    selectedDonationDetails.donorHistory.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDonationDetails.donorHistory.map((history) => (
                        <div
                          key={history.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <div className="font-medium">
                              {history.campaignTitle || "Unknown campaign"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatRelativeTime(history.createdAt)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(
                                Number(history.amount),
                                history.currency
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {history.paymentStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent donations found.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Donation details could not be loaded.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
