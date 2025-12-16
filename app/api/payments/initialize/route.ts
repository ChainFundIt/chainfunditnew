import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { donations } from "@/lib/schema/donations";
import { campaigns } from "@/lib/schema/campaigns";
import { users } from "@/lib/schema/users";
import { eq } from "drizzle-orm";
import { createStripePaymentIntent } from "@/lib/payments/stripe";
import { initializePaystackPayment } from "@/lib/payments/paystack";
import { getSupportedProviders } from "@/lib/payments/config";
import {
  validateCampaignForDonations,
  checkAndUpdateGoalReached,
} from "@/lib/utils/campaign-validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaignId,
      amount,
      currency,
      paymentProvider,
      message,
      isAnonymous,
      email,
      donorName,
      donorPhone,
      simulate = false, // For testing purposes
    } = body;

    // Validate required fields
    if (!campaignId || !amount || !currency || !paymentProvider) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate payment provider is supported for currency
    const supportedProviders = getSupportedProviders(currency);
    if (!supportedProviders.includes(paymentProvider)) {
      return NextResponse.json(
        {
          success: false,
          error: `${paymentProvider} does not support ${currency}`,
        },
        { status: 400 }
      );
    }

    const normalizedEmail =
      (typeof email === "string" && email.trim()) ? email.trim().toLowerCase() : undefined;
    const normalizedDonorName =
      (typeof donorName === "string" && donorName.trim()) ? donorName.trim() : undefined;
    const normalizedDonorPhone =
      (typeof donorPhone === "string" && donorPhone.trim()) ? donorPhone.trim() : undefined;

    // Get authenticated user or create/resolve guest user
    const userEmail = await getUserFromRequest(request);
    let user;

    if (userEmail) {
      // Get authenticated user details
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (!userResult.length) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      user = userResult[0];
    } else {
      /**
       * Guest donations:
       * - Mobile users are often not authenticated, but may enter an email that already exists.
       * - `users.email` is unique, so blindly inserting will throw and bubble up as "Internal server error".
       * Strategy: find-or-create by email (and tolerate race conditions).
       */
      const donorEmail =
        normalizedEmail
          ? normalizedEmail
          : `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}@chainfundit.com`;

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, donorEmail))
        .limit(1);

      if (existingUser.length) {
        user = existingUser[0];
      } else {
        try {
          const guestDisplayName =
            isAnonymous
              ? "Anonymous Donor"
              : (normalizedDonorName || "Guest Donor");
          const guestUser = await db
            .insert(users)
            .values({
              email: donorEmail,
              fullName: guestDisplayName,
              isVerified: false,
              hasCompletedProfile: false,
            })
            .returning();

          user = guestUser[0];
        } catch (insertErr) {
          // If another request created this email concurrently, re-fetch.
          const refetch = await db
            .select()
            .from(users)
            .where(eq(users.email, donorEmail))
            .limit(1);

          if (!refetch.length) {
            throw insertErr;
          }
          user = refetch[0];
        }
      }
    }

    // Validate campaign can accept donations
    const campaignValidation = await validateCampaignForDonations(campaignId);

    if (!campaignValidation.canAcceptDonations) {
      return NextResponse.json(
        {
          success: false,
          error:
            campaignValidation.reason || "Campaign cannot accept donations",
          campaignStatus: campaignValidation.campaign?.status,
        },
        { status: 400 }
      );
    }

    const campaign = campaignValidation.campaign;

    // Check minimum donation amount
    const minDonation = parseFloat(campaign.minimumDonation);
    if (amount < minDonation) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum donation amount is ${campaign.currency} ${minDonation}`,
        },
        { status: 400 }
      );
    }

    const donationDonorName = isAnonymous
      ? null
      : (normalizedDonorName || user.fullName || "Guest Donor");
    const donationDonorEmail = normalizedEmail || user.email || null;

    // Create donation record
    const newDonation = await db
      .insert(donations)
      .values({
        campaignId,
        donorId: user.id,
        amount: amount.toString(),
        currency,
        paymentMethod: paymentProvider,
        paymentStatus: "pending",
        message,
        isAnonymous: isAnonymous || false,
        donorName: donationDonorName,
        donorEmail: donationDonorEmail,
        donorPhone: normalizedDonorPhone || null,
      })
      .returning();

    const donationId = newDonation[0].id;

    // Initialize payment based on provider
    let paymentResult;

    if (paymentProvider === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          {
            success: false,
            error: "Stripe is not properly configured. Please contact support.",
            details: "STRIPE_SECRET_KEY is missing",
          },
          { status: 500 }
        );
      }

      try {
        const paymentIntent = await createStripePaymentIntent(
          amount,
          currency,
          {
            donationId,
            campaignId,
            donorEmail: (donationDonorEmail || user.email || "") as string,
            donorName: donationDonorName || "",
            campaignTitle: campaign.title,
          }
        );

        paymentResult = {
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };

        if (paymentResult.success) {
          // Update donation with payment intent ID
          await db
            .update(donations)
            .set({ paymentIntentId: paymentResult.paymentIntentId })
            .where(eq(donations.id, donationId));

          return NextResponse.json({
            success: true,
            provider: "stripe",
            clientSecret: paymentResult.clientSecret,
            donationId,
            paymentIntentId: paymentResult.paymentIntentId,
          });
        }
      } catch (stripeError: any) {
        console.error("Stripe payment intent creation failed:", stripeError);

        await db.delete(donations).where(eq(donations.id, donationId));

        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to initialize Stripe payment. Please ensure Stripe is properly configured.",
            details: stripeError.message || "Unknown Stripe error",
            code: stripeError.code || "STRIPE_ERROR",
          },
          { status: 500 }
        );
      }
    } else if (paymentProvider === "paystack") {
      try {
        const campaignMetadata = {
          donationId,
          campaignId,
          donorName: donationDonorName || "",
          donorEmail: donationDonorEmail || user.email!,
          campaignTitle: campaign.title,
          campaignSlug: campaign.slug,
        };

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const callbackUrl = new URL(
          "/api/payments/paystack/callback",
          appUrl
        ).toString();

        const paystackResponse = await initializePaystackPayment(
          user.email!,
          amount,
          currency,
          campaignMetadata,
          callbackUrl
        );

        paymentResult = {
          success: paystackResponse.status,
          authorization_url: paystackResponse.data.authorization_url,
          reference: paystackResponse.data.reference,
          accessCode: paystackResponse.data.access_code,
        };

        if (paymentResult.success) {
          // Update donation with reference
          await db
            .update(donations)
            .set({ paymentIntentId: paymentResult.reference })
            .where(eq(donations.id, donationId));

          return NextResponse.json({
            success: true,
            provider: "paystack",
            authorization_url: paymentResult.authorization_url,
            donationId,
            reference: paymentResult.reference,
          });
        }
      } catch (paystackError: any) {
        console.error("Paystack payment initialization failed:", paystackError);

        // Delete the donation record since payment initialization failed
        await db.delete(donations).where(eq(donations.id, donationId));

        // Return a more helpful error message
        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to initialize Paystack payment. Please ensure Paystack is properly configured.",
            details: paystackError.message || "Unknown Paystack error",
            code: paystackError.code || "PAYSTACK_ERROR",
          },
          { status: 500 }
        );
      }
    }

    // If payment initialization failed, delete the donation record
    await db.delete(donations).where(eq(donations.id, donationId));

    return NextResponse.json(
      { success: false, error: "Payment initialization failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
