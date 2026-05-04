import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { donations } from "@/lib/schema/donations";
import { campaigns } from "@/lib/schema/campaigns";
import { users } from "@/lib/schema/users";
import { chainers } from "@/lib/schema/chainers";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  createPaystackCustomer,
  createPaystackDedicatedAccount,
  initializePaystackPayment,
} from "@/lib/payments/paystack";
import { createPayPalOrder, getPayPalApprovalUrl } from "@/lib/payments/paypal";
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
      chainerId: bodyChainerId,
      quickDonate = false,
      paymentMethod,
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

    const isQuickDonatePaystackNgn =
      Boolean(quickDonate) &&
      paymentProvider === "paystack" &&
      currency === "NGN";
    const isQuickDonatePayPal =
      Boolean(quickDonate) &&
      paymentProvider === "paypal" &&
      supportedProviders.includes("paypal");

    if (
      quickDonate &&
      !isQuickDonatePaystackNgn &&
      !isQuickDonatePayPal
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Quick Donate supports Nigerian Naira (bank transfer or Apple Pay via Paystack) or international checkout with PayPal (USD, GBP, EUR, CAD, AUD).",
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

    // Resolve chainer referral code for metadata
    let chainerReferralCode: string | null = null;
    if (bodyChainerId && typeof bodyChainerId === "string") {
      const [chainerRow] = await db
        .select({ referralCode: chainers.referralCode, campaignId: chainers.campaignId })
        .from(chainers)
        .where(eq(chainers.id, bodyChainerId))
        .limit(1);
      if (chainerRow?.referralCode && chainerRow.campaignId === campaignId) {
        chainerReferralCode = chainerRow.referralCode;
      }
    }

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

    const isQuickDonateApplePay =
      quickDonate && paymentProvider === "paystack" && paymentMethod === "apple_pay";

    // Quick donate bank transfer uses a campaign-level virtual account (no donor profile required up front).
    // Quick donate Apple Pay intentionally skips this branch and uses a normal Paystack transaction.
    // PayPal quick donate skips this branch and uses the standard PayPal order flow below.
    if (isQuickDonatePaystackNgn && !isQuickDonateApplePay) {
      const quickPhone =
        (normalizedDonorPhone && normalizedDonorPhone.trim()) || "08000000000";
      const customerCode = campaign.quickDonateCustomerCode || null;
      const accountNumber = campaign.quickDonateAccountNumber || null;
      const bankName = campaign.quickDonateBankName || null;
      const accountName = campaign.quickDonateAccountName || null;
      const shouldRefreshLegacyAccountName =
        typeof accountName === "string" &&
        accountName.toUpperCase().includes("QUICKDONATE CAMPAIGN");

      const createQuickDonateAttempt = async () => {
        const suffix = crypto.randomUUID();
        const guestEmail = `quickdonor+${suffix}@chainfundit.app`;
        const guestName = "Quick Donor";

        const [existingUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, guestEmail))
          .limit(1);

        const donorId = existingUser?.id
          ? existingUser.id
          : (
              await db
                .insert(users)
                .values({
                  email: guestEmail,
                  fullName: guestName,
                  isVerified: false,
                  hasCompletedProfile: false,
                })
                .returning({ id: users.id })
            )[0]?.id;

        if (!donorId) {
          throw new Error("Failed to create guest donor");
        }

        const [newDonation] = await db
          .insert(donations)
          .values({
            campaignId,
            donorId,
            amount: amount.toString(),
            currency: "NGN",
            paymentMethod: "paystack",
            paymentStatus: "pending",
            message: "Quick Donate",
            isAnonymous: true,
            donorName: guestName,
            donorEmail: guestEmail,
            donorPhone: normalizedDonorPhone || null,
            chainerId:
              bodyChainerId && typeof bodyChainerId === "string"
                ? bodyChainerId
                : null,
            quickDonate: true,
          })
          .returning({ id: donations.id });

        if (!newDonation?.id) {
          throw new Error("Failed to create quick donate attempt");
        }
        return newDonation.id;
      };

      if (
        customerCode &&
        accountNumber &&
        bankName &&
        accountName &&
        !shouldRefreshLegacyAccountName
      ) {
        const donationId = await createQuickDonateAttempt();
        return NextResponse.json({
          success: true,
          provider: "paystack",
          mode: "quick",
          donationId,
          virtualAccount: {
            accountNumber,
            accountName,
            bankName,
            amount,
            campaignName: campaign.title,
          },
        });
      }

      const customerMetadata: Record<string, any> = {
        campaignId,
        campaignSlug: campaign.slug,
        campaignName: campaign.title,
        donationMode: "quick",
        ...(chainerReferralCode ? { chainCode: chainerReferralCode } : {}),
      };
      const campaignNameForAccount = campaign.title
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60);
      // Paystack virtual account names use "MERCHANT / {last_name} {first_name}".
      // Map words so that segment reads in natural title order (e.g. BOOK DRIVE CAMPAIGN).
      const nameWords = campaignNameForAccount.split(/\s+/).filter(Boolean);
      const quickDonateLastName = (nameWords[0] || "Campaign").slice(0, 50);
      const quickDonateFirstName =
        nameWords.length > 1
          ? nameWords.slice(1).join(" ").slice(0, 50)
          : "Fundraiser";

      try {
        const customer = await createPaystackCustomer(
          `quickdonate+${campaignId}@chainfundit.app`,
          {
            firstName: quickDonateFirstName,
            lastName: quickDonateLastName,
            phone: quickPhone,
          },
          customerMetadata
        );
        const dedicatedAccount = await createPaystackDedicatedAccount(
          customer.data.customer_code
        );

        await db
          .update(campaigns)
          .set({
            quickDonateCustomerCode: customer.data.customer_code,
            quickDonateAccountNumber: dedicatedAccount.data.account_number,
            quickDonateBankName: dedicatedAccount.data.bank?.name ?? null,
            quickDonateAccountName: dedicatedAccount.data.account_name,
          })
          .where(eq(campaigns.id, campaignId));

        const donationId = await createQuickDonateAttempt();
        return NextResponse.json({
          success: true,
          provider: "paystack",
          mode: "quick",
          donationId,
          virtualAccount: {
            accountNumber: dedicatedAccount.data.account_number,
            accountName: dedicatedAccount.data.account_name,
            bankName: dedicatedAccount.data.bank?.name ?? "Paystack Bank",
            amount,
            campaignName: campaign.title,
          },
        });
      } catch (quickErr: unknown) {
        const message =
          quickErr instanceof Error ? quickErr.message : "Unknown error";
        console.error("Quick Donate virtual account creation failed:", quickErr);
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not create a bank transfer account for this campaign. Check Paystack DVA settings and keys.",
            details: message,
            code: "QUICK_DONATE_DVA_ERROR",
          },
          { status: 502 }
        );
      }
    }

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

    const donationDonorName = isAnonymous
      ? null
      : (normalizedDonorName || user.fullName || "Guest Donor");
    const donationDonorEmail = normalizedEmail || user.email || null;
    const effectiveDonationEmail =
      donationDonorEmail ??
      `quickdonor+${Date.now()}_${Math.random().toString(36).slice(2, 8)}@chainfundit.app`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Create donation record (include chainerId when donation comes through a chainer's link)
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
        donorEmail: donationDonorEmail ?? effectiveDonationEmail,
        donorPhone: normalizedDonorPhone || null,
        chainerId: bodyChainerId && typeof bodyChainerId === "string" ? bodyChainerId : null,
        quickDonate: Boolean(quickDonate),
      })
      .returning();

    const donationId = newDonation[0].id;

    // Initialize payment based on provider
    let paymentResult;

    if (paymentProvider === "paystack") {
      try {
        // Structure metadata with custom_fields for Paystack Dashboard display
        const paystackCustomFields: Array<{ display_name: string; variable_name: string; value: string }> = [
          { display_name: "Campaign Title", variable_name: "campaign_title", value: campaign.title },
          { display_name: "Campaign Slug", variable_name: "campaign_slug", value: campaign.slug },
          { display_name: "Campaign ID", variable_name: "campaign_id", value: campaignId },
          { display_name: "Donation ID", variable_name: "donation_id", value: donationId },
          ...(campaign.description ? [{
            display_name: "Campaign Description",
            variable_name: "campaign_description",
            value: campaign.description.length > 200 ? campaign.description.substring(0, 200) + "..." : campaign.description,
          }] : []),
          ...(campaign.goalAmount ? [{
            display_name: "Campaign Goal",
            variable_name: "campaign_goal",
            value: `${campaign.currency} ${campaign.goalAmount}`,
          }] : []),
        ];
        if (chainerReferralCode) {
          paystackCustomFields.push(
            { display_name: "Chain Code", variable_name: "chain_code", value: chainerReferralCode }
          );
        }
        const campaignMetadata = {
          donationId,
          campaignId,
          donorName: donationDonorName || "",
          donorEmail: donationDonorEmail || user.email!,
          custom_fields: paystackCustomFields,
        };

        const callbackUrl = new URL(
          "/api/payments/paystack/callback",
          appUrl
        ).toString();

        const paystackResponse = await initializePaystackPayment(
          donationDonorEmail || user.email!,
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
            publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
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
    } else if (paymentProvider === "paypal") {
      try {
        const returnUrl = new URL("/api/payments/paypal/callback", appUrl);
        const cancelUrl = new URL("/api/payments/paypal/cancel", appUrl);
        cancelUrl.searchParams.set("donationId", donationId);

        const order = await createPayPalOrder({
          amount,
          currency,
          donationId,
          campaignTitle: campaign.title,
          donorEmail: donationDonorEmail || user.email || null,
          returnUrl: returnUrl.toString(),
          cancelUrl: cancelUrl.toString(),
        });

        const approvalUrl = getPayPalApprovalUrl(order);
        if (!approvalUrl) {
          throw new Error("PayPal approval URL was not returned");
        }

        await db
          .update(donations)
          .set({ paymentIntentId: order.id })
          .where(eq(donations.id, donationId));

        return NextResponse.json({
          success: true,
          provider: "paypal",
          donationId,
          orderId: order.id,
          approvalUrl,
        });
      } catch (paypalError: any) {
        console.error("PayPal order creation failed:", paypalError);

        await db.delete(donations).where(eq(donations.id, donationId));

        return NextResponse.json(
          {
            success: false,
            error:
              "Failed to initialize PayPal payment. Please ensure PayPal is properly configured.",
            details: paypalError.message || "Unknown PayPal error",
            code: paypalError.code || "PAYPAL_ERROR",
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
