export const PLATFORM_REVIEW_PROMPT_EVENT = "cf:platform-review-prompt" as const;

export type PlatformReviewPromptReason =
  | "donation"
  | "campaign_created"
  | "goal_reached"
  | "payout"
  | "dashboard_load";

export type PlatformReviewPromptEventDetail = {
  reason: PlatformReviewPromptReason;
  bypassCooldown?: boolean;
};

export function triggerPlatformReviewPrompt(
  detail: PlatformReviewPromptEventDetail
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<PlatformReviewPromptEventDetail>(
      PLATFORM_REVIEW_PROMPT_EVENT,
      { detail }
    )
  );
}

