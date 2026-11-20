import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectionPayouts } from "@/lib/schema/collections";
import { getDashboardUser, getOwnedCollection } from "@/lib/collections/owner";
import {
  getActiveCollectionPayouts,
  getCollectionBalances,
  roundMoney,
} from "@/lib/collections/payout-balance";
import {
  getPayoutConfig,
  getPayoutProvider,
} from "@/lib/payments/payout-config";
import { notifyPayoutRequest } from "@/lib/notifications/payout-request-alerts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getDashboardUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const collection = await getOwnedCollection(user.id, id);
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    let body: { amount?: unknown; payoutProvider?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const amount = roundMoney(body.amount);
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    const provider = getPayoutProvider(collection.currency);
    if (!provider) {
      return NextResponse.json(
        { error: `Payouts are not available for ${collection.currency}` },
        { status: 400 }
      );
    }

    if (body.payoutProvider && body.payoutProvider !== provider) {
      return NextResponse.json(
        { error: `${collection.currency} payouts use ${provider}` },
        { status: 400 }
      );
    }

    const payoutConfig = getPayoutConfig(provider);
    if (amount < payoutConfig.minPayoutAmount) {
      return NextResponse.json(
        {
          error: `Minimum payout is ${payoutConfig.minPayoutAmount} ${collection.currency}`,
        },
        { status: 400 }
      );
    }

    if (provider === "paystack") {
      if (!user.accountVerified) {
        return NextResponse.json(
          { error: "Bank account not verified" },
          { status: 400 }
        );
      }
      if (!user.accountNumber || !user.bankCode) {
        return NextResponse.json(
          { error: "Bank details incomplete" },
          { status: 400 }
        );
      }
    }

    if (provider === "paypal" && !user.email) {
      return NextResponse.json(
        { error: "A verified account email is required for PayPal payouts" },
        { status: 400 }
      );
    }

    const activePayouts = await getActiveCollectionPayouts([collection.id]);
    const existingPayout = activePayouts.get(collection.id);
    if (existingPayout) {
      return NextResponse.json(
        {
          error: "An active payout already exists for this collection",
          existingPayout,
        },
        { status: 409 }
      );
    }

    const balances = await getCollectionBalances([collection.id]);
    const balance = balances.get(collection.id);
    const availableAmount = balance?.availableAmount ?? 0;
    if (availableAmount <= 0) {
      return NextResponse.json(
        { error: "No funds available for payout" },
        { status: 400 }
      );
    }
    if (amount > availableAmount) {
      return NextResponse.json(
        {
          error: `Requested amount (${amount}) exceeds available funds (${availableAmount})`,
        },
        { status: 400 }
      );
    }

    const [saved] = await db
      .insert(collectionPayouts)
      .values({
        userId: user.id,
        collectionId: collection.id,
        requestedAmount: amount.toFixed(2),
        grossAmount: (balance?.totalRaised ?? 0).toFixed(2),
        fees: "0.00",
        netAmount: amount.toFixed(2),
        currency: collection.currency,
        status: "pending",
        payoutProvider: provider,
        reference: `COL-${Date.now()}-${collection.id.slice(0, 8)}`,
        bankName: provider === "paypal" ? "PayPal" : user.bankName,
        accountNumber: provider === "paypal" ? user.email : user.accountNumber,
        accountName:
          provider === "paypal"
            ? user.fullName || user.email
            : user.accountName,
        bankCode: provider === "paypal" ? null : user.bankCode,
      })
      .returning();

    notifyPayoutRequest({
      userId: user.id,
      userEmail: user.email || "",
      userName: user.fullName || user.email || "Unknown User",
      campaignId: collection.id,
      campaignTitle: collection.title,
      amount,
      currency: collection.currency,
      payoutId: saved.id,
      requestDate: new Date(),
      bankDetails: {
        accountName:
          provider === "paypal"
            ? user.fullName || user.email || ""
            : user.accountName || "",
        accountNumber:
          provider === "paypal" ? user.email || "" : user.accountNumber || "",
        bankName: provider === "paypal" ? "PayPal" : user.bankName || "",
      },
    }).catch((notificationError) => {
      console.error("Error sending collection payout alert:", notificationError);
    });

    return NextResponse.json({
      success: true,
      data: {
        payoutId: saved.id,
        amount,
        currency: collection.currency,
        provider,
        status: "pending",
        netAmount: amount,
        fees: 0,
        estimatedDelivery: payoutConfig.processingTime,
        message: `Payout of ${collection.currency} ${amount} requested via ${provider}`,
        collectionTitle: collection.title,
      },
    });
  } catch (error) {
    console.error("Error requesting collection payout:", error);
    return NextResponse.json(
      { error: "Failed to request payout" },
      { status: 500 }
    );
  }
}
