"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PLATFORM_REVIEW_PROMPT_EVENT,
  type PlatformReviewPromptEventDetail,
  type PlatformReviewPromptReason,
} from "@/lib/utils/review-prompt";

type Mode = "create" | "edit";

type Review = {
  id: string;
  rating: number;
  headline: string | null;
  body: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
};

type MeResponse =
  | {
      success: true;
      eligible: boolean;
      role: "donor" | "creator" | "both";
      mode: Mode;
      user: { id: string; fullName: string };
      review: Review | null;
    }
  | { success: false; error: unknown };

const REVIEW_PROMPT_NEXT_AT_KEY = "cf_platform_review_prompt_next_at";
const REVIEW_PROMPT_DONE_KEY = "cf_platform_review_prompt_done";
const INELIGIBLE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const LATER_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function safeNow() {
  return Date.now();
}

function canPromptNow() {
  try {
    if (localStorage.getItem(REVIEW_PROMPT_DONE_KEY) === "1") return false;
    const nextAtRaw = localStorage.getItem(REVIEW_PROMPT_NEXT_AT_KEY);
    const nextAt = Number(nextAtRaw ?? "0") || 0;
    return safeNow() >= nextAt;
  } catch {
    // If storage is blocked, default to "don't nag"
    return false;
  }
}

function snoozePrompt(ms: number) {
  try {
    localStorage.setItem(
      REVIEW_PROMPT_NEXT_AT_KEY,
      String(safeNow() + ms)
    );
  } catch {
    // ignore
  }
}

function markPromptDone() {
  try {
    localStorage.setItem(REVIEW_PROMPT_DONE_KEY, "1");
  } catch {
    // ignore
  }
}

export default function PlatformReviewPrompt() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  // form state (hydrated from /api/reviews/me)
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const roleLabel = useMemo(() => {
    if (me && "success" in me && me.success) {
      if (me.role === "both") return "Donor & Creator";
      if (me.role === "creator") return "Campaign Creator";
      return "Donor";
    }
    return "Donor";
  }, [me]);

  const displayNamePreview = useMemo(() => {
    const fullName =
      me && "success" in me && me.success ? me.user?.fullName ?? "" : "";
    return isAnonymous ? "Anonymous" : fullName || "Your name";
  }, [isAnonymous, me]);

  const hydrateForm = (data: Extract<MeResponse, { success: true }>) => {
    setRating(data.review?.rating ?? 5);
    setHeadline(data.review?.headline ?? "");
    setBody(data.review?.body ?? "");
    setIsAnonymous(data.review?.isAnonymous ?? false);
  };

  const fetchMe = async () => {
    setLoading(true);
    setNeedsAuth(false);
    try {
      const res = await fetch("/api/reviews/me", { method: "GET" });
      if (res.status === 401) {
        setMe({ success: false, error: "Not authenticated" });
        setNeedsAuth(true);
        return null;
      }

      const data = (await res.json()) as MeResponse;
      if (!res.ok || !data || data.success !== true) {
        setMe(data ?? { success: false, error: "Failed to load" });
        return null;
      }
      setMe(data);
      hydrateForm(data);
      return data;
    } catch (e) {
      setMe({ success: false, error: e });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openFromTrigger = async (opts: {
    reason: PlatformReviewPromptReason;
    bypassCooldown?: boolean;
    // If true, open even if not eligible (still requires mode=create).
    allowIneligible?: boolean;
  }) => {
    try {
      if (localStorage.getItem(REVIEW_PROMPT_DONE_KEY) === "1") return;
    } catch {
      // ignore
    }

    if (!opts.bypassCooldown && !canPromptNow()) return;

    const data = await fetchMe();
    if (!data || data.success !== true) return;

    // If they already have a review, never prompt again.
    if (data.mode !== "create") {
      markPromptDone();
      return;
    }

    if (!opts.allowIneligible && !data.eligible) return;

    setOpen(true);
  };

  useEffect(() => {
    let cancelled = false;

    async function maybePrompt() {
      // "Current flow": only auto-prompt inside the dashboard.
      if (typeof window !== "undefined") {
        const path = window.location?.pathname ?? "";
        if (!path.startsWith("/dashboard")) return;
      }
      if (!canPromptNow()) return;

      const data = await fetchMe();
      if (cancelled || !data) return;

      // Auto-open only if eligible and no existing review yet.
      if (data.eligible && data.mode === "create") {
        setOpen(true);
      } else {
        // Avoid re-checking too frequently for users who aren't eligible yet.
        snoozePrompt(INELIGIBLE_COOLDOWN_MS);
      }
    }

    maybePrompt();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent<PlatformReviewPromptEventDetail>;
      const reason = detail?.reason ?? "dashboard_load";
      const bypassCooldown = Boolean(detail?.bypassCooldown);

      // Event triggers should show the modal even if not eligible yet,
      // but still only if they haven't left a review.
      openFromTrigger({
        reason,
        bypassCooldown,
        allowIneligible: true,
      }).catch(() => {});
    };

    window.addEventListener(PLATFORM_REVIEW_PROMPT_EVENT, handler);
    return () => {
      window.removeEventListener(PLATFORM_REVIEW_PROMPT_EVENT, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWithSnooze = () => {
    setOpen(false);
    snoozePrompt(LATER_COOLDOWN_MS);
  };

  const handleSave = async () => {
    if (!me || !("success" in me) || !me.success) return;

    setSaving(true);
    try {
      const method = me.mode === "edit" ? "PUT" : "POST";
      const res = await fetch("/api/reviews/me", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          headline: headline.trim() || null,
          body: body.trim() || null,
          isAnonymous,
        }),
      });
      const data = (await res.json()) as MeResponse;

      if (!res.ok || !data || data.success !== true) {
        const err =
          typeof (data as any)?.error === "string"
            ? (data as any).error
            : "Failed to save your review.";
        throw new Error(err);
      }

      toast.success(me.mode === "edit" ? "Review updated!" : "Review posted!");
      markPromptDone();
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to save your review.");
    } finally {
      setSaving(false);
    }
  };

  // Don’t render anything visible outside the modal.
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // If user closes the dialog via overlay/X, snooze it.
        if (open && !next) closeWithSnooze();
        else setOpen(next);
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="p-6 border-b bg-[#F0F7Ef]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#104901]">
              <Star className="h-5 w-5" />
              Leave a platform review
            </DialogTitle>
            <DialogDescription className="text-[#104901]/70">
              {me && "success" in me && me.success && me.eligible
                ? `You’re eligible as a ${roleLabel}. This review is public and appears immediately.`
                : "Share your experience on ChainFundit. Reviews are available to verified users only."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[70vh] overflow-auto">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : needsAuth ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Please sign in to leave a platform review.
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  className="rounded-2xl bg-[#104109] hover:bg-[#0b2f07]"
                  onClick={() => {
                    window.location.href = "/signup";
                  }}
                >
                  Sign up / Sign in
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={closeWithSnooze}
                >
                  Later
                </Button>
              </div>
            </div>
          ) : me && "success" in me && me.success ? (
            me.eligible ? (
              <div className="space-y-5 font-jakarta">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="p-1"
                        aria-label={`Set rating to ${n}`}
                      >
                        <Star
                          className={cn(
                            "h-6 w-6",
                            n <= rating
                              ? "fill-[#FFD700] text-[#FFD700]"
                              : "text-[#E8E8E8]"
                          )}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headline">Headline (optional)</Label>
                  <Input
                    id="headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="A quick summary of your experience"
                    maxLength={120}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Message (optional)</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="What stood out to you?"
                    rows={5}
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-500">{body.length}/1000</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Post anonymously</Label>
                    <p className="text-sm text-gray-500">
                      If enabled, your review will show as “Anonymous”.
                    </p>
                  </div>
                  <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                </div>

                <div className="rounded-2xl bg-[#F0F7Ef] p-4 text-sm text-[#104901]">
                  <div className="font-semibold mb-1">Preview</div>
                  <div>
                    <span className="font-semibold">Name:</span>{" "}
                    {displayNamePreview}
                  </div>
                  <div>
                    <span className="font-semibold">Role:</span> {roleLabel}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                You can leave a platform review after you&apos;ve completed a donation or
                received your first payout.
              </div>
            )
          ) : null}
        </div>

        <div className="p-6 border-t bg-white">
          <DialogFooter className="sm:justify-between sm:flex-row flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={closeWithSnooze}
              disabled={saving}
            >
              Later
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={
                saving ||
                loading ||
                needsAuth ||
                !me ||
                !("success" in me) ||
                !me.success ||
                !me.eligible
              }
              className="rounded-2xl bg-[#104109]"
            >
              {saving
                ? "Saving..."
                : me && "success" in me && me.success && me.mode === "edit"
                  ? "Save changes"
                  : "Post review"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

