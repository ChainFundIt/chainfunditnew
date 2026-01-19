"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";
import { Star } from "lucide-react";

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

type ApiState = {
  loading: boolean;
  eligible: boolean;
  role: "donor" | "creator" | "both";
  mode: Mode;
  userFullName: string;
  review: Review | null;
};

export default function ReviewSettings() {
  const [state, setState] = useState<ApiState>({
    loading: true,
    eligible: false,
    role: "donor",
    mode: "create",
    userFullName: "",
    review: null,
  });
  const [saving, setSaving] = useState(false);

  const [rating, setRating] = useState<number>(5);
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const roleLabel = useMemo(() => {
    if (state.role === "both") return "Donor & Creator";
    if (state.role === "creator") return "Campaign Creator";
    return "Donor";
  }, [state.role]);

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hydrateForm = (data: { userFullName: string; review: Review | null }) => {
    setHeadline(data.review?.headline ?? "");
    setBody(data.review?.body ?? "");
    setRating(data.review?.rating ?? 5);
    setIsAnonymous(data.review?.isAnonymous ?? false);
  };

  const fetchMe = async () => {
    try {
      setState((s) => ({ ...s, loading: true }));
      const res = await fetch("/api/reviews/me");
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to load review settings");
      }
      setState({
        loading: false,
        eligible: Boolean(data.eligible),
        role: data.role,
        mode: data.mode,
        userFullName: data.user?.fullName ?? "",
        review: data.review ?? null,
      });
      hydrateForm({
        userFullName: data.user?.fullName ?? "",
        review: data.review ?? null,
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load your review settings.");
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = state.mode === "edit" ? "PUT" : "POST";
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
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to save your review"
        );
      }

      toast.success(state.mode === "edit" ? "Review updated!" : "Review posted!");
      await fetchMe();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Failed to save your review.");
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) {
    return (
      <div className="flex pt-5 justify-center">
        <div className="text-[#104901] font-extrabold text-xl flex items-center gap-2">
          <Loader size="medium" />
          Loading review settings...
        </div>
      </div>
    );
  }

  if (!state.eligible) {
    return (
      <div className="bg-white p-5 flex flex-col gap-6 font-jakarta">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Platform Review
            </CardTitle>
            <CardDescription>
              Reviews are available to verified users only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              You can leave a platform review after you&apos;ve completed a
              donation or received your first payout.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 flex flex-col gap-6 font-jakarta">
      <div>
        <h4 className="text-3xl font-semibold text-[#104901] mb-2">
          Platform Review
        </h4>
        <p className="font-normal text-xl text-[#104901] opacity-80">
          Share your experience as a <span className="font-semibold">{roleLabel}</span>.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your review</CardTitle>
          <CardDescription>
            {state.mode === "edit"
              ? "You can edit your review. Updates are limited to once every 24 hours."
              : "Post your one platform review. It will appear immediately."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
                    className={
                      n <= rating ? "fill-[#FFD700] text-[#FFD700]" : "text-[#E8E8E8]"
                    }
                    size={24}
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
              {isAnonymous ? "Anonymous" : state.userFullName || "Your name"}
            </div>
            <div>
              <span className="font-semibold">Role:</span> {roleLabel}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-[#104109] hover:bg-[#0b2f07]"
            >
              {saving ? "Saving..." : state.mode === "edit" ? "Save changes" : "Post review"}
            </Button>
            <Button
              onClick={fetchMe}
              variant="outline"
              className="rounded-2xl hover:bg-white"
              disabled={saving}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

