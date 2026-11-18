import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectionContributions } from "@/lib/schema/collections";
import { eq } from "drizzle-orm";
import { initializePaystackPayment } from "@/lib/payments/paystack";
import { createPayPalOrder, getPayPalApprovalUrl } from "@/lib/payments/paypal";
import { getSupportedProviders } from "@/lib/payments/config";
import { findCollectionByIdOrSlug } from "@/lib/collections/resolve-collection";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      amount,
      currency,
      contributorEmail,
      contributorName,
      message,
      isAnonymous,
      contributionId,
      paymentMethod: requestedPaymentMethod,
    } = body;

    const collection = await findCollectionByIdOrSlug(id);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.status !== "active") {
      return NextResponse.json(
        { error: "This collection is not accepting contributions" },
        { status: 400 }
      );
    }

    const supportedProviders = getSupportedProviders(currency);
    const paymentMethod =
      typeof requestedPaymentMethod === "string" &&
      supportedProviders.includes(requestedPaymentMethod as "paypal" | "paystack")
        ? requestedPaymentMethod
        : currency === "NGN"
          ? "paystack"
          : "paypal";

    if (!supportedProviders.includes(paymentMethod as "paypal" | "paystack")) {
      return NextResponse.json(
        { error: `${paymentMethod} does not support ${currency}` },
        { status: 400 }
      );
    }

    let contribution;
    if (contributionId) {
      const [updated] = await db
        .update(collectionContributions)
        .set({
          paymentMethod,
          updatedAt: new Date(),
        })
        .where(eq(collectionContributions.id, contributionId))
        .returning();
      contribution = updated;
    } else {
      const [created] = await db
        .insert(collectionContributions)
        .values({
          collectionId: collection.id,
          contributorEmail,
          contributorName: isAnonymous ? "Anonymous" : contributorName,
          amount: amount.toString(),
          currency,
          message,
          isAnonymous: Boolean(isAnonymous),
          paymentMethod,
          paymentStatus: "pending",
        })
        .returning();
      contribution = created;
    }

    if (!contribution) {
      return NextResponse.json(
        { error: "Failed to create contribution" },
        { status: 500 }
      );
    }

    if (paymentMethod === "paystack") {
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/collections/${collection.slug}/payment-callback`;

      const metadata = {
        donationId: contribution.id,
        collectionId: collection.id,
        collectionTitle: collection.title,
        custom_fields: [
          {
            display_name: "Collection",
            variable_name: "collection_title",
            value: collection.title,
          },
          {
            display_name: "Contribution ID",
            variable_name: "donation_id",
            value: contribution.id,
          },
        ],
      };

      const paystackResponse = await initializePaystackPayment(
        contributorEmail,
        parseFloat(amount),
        currency,
        metadata,
        callbackUrl
      );

      await db
        .update(collectionContributions)
        .set({
          transactionId: paystackResponse.data.reference,
          updatedAt: new Date(),
        })
        .where(eq(collectionContributions.id, contribution.id));

      return NextResponse.json({
        paymentMethod: "paystack",
        authorizationUrl: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference,
        contributionId: contribution.id,
        donationId: contribution.id,
      });
    }

    if (paymentMethod === "paypal") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
      const returnUrl = `${baseUrl}/collections/${collection.slug}/payment-callback`;
      const cancelUrl = `${baseUrl}/collections/${collection.slug}`;
      const order = await createPayPalOrder({
        amount: parseFloat(amount),
        currency,
        donationId: contribution.id,
        campaignTitle: collection.title,
        donorEmail: contributorEmail,
        returnUrl,
        cancelUrl,
        customId: collection.slug,
        description: `Contribution to ${collection.title}`,
      });

      const approvalUrl = getPayPalApprovalUrl(order);
      if (!approvalUrl) {
        throw new Error("PayPal approval URL missing");
      }

      await db
        .update(collectionContributions)
        .set({
          paymentIntentId: order.id,
          updatedAt: new Date(),
        })
        .where(eq(collectionContributions.id, contribution.id));

      return NextResponse.json({
        paymentMethod: "paypal",
        approvalUrl,
        orderId: order.id,
        contributionId: contribution.id,
        donationId: contribution.id,
      });
    }

    return NextResponse.json(
      { error: `Unsupported payment method: ${paymentMethod}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error creating collection payment intent:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create payment intent";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}