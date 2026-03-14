import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema/campaigns";
import { donations } from "@/lib/schema/donations";
import { eq } from "drizzle-orm";
import { completeCampaignDonation, failCampaignDonation } from "@/lib/payments/campaign-donation-processing";
import { capturePayPalOrder } from "@/lib/payments/paypal";

function getBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("token");

    if (!orderId) {
      return NextResponse.redirect(
        `${baseUrl}/campaigns?donation_status=failed&error=missing_paypal_token`
      );
    }

    const [donation] = await db
      .select({
        id: donations.id,
        campaignId: donations.campaignId,
      })
      .from(donations)
      .where(eq(donations.paymentIntentId, orderId))
      .limit(1);

    if (!donation) {
      return NextResponse.redirect(
        `${baseUrl}/campaigns?donation_status=failed&error=donation_not_found`
      );
    }

    const capture = await capturePayPalOrder(orderId);
    if (capture.status !== "COMPLETED") {
      const { campaignSlug } = await failCampaignDonation({
        donationId: donation.id,
        providerStatus: capture.status || "CAPTURE_FAILED",
        failureReason: "PayPal payment was not completed.",
      });

      return NextResponse.redirect(
        `${baseUrl}/campaign/${campaignSlug}?donation_status=failed&error=paypal_capture_incomplete`
      );
    }

    const { campaignSlug } = await completeCampaignDonation({
      donationId: donation.id,
      paymentReference: orderId,
      providerStatus: capture.status,
    });

    return NextResponse.redirect(
      `${baseUrl}/campaign/${campaignSlug}?donation_status=success&donation_id=${donation.id}`
    );
  } catch (error) {
    console.error("PayPal callback error:", error);

    const orderId = request.nextUrl.searchParams.get("token");
    if (orderId) {
      const [donation] = await db
        .select({
          id: donations.id,
          campaignId: donations.campaignId,
        })
        .from(donations)
        .where(eq(donations.paymentIntentId, orderId))
        .limit(1);

      if (donation) {
        const [campaign] = await db
          .select({ slug: campaigns.slug })
          .from(campaigns)
          .where(eq(campaigns.id, donation.campaignId))
          .limit(1);

        if (campaign) {
          return NextResponse.redirect(
            `${baseUrl}/campaign/${campaign.slug}?donation_status=failed&error=paypal_callback_error`
          );
        }
      }
    }

    return NextResponse.redirect(
      `${baseUrl}/campaigns?donation_status=failed&error=paypal_callback_error`
    );
  }
}
