"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Payout {
  id: string;
  charityId: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  reference: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  donationIds: string[];
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  charity: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function CharityPayoutsAdmin() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(
        `/api/charities/payouts?${params.toString()}`
      );
      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (
    payoutId: string,
    status: "completed" | "failed"
  ) => {
    setProcessing(payoutId);
    try {
      const response = await fetch(`/api/charities/payouts/${payoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          failureReason:
            status === "failed" ? "Manual review failed" : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payout");
      }

      toast.success(
        `Payout ${status === "completed" ? "completed" : "failed"} successfully`
      );
      fetchPayouts();
    } catch (error) {
      console.error("Error processing payout:", error);
      toast.error("Failed to process payout");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
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

  // Calculate statistics
  const stats = {
    total: payouts.length,
    pending: payouts.filter((p) => p.status === "pending").length,
    processing: payouts.filter((p) => p.status === "processing").length,
    completed: payouts.filter((p) => p.status === "completed").length,
    failed: payouts.filter((p) => p.status === "failed").length,
    totalAmount: payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Charity Payouts Management
          </h1>
          <p className="text-gray-600">
            Manage and process payouts to charities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Payouts
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats.totalAmount.toString(), "NGN")} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Successfully processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <p className="text-xs text-gray-500 mt-1">Failed payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payouts</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchPayouts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Payouts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-4">Loading payouts...</p>
            </div>
          ) : payouts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No payouts found</p>
              </CardContent>
            </Card>
          ) : (
            payouts.map((payout) => (
              <Card key={payout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {payout.charity.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Reference: {payout.reference}
                      </CardDescription>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(payout.amount, payout.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bank Details</p>
                      <p className="text-sm font-medium">{payout.bankName}</p>
                      <p className="text-xs text-gray-600">
                        {payout.accountNumber}
                      </p>
                      <p className="text-xs text-gray-600">
                        {payout.accountName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Donations</p>
                      <p className="text-lg font-semibold">
                        {payout.donationIds?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm">{formatDate(payout.createdAt)}</p>
                      {payout.processedAt && (
                        <>
                          <p className="text-xs text-gray-500 mt-1">
                            Processed
                          </p>
                          <p className="text-xs">
                            {formatDate(payout.processedAt)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {payout.failureReason && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Failure Reason:</strong> {payout.failureReason}
                      </p>
                    </div>
                  )}

                  {(payout.status === "pending" ||
                    payout.status === "processing") && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleProcessPayout(payout.id, "completed")
                        }
                        disabled={processing === payout.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                      <Button
                        onClick={() => handleProcessPayout(payout.id, "failed")}
                        disabled={processing === payout.id}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Mark as Failed
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
