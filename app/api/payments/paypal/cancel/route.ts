import { NextRequest, NextResponse } from "next/server";
import { failCampaignDonation } from "@/lib/payments/campaign-donation-processing";

function getBaseUrl(request: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const donationId = request.nextUrl.searchParams.get("donationId");

  if (!donationId) {
    return NextResponse.redirect(
      `${baseUrl}/campaigns?donation_status=failed&error=missing_donation_id`
    );
  }

  try {
    const { campaignSlug } = await failCampaignDonation({
      donationId,
      providerStatus: "CANCELLED",
      failureReason: "PayPal payment was cancelled by the donor.",
    });

    return NextResponse.redirect(
      `${baseUrl}/campaign/${campaignSlug}?donation_status=failed&error=paypal_cancelled`
    );
  } catch (error) {
    console.error("PayPal cancel error:", error);
    return NextResponse.redirect(
      `${baseUrl}/campaigns?donation_status=failed&error=paypal_cancelled`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donationId = body?.donationId;

    if (!donationId) {
      return NextResponse.json(
        { success: false, error: "donationId is required" },
        { status: 400 }
      );
    }

    const { campaignSlug } = await failCampaignDonation({
      donationId,
      providerStatus: "CANCELLED",
      failureReason: "PayPal payment was cancelled by the donor.",
    });

    return NextResponse.json({
      success: true,
      campaignSlug,
    });
  } catch (error: any) {
    console.error("PayPal cancel error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel PayPal payment" },
      { status: 500 }
    );
  }
}
