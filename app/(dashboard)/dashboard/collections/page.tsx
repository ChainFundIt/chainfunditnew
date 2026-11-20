"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { getCollectionCategoryLabel } from "@/lib/collections/categories";

interface CollectionBalance {
  totalRaised: number;
  totalPaidOut: number;
  availableAmount: number;
}

interface OwnerCollection {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  currency: string;
  status: string;
  dueAt: string | null;
  isPublic: boolean;
  balance?: CollectionBalance;
  activePayout: { status: string } | null;
}

export default function DashboardCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<OwnerCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/dashboard/collections");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load collections");
        }
        setCollections(data.collections || []);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load collections"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="font-jakarta mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#104109]">Collections</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Manage your pots, see who has paid, and withdraw what is available.
          </p>
        </div>
        <Button
          onClick={() => router.push("/collections/create")}
          className="rounded-full bg-[#104109] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          New collection
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading collections...</p>
      ) : collections.length === 0 ? (
        <div className="rounded-3xl border border-[#E5EBE3] bg-white p-8">
          <h2 className="text-xl font-bold text-[#104109]">No collections yet</h2>
          <p className="mt-2 text-sm text-[#6B7280]">
            Start a collection when a group needs one shared pot.
          </p>
          <Button
            onClick={() => router.push("/collections/create")}
            className="mt-6 rounded-full bg-[#104109] text-white"
          >
            Create a collection
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {collections.map((collection) => {
            const raised = collection.balance?.totalRaised ?? 0;
            const available = collection.balance?.availableAmount ?? 0;
            return (
              <div
                key={collection.id}
                role="link"
                tabIndex={0}
                onClick={() =>
                  router.push(`/dashboard/collections/${collection.id}`)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(`/dashboard/collections/${collection.id}`);
                  }
                }}
                className="cursor-pointer rounded-3xl border border-[#E5EBE3] bg-white p-6 text-left transition hover:border-[#104109]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#F0F7EF] px-3 py-1 text-xs font-semibold capitalize text-[#104109]">
                        {collection.status}
                      </span>
                      {collection.activePayout && (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                          Payout {collection.activePayout.status}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-[#1C1917]">
                      {collection.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {getCollectionCategoryLabel(collection.category) ||
                        "Collection"}
                      {collection.dueAt
                        ? ` · Closes ${format(new Date(collection.dueAt), "d MMM yyyy")}`
                        : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 md:text-right">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                        Raised
                      </p>
                      <p className="text-lg font-bold text-[#104109]">
                        {formatCurrency(raised, collection.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                        Available
                      </p>
                      <p className="text-lg font-bold text-[#104109]">
                        {formatCurrency(available, collection.currency)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-[#104109]">
                  <Link
                    href={`/collections/${collection.slug}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    View public page
                  </Link>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
