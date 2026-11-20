"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Eye, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/currency";
import { getCollectionCategoryLabel } from "@/lib/collections/categories";

interface CollectionRow {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  organiserName: string;
  currency: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  creatorName: string | null;
  creatorEmail: string | null;
  contributionCount: number;
  completedContributionCount: number;
  balance?: {
    totalRaised: number;
    availableAmount: number;
    totalPaidOut: number;
  };
}

interface CollectionStats {
  totalCollections: number;
  activeCollections: number;
  closedCollections: number;
  raisedByCurrency: Record<string, number>;
}

interface CollectionDetail {
  collection: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    category: string | null;
    organiserName: string;
    currency: string;
    targetAmount: string | null;
    status: string;
    isPublic: boolean;
    dueAt: string | null;
    creatorName: string | null;
    creatorEmail: string | null;
  };
  contributions: Array<{
    id: string;
    contributorName: string | null;
    contributorEmail: string | null;
    amount: string;
    currency: string;
    paymentStatus: string;
    isAnonymous: boolean;
    createdAt: string;
  }>;
  payouts: Array<{
    id: string;
    netAmount: string;
    currency: string;
    status: string;
    payoutProvider: string;
    createdAt: string;
  }>;
  balance?: {
    totalRaised: number;
    availableAmount: number;
    totalPaidOut: number;
  };
}

const formatAmounts = (amounts: Record<string, number>) => {
  const entries = Object.entries(amounts);
  if (entries.length === 0) return "0.00";
  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ");
};

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        status,
        search,
      });
      const response = await fetch(`/api/admin/collections?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load collections");
      }
      setCollections(data.collections || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load collections"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/collections/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load collection");
      }
      setDetail(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load collection"
      );
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateCollection = async (
    action: "close" | "reopen" | "hide" | "show"
  ) => {
    if (!selectedId) return;
    setActing(true);
    try {
      const response = await fetch(`/api/admin/collections/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update collection");
      }
      toast.success(data.message || "Collection updated");
      await Promise.all([load(), openDetail(selectedId)]);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update collection"
      );
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-gray-600">
            Review group pots, contributions, and whether they are still open.
          </p>
        </div>
        <Button onClick={load} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCollections}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCollections}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedCollections}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatAmounts(stats.raisedByCurrency)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search by title, organiser, or email"
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All collections</CardTitle>
          <CardDescription>
            Raised totals count completed contributions only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No collections found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collection</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Contributions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell>
                        <div className="font-medium">{collection.title}</div>
                        <div className="text-xs text-gray-500">
                          {getCollectionCategoryLabel(collection.category) ||
                            "Collection"}
                          {collection.isPublic ? "" : " · Hidden"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{collection.creatorName || collection.organiserName}</div>
                        <div className="text-xs text-gray-500">
                          {collection.creatorEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {collection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(
                          collection.balance?.totalRaised ?? 0,
                          collection.currency
                        )}
                      </TableCell>
                      <TableCell>
                        {collection.completedContributionCount}
                        {collection.contributionCount !==
                        collection.completedContributionCount
                          ? ` / ${collection.contributionCount}`
                          : ""}
                      </TableCell>
                      <TableCell>
                        {format(new Date(collection.createdAt), "d MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(collection.id)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
            setDetail(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.collection.title || "Collection"}</DialogTitle>
            <DialogDescription>
              {detail
                ? `${detail.collection.creatorName || detail.collection.organiserName} · ${detail.collection.creatorEmail || "No email"}`
                : "Loading collection"}
            </DialogDescription>
          </DialogHeader>

          {detailLoading || !detail ? (
            <p className="py-6 text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {detail.collection.status}
                </Badge>
                <Badge variant="outline">
                  {detail.collection.isPublic ? "Public" : "Hidden"}
                </Badge>
                <Link
                  href={`/collections/${detail.collection.slug}`}
                  className="text-sm font-medium text-[#104109] underline"
                  target="_blank"
                >
                  Public page
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Raised</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      detail.balance?.totalRaised ?? 0,
                      detail.collection.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Available</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      detail.balance?.availableAmount ?? 0,
                      detail.collection.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Paid out</p>
                  <p className="font-semibold">
                    {formatCurrency(
                      detail.balance?.totalPaidOut ?? 0,
                      detail.collection.currency
                    )}
                  </p>
                </div>
              </div>

              {detail.collection.description && (
                <p className="text-sm text-gray-700">{detail.collection.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {detail.collection.status === "active" ? (
                  <Button
                    variant="outline"
                    disabled={acting}
                    onClick={() => updateCollection("close")}
                  >
                    Close collection
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled={acting}
                    onClick={() => updateCollection("reopen")}
                  >
                    Reopen collection
                  </Button>
                )}
                {detail.collection.isPublic ? (
                  <Button
                    variant="outline"
                    disabled={acting}
                    onClick={() => updateCollection("hide")}
                  >
                    Hide from public
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled={acting}
                    onClick={() => updateCollection("show")}
                  >
                    Make public
                  </Button>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Contributions</h3>
                {detail.contributions.length === 0 ? (
                  <p className="text-sm text-gray-500">No contributions yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {detail.contributions.map((contribution) => (
                      <li
                        key={contribution.id}
                        className="flex items-start justify-between gap-4 border-b border-gray-100 py-2"
                      >
                        <div>
                          <p className="font-medium">
                            {contribution.contributorName || "Supporter"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {contribution.contributorEmail || "No email"}
                            {contribution.isAnonymous ? " · Anonymous" : ""} ·{" "}
                            {format(new Date(contribution.createdAt), "d MMM yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>
                            {formatCurrency(
                              Number(contribution.amount),
                              contribution.currency
                            )}
                          </p>
                          <p className="text-xs capitalize text-gray-500">
                            {contribution.paymentStatus}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Payouts</h3>
                {detail.payouts.length === 0 ? (
                  <p className="text-sm text-gray-500">No payout requests.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {detail.payouts.map((payout) => (
                      <li key={payout.id} className="flex justify-between">
                        <span className="capitalize">
                          {payout.status} · {payout.payoutProvider}
                        </span>
                        <span>
                          {formatCurrency(Number(payout.netAmount), payout.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
