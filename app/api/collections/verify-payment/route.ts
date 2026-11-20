import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { db } from "@/lib/db";
import { collectionContributions } from "@/lib/schema/collections";
import { eq } from "drizzle-orm";
import { completeCollectionContribution } from "@/lib/payments/collection-contribution-processing";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");
    const method = searchParams.get("method");

    if (!reference || !method) {
      return NextResponse.json(
        { error: "Missing reference or method" },
        { status: 400 }
      );
    }

    if (method === "paystack") {
      const verification = await verifyPaystackPayment(reference);

      if (verification.status && verification.data.status === "success") {
        const metadata = verification.data.metadata ?? {};
        const metaContributionId =
          (typeof metadata.donationId === "string" && metadata.donationId) ||
          (typeof metadata.donation_id === "string" && metadata.donation_id) ||
          undefined;

        let contribution =
          (await db.query.collectionContributions.findFirst({
            where: eq(collectionContributions.transactionId, reference),
          })) ||
          (metaContributionId
            ? await db.query.collectionContributions.findFirst({
                where: eq(collectionContributions.id, metaContributionId),
              })
            : undefined);

        if (contribution && contribution.paymentStatus !== "completed") {
          await completeCollectionContribution({
            contributionId: contribution.id,
            paymentReference: reference,
          });
        }

        const refreshed = await db.query.collectionContributions.findFirst({
          where: eq(collectionContributions.transactionId, reference),
        });

        return NextResponse.json({
          success: true,
          status: "completed",
          contribution: refreshed,
          donation: refreshed,
          message: "Payment verified successfully",
        });
      }

      return NextResponse.json({
        success: false,
        status: "failed",
        message: "Payment verification failed",
      });
    }

    if (method === "paypal") {
      const contribution = await db.query.collectionContributions.findFirst({
        where: eq(collectionContributions.paymentIntentId, reference),
      });

      if (!contribution) {
        return NextResponse.json(
          { error: "Contribution not found" },
          { status: 404 }
        );
      }

      const capture = await capturePayPalOrder(reference);
      if (capture.status !== "COMPLETED") {
        return NextResponse.json({
          success: false,
          status: capture.status?.toLowerCase?.() || "failed",
          contribution,
          message: "Payment not completed",
        });
      }

      const completed = await completeCollectionContribution({
        contributionId: contribution.id,
        paymentReference: reference,
      });

      const refreshed = await db.query.collectionContributions.findFirst({
        where: eq(collectionContributions.id, contribution.id),
      });

      return NextResponse.json({
        success: true,
        status: "completed",
        contribution: refreshed,
        donation: {
          ...refreshed,
          id: completed.contributionId,
        },
        message: "Payment verified successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("Error verifying collection payment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}