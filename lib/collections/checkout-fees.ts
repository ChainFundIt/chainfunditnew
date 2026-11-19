import { getProviderFeePercent } from "@/lib/payments/payout-fee-config";

export type CollectionPaymentProvider = "paystack" | "paypal";

function roundMoney(amount: number, currency: string): number {
  if (currency === "NGN") {
    return Math.round(amount);
  }
  return Math.round(amount * 100) / 100;
}

export interface CollectionCheckoutFees {
  contributionAmount: number;
  providerFeePercent: number;
  providerFee: number;
  platformFee: number;
  surchargeAmount: number;
  totalCharged: number;
  supportChainfundit: boolean;
  currency: string;
}

/**
 * Everyone pays contribution + payment provider fee.
 * Optional ChainFundIt support is a custom fixed amount added on top.
 */
export function calculateCollectionCheckoutFees(params: {
  contributionAmount: number;
  currency: string;
  paymentMethod: CollectionPaymentProvider;
  supportChainfundit: boolean;
  chainfunditSupportAmount?: number;
}): CollectionCheckoutFees {
  const contribution = Number.isFinite(params.contributionAmount)
    ? Math.max(params.contributionAmount, 0)
    : 0;
  const providerFeePercent = getProviderFeePercent(params.paymentMethod);

  const providerFee = roundMoney(
    (contribution * providerFeePercent) / 100,
    params.currency
  );

  let platformFee = 0;
  if (params.supportChainfundit) {
    const supportRaw = params.chainfunditSupportAmount ?? 0;
    const supportAmount = Number.isFinite(supportRaw)
      ? Math.max(supportRaw, 0)
      : 0;
    platformFee = roundMoney(supportAmount, params.currency);
  }

  const surchargeAmount = roundMoney(providerFee + platformFee, params.currency);

  const totalCharged = roundMoney(
    contribution + surchargeAmount,
    params.currency
  );

  return {
    contributionAmount: contribution,
    providerFeePercent,
    providerFee,
    platformFee,
    surchargeAmount,
    totalCharged,
    supportChainfundit: params.supportChainfundit,
    currency: params.currency,
  };
}