import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema/campaigns";
import { donations } from "@/lib/schema/donations";
import { notifications } from "@/lib/schema/notifications";
import { eq } from "drizzle-orm";
import { sendDonorConfirmationEmailById } from "@/lib/notifications/donor-confirmation-email";
import { closeCampaign, shouldCloseForGoalReached } from "@/lib/utils/campaign-closure";
import { updateCampaignAmount } from "@/lib/utils/campaign-amount";
import { calculateAndDistributeCommissions } from "@/lib/utils/commission-calculation";
import {
  formatDonationNotificationMessage,
  shouldNotifyUserOfDonation,
} from "@/lib/utils/donation-notification-utils";

interface CompletionParams {
  donationId: string;
  paymentReference: string;
  providerStatus: string;
}

interface FailureParams {
  donationId: string;
  providerStatus: string;
  failureReason: string;
}

export async function completeCampaignDonation({
  donationId,
  paymentReference,
  providerStatus,
}: CompletionParams): Promise<{ campaignSlug: string }> {
  const [donation] = await db
    .select({
      id: donations.id,
      campaignId: donations.campaignId,
      paymentStatus: donations.paymentStatus,
    })
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);

  if (!donation) {
    throw new Error("Donation not found");
  }

  const [campaign] = await db
    .select({
      id: campaigns.id,
      slug: campaigns.slug,
      creatorId: campaigns.creatorId,
      title: campaigns.title,
      currentAmount: campaigns.currentAmount,
      goalAmount: campaigns.goalAmount,
      currency: campaigns.currency,
      status: campaigns.status,
    })
    .from(campaigns)
    .where(eq(campaigns.id, donation.campaignId))
    .limit(1);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (donation.paymentStatus === "completed") {
    return { campaignSlug: campaign.slug };
  }

  await db
    .update(donations)
    .set({
      paymentStatus: "completed",
      processedAt: new Date(),
      lastStatusUpdate: new Date(),
      providerStatus,
      providerError: null,
      paymentIntentId: paymentReference,
      failureReason: null,
    })
    .where(eq(donations.id, donationId));

  await updateCampaignAmount(donation.campaignId);

  const [updatedCampaign] = await db
    .select({
      id: campaigns.id,
      creatorId: campaigns.creatorId,
      currentAmount: campaigns.currentAmount,
      goalAmount: campaigns.goalAmount,
      status: campaigns.status,
    })
    .from(campaigns)
    .where(eq(campaigns.id, donation.campaignId))
    .limit(1);

  if (
    updatedCampaign &&
    updatedCampaign.status === "active" &&
    shouldCloseForGoalReached(
      parseFloat(updatedCampaign.currentAmount),
      parseFloat(updatedCampaign.goalAmount)
    )
  ) {
    await closeCampaign(updatedCampaign.id, "goal_reached", updatedCampaign.creatorId);
  }

  await calculateAndDistributeCommissions(donationId);
  await createSuccessfulCampaignDonationNotification(donationId, donation.campaignId);
  await sendDonorConfirmationEmailById(donationId);

  return { campaignSlug: campaign.slug };
}

export async function failCampaignDonation({
  donationId,
  providerStatus,
  failureReason,
}: FailureParams): Promise<{ campaignSlug: string }> {
  const [donation] = await db
    .select({
      id: donations.id,
      campaignId: donations.campaignId,
      paymentStatus: donations.paymentStatus,
    })
    .from(donations)
    .where(eq(donations.id, donationId))
    .limit(1);

  if (!donation) {
    throw new Error("Donation not found");
  }

  const [campaign] = await db
    .select({ slug: campaigns.slug })
    .from(campaigns)
    .where(eq(campaigns.id, donation.campaignId))
    .limit(1);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (donation.paymentStatus !== "completed") {
    await db
      .update(donations)
      .set({
        paymentStatus: "failed",
        lastStatusUpdate: new Date(),
        providerStatus,
        providerError: failureReason,
        failureReason,
      })
      .where(eq(donations.id, donationId));
  }

  return { campaignSlug: campaign.slug };
}

async function createSuccessfulCampaignDonationNotification(
  donationId: string,
  campaignId: string
) {
  try {
    const [campaign] = await db
      .select({ creatorId: campaigns.creatorId })
      .from(campaigns)
      .where(eq(campaigns.id, campaignId))
      .limit(1);

    if (!campaign) {
      return;
    }

    const [donation] = await db
      .select({
        amount: donations.amount,
        currency: donations.currency,
        donorId: donations.donorId,
      })
      .from(donations)
      .where(eq(donations.id, donationId))
      .limit(1);

    if (!donation) {
      return;
    }

    const notificationCheck = await shouldNotifyUserOfDonation(
      campaign.creatorId,
      donation.amount,
      donation.currency
    );

    if (!notificationCheck.shouldNotify) {
      return;
    }

    const { title, message } = formatDonationNotificationMessage(
      donation.amount,
      donation.currency,
      notificationCheck.isLargeDonation
    );

    await db.insert(notifications).values({
      userId: campaign.creatorId,
      type: notificationCheck.isLargeDonation
        ? "large_donation_received"
        : "donation_received",
      title,
      message,
      metadata: JSON.stringify({
        donationId,
        campaignId,
        amount: donation.amount,
        currency: donation.currency,
        donorId: donation.donorId,
        isLargeDonation: notificationCheck.isLargeDonation,
      }),
      createdAt: new Date(),
    });

    const { sendCampaignDonationEmailById } = await import(
      "@/lib/notifications/campaign-donation-email"
    );

    await sendCampaignDonationEmailById(
      donationId,
      campaign.creatorId,
      notificationCheck.isLargeDonation
    );
  } catch (error) {
    console.error("Error creating successful campaign donation notification:", error);
  }
}
