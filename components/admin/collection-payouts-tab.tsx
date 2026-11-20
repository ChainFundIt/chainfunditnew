"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock, RefreshCw, Search, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
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

interface CollectionPayoutRow {
  id: string;
  requestedAmount: string;
  netAmount: string;
  fees: string;
  currency: string;
  status: string;
  payoutProvider: string;
  userName: string | null;
  userEmail: string | null;
  collectionTitle: string | null;
  createdAt: string;
  rejectionReason: string | null;
  failureReason: string | null;
}

interface CollectionPayoutStats {
  totalPayouts: number;
  pendingPayouts: number;
  pendingAmountByCurrency: Record<string, number>;
  paidAmountByCurrency: Record<string, number>;
}

const formatAmounts = (amounts: Record<string, number>) => {
  const entries = Object.entries(amounts);
  if (entries.length === 0) return "0.00";
  return entries
    .map(([currency, amount]) => formatCurrency(amount, currency))
    .join(" · ");
};

export function CollectionPayoutsTab() {
  const [payouts, setPayouts] = useState<CollectionPayoutRow[]>([]);
  const [stats, setStats] = useState<CollectionPayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selected, setSelected] = useState<CollectionPayoutRow | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        status,
        search,
      });
      const response = await fetch(`/api/admin/payouts/collections?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load collection payouts");
      }
      setPayouts(data.payouts || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load payouts"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (action: "approve" | "reject") => {
    if (!selected) return;
    setProcessing(selected.id);
    try {
      const response = await fetch(
        `/api/admin/payouts/collections/${selected.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            notes: notes.trim() || undefined,
            rejectionReason:
              action === "reject" ? rejectionReason.trim() : undefined,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update payout");
      }
      toast.success(data.message || "Payout updated");
      setApproveOpen(false);
      setRejectOpen(false);
      setSelected(null);
      setNotes("");
      setRejectionReason("");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update payout");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Collection Payouts</h2>
          <p className="text-gray-600">
            Review organiser withdrawals. The full requested amount is paid, with no extra platform fee.
          </p>
        </div>
        <Button onClick={load} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPayouts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayouts} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending amount</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatAmounts(stats.pendingAmountByCurrency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {formatAmounts(stats.paidAmountByCurrency)}
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
                placeholder="Search by organiser, email, or collection"
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection payout requests</CardTitle>
          <CardDescription>
            Approve a request to send the full amount through Paystack or PayPal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : payouts.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No collection payout requests found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organiser</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="font-medium">{payout.userName || "Organiser"}</div>
                        <div className="text-xs text-gray-500">{payout.userEmail}</div>
                      </TableCell>
                      <TableCell>{payout.collectionTitle || "Collection"}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(payout.netAmount), payout.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">
                        {payout.payoutProvider}
                      </TableCell>
                      <TableCell className="text-right">
                        {payout.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelected(payout);
                                setNotes("");
                                setApproveOpen(true);
                              }}
                              disabled={processing === payout.id}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelected(payout);
                                setRejectionReason("");
                                setRejectOpen(true);
                              }}
                              disabled={processing === payout.id}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
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

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve collection payout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {selected
              ? `${formatCurrency(Number(selected.netAmount), selected.currency)} will be sent to ${selected.userName || "the organiser"}.`
              : ""}
          </p>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional note"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => act("approve")} disabled={Boolean(processing)}>
              Approve and pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject collection payout</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Tell the organiser why this request was rejected"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectionReason.trim().length < 10) {
                  toast.error("Rejection reason must be at least 10 characters");
                  return;
                }
                act("reject");
              }}
              disabled={Boolean(processing)}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
