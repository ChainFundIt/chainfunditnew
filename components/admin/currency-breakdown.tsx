import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/currency";

type CurrencyAmount = {
  currency: string;
  amount: number;
};

interface CurrencyBreakdownProps {
  amounts?: CurrencyAmount[];
  emptyLabel?: string;
  className?: string;
}

export function CurrencyBreakdown({
  amounts,
  emptyLabel = "0.00",
  className,
}: CurrencyBreakdownProps) {
  if (!amounts || amounts.length === 0) {
    return <span className="text-base text-black font-medium">{emptyLabel}</span>;
  }

  const sortedAmounts = [...amounts].sort((a, b) =>
    a.currency.localeCompare(b.currency)
  );

  return (
    <div className={cn("space-y-1 text-sm", className)}>
      {sortedAmounts.map((entry) => (
        <div key={entry.currency} className="flex items-center justify-between">
          <span className="text-sm text-black font-medium">
            {entry.currency}
          </span>
          <span className="font-medium text-base">
            {formatCurrency(entry.amount, entry.currency)}
          </span>
        </div>
      ))}
    </div>
  );
}
