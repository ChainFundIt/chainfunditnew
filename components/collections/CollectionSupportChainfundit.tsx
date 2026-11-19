"use client";

import { useState } from "react";
import { Check, ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { collectionLabel } from "@/lib/collections/ui";

interface CollectionSupportChainfunditProps {
  organiserName: string;
  currencyCode: string;
  supportChainfundit: boolean;
  supportAmount: string;
  onSupportChange: (value: boolean) => void;
  onSupportAmountChange: (value: string) => void;
}

export function CollectionSupportChainfundit({
  organiserName,
  currencyCode,
  supportChainfundit,
  supportAmount,
  onSupportChange,
  onSupportAmountChange,
}: CollectionSupportChainfunditProps) {
  const [open, setOpen] = useState(true);

  const amountStep = currencyCode === "NGN" ? "1" : "0.01";

  return (
    <div className="space-y-3">
      <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-[#E7E5E4] bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex flex-1 items-center justify-between gap-2 text-left min-w-0"
          aria-expanded={open}
        >
          <span className="text-sm font-semibold text-[#1C1917]">
            Support ChainFundIt
          </span>
          <span className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-[#57534E]">
              {supportChainfundit ? "Yes" : "No"}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-[#57534E] transition-transform",
                open && "rotate-180"
              )}
            />
          </span>
        </button>

        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 rounded-full p-1.5 text-[#57534E] hover:bg-[#F3F8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#104109]"
              aria-label="How payments and fees work"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>How your payment works</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-3 pt-2 text-left text-sm text-[#57534E]">
                  <p>
                    Your <strong className="text-[#1C1917]">contribution</strong>{" "}
                    goes in full to {organiserName}&apos;s collection. We never
                    reduce that amount on the collection page.
                  </p>
                  <p>
                    A <strong className="text-[#1C1917]">payment provider fee</strong>{" "}
                    is added at checkout to cover card processing (Paystack or
                    PayPal). This applies whether or not you support ChainFundIt.
                  </p>
                  <p>
                    If you choose <strong className="text-[#1C1917]">Yes</strong>{" "}
                    under Support ChainFundIt, you can add any amount you like to
                    help us run the platform — entirely optional.
                  </p>
                  <p>
                    If you choose <strong className="text-[#1C1917]">Not this time</strong>,
                    you pay only your contribution plus the payment provider fee.
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      {supportChainfundit && (
        <div className="space-y-2">
          <Label htmlFor="chainfundit-support-amount" className={collectionLabel}>
            Amount to support ChainFundIt ({currencyCode})
          </Label>
          <Input
            id="chainfundit-support-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step={amountStep}
            placeholder={`0 — optional, in ${currencyCode}`}
            value={supportAmount}
            onChange={(e) => onSupportAmountChange(e.target.value)}
            className="h-12 rounded-full border-[#E7E5E4] text-base text-[#1C1917] placeholder:text-[#78716C]"
          />
        </div>
      )}

      {open && (
        <div className="rounded-2xl border border-[#E7E5E4] bg-white p-4 shadow-sm space-y-4">
          <div>
            <p className="font-semibold text-[#1C1917]">Thank you!</p>
            <p className="mt-1 text-sm text-[#57534E]">
              You&apos;re helping keep collections free for communities and
              organisers like {organiserName}. They still get your full
              contribution.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onSupportChange(true);
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                supportChainfundit
                  ? "border-[#104109] bg-[#F3F8F2] ring-1 ring-[#104109]/20"
                  : "border-[#E7E5E4] bg-white hover:border-[#104109]/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      supportChainfundit ? "text-[#104109]" : "text-[#1C1917]"
                    )}
                  >
                    Yes, keep collections free for {organiserName}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      supportChainfundit ? "text-[#104109]/80" : "text-[#78716C]"
                    )}
                  >
                    Add any amount you like to support ChainFundIt — thank you!
                  </p>
                </div>
                {supportChainfundit && (
                  <Check className="h-5 w-5 shrink-0 text-[#104109]" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onSupportChange(false);
                onSupportAmountChange("");
                setOpen(false);
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                !supportChainfundit
                  ? "border-[#104109] bg-[#FAFAF9] ring-1 ring-[#104109]/15"
                  : "border-[#E7E5E4] bg-white hover:border-[#104109]/30"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[#1C1917]">
                    Not this time
                  </p>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Pay your contribution plus the payment provider fee only. We
                    understand if you can&apos;t.
                  </p>
                </div>
                {!supportChainfundit && (
                  <Check className="h-5 w-5 shrink-0 text-[#104109]" />
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}