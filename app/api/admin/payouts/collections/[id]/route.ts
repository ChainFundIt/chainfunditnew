import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { collectionPayouts } from "@/lib/schema/collections";
import { requireAdminAuthWith2FA } from "@/lib/admin-auth";
import {
  processCollectionPayout,
  sendPayoutApprovalNotification,
} from "@/lib/payments/payout-processor";
import { logCollectionPayoutStatusChange } from "@/lib/payments/payout-audit";
import { sendPayoutFailureEmail } from "@/lib/payments/payout-email";

function adminAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "2FA verification required") {
      return NextResponse.json(
        { error: "2FA verification required" },
        { status: 403 }
      );
    }
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUser = await requireAdminAuthWith2FA(request);
    const { id } = await params;
    const body = await request.json();
    const { action, notes, rejectionReason } = body;

    const existingPayout = await db.query.collectionPayouts.findFirst({
      where: eq(collectionPayouts.id, id),
      with: {
        user: true,
        collection: true,
      },
    });

    if (!existingPayout) {
      return NextResponse.json({ error: "Payout not found" }, { status: 404 });
    }

    const oldStatus = existingPayout.status;

    if (action === "approve") {
      if (existingPayout.status !== "pending") {
        return NextResponse.json(
          { error: "Only pending payouts can be approved" },
          { status: 400 }
        );
      }

      await db
        .update(collectionPayouts)
        .set({
          status: "approved",
          approvedBy: adminUser.id,
          approvedAt: new Date(),
          notes: notes || null,
          updatedAt: new Date(),
        })
        .where(eq(collectionPayouts.id, id));

      await logCollectionPayoutStatusChange({
        payoutId: id,
        oldStatus,
        newStatus: "approved",
        changedBy: adminUser.id,
        reason: notes || "Payout approved by admin",
      });

      try {
        await sendPayoutApprovalNotification(id, "collection");
      } catch (emailError) {
        console.error("Failed to send collection approval email:", emailError);
      }

      try {
        const processResult = await processCollectionPayout(id);
        if (!processResult.success) {
          const errorMessage = processResult.error || "Processing failed";
          await db
            .update(collectionPayouts)
            .set({
              status: "failed",
              failureReason: errorMessage,
              updatedAt: new Date(),
            })
            .where(eq(collectionPayouts.id, id));
          await logCollectionPayoutStatusChange({
            payoutId: id,
            oldStatus: "approved",
            newStatus: "failed",
            changedBy: "system",
            reason: errorMessage,
          });
        }
      } catch (processError) {
        const errorMessage =
          processError instanceof Error
            ? processError.message
            : "Processing failed";
        await db
          .update(collectionPayouts)
          .set({
            status: "failed",
            failureReason: errorMessage,
            updatedAt: new Date(),
          })
          .where(eq(collectionPayouts.id, id));
        await logCollectionPayoutStatusChange({
          payoutId: id,
          oldStatus: "approved",
          newStatus: "failed",
          changedBy: "system",
          reason: errorMessage,
        });
      }

      return NextResponse.json({ message: "Collection payout approved" });
    }

    if (action === "reject") {
      if (!rejectionReason || String(rejectionReason).trim().length < 10) {
        return NextResponse.json(
          { error: "Rejection reason must be at least 10 characters" },
          { status: 400 }
        );
      }
      if (existingPayout.status !== "pending") {
        return NextResponse.json(
          { error: "Only pending payouts can be rejected" },
          { status: 400 }
        );
      }

      await db
        .update(collectionPayouts)
        .set({
          status: "rejected",
          rejectionReason: String(rejectionReason).trim(),
          notes: notes || null,
          updatedAt: new Date(),
        })
        .where(eq(collectionPayouts.id, id));

      await logCollectionPayoutStatusChange({
        payoutId: id,
        oldStatus,
        newStatus: "rejected",
        changedBy: adminUser.id,
        reason: String(rejectionReason).trim(),
      });

      if (existingPayout.user?.email) {
        try {
          await sendPayoutFailureEmail({
            userEmail: existingPayout.user.email,
            userName:
              existingPayout.user.fullName || existingPayout.user.email,
            campaignTitle: existingPayout.collection?.title || "Collection",
            payoutAmount: parseFloat(existingPayout.requestedAmount),
            currency: existingPayout.currency,
            failureReason: String(rejectionReason).trim(),
            payoutId: id,
          });
        } catch (emailError) {
          console.error("Failed to send collection rejection email:", emailError);
        }
      }

      return NextResponse.json({ message: "Collection payout rejected" });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const authResponse = adminAuthError(error);
    if (authResponse) return authResponse;
    console.error("Error updating collection payout:", error);
    return NextResponse.json(
      { error: "Failed to update collection payout" },
      { status: 500 }
    );
  }
}
