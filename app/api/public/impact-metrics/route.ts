import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { db, withRetry } from "@/lib/db";
import { donations } from "@/lib/schema/donations";
import { campaigns } from "@/lib/schema/campaigns";
import { users } from "@/lib/schema/users";
import { fetchExchangeRate, getCurrencyRate } from "@/lib/utils/currency-conversion";

export const revalidate = 300; // 5 minutes

type ImpactMetricsResponse = {
  donationsCompleted: number;
  campaignsPublicActive: number;
  countriesReached: number;
  distinctDonors: number;
  amountRaised: {
    currency: string;
    amount: number;
    originalCurrency: "GBP";
    originalAmount: number;
  };
  updatedAt: string;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const currencyParam = url.searchParams.get("currency");
    const requestedCurrency = currencyParam ? currencyParam.toUpperCase() : "GBP";
    const targetCurrency = /^[A-Z]{3}$/.test(requestedCurrency) ? requestedCurrency : "GBP";

    const [
      donationCountRows,
      campaignCountRows,
      donationSumsByCurrency,
      countriesRows,
      distinctDonorsRows,
    ] = await withRetry(async () =>
      Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(donations)
          .where(eq(donations.paymentStatus, "completed")),
        db
          .select({ count: sql<number>`count(*)` })
          .from(campaigns)
          .where(and(eq(campaigns.visibility, "public"), eq(campaigns.isActive, true))),
        db
          .select({
            currency: donations.currency,
            total: sql<string>`sum(${donations.amount})`,
          })
          .from(donations)
          .where(eq(donations.paymentStatus, "completed"))
          .groupBy(donations.currency),
        db
          .select({ count: sql<number>`count(distinct ${users.countryCode})` })
          .from(donations)
          .leftJoin(users, eq(donations.donorId, users.id))
          .where(eq(donations.paymentStatus, "completed")),
        db
          .select({ count: sql<number>`count(distinct ${donations.donorId})` })
          .from(donations)
          .where(eq(donations.paymentStatus, "completed")),
      ])
    );

    const donationsCompleted = Number(donationCountRows?.[0]?.count || 0);
    const campaignsPublicActive = Number(campaignCountRows?.[0]?.count || 0);
    const countriesReached = Number(countriesRows?.[0]?.count || 0);
    const distinctDonors = Number(distinctDonorsRows?.[0]?.count || 0);

    // Compute total raised in GBP, using donation currency (what donors actually paid).
    // Conversion uses existing approximate rates as a fallback; this avoids slow external FX calls.
    const totalRaisedGBP = donationSumsByCurrency.reduce((acc, row) => {
      const currency = (row.currency || "USD").toUpperCase();
      const total = Number(row.total || 0);
      if (!Number.isFinite(total) || total <= 0) return acc;
      const rateToGBP = getCurrencyRate(currency, "GBP");
      return acc + total * rateToGBP;
    }, 0);

    let amount = totalRaisedGBP;
    if (targetCurrency !== "GBP") {
      const fx = await fetchExchangeRate("GBP", targetCurrency);
      if (fx.success && fx.rate) {
        amount = totalRaisedGBP * fx.rate;
      } else {
        // Fallback to approximate rates if external FX is unavailable
        amount = totalRaisedGBP * getCurrencyRate("GBP", targetCurrency);
      }
    }

    const body: ImpactMetricsResponse = {
      donationsCompleted,
      campaignsPublicActive,
      countriesReached,
      distinctDonors,
      amountRaised: {
        currency: targetCurrency,
        amount: Math.round(amount),
        originalCurrency: "GBP",
        originalAmount: Math.round(totalRaisedGBP),
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to compute impact metrics:", error);
    return NextResponse.json(
      { error: "Failed to compute impact metrics" },
      { status: 500 }
    );
  }
}


