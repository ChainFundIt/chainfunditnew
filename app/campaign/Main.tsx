"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { R2Image } from "@/components/ui/r2-image";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import {
  CheckCircle,
  Users,
  LinkIcon,
  Heart,
  MessageSquare,
  Send,
  PlusSquare,
  AlertCircle,
  X,
  Share2,
  Clock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import CTA from "./cta";
import ChainModal from "./chain-modal";
import DonateModal from "./donate-modal";
import ShareModal from "./share-modal";
import UpdateModal from "./update-modal";
import CommentModal from "./comment-modal";
import { useCampaignDonations } from "@/hooks/use-campaign-donations";
import { useTopChainers } from "@/hooks/use-top-chainers";
import ClientToaster from "@/components/ui/client-toaster";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils/currency";
import { ExternalToast, toast } from "sonner";

const autoRefreshInterval = 120000; // 2 minutes

const getYouTubeThumbnail = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
};

const getYouTubeVideoId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
};

interface CampaignData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  reason: string;
  fundraisingFor: string;
  duration: string;
  videoUrl?: string;
  coverImageUrl?: string;
  galleryImages: string[];
  documents: string[];
  goalAmount: number;
  currency: string;
  minimumDonation: string;
  chainerCommissionRate: number;
  isChained: boolean;
  currentAmount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  stats: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
  canEdit?: boolean;
}

interface CampaignUpdate {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CampaignComment {
  id: string;
  slug: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

interface MainProps {
  campaignSlug: string;
}

const Main = ({ campaignSlug }: MainProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("our-story");
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comments, setComments] = useState<CampaignComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [chainCount, setChainCount] = useState(0);
  const [loadingChains, setLoadingChains] = useState(false);
  const [donationStatusNotification, setDonationStatusNotification] = useState<{
    status: "success" | "failed" | "pending";
    donationId?: string;
    message: string;
  } | null>(null);
  const [referralChainer, setReferralChainer] = useState<{
    id: string;
    referralCode: string;
  } | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const { donations, loading: loadingDonations } = useCampaignDonations(
    campaignId || ""
  );
  const { topChainers, loading: loadingTopChainers } = useTopChainers(
    campaignId || ""
  );
  // Handle donation status from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const donationStatus = urlParams.get("donation_status");
    const donationId = urlParams.get("donation_id");
    const error = urlParams.get("error");
    const ref = urlParams.get("ref");

    if (donationStatus) {
      let message = "";
      let status: "success" | "failed" | "pending" = "success";

      switch (donationStatus) {
        case "success":
          status = "success";
          message = "Thank you! Your donation was successful.";
          setDonateModalOpen(true);
          sessionStorage.setItem("showThankYouModal", "true");
          break;
        case "failed":
          status = "failed";
          message = error
            ? `Donation failed: ${error}`
            : "Your donation could not be processed. Please try again.";
          toast.error("Donation Failed", {
            description: message,
            duration: 8000,
          });
          break;
        case "pending":
          status = "pending";
          message =
            "Your donation is being processed. You will be notified once it's completed.";
          toast.info("Donation Pending", {
            description: message,
            duration: 6000,
          });
          break;
      }

      setDonationStatusNotification({
        status,
        donationId: donationId || undefined,
        message,
      });

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("donation_status");
      newUrl.searchParams.delete("donation_id");
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());

      setTimeout(() => {
        setDonationStatusNotification(null);
      }, 10000);
    }

    if (ref) {
      fetch(`/api/chainers?referralCode=${ref}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.data.length > 0) {
            const chainer = data.data[0];
            if (
              chainer.campaignId === campaignId ||
              (campaign && chainer.campaignId === campaign.id)
            ) {
              setReferralChainer({
                id: chainer.id,
                referralCode: ref,
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching chainer:", error);
        });
    }
  }, [campaignId]);

  const fetchUpdates = React.useCallback(
    async (options?: { silent?: boolean; campaignIdOverride?: string }) => {
      const isSilent = options?.silent ?? false;
      const idToUse = options?.campaignIdOverride || campaignId;
      if (!idToUse) return;
      try {
        if (!isSilent) {
          setLoadingUpdates(true);
        }
        const response = await fetch(`/api/campaigns/${idToUse}/updates`);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUpdates(result.data);
          }
        }
      } catch (error) {
        if (!isSilent) {
          toast.error(
            "Error fetching updates:",
            error as ExternalToast | undefined
          );
        } else {
          console.error("Error fetching updates:", error);
        }
      } finally {
        if (!isSilent) {
          setLoadingUpdates(false);
        }
      }
    },
    [campaignId]
  );

  const fetchComments = React.useCallback(
    async (options?: { silent?: boolean; campaignIdOverride?: string }) => {
      const isSilent = options?.silent ?? false;
      const idToUse = options?.campaignIdOverride || campaignId;
      if (!idToUse) return;
      try {
        if (!isSilent) {
          setLoadingComments(true);
        }
        const response = await fetch(`/api/campaigns/${idToUse}/comments`);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setComments(result.data);
          }
        }
      } catch (error) {
        if (!isSilent) {
          toast.error(
            "Error fetching comments:",
            error as ExternalToast | undefined
          );
        } else {
          console.error("Error fetching comments:", error);
        }
      } finally {
        if (!isSilent) {
          setLoadingComments(false);
        }
      }
    },
    [campaignId]
  );

  const fetchChainCount = React.useCallback(
    async (options?: { silent?: boolean; campaignIdOverride?: string }) => {
      const isSilent = options?.silent ?? false;
      const idToUse = options?.campaignIdOverride || campaignId;
      if (!idToUse) return;
      try {
        if (!isSilent) {
          setLoadingChains(true);
        }
        const response = await fetch(`/api/campaigns/${idToUse}/chains`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setChainCount(result.data.chainCount);
          }
        }
      } catch (error) {
        if (!isSilent) {
          toast.error(
            "Error fetching chain count:",
            error as ExternalToast | undefined
          );
        } else {
          console.error("Error fetching chain count:", error);
        }
      } finally {
        if (!isSilent) {
          setLoadingChains(false);
        }
      }
    },
    [campaignId]
  );
  const fetchCampaign = React.useCallback(
    async (options?: { silent?: boolean }) => {
      const isSilent = options?.silent ?? false;
      try {
        if (!isSilent) {
          setLoading(true);
          setError(null);
        }

        const response = await fetch(
          `/api/campaigns/${campaignSlug}?t=${Date.now()}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Campaign not found");
          }
          throw new Error(`Failed to fetch campaign: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch campaign");
        }

        let campaignData = result.data;

        if (!campaignData.creatorName) {
          campaignData = {
            ...campaignData,
            creatorName: "Unknown Creator",
            fundraisingFor: campaignData.fundraisingFor || "Unknown Cause",
          };
        }

        setCampaign(campaignData);
        const loadedCampaignId = campaignData.id;
        setCampaignId(loadedCampaignId);
        setError(null);

        if (typeof window !== "undefined" && !isSilent) {
          const { trackCampaign } = await import("@/lib/analytics");
          trackCampaign("campaign_viewed", {
            campaign_id: campaignData.id,
            campaign_title: campaignData.title,
            campaign_slug: campaignData.slug,
            campaign_goal: parseFloat(campaignData.goalAmount || "0"),
            campaign_currency: campaignData.currency,
          });
        }

        await Promise.all([
          fetchUpdates({
            silent: isSilent,
            campaignIdOverride: loadedCampaignId,
          }),
          fetchComments({
            silent: isSilent,
            campaignIdOverride: loadedCampaignId,
          }),
          fetchChainCount({
            silent: isSilent,
            campaignIdOverride: loadedCampaignId,
          }),
        ]);
      } catch (error) {
        if (!isSilent) {
          setError(
            error instanceof Error ? error.message : "Failed to fetch campaign"
          );
          toast.error(
            "Error fetching campaign:",
            error as ExternalToast | undefined
          );
        } else {
          console.error("Error refreshing campaign:", error);
        }
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    },
    [campaignSlug, fetchUpdates, fetchComments, fetchChainCount]
  );

  React.useEffect(() => {
    if (campaignSlug) {
      fetchCampaign();
    }
  }, [campaignSlug, fetchCampaign]);

  React.useEffect(() => {
    if (!campaignId) {
      return;
    }

    const maybeRefreshCampaign = () => {
      if (document.visibilityState === "visible") {
        fetchCampaign({ silent: true });
      }
    };

    const intervalId = window.setInterval(
      maybeRefreshCampaign,
      autoRefreshInterval
    );

    document.addEventListener("visibilitychange", maybeRefreshCampaign);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", maybeRefreshCampaign);
    };
  }, [campaignId, fetchCampaign]);
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderBottomColor: "#104901" }}
            ></div>
            <p className="text-lg text-gray-600">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl  text-gray-900 mb-2">
              {error === "Campaign not found"
                ? "Campaign Not Found"
                : "Something went wrong"}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {error === "Campaign not found"
                ? "The campaign you're looking for doesn't exist or has been removed."
                : "We couldn't load the campaign. Please try again later."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
              style={{ backgroundColor: "#104901" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const campaignData = campaign;
  const raised = campaignData.currentAmount;
  const goal = campaignData.goalAmount;
  const percent = Math.min(100, Math.round((raised / goal) * 100));
  const isGoalReached = raised >= goal;
  const isCampaignInactive = !campaignData.isActive;
  const shouldDisableButtons = isGoalReached || isCampaignInactive;

  const parseJsonArray = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const galleryImages = parseJsonArray(campaign?.galleryImages).filter(
    (img) => img && img !== "undefined"
  );

  const campaignImages = campaignData?.coverImageUrl
    ? [campaignData.coverImageUrl, ...galleryImages]
    : galleryImages;

  const campaignDocuments = parseJsonArray(campaignData?.documents);
  return (
    <div className="bg-gray-50 font-jakarta">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Campaigns</span>
            <span className="text-gray-400">/</span>
            <span style={{ color: "#104901" }} className="font-medium">
              {campaignData.reason}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 mt-6">
                {campaignData.title}
              </h1>
            </div>

            {/* Main Image with Verified Badge */}
            <div className="relative">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
                {campaignImages.length > 0 ? (
                  needsEmojiFallback(campaignImages[selectedImage]) ? (
                    <EmojiFallbackImage
                      category={campaign?.reason || "Uncategorized"}
                      title={campaign?.title}
                      className="w-full h-full"
                      fill
                    />
                  ) : (
                    <R2Image
                      src={campaignImages[selectedImage]}
                      alt={`Gallery image ${selectedImage + 1}`}
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <EmojiFallbackImage
                    category={campaign?.reason || "Uncategorized"}
                    title={campaign?.title}
                    className="w-full h-full"
                    fill
                  />
                )}
              </div>

              {/* Verified Badge Overlay */}
              <div className="absolute top-4 left-4">
                {campaignData.isActive && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-900">
                      ACTIVE
                    </span>
                  </div>
                )} 
                {!campaignData.isActive && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-900">
                      INACTIVE
                    </span>
                  </div>
                )}
                {isGoalReached && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
                    <span className="text-sm font-medium text-gray-900">
                      GOAL REACHED
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {campaignImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {campaignImages.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? "border-[#104901] ring-2 ring-offset-2"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {needsEmojiFallback(img) ? (
                      <EmojiFallbackImage
                        category={campaign?.reason || "Uncategorized"}
                        title={campaign?.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <R2Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}

                {/* YouTube Video Thumbnail */}
                {campaignData.videoUrl &&
                  getYouTubeThumbnail(campaignData.videoUrl) && (
                    <button
                      onClick={() => {
                        const videoId = getYouTubeVideoId(
                          campaignData.videoUrl!
                        );
                        if (videoId) {
                          window.open(
                            `https://www.youtube.com/watch?v=${videoId}`,
                            "_blank"
                          );
                        }
                      }}
                      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#104901] transition-all group"
                    >
                      <Image
                        src={getYouTubeThumbnail(campaignData.videoUrl)!}
                        alt="YouTube video"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-all">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#104901" }}
                        >
                          <svg
                            className="w-5 h-5 text-white ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  )}
              </div>
            )}
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("our-story")}
                  className={`flex-1 px-6 py-4 text-base font-medium transition-colors ${
                    activeTab === "our-story"
                      ? "border-b-2 bg-[#F0F9EC]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  style={
                    activeTab === "our-story"
                      ? { color: "#104901", borderBottomColor: "#104901" }
                      : {}
                  }
                >
                  Our Story
                </button>
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`flex-1 px-6 py-4 text-base font-medium transition-colors relative ${
                    activeTab === "updates"
                      ? "border-b-2 bg-[#F0F9EC]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  style={
                    activeTab === "updates"
                      ? { color: "#104901", borderBottomColor: "#104901" }
                      : {}
                  }
                >
                  Updates
                  {updates.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: "#104901" }}
                    >
                      {updates.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`flex-1 px-6 py-4 text-base font-medium transition-colors relative ${
                    activeTab === "documents"
                      ? "border-b-2 bg-[#F0F9EC]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  style={
                    activeTab === "documents"
                      ? { color: "#104901", borderBottomColor: "#104901" }
                      : {}
                  }
                >
                  Documents
                  {campaignDocuments.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: "#104901" }}
                    >
                      {campaignDocuments.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "our-story" && (
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {campaignData.description}
                    </p>
                  </div>
                )}

                {activeTab === "updates" && (
                  <div>
                    {loadingUpdates ? (
                      <div className="text-center py-12">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                          style={{ borderBottomColor: "#104901" }}
                        ></div>
                        <p className="text-gray-600">Loading updates...</p>
                      </div>
                    ) : updates.length > 0 ? (
                      <div className="space-y-4">
                        {updates.map((update) => (
                          <div
                            key={update.id}
                            className="bg-gray-50 rounded-lg p-5 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <h4 className=" text-lg text-gray-900">
                                {update.title}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  update.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {update.content}
                            </p>
                            {!update.isPublic && (
                              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm">
                                <span>🔒</span>
                                <span>Private Update</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {campaign?.canEdit && (
                          <div className="text-center pt-4">
                            <Button
                              onClick={() => setUpdateModalOpen(true)}
                              style={{ backgroundColor: "#104901" }}
                              className="text-white hover:opacity-90"
                            >
                              <PlusSquare className="h-4 w-4 mr-2" />
                              Add Update
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                          No updates available yet.
                        </p>
                        {campaign?.canEdit && (
                          <Button
                            onClick={() => setUpdateModalOpen(true)}
                            style={{ backgroundColor: "#104901" }}
                            className="text-white hover:opacity-90"
                          >
                            <PlusSquare className="h-4 w-4 mr-2" />
                            Add Update
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div>
                    {campaignDocuments.length > 0 ? (
                      <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                          Click on any document to view or download it.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {campaignDocuments.map((doc, index) => (
                            <button
                              key={index}
                              onClick={() => window.open(doc, "_blank")}
                              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#104901] hover:bg-[#F0F9EC] transition-all group"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-6 h-6 text-red-600"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                </svg>
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  Document {index + 1}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Click to view/download
                                </p>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-[#104901]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-600 mb-2">
                          No documents available yet.
                        </p>
                        <p className="text-sm text-gray-500">
                          Documents will appear here when they are uploaded.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column - Donation Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              {/* Raised Amount */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {formatCurrency(raised, campaignData.currency)}
                </div>
                <p className="text-gray-600 text-sm">
                  raised of {formatCurrency(goal, campaignData.currency)} goal
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: "#104901" }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{percent}%</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    style={{ color: "#104901" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="font-medium">
                    {campaignData?.stats?.uniqueDonors}
                  </span>
                  <span className="text-sm text-gray-600">people donated</span>
                </div>
              </div>

              {/* Donor Avatars */}
              {donations && donations.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {donations.slice(0, 3).map((donation, idx) => (
                      <div
                        key={donation.id}
                        className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white  text-sm overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(to bottom right, #104901, #2ea853)",
                        }}
                      >
                        {donation.donorAvatar && !donation.isAnonymous ? (
                          <Image
                            src={donation.donorAvatar}
                            alt={donation.donorName || "Donor"}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span>
                            {donation.isAnonymous
                              ? "A"
                              : donation.donorName?.charAt(0).toUpperCase() ||
                                "D"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {campaignData?.stats?.uniqueDonors} people have donated
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mb-6">
                <Button
                  onClick={() => setDonateModalOpen(true)}
                  disabled={shouldDisableButtons}
                  className="rounded-3xl h-auto py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => {
                    if (!shouldDisableButtons) {
                      e.currentTarget.style.backgroundColor = "#0d3a00";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!shouldDisableButtons) {
                      e.currentTarget.style.backgroundColor = "#104901";
                    }
                  }}
                  title={
                    shouldDisableButtons
                      ? isGoalReached
                        ? "Campaign goal has been reached"
                        : "Campaign is no longer active"
                      : undefined
                  }
                >
                  <ArrowRight />
                  <span>Donate Now</span>
                </Button>
                <Button
                  onClick={() => setShareModalOpen(true)}
                  disabled={shouldDisableButtons}
                  className="rounded-3xl h-auto py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => {
                    if (!shouldDisableButtons) {
                      e.currentTarget.style.backgroundColor = "#F0F9EC";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!shouldDisableButtons) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                  title={
                    shouldDisableButtons
                      ? isGoalReached
                        ? "Campaign goal has been reached"
                        : "Campaign is no longer active"
                      : undefined
                  }
                >
                  <Share2 />
                  <span>Share Campaign</span>
                </Button>
                {shouldDisableButtons && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {isGoalReached
                      ? "Campaign goal has been reached"
                      : "Campaign is no longer active"}
                  </p>
                )}
              </div>

              {/* Organizer Info */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">ORGANIZER</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white  text-lg overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(to bottom right, #104901, #2ea853)",
                    }}
                  >
                    {campaignData.creatorAvatar ? (
                      <Image
                        src={campaignData.creatorAvatar}
                        alt={campaignData.creatorName}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <span>
                        {campaignData.creatorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className=" text-gray-900">{campaignData.creatorName}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>Response time: 1 day</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Donations Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recent Donations
          </h2>
          {loadingDonations ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                  style={{ borderBottomColor: "#104901" }}
                ></div>
                <p className="text-gray-600">Loading donations...</p>
              </div>
            </div>
          ) : donations && donations.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {donations.slice(0, 5).map((donation) => (
                <div
                  key={donation.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white  text-lg overflow-hidden flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(to bottom right, #104901, #2ea853)",
                      }}
                    >
                      {donation.donorAvatar && !donation.isAnonymous ? (
                        <Image
                          src={donation.donorAvatar}
                          alt={donation.donorName || "Donor"}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <span>
                          {donation.isAnonymous
                            ? "A"
                            : donation.donorName?.charAt(0).toUpperCase() ||
                              "D"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <p className=" text-gray-900">
                          {donation.isAnonymous
                            ? "Anonymous"
                            : donation.donorName}
                        </p>
                        <span className="text-sm text-gray-600">
                          donated{" "}
                          <span className="" style={{ color: "#104901" }}>
                            {formatCurrency(
                              parseFloat(donation.amount),
                              donation.currency
                            )}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(donation.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      {donation.message && (
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2">
                          {donation.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">No donations yet</p>
              <p className="text-gray-500 text-sm">
                Be the first to support this campaign!
              </p>
            </div>
          )}
        </div>
      
      </div>
      {/* CTA Section */}
      <CTA />

      {/* Modals */}
      <ChainModal
        open={chainModalOpen}
        onOpenChange={setChainModalOpen}
        campaign={campaign || undefined}
        onChainCreated={fetchChainCount}
      />
      <DonateModal
        open={donateModalOpen}
        onOpenChange={setDonateModalOpen}
        campaign={campaign || undefined}
        referralChainer={referralChainer}
      />
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        campaign={campaign || undefined}
      />
      <UpdateModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        campaignId={campaignId || campaign?.id || ""}
        onUpdateCreated={fetchUpdates}
      />
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        campaignId={campaignId || campaign?.id || ""}
        onCommentCreated={fetchComments}
      />
      <ClientToaster />
    </div>
  );
};

export default Main;
