"use client";

import type { CollectionCheckoutFees } from "@/lib/collections/checkout-fees";
import { collectionLabel } from "@/lib/collections/ui";

interface CollectionPaymentBreakdownProps {
  organiserName: string;
  fees: CollectionCheckoutFees;
  formatMoney: (amount: number) => string;
}

export function CollectionPaymentBreakdown({
  organiserName,
  fees,
  formatMoney,
}: CollectionPaymentBreakdownProps) {
  return (
    <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 space-y-3">
      <h3 className={collectionLabel}>Payment</h3>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4 text-[#57534E]">
          <dt>Contribution to {organiserName}</dt>
          <dd className="font-medium text-[#1C1917] tabular-nums">
            {formatMoney(fees.contributionAmount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-[#57534E]">
          <dt>Payment provider fee</dt>
          <dd className="font-medium text-[#1C1917] tabular-nums">
            {formatMoney(fees.providerFee)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-[#57534E]">
          <dt>Support ChainFundIt</dt>
          <dd className="font-medium text-[#1C1917] tabular-nums">
            {formatMoney(fees.platformFee)}
          </dd>
        </div>
      </dl>
      <div className="flex justify-between gap-4 border-t border-[#E7E5E4] pt-3 text-sm font-semibold text-[#1C1917]">
        <span>Total to pay</span>
        <span className="tabular-nums">{formatMoney(fees.totalCharged)}</span>
      </div>
    </div>
  );
}