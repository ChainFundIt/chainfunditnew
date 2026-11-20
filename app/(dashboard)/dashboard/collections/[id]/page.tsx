"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/currency";
import { COLLECTION_CATEGORIES } from "@/lib/collections/categories";
import { PayoutAmountModal } from "@/components/payments/payout-amount-modal";
import {
  PayoutSuccessModal,
  type PayoutSuccessData,
} from "@/components/payments/payout-success-modal";

interface CollectionRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  organiserName: string;
  coverImage: string | null;
  currency: string;
  targetAmount: string | null;
  dueAt: string | null;
  status: string;
  isPublic: boolean;
}

interface Contribution {
  id: string;
  contributorName: string | null;
  contributorEmail: string | null;
  amount: string;
  currency: string;
  paymentStatus: string;
  message: string | null;
  isAnonymous: boolean;
  createdAt: string;
}

interface PayoutRecord {
  id: string;
  requestedAmount: string;
  netAmount: string;
  fees: string;
  currency: string;
  status: string;
  payoutProvider: string;
  rejectionReason: string | null;
  failureReason: string | null;
  createdAt: string;
}

interface Balance {
  totalRaised: number;
  totalPaidOut: number;
  availableAmount: number;
}

interface PayoutReadiness {
  provider: string | null;
  supported: boolean;
  ready: boolean;
  accountVerified: boolean;
  accountChangeRequested: boolean;
  email: string;
  processingTime: string | null;
}

interface DetailResponse {
  collection: CollectionRecord;
  contributions: Contribution[];
  payouts: PayoutRecord[];
  balance: Balance;
  activePayout: { id: string; status: string; requestedAmount: string } | null;
  payoutReadiness: PayoutReadiness;
}

const toDateInput = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

export default function DashboardCollectionDetailPage() {
  const params = useParams();
  const collectionId = params.id as string;
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [successData, setSuccessData] = useState<PayoutSuccessData | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    organiserName: "",
    coverImage: "",
    targetAmount: "",
    dueAt: "",
    isPublic: true,
  });

  const load = async () => {
    const response = await fetch(`/api/dashboard/collections/${collectionId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to load collection");
    }
    setDetail(data);
    const collection = data.collection as CollectionRecord;
    setForm({
      title: collection.title,
      description: collection.description || "",
      category: collection.category || "",
      organiserName: collection.organiserName,
      coverImage: collection.coverImage || "",
      targetAmount: collection.targetAmount || "",
      dueAt: toDateInput(collection.dueAt),
      isPublic: collection.isPublic,
    });
  };

  useEffect(() => {
    load()
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load collection"
        );
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          organiserName: form.organiserName,
          coverImage: form.coverImage,
          targetAmount: form.targetAmount,
          dueAt: form.dueAt || null,
          isPublic: form.isPublic,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save collection");
      }
      toast.success("Collection updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const closeCollection = async () => {
    setClosing(true);
    try {
      const response = await fetch(
        `/api/dashboard/collections/${collectionId}/close`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to close collection");
      }
      toast.success("Collection closed");
      setConfirmClose(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to close");
    } finally {
      setClosing(false);
    }
  };

  const requestPayout = async (
    _id: string,
    amount: number,
    _currency: string,
    payoutProvider: string
  ) => {
    setRequesting(true);
    try {
      const response = await fetch(
        `/api/dashboard/collections/${collectionId}/payouts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, payoutProvider }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to request payout");
      }
      setWithdrawOpen(false);
      setSuccessData({
        payoutId: data.data.payoutId,
        amount: data.data.amount,
        currency: data.data.currency,
        provider: data.data.provider,
        status: data.data.status,
        netAmount: data.data.netAmount,
        fees: data.data.fees,
        estimatedDelivery: data.data.estimatedDelivery,
        message: data.data.message,
        campaignTitle: data.data.collectionTitle,
      });
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to request payout"
      );
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <p className="p-8 text-sm text-[#6B7280]">Loading collection...</p>;
  }

  if (!detail) {
    return (
      <div className="p-8">
        <p className="text-sm text-[#6B7280]">Collection not found.</p>
        <Link href="/dashboard/collections" className="mt-4 inline-block text-[#104109]">
          Back to collections
        </Link>
      </div>
    );
  }

  const { collection, balance, payoutReadiness, activePayout } = detail;
  const canWithdraw =
    payoutReadiness.supported &&
    payoutReadiness.ready &&
    !activePayout &&
    balance.availableAmount > 0;

  return (
    <div className="font-jakarta mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
      <Link href="/dashboard/collections" className="text-sm font-semibold text-[#104109]">
        Back to collections
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#F0F7EF] px-3 py-1 text-xs font-semibold capitalize text-[#104109]">
              {collection.status}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-[#6B7280]">
              {collection.isPublic ? "Public" : "Hidden"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#104109]">{collection.title}</h1>
          <Link
            href={`/collections/${collection.slug}`}
            className="mt-2 inline-block text-sm text-[#6B7280] underline"
          >
            Public page
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {collection.status === "active" &&
            (confirmClose ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setConfirmClose(false)}
                  disabled={closing}
                >
                  Keep open
                </Button>
                <Button
                  onClick={closeCollection}
                  disabled={closing}
                  className="bg-[#104109] text-white"
                >
                  {closing ? "Closing..." : "Confirm close"}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setConfirmClose(true)}>
                Close collection
              </Button>
            ))}
          <Button
            onClick={() => setWithdrawOpen(true)}
            disabled={!canWithdraw}
            className="bg-[#104109] text-white"
          >
            Withdraw
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Raised" value={formatCurrency(balance.totalRaised, collection.currency)} />
        <Stat
          label="Available"
          value={formatCurrency(balance.availableAmount, collection.currency)}
        />
        <Stat
          label="Paid out"
          value={formatCurrency(balance.totalPaidOut, collection.currency)}
        />
      </div>

      {activePayout && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          A {activePayout.status} payout of{" "}
          {formatCurrency(Number(activePayout.requestedAmount), collection.currency)}{" "}
          is already in progress.
        </div>
      )}

      {!payoutReadiness.supported ? (
        <p className="text-sm text-[#6B7280]">
          Payouts are not available for {collection.currency}.
        </p>
      ) : !payoutReadiness.ready ? (
        <p className="text-sm text-[#6B7280]">
          Add your {payoutReadiness.provider === "paystack" ? "verified bank account" : "PayPal email"} in{" "}
          <Link href="/dashboard/settings" className="font-semibold text-[#104109]">
            Settings
          </Link>{" "}
          before you withdraw.
        </p>
      ) : null}

      <section className="rounded-3xl border border-[#E5EBE3] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#104109]">Edit collection</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
          </Field>
          <Field label="Organiser name">
            <Input
              value={form.organiserName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  organiserName: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {COLLECTION_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target amount">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.targetAmount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  targetAmount: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Closing date">
            <Input
              type="date"
              value={form.dueAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, dueAt: event.target.value }))
              }
            />
          </Field>
          <Field label="Cover image URL">
            <Input
              value={form.coverImage}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  coverImage: event.target.value,
                }))
              }
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#1C1917]">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isPublic: event.target.checked,
                }))
              }
            />
            Show this collection publicly
          </label>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="mt-6 bg-[#104109] text-white"
        >
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </section>

      <section className="rounded-3xl border border-[#E5EBE3] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#104109]">Contributions</h2>
        {detail.contributions.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No contributions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[#6B7280]">
                <tr>
                  <th className="py-2 pr-4">Supporter</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {detail.contributions.map((contribution) => (
                  <tr key={contribution.id} className="border-t border-[#F3F4F6]">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-[#1C1917]">
                        {contribution.contributorName || "Supporter"}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {contribution.contributorEmail || "No email"}
                        {contribution.isAnonymous ? " · Asked to be anonymous" : ""}
                      </p>
                      {contribution.message && (
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {contribution.message}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      {formatCurrency(
                        Number(contribution.amount),
                        contribution.currency
                      )}
                    </td>
                    <td className="py-3 pr-4 capitalize">
                      {contribution.paymentStatus}
                    </td>
                    <td className="py-3">
                      {format(new Date(contribution.createdAt), "d MMM yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[#E5EBE3] bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-[#104109]">Payouts</h2>
        {detail.payouts.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No payout requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {detail.payouts.map((payout) => (
              <li
                key={payout.id}
                className="flex flex-col gap-1 rounded-2xl border border-[#F3F4F6] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-[#1C1917]">
                    {formatCurrency(Number(payout.netAmount), payout.currency)}
                  </p>
                  <p className="text-xs capitalize text-[#6B7280]">
                    {payout.status} · {payout.payoutProvider} ·{" "}
                    {format(new Date(payout.createdAt), "d MMM yyyy")}
                  </p>
                  {(payout.rejectionReason || payout.failureReason) && (
                    <p className="mt-1 text-xs text-red-600">
                      {payout.rejectionReason || payout.failureReason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PayoutAmountModal
        isOpen={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        subjectLabel="Collection"
        campaign={{
          id: collection.id,
          title: collection.title,
          currencyCode: collection.currency,
          availableAmount: balance.availableAmount,
          payoutProvider: payoutReadiness.provider,
          payoutConfig: { processingTime: payoutReadiness.processingTime },
          chainerCommissionsTotal: 0,
          effectivePlatformFeePercent: 0,
          providerFeePercent: 0,
        }}
        userProfile={{
          email: payoutReadiness.email,
          accountVerified: payoutReadiness.accountVerified,
          accountChangeRequested: payoutReadiness.accountChangeRequested,
        }}
        isProcessing={requesting}
        onConfirmPayout={requestPayout}
      />
      <PayoutSuccessModal
        isOpen={Boolean(successData)}
        onClose={() => setSuccessData(null)}
        data={successData}
        subjectLabel="Collection"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-[#E5EBE3] bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-[#104109]">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
