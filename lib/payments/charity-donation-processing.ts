import { db } from "@/lib/db";
import { charities, charityDonations } from "@/lib/schema/charities";
import { eq, sql } from "drizzle-orm";
import { notifyAdminsOfCharityDonation } from "@/lib/notifications/charity-donation-alerts";

export async function completeCharityDonation(params: {
  donationId: string;
  paymentReference: string;
}): Promise<{ donationId: string; charitySlug: string }> {
  const [donation] = await db
    .select({
      id: charityDonations.id,
      charityId: charityDonations.charityId,
      amount: charityDonations.amount,
      paymentStatus: charityDonations.paymentStatus,
    })
    .from(charityDonations)
    .where(eq(charityDonations.id, params.donationId))
    .limit(1);

  if (!donation) {
    throw new Error("Charity donation not found");
  }

  const [charity] = await db
    .select({
      id: charities.id,
      slug: charities.slug,
    })
    .from(charities)
    .where(eq(charities.id, donation.charityId))
    .limit(1);

  if (!charity) {
    throw new Error("Charity not found");
  }

  if (donation.paymentStatus !== "completed") {
    await db
      .update(charityDonations)
      .set({
        paymentStatus: "completed",
        transactionId: params.paymentReference,
        paymentIntentId: params.paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(charityDonations.id, donation.id));

    await db
      .update(charities)
      .set({
        totalReceived: sql`${charities.totalReceived} + ${donation.amount}`,
        pendingAmount: sql`${charities.pendingAmount} + ${donation.amount}`,
        updatedAt: new Date(),
      })
      .where(eq(charities.id, donation.charityId));

    const fullDonation = await db.query.charityDonations.findFirst({
      where: eq(charityDonations.id, donation.id),
    });
    const fullCharity = await db.query.charities.findFirst({
      where: eq(charities.id, donation.charityId),
    });

    if (fullDonation && fullCharity) {
      await notifyAdminsOfCharityDonation({
        donationId: fullDonation.id,
        charityId: fullCharity.id,
        charityName: fullCharity.name,
        amount: fullDonation.amount,
        currency: fullDonation.currency,
        donorName: fullDonation.donorName || "Anonymous",
        donorEmail: fullDonation.donorEmail || "",
        isAnonymous: fullDonation.isAnonymous,
        message: fullDonation.message || undefined,
      }).catch((error) => {
        console.error("Failed to notify admins of charity donation:", error);
      });
    }
  }

  return { donationId: donation.id, charitySlug: charity.slug };
}

export async function failCharityDonation(params: {
  donationId: string;
  failureReason: string;
}): Promise<{ charitySlug: string }> {
  const [donation] = await db
    .select({
      id: charityDonations.id,
      charityId: charityDonations.charityId,
    })
    .from(charityDonations)
    .where(eq(charityDonations.id, params.donationId))
    .limit(1);

  if (!donation) {
    throw new Error("Charity donation not found");
  }

  const [charity] = await db
    .select({ slug: charities.slug })
    .from(charities)
    .where(eq(charities.id, donation.charityId))
    .limit(1);

  if (!charity) {
    throw new Error("Charity not found");
  }

  await db
    .update(charityDonations)
    .set({
      paymentStatus: "failed",
      updatedAt: new Date(),
    })
    .where(eq(charityDonations.id, donation.id));

  return { charitySlug: charity.slug };
}
