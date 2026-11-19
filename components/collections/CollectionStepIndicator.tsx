import { cn } from "@/lib/utils";

interface CollectionStepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { num: 1, label: "Occasion" },
  { num: 2, label: "Details" },
  { num: 3, label: "Review" },
] as const;

export function CollectionStepIndicator({
  currentStep,
}: CollectionStepIndicatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-4 mb-8"
      aria-label={`Step ${currentStep} of 3`}
    >
      {steps.map((step) => {
        const isActive = step.num === currentStep;
        const isComplete = step.num < currentStep;
        return (
          <div
            key={step.num}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[3rem]",
              isActive ? "text-[#104109]" : "text-[#78716C]"
            )}
          >
            <span
              className={cn(
                "text-lg font-bold tabular-nums",
                isComplete && "text-[#104109]/70"
              )}
            >
              {step.num}
            </span>
            <span className="text-xs font-semibold tracking-wide hidden sm:block">
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}