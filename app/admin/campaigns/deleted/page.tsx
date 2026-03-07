"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { BarChart3, RotateCcw, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { R2Image } from "@/components/ui/r2-image";

interface DeletedCampaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string | null;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  donationCount: number;
  chainerCount: number;
}

export default function AdminRecentlyDeletedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<DeletedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [restoring, setRestoring] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });
      const response = await fetch(`/api/admin/campaigns/deleted?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch");
      setCampaigns(data.campaigns || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching deleted campaigns:", error);
      toast.error("Failed to load recently deleted campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage]);

  const handleRestore = async (campaignIds: string[]) => {
    if (campaignIds.length === 0) {
      toast.error("Select at least one campaign to restore");
      return;
    }
    setRestoring(true);
    try {
      const response = await fetch("/api/admin/campaigns/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignIds, action: "restore" }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to restore");
      }
      toast.success("Campaign(s) restored successfully");
      setSelectedCampaigns([]);
      fetchCampaigns();
    } catch (error) {
      console.error("Error restoring campaigns:", error);
      toast.error(error instanceof Error ? error.message : "Failed to restore campaigns");
    } finally {
      setRestoring(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recently Deleted
          </CardTitle>
          <CardDescription>
            Campaigns moved here are hidden from the user dashboard and main campaign list. Restore to make them visible again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedCampaigns.length > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedCampaigns.length} campaign(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRestore(selectedCampaigns)}
                  disabled={restoring}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedCampaigns([])}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5F8555]" />
            </div>
          ) : campaigns.length === 0 ? (
            <p className="py-12 text-center text-gray-500">
              No recently deleted campaigns.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Campaign</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Deleted at</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                            } else {
                              setSelectedCampaigns(selectedCampaigns.filter((id) => id !== campaign.id));
                            }
                          }}
                        />
                      </TableCell>
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
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-[200px]">
                              {campaign.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {campaign.description?.slice(0, 40)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {campaign.creatorName ?? "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.creatorId?.slice(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatCurrency(campaign.currentAmount, campaign.currency)} /{" "}
                          {formatCurrency(campaign.goalAmount, campaign.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {campaign.donationCount} donations · {campaign.chainerCount} chainers
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(campaign.deletedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore([campaign.id])}
                          disabled={restoring}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
