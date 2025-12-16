import { formatCurrency } from "./currency";
import { getCurrencyRate } from "./currency-conversion";

const DEFAULT_EQUIVALENT_CURRENCIES = ["USD", "EUR", "NGN"] as const;

/**
 * Formats a base amount like "£20,250+" and appends approximate equivalents in other currencies.
 * Uses existing fallback rates (via NGN) from `getCurrencyRate`, so values are intentionally approximate.
 */
export function formatImpactAmountWithEquivalents(
  baseAmount: number,
  baseCurrency: string,
  otherCurrencies: readonly string[] = DEFAULT_EQUIVALENT_CURRENCIES
): string {
  const base = `${formatCurrency(baseAmount, baseCurrency)}+`;

  if (!otherCurrencies.length) return base;

  const equivalents = otherCurrencies
    .filter((c) => c.toUpperCase() !== baseCurrency.toUpperCase())
    .map((currency) => {
      const code = currency.toUpperCase();
      const rate = getCurrencyRate(baseCurrency, code);
      const converted = Math.round(baseAmount * rate);
      return `≈ ${formatCurrency(converted, code)}+`;
    })
    .join(", ");

  return equivalents ? `${base} (${equivalents})` : base;
}


