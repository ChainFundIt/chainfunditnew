import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { impactHangoutRegistrations } from "@/lib/schema";
import {
  createPaystackCustomer,
  createPaystackDedicatedAccount,
  initializePaystackPayment,
} from "@/lib/payments/paystack";
import { sql } from "drizzle-orm";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://chainfundit.com";

const MIN_AMOUNT = 1_000;
const MAX_AMOUNT = 10_000_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      slug,
      amountInNaira,
      donorEmail,
      paymentProvider = "paystack",
      quickDonate = false,
    } = body || {};

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json(
        { error: "Hangout slug is required" },
        { status: 400 }
      );
    }
    const providedEmail =
      typeof donorEmail === "string" && donorEmail.trim()
        ? donorEmail.trim()
        : null;
    const email = quickDonate
      ? providedEmail ?? `quickdonor+${Date.now()}@chainfundit.app`
      : providedEmail;
    if (!email) {
      return NextResponse.json(
        { error: "Donor email is required" },
        { status: 400 }
      );
    }

    const amount =
      typeof amountInNaira === "number" &&
      amountInNaira >= MIN_AMOUNT &&
      amountInNaira <= MAX_AMOUNT
        ? Math.round(amountInNaira)
        : MIN_AMOUNT;

    const slugLower = slug.trim().toLowerCase();
    const [row] = await db
      .select({ id: impactHangoutRegistrations.id, slug: impactHangoutRegistrations.slug })
      .from(impactHangoutRegistrations)
      .where(sql`LOWER(TRIM(${impactHangoutRegistrations.slug})) = ${slugLower}`)
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: "Hangout not found" },
        { status: 404 }
      );
    }

    if (quickDonate) {
      const quickEmailName = (email.split("@")[0] || "quickdonor").replace(/[^\w]/g, " ").trim();
      const nameParts = quickEmailName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || "Quick";
      const lastName = nameParts.slice(1).join(" ") || "Donor";
      const customer = await createPaystackCustomer(email, {
        firstName,
        lastName,
        phone: "08000000000",
      }, {
        type: "donation",
        donationMode: "quick",
        impactHangoutSlug: row.slug ?? slug,
        amountNgn: amount,
      });

      const dedicatedAccount = await createPaystackDedicatedAccount(customer.data.customer_code);

      return NextResponse.json({
        provider: "paystack",
        mode: "quick",
        virtualAccount: {
          accountName: dedicatedAccount.data.account_name,
          accountNumber: dedicatedAccount.data.account_number,
          bankName: dedicatedAccount.data.bank?.name ?? "Paystack Bank",
          amountNgn: amount,
        },
      });
    }

    const callbackUrl = `${baseUrl}/api/events/impact-hangout/payment-callback`;
    const result = await initializePaystackPayment(
      email,
      amount,
      "NGN",
      {
        type: "donation",
        impactHangoutSlug: row.slug ?? slug,
        amountNgn: amount,
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
      provider: "paystack",
      fallbackProvider: paymentProvider === "paypal" ? "paystack" : undefined,
    });
  } catch (error) {
    console.error("Impact Hangout donate init error:", error);
    return NextResponse.json(
      { error: "Failed to start donation" },
      { status: 500 }
    );
  }
}
