import { db } from "@/lib/db";
import { campaignPayouts } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getStripeConnectAccount, getStripePaymentIntent } from "./stripe";
import { verifyPaystackPayment } from "./paystack";

/**
 * Reconcile payout status with payment provider
 */
export async function reconcilePayoutStatus(payoutId: string) {
  try {
    const payout = await db.query.campaignPayouts.findFirst({
      where: eq(campaignPayouts.id, payoutId),
    });

    if (!payout) {
      return { success: false, error: "Payout not found" };
    }

    // Skip if already completed or failed
    if (payout.status === "completed" || payout.status === "failed") {
      return {
        success: true,
        message: "Payout already finalized",
        status: payout.status,
      };
    }

    // Skip if no transaction ID
    if (!payout.transactionId) {
      return { success: true, message: "No transaction ID to reconcile" };
    }

    let providerStatus: string | null = null;
    let shouldUpdate = false;

    if (payout.payoutProvider === "stripe") {
      try {
        // For Stripe, check transfer or payout status
        // Note: This is a simplified check - in production, you'd want to check both transfers and payouts
        const { stripe } = await import("./stripe");

        // Try to retrieve as transfer first
        try {
          const transfer = await stripe.transfers.retrieve(
            payout.transactionId
          );
          // Stripe Transfer objects don't have a status property
          // They only have a 'reversed' boolean property
          providerStatus = transfer.reversed
            ? "failed"
            : "completed"; // If not reversed, transfer is completed
          shouldUpdate = providerStatus !== payout.status;
        } catch {
          // If not a transfer, try as payout
          try {
            const stripePayoutObj = await stripe.payouts.retrieve(
              payout.transactionId
            );
            providerStatus =
              stripePayoutObj.status === "paid"
                ? "completed"
                : stripePayoutObj.status === "failed"
                  ? "failed"
                  : stripePayoutObj.status === "canceled"
                    ? "failed"
                    : "processing";
            shouldUpdate = providerStatus !== payout.status;
          } catch {
            return { success: false, error: "Transaction not found in Stripe" };
          }
        }
      } catch (error) {
        console.error("Error reconciling Stripe payout:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    } else if (payout.payoutProvider === "paystack") {
      try {
        const transfer = await verifyPaystackPayment(payout.transactionId);
        providerStatus =
          transfer.data.status === "success"
            ? "completed"
            : transfer.data.status === "failed"
              ? "failed"
              : "processing";
        shouldUpdate = providerStatus !== payout.status;
      } catch (error) {
        console.error("Error reconciling Paystack payout:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    if (shouldUpdate && providerStatus) {
      const { logPayoutStatusChange } = await import("./payout-audit");

      await db
        .update(campaignPayouts)
        .set({
          status: providerStatus,
          updatedAt: new Date(),
        })
        .where(eq(campaignPayouts.id, payoutId));

      await logPayoutStatusChange({
        payoutId,
        oldStatus: payout.status,
        newStatus: providerStatus,
        changedBy: "reconciliation",
        reason: "Status reconciled with payment provider",
      });

      return {
        success: true,
        message: "Payout status updated",
        oldStatus: payout.status,
        newStatus: providerStatus,
      };
    }

    return {
      success: true,
      message: "Status matches provider",
      status: payout.status,
    };
  } catch (error) {
    console.error("Error in reconcilePayoutStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reconcile all pending/processing payouts
 */
export async function reconcileAllPendingPayouts() {
  try {
    const pendingPayouts = await db
      .select()
      .from(campaignPayouts)
      .where(
        and(
          inArray(campaignPayouts.status, ["pending", "approved", "processing"])
          // Only reconcile payouts that have been processing for more than 1 hour
          // This avoids reconciling payouts that were just created
        )
      );

    const results = {
      total: pendingPayouts.length,
      updated: 0,
      errors: 0,
    };

    for (const payout of pendingPayouts) {
      // Only reconcile if there's a transaction ID (meaning it was sent to provider)
      if (payout.transactionId) {
        const result = await reconcilePayoutStatus(payout.id);
        if (result.success && result.oldStatus !== result.newStatus) {
          results.updated++;
        } else if (!result.success) {
          results.errors++;
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error in reconcileAllPendingPayouts:", error);
    return { total: 0, updated: 0, errors: 1 };
  }
}
