export const DEFAULT_PLATFORM_FEE_PERCENT = 5;

const DEFAULT_PROVIDER_FEE_PERCENT = 2;

const PROVIDER_FEE_PERCENT_BY_PROVIDER: Record<string, number> = {
  paystack: 1,
  paypal: 2,
};

export function getProviderFeePercent(payoutProvider?: string | null): number {
  if (!payoutProvider) {
    return DEFAULT_PROVIDER_FEE_PERCENT;
  }

  return PROVIDER_FEE_PERCENT_BY_PROVIDER[payoutProvider] ?? DEFAULT_PROVIDER_FEE_PERCENT;
}

export function resolveEffectivePlatformFeePercent(params: {
  overrideEnabled?: boolean | null;
  overridePercent?: string | number | null;
  defaultPercent?: number;
}): number {
  const defaultPercent = params.defaultPercent ?? DEFAULT_PLATFORM_FEE_PERCENT;
  const parsedOverride =
    params.overridePercent == null
      ? null
      : typeof params.overridePercent === "number"
      ? params.overridePercent
      : Number(params.overridePercent);

  if (!params.overrideEnabled || parsedOverride == null || !Number.isFinite(parsedOverride)) {
    return defaultPercent;
  }

  // Admin can reduce to 0%, but cannot exceed platform default.
  return Math.min(Math.max(parsedOverride, 0), defaultPercent);
}

export function calculatePayoutFees(params: {
  requestedAmount: number;
  payoutProvider?: string | null;
  effectivePlatformFeePercent: number;
}): {
  platformFeePercent: number;
  providerFeePercent: number;
  platformFee: number;
  providerFee: number;
  fixedFee: number;
  totalFees: number;
  netAmount: number;
} {
  const requestedAmount = Number.isFinite(params.requestedAmount)
    ? Math.max(params.requestedAmount, 0)
    : 0;
  const platformFeePercent = Number.isFinite(params.effectivePlatformFeePercent)
    ? Math.max(params.effectivePlatformFeePercent, 0)
    : 0;
  const providerFeePercent = getProviderFeePercent(params.payoutProvider);

  // Provider fee is charged on payout amount, independent of platform-fee overrides.
  const platformFee = (requestedAmount * platformFeePercent) / 100;
  const providerFee = (requestedAmount * providerFeePercent) / 100;
  const fixedFee = 0;
  const totalFees = platformFee + providerFee + fixedFee;
  const netAmount = Math.max(requestedAmount - totalFees, 0);

  return {
    platformFeePercent,
    providerFeePercent,
    platformFee,
    providerFee,
    fixedFee,
    totalFees,
    netAmount,
  };
}
