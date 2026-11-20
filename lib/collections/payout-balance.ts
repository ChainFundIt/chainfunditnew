import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  collectionContributions,
  collectionPayouts,
} from "@/lib/schema/collections";
import { getPayoutConfig, getPayoutProvider } from "@/lib/payments/payout-config";

export const ACTIVE_PAYOUT_STATUSES = ["pending", "approved", "processing"] as const;

export function roundMoney(value: unknown): number {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(String(value ?? "0"));
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export interface CollectionBalance {
  totalRaised: number;
  totalPaidOut: number;
  availableAmount: number;
}

export async function getCollectionBalances(collectionIds: string[]) {
  const balances = new Map<string, CollectionBalance>();
  if (collectionIds.length === 0) return balances;

  const raisedRows = await db
    .select({
      collectionId: collectionContributions.collectionId,
      total: sql<string>`COALESCE(SUM(${collectionContributions.amount}), 0)`,
    })
    .from(collectionContributions)
    .where(
      and(
        inArray(collectionContributions.collectionId, collectionIds),
        eq(collectionContributions.paymentStatus, "completed")
      )
    )
    .groupBy(collectionContributions.collectionId);

  const paidRows = await db
    .select({
      collectionId: collectionPayouts.collectionId,
      total: sql<string>`COALESCE(SUM(${collectionPayouts.requestedAmount}), 0)`,
    })
    .from(collectionPayouts)
    .where(
      and(
        inArray(collectionPayouts.collectionId, collectionIds),
        eq(collectionPayouts.status, "completed")
      )
    )
    .groupBy(collectionPayouts.collectionId);

  const raised = new Map(
    raisedRows.map((row) => [row.collectionId, roundMoney(row.total)])
  );
  const paid = new Map(
    paidRows.map((row) => [row.collectionId, roundMoney(row.total)])
  );

  for (const id of collectionIds) {
    const totalRaised = raised.get(id) ?? 0;
    const totalPaidOut = paid.get(id) ?? 0;
    const availableRaw = totalRaised - totalPaidOut;
    balances.set(id, {
      totalRaised,
      totalPaidOut,
      availableAmount: availableRaw > 0 ? roundMoney(availableRaw) : 0,
    });
  }

  return balances;
}

export async function getActiveCollectionPayouts(collectionIds: string[]) {
  const active = new Map<
    string,
    {
      id: string;
      status: string;
      requestedAmount: string;
      currency: string;
      createdAt: Date;
    }
  >();
  if (collectionIds.length === 0) return active;

  const rows = await db
    .select({
      id: collectionPayouts.id,
      collectionId: collectionPayouts.collectionId,
      status: collectionPayouts.status,
      requestedAmount: collectionPayouts.requestedAmount,
      currency: collectionPayouts.currency,
      createdAt: collectionPayouts.createdAt,
    })
    .from(collectionPayouts)
    .where(
      and(
        inArray(collectionPayouts.collectionId, collectionIds),
        inArray(collectionPayouts.status, [...ACTIVE_PAYOUT_STATUSES])
      )
    );

  for (const row of rows) {
    if (!active.has(row.collectionId)) {
      active.set(row.collectionId, row);
    }
  }

  return active;
}

export function getCollectionPayoutReadiness(
  currency: string,
  user: {
    email: string;
    accountVerified: boolean | null;
    accountNumber: string | null;
    bankCode: string | null;
    accountChangeRequested: boolean | null;
  }
) {
  const provider = getPayoutProvider(currency);
  const config = provider ? getPayoutConfig(provider) : null;
  const bankReady = Boolean(
    user.accountVerified && user.accountNumber && user.bankCode
  );
  const paypalReady = Boolean(user.email);

  return {
    provider,
    supported: Boolean(provider),
    ready:
      provider === "paystack"
        ? bankReady
        : provider === "paypal"
          ? paypalReady
          : false,
    accountVerified: Boolean(user.accountVerified),
    accountChangeRequested: Boolean(user.accountChangeRequested),
    email: user.email,
    processingTime: config?.processingTime ?? null,
    minPayoutAmount: config?.minPayoutAmount ?? null,
  };
}
