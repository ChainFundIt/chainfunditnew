import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { donations } from "@/lib/schema/donations";
import { eq } from "drizzle-orm";
import {
  completeCampaignDonation,
  failCampaignDonation,
} from "@/lib/payments/campaign-donation-processing";
import { capturePayPalOrder } from "@/lib/payments/paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body?.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const [donation] = await db
      .select({ id: donations.id })
      .from(donations)
      .where(eq(donations.paymentIntentId, orderId))
      .limit(1);

    if (!donation) {
      return NextResponse.json(
        { success: false, error: "Donation not found" },
        { status: 404 }
      );
    }

    const capture = await capturePayPalOrder(orderId);
    console.info("PayPal capture response", {
      orderId,
      captureStatus: capture.status || null,
      hasPurchaseUnits: Array.isArray(capture.purchase_units),
      captureId:
        capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
        null,
    });
    if (capture.status !== "COMPLETED") {
      await failCampaignDonation({
        donationId: donation.id,
        providerStatus: capture.status || "CAPTURE_FAILED",
        failureReason: `PayPal payment was not completed (status: ${capture.status || "unknown"}).`,
      });

      return NextResponse.json(
        {
          success: false,
          error: "PayPal payment was not completed.",
          details: {
            orderId,
            captureStatus: capture.status || null,
          },
        },
        { status: 400 }
      );
    }

    const result = await completeCampaignDonation({
      donationId: donation.id,
      paymentReference: orderId,
      providerStatus: capture.status,
    });

    return NextResponse.json({
      success: true,
      donationId: donation.id,
      campaignSlug: result.campaignSlug,
    });
  } catch (error: any) {
    console.error("PayPal capture error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to capture PayPal payment" },
      { status: 500 }
    );
  }
}
