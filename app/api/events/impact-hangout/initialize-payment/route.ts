import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import { KICKSTART_AMOUNTS_NGN } from "@/lib/schema/impact-hangout-registrations";
import { initializePaystackPayment } from "@/lib/payments/paystack";
import { eq } from "drizzle-orm";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 10_000_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, amountInNaira } = body || {};

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const amount =
      typeof amountInNaira === "number" && amountInNaira >= MIN_AMOUNT && amountInNaira <= MAX_AMOUNT
        ? Math.round(amountInNaira)
        : KICKSTART_AMOUNTS_NGN[1]; // default ₦10,000

    const [registration] = await db
      .select()
      .from(impactHangoutRegistrations)
      .where(eq(impactHangoutRegistrations.id, registrationId))
      .limit(1);

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.paymentStatus === "completed") {
      return NextResponse.json(
        { error: "Payment already completed", alreadyPaid: true },
        { status: 400 }
      );
    }

    const callbackUrl = `${baseUrl}/api/events/impact-hangout/payment-callback`;

    const result = await initializePaystackPayment(
      registration.email,
      amount,
      "NGN",
      {
        impactHangoutRegistrationId: registrationId,
        commitmentAmountNgn: amount,
      },
      callbackUrl
    );

    if (!result?.data?.authorization_url) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorizationUrl: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("Impact Hangout payment init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
