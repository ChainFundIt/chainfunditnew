"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Airplay,
  AlertTriangle,
  Ambulance,
  BookOpen,
  Briefcase,
  Cat,
  Camera,
  Check,
  ChevronsRight,
  DollarSign,
  Euro,
  Feather,
  Flag,
  Frown,
  Gift,
  Globe,
  HeartHandshake,
  Loader,
  Lock,
  MinusCircle,
  Paperclip,
  PenTool,
  Plus,
  PlusSquare,
  PoundSterling,
  Target,
  User,
  UserPlus,
  Users,
  XCircle,
  Youtube,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink,
  HelpCircle,
  Upload as UploadIcon,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ClientToaster from "@/components/ui/client-toaster";
import { Switch } from "@/components/ui/switch";
import { useShortenLink } from "@/hooks/use-shorten-link";
import { useFileUpload } from "@/hooks/use-upload";

const reasons = [
  { text: "Business", icon: <Briefcase /> },
  { text: "Charity", icon: <Gift /> },
  { text: "Community", icon: <Users /> },
  { text: "Creative", icon: <Feather /> },
  { text: "Education", icon: <BookOpen /> },
  { text: "Emergency", icon: <Activity /> },
  { text: "Religion", icon: <Plus /> },
  { text: "Family", icon: <HeartHandshake /> },
  { text: "Medical", icon: <PlusSquare /> },
  { text: "Memorial", icon: <Frown /> },
  { text: "Pets", icon: <Cat /> },
  { text: "Sports", icon: <Flag /> },
  { text: "Uncategorized", icon: <AlertTriangle /> },
  { text: "Welfare", icon: <Ambulance /> },
];

const persons = [
  { text: "Yourself", icon: <User /> },
  { text: "Someone else", icon: <UserPlus /> },
  { text: "Charity", icon: <Gift /> },
];

const currencies = [
  { code: "GBP", text: "British Pound", icon: <PoundSterling /> },
  { code: "USD", text: "US Dollar", icon: <DollarSign /> },
  { code: "NGN", text: "Nigerian Naira", icon: "₦" },
  { code: "EUR", text: "Euro", icon: <Euro /> },
  { code: "CAD", text: "Canadian Dollar", icon: "C$" },
];

const duration = [
  { text: "Not applicable", icon: <MinusCircle /> },
  { text: "2 weeks" },
  { text: "1 month" },
  { text: "2 months" },
  { text: "3 months" },
  { text: "6 months" },
  { text: "1 year" },
];

type CampaignFormData = {
  title: string;
  subtitle: string;
  visibility: "public" | "private";
  reason: string;
  fundraisingFor: string;
  currency: string;
  goal: number;
  duration: string;
  video: string;
  story: string;
  isChained: boolean;
  chainerCommissionRate: number;
};

const tabs = ["S", "M", "L"];
const steps = [
  { number: 1, title: "Details", label: "Details" },
  { number: 2, title: "Goal", label: "Goal" },
  { number: 3, title: "Media", label: "Media" },
  { number: 4, title: "Review", label: "Review" },
];

export default function CreateCampaignPage() {
  const [aiInstruction, setAiInstruction] = useState("");
  const [step, setStep] = useState(1);
  const { shortenLink } = useShortenLink();
  const { uploadFile } = useFileUpload();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showChainInfoModal, setShowChainInfoModal] = useState(false);
  const [createdCampaign, setCreatedCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("S");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    subtitle: "",
    visibility: "public",
    reason: "",
    fundraisingFor: "",
    currency: "",
    goal: 0,
    duration: "",
    video: "",
    story: "",
    isChained: false,
    chainerCommissionRate: 0,
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    coverImageUrl: "",
    imageUrls: [] as string[],
    documentUrls: [] as string[],
  });

  const handleCoverImageUpload = (url: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      coverImageUrl: url,
    }));
  };

  const handleImageFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await uploadFile(file, "imageUpload");
        if (result && result.url) {
          setUploadedFiles((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, result.url],
          }));
        }
      } catch (error) {}
    }
  };

  const handleDocumentFileSelect = async (files: FileList | null) => {
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const result = await uploadFile(file, "documentUpload");
        if (result && result.url) {
          setUploadedFiles((prev) => ({
            ...prev,
            documentUrls: [...prev.documentUrls, result.url],
          }));
        }
      } catch (error) {}
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveDocument = (index: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      documentUrls: prev.documentUrls.filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (field: keyof CampaignFormData, value: any) => {
    if (field === "currency") {
      setFormData((prev) => ({ ...prev, currency: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const generateAiSuggestion = async () => {
    const prompt = aiInstruction.trim();
    const length =
      activeTab === "S" ? "short" : activeTab === "M" ? "medium" : "long";

    if (!prompt) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, length }),
      });

      const data = await res.json();
      const story =
        data.choices?.[0]?.message?.content ?? "No suggestion generated.";
      setAiInstruction(story);
    } catch (error) {
      setAiInstruction("Error generating suggestion. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("subtitle", formData.subtitle || "");
      payload.append("description", formData.story);
      payload.append("reason", formData.reason);
      payload.append("fundraisingFor", formData.fundraisingFor);
      payload.append("duration", formData.duration || "");
      payload.append("videoUrl", formData.video || "");
      payload.append("goalAmount", formData.goal.toString());
      payload.append("currency", formData.currency);
      payload.append("minimumDonation", "1");
      payload.append(
        "chainerCommissionRate",
        formData.chainerCommissionRate.toString()
      );
      payload.append("isChained", formData.isChained.toString());
      payload.append("visibility", formData.visibility);

      if (uploadedFiles.coverImageUrl) {
        payload.append("coverImageUrl", uploadedFiles.coverImageUrl);
      } else if (uploadedFiles.imageUrls.length > 0) {
        payload.append("coverImageUrl", uploadedFiles.imageUrls[0]);
      }

      if (uploadedFiles.imageUrls.length > 0) {
        payload.append(
          "galleryImages",
          JSON.stringify(uploadedFiles.imageUrls)
        );
      }

      if (uploadedFiles.documentUrls.length > 0) {
        payload.append("documents", JSON.stringify(uploadedFiles.documentUrls));
      }

      const res = await fetch("/api/campaigns", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create campaign");
      }
      const campaignUrl = `${window.location.origin}/campaign/${data.data.slug}`;
      let shortUrl = null;
      try {
        shortUrl = await shortenLink(campaignUrl);
      } catch (e) {
        shortUrl = null;
      }
      setCreatedCampaign({
        ...data.data,
        shortUrl: shortUrl || campaignUrl,
      });
      setShowSuccessModal(true);
    } catch (err) {
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFinalStep = step === 4;
  const nextStep = () => {
    if (isFinalStep) {
      handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleAiDone = () => {
    setFormData((prev) => ({ ...prev, story: aiInstruction }));
    setShowAiModal(false);
  };

  const handleViewCampaign = () => {
    if (createdCampaign?.id) {
      router.push(`/campaign/${createdCampaign.slug}`);
    }
  };

  const handleShareCampaign = (platform: string) => {
    const campaignUrl =
      createdCampaign?.shortUrl || `chainfund.it/${createdCampaign?.slug}`;
    const shareText = `Check out my campaign: ${formData.title}`;

    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          campaignUrl
        )}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(campaignUrl)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          campaignUrl
        )}`;
        break;
      case "instagram":
        navigator.clipboard.writeText(`${shareText} ${campaignUrl}`);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  const SideBar = () => {
    return (
      <div className="md:w-[20rem] flex md:flex-col flex-row md:gap-4 justify-between p-8 bg-white rounded-2xl h-fit shadow-sm overflow-x-auto scrollbar-hide">
        {steps.map((s) => (
          <div
            key={s.number}
            className="flex flex-col md:flex-row items-center gap-3"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                step >= s.number
                  ? "bg-[#104109] text-white"
                  : "bg-[#E5ECDE] text-[#5F8555]"
              }`}
            >
              {step > s.number ? <Check size={20} /> : s.number}
            </div>
            <div>
              <p className="text-sm font-medium text-[#999]">Step {s.number}</p>
              <p
                className={`font-semibold ${
                  step === s.number ? "text-[#104109]" : "text-[#ADADAD]"
                }`}
              >
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const StepOne = () => {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-[#104109]">Campaign Details</h2>

        {/* Campaign Title */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Campaign Title
          </label>
          <input
            type="text"
            placeholder="e.g. Clean Water for Village"
            value={formData.title}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5ECDE] rounded-lg text-[#104109] placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#104109]"
          />
        </div>

        {/* Subtitle */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-semibold text-[#104109] mb-2">
            Subtitle (Optional)
          </label>
          <input
            type="text"
            placeholder="Add a catchy, emotional hook"
            value={formData.subtitle}
            onChange={(e) => handleFieldChange("subtitle", e.target.value)}
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5ECDE] rounded-lg text-[#104109] placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#104109]"
          />
          <p className="text-sm text-[#5F8555]">
            A catchy hook to attract donors (150 characters max)
          </p>
        </div>

        {/* Visibility */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Visibility
          </label>
          <Select
            value={formData.visibility}
            onValueChange={(value) =>
              handleFieldChange("visibility", value as "public" | "private")
            }
          >
            <SelectTrigger className="w-full bg-[#F5F5F5] border-0 text-[#5F8555] h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#F5F5F5]">
              <SelectGroup>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe size={18} />
                    Public
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock size={18} />
                    Private
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reasons.map((reason) => (
              <button
                key={reason.text}
                type="button"
                onClick={() => handleFieldChange("reason", reason.text)}
                className={`px-4 py-3 flex gap-2 items-center rounded-lg transition-all ${
                  formData.reason === reason.text
                    ? "bg-[#104109] text-white"
                    : "bg-[#F5F5F5] text-[#5F8555] hover:bg-[#D9D9D9]"
                }`}
              >
                {reason.icon}
                <span className="text-sm">{reason.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fundraising For */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Who are you fundraising for? <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {persons.map((person) => (
              <button
                key={person.text}
                type="button"
                onClick={() => handleFieldChange("fundraisingFor", person.text)}
                className={`px-4 py-3 flex gap-2 items-center rounded-lg transition-all ${
                  formData.fundraisingFor === person.text
                    ? "bg-[#104109] text-white"
                    : "bg-[#F5F5F5] text-[#5F8555] hover:bg-[#D9D9D9]"
                }`}
              >
                {person.icon}
                <span className="text-sm">{person.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const StepTwo = () => {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-[#104109]">Set Your Goal</h2>

        {/* Currency & Goal Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-lg font-semibold text-[#104109]">
              Currency
            </label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleFieldChange("currency", value)}
            >
              <SelectTrigger className="w-full bg-[#F5F5F5] border-0 text-[#5F8555] h-12">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-[#F5F5F5]">
                <SelectGroup>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2 p-0">
                        {typeof currency.icon === "string"
                          ? currency.icon
                          : currency.icon}{" "}
                        {currency.text}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-lg font-semibold text-[#104109]">
              Goal Amount
            </label>
            <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-4 py-3">
              <span className="text-[#5F8555] font-semibold text-lg">
                {
                  {
                    GBP: "£",
                    USD: "$",
                    NGN: "₦",
                    EUR: "€",
                    CAD: "C$",
                  }[formData.currency]
                }
              </span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="10000"
                value={formData.goal === 0 ? "" : formData.goal}
                onChange={(e) =>
                  handleFieldChange(
                    "goal",
                    e.target.value === "" ? 0 : +e.target.value
                  )
                }
                className="w-full bg-transparent font-medium text-lg text-[#5F8555] placeholder:text-[#5F8555] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Campaign Duration
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {duration.map((time) => (
              <button
                key={time.text}
                type="button"
                onClick={() => handleFieldChange("duration", time.text)}
                className={`px-3 py-3 flex gap-2 items-center justify-center rounded-lg transition-all text-sm ${
                  formData.duration === time.text
                    ? "bg-[#104109] text-white"
                    : "bg-[#F5F5F5] text-[#5F8555] hover:bg-[#D9D9D9]"
                }`}
              >
                {time.icon}
                <span>{time.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chained Campaign */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label className="text-lg font-semibold text-[#104109]">
              Do you want your campaign to be chained?
            </label>
            <button
              type="button"
              onClick={() => setShowChainInfoModal(true)}
              className="text-[#5F8555] hover:text-[#104109] transition-colors"
              aria-label="Learn more about chained campaigns"
            >
              <HelpCircle size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isChained}
              onCheckedChange={() =>
                handleFieldChange("isChained", !formData.isChained)
              }
            />
            <span className="text-[#5F8555]">
              Yes, I want my campaign to be chained
            </span>
          </div>
        </div>

        {/* Commission Rate */}
        {formData.isChained && (
          <div className="flex flex-col gap-3">
            <label className="text-lg font-semibold text-[#104109]">
              Ambassador Commission Rate (%)
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={formData.chainerCommissionRate}
              onChange={(e) =>
                handleFieldChange("chainerCommissionRate", +e.target.value)
              }
              className="w-full md:w-64 px-4 py-3 rounded-lg bg-[#F5F5F5] font-medium text-lg text-[#5F8555] placeholder:text-[#5F8555] focus:outline-none focus:ring-2 focus:ring-[#5F8555]"
            />
          </div>
        )}
      </div>
    );
  };

  const StepThree = () => {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-[#104109]">Campaign Media</h2>

        {/* Cover Image */}
        <div className="flex flex-col gap-3">
          <label className="text-lg font-semibold text-[#104109]">
            Cover Image
          </label>
          <div className="relative bg-[#F5F5F5] rounded-2xl border-2 border-dashed border-[#E5ECDE] overflow-hidden">
            {uploadedFiles.coverImageUrl ? (
              <div className="relative w-full h-64">
                <Image
                  src={uploadedFiles.coverImageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleCoverImageUpload("")}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors z-10"
                >
                  <XCircle size={20} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadFile(e.target.files[0], "imageUpload").then(
                        (result) => {
                          if (result?.url) {
                            handleCoverImageUpload(result.url);
                          }
                        }
                      );
                    }
                  }}
                  className="hidden"
                  id="cover-image-input"
                />
                <label
                  htmlFor="cover-image-input"
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-100 text-[#104109] px-6 py-2 rounded-lg font-semibold cursor-pointer transition-colors shadow-lg"
                >
                  Choose New
                </label>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#E5ECDE] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadFile(e.target.files[0], "imageUpload").then(
                        (result) => {
                          if (result?.url) {
                            handleCoverImageUpload(result.url);
                          }
                        }
                      );
                    }
                  }}
                  className="hidden"
                  id="cover-image-input"
                />
                <label
                  htmlFor="cover-image-input"
                  className="flex flex-col items-center gap-4 cursor-pointer"
                >
                  <div className="bg-[#E5ECDE] p-4 rounded-full">
                    <UploadIcon
                      size={32}
                      className="text-[#5F8555] font-bold stroke-[3]"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[#104109]">
                      Upload Cover Image
                    </p>
                    <p className="text-sm text-[#999]">
                      Drag and drop your image here, or click to browse
                    </p>
                    <p className="text-xs text-[#B3B3B3] mt-1">
                      Recommended size: 1200x400px
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-semibold text-[#104109] mb-2">
            Cover Video (Optional)
          </label>

          <div className="flex items-center gap-3 mb-2">
            <Youtube color="#5F8555" size={24} />
            <span className="font-semibold text-[#5F8555]">
              YouTube or Video Link
            </span>
          </div>
          <input
            type="text"
            placeholder="Paste video link from YouTube or other sources"
            value={formData.video}
            onChange={(e) => handleFieldChange("video", e.target.value)}
            className="w-full px-4 py-3 bg-[#F5F5F5] border border-[#E5ECDE] rounded-lg text-[#104109] placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#104109]"
          />
        </div>

        {/* Gallery Images */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-semibold text-[#104109]">
            Gallery Images
          </label>
          <p className="text-sm text-[#5F8555]">
            Add up to 5 images (PNG, JPG, WEBP - max 1MB each)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="campaign-images"
              onChange={(e) => handleImageFileSelect(e.target.files)}
            />

            <label
              htmlFor="campaign-images"
              className="bg-[#F5F5F5] flex flex-col gap-3 items-center justify-center px-8 py-12 rounded-xl text-[#5F8555] cursor-pointer hover:bg-[#D9D9D9] transition-colors border-2 border-dashed border-[#5F8555]"
            >
              <ImageIcon size={40} />
              <span className="text-center font-medium">
                Click to upload images
              </span>
            </label>

            {uploadedFiles.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative bg-[#F5F5F5] rounded-xl overflow-hidden flex items-center justify-center group"
              >
                <Image
                  src={url}
                  alt={`preview-${index}`}
                  width={200}
                  height={150}
                  className="object-cover w-full h-40"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all"
                >
                  <XCircle
                    size={32}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="flex flex-col gap-1">
          <label className="text-lg font-semibold text-[#104109]">
            Supporting Documents
          </label>
          <p className="text-sm text-[#5F8555]">
            Add supporting documents (PDF, DOC, DOCX - max 10MB total)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              className="hidden"
              id="supporting-documents"
              onChange={(e) => handleDocumentFileSelect(e.target.files)}
            />

            <label
              htmlFor="supporting-documents"
              className="bg-[#F5F5F5] flex flex-col gap-3 items-center justify-center px-8 py-12 rounded-xl text-[#5F8555] cursor-pointer hover:bg-[#D9D9D9] transition-colors border-2 border-dashed border-[#5F8555]"
            >
              <Paperclip size={40} />
              <span className="text-center font-medium">
                Click to upload documents
              </span>
            </label>

            {uploadedFiles.documentUrls.map((url, index) => {
              const filename = url.split("/").pop() || `document-${index}`;
              return (
                <div
                  key={index}
                  className="relative bg-[#F5F5F5] px-4 py-4 rounded-xl flex items-center gap-3 text-[#5F8555] group hover:bg-[#D9D9D9] transition-colors"
                >
                  <Paperclip size={20} className="flex-shrink-0" />
                  <span className="text-sm truncate flex-1">
                    {filename.length > 25
                      ? filename.slice(0, 25) + "..."
                      : filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="text-red-600 hover:text-red-700 flex-shrink-0"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const StepFour = () => {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-[#104109]">Review & Launch</h2>

        {/* Campaign Preview */}
        <div className="bg-[#F5F5F5] rounded-xl overflow-hidden">
          {uploadedFiles.coverImageUrl && (
            <div className="relative w-full h-64 mb-4">
              <Image
                src={uploadedFiles.coverImageUrl}
                alt="Campaign cover"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-[#104109] mb-2">
              {formData.title || "Untitled Campaign"}
            </h3>
            <p className="text-sm text-[#5F8555] mb-4 uppercase tracking-wide">
              {formData.reason || "UNCATEGORIZED"}
            </p>
            <p className="text-[#5F8555]">
              {formData.story || "No description provided."}
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div>
          <label className="text-lg font-semibold text-[#104109] mb-3 block">
            Campaign Story
          </label>
          <div className="bg-[#E5ECDE] rounded-xl overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <PenTool
                  size={24}
                  className="text-[#5F8555] rotate-180 flex-shrink-0 mt-1"
                />
                <textarea
                  placeholder="Tell the world what your campaign is about..."
                  value={formData.story}
                  onChange={(e) => handleFieldChange("story", e.target.value)}
                  className="w-full bg-transparent text-[#5F8555] placeholder:text-[#5F8555] focus:outline-none resize-none min-h-40"
                />
              </div>
              <div className="text-sm text-[#5F8555] px-4">
                Tell the world what your campaign is about and why they should
                support you.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="w-full bg-[#5F8555] py-3 px-4 flex gap-2 items-center justify-center font-semibold text-white hover:bg-[#3f5f3d] transition-colors"
            >
              <Airplay size={20} />
              Suggest with AI
            </button>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#E5ECDE] rounded-xl p-6">
          <div>
            <p className="text-sm text-[#5F8555]">Currency</p>
            <p className="text-xl font-bold text-[#104109]">
              {formData.currency || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#5F8555]">Goal</p>
            <p className="text-xl font-bold text-[#104109]">
              {formData.goal || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#5F8555]">Duration</p>
            <p className="text-xl font-bold text-[#104109]">
              {formData.duration || "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#5F8555]">Visibility</p>
            <p className="text-xl font-bold text-[#104109] capitalize">
              {formData.visibility}
            </p>
          </div>
        </div>

        {/* AI Modal */}
        {showAiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg space-y-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start">
                <div className="flex gap-2 items-start">
                  <Loader size={32} color="#5F8555" />
                  <div>
                    <h2 className="text-2xl font-semibold text-[#104109]">
                      Suggest Description
                    </h2>
                    <p className="text-[#5F8555]">
                      Generate a description for your campaign with AI
                    </p>
                  </div>
                </div>
                <button
                  className="text-[#5F8555] hover:text-[#104109]"
                  onClick={() => setShowAiModal(false)}
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-[#104109] font-semibold">Length</label>
                <div className="flex gap-2 bg-[#E5ECDE] w-fit p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                        activeTab === tab
                          ? "bg-[#104109] text-white"
                          : "bg-transparent text-[#5F8555] hover:bg-[#D9D9D9]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[#104109] font-semibold block">
                  Additional Instructions
                </label>
                <textarea
                  className="w-full bg-[#F5F5F5] rounded-lg border border-[#E5ECDE] p-4 text-[#5F8555] placeholder:text-[#B3B3B3] focus:outline-none focus:ring-2 focus:ring-[#5F8555]"
                  rows={4}
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="Share your story, goals, and what makes your campaign unique..."
                />
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  className="flex-1 bg-[#104109] hover:bg-[#0a3a01] text-white font-semibold py-2 h-12 text-lg"
                  onClick={generateAiSuggestion}
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate"}
                  {!isLoading && <ChevronsRight className="ml-2" size={20} />}
                </Button>
                {aiInstruction && (
                  <Button
                    onClick={handleAiDone}
                    className="flex-1 bg-[#5F8555] hover:bg-[#3f5f3d] text-white font-semibold py-2 h-12 text-lg"
                  >
                    Done <Check className="ml-2" size={20} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="font-jakarta p-8 bg-[#F0F7EF] flex flex-col gap-8 md:min-h-[calc(100vh-122px)]">
      {/* Header */}
      <div className="flex gap-2">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((prev) => prev - 1)}
            className="hover:bg-transparent"
          >
            <ArrowLeft size={24} color="#104109" />
          </Button>
        ) : (
          <div />
        )}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold text-[#104109]">
              Create Campaign
            </div>
            <div className="text-[#6B7280] text-sm font-medium">
              Launch a new fundraising initiative in 4 simple steps.
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-8 md:flex-row flex-col">
        {/* Sidebar - Steps */}
        <SideBar />

        {/* Main Body */}
        <div className="flex-1">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {/* Step 1: Details */}
            {step === 1 && <StepOne />}
            {/* Step 2: Goal */}
            {step === 2 && <StepTwo />}
            {/* Step 3: Media */}
            {step === 3 && <StepThree />}
            {/* Step 4: Review & Launch */}
            {step === 4 && <StepFour />}
            {/* Navigation */}
            <div className="flex justify-end items-center">
              <Button
                type="button"
                onClick={nextStep}
                disabled={isLoading}
                className="bg-[#104109] px-8 py-2 rounded-full h-auto font-bold text-lg leading-7 border-none"
              >
                {isFinalStep ? "Launch Campaign" : "Next Step"}
                <ArrowRight size={20} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-[#104109] mb-2">
                  Campaign Created Successfully! 🎉
                </h2>
                <p className="text-[#5F8555]">
                  Your fundraising campaign is live. Share it to start receiving
                  donations.
                </p>
              </div>
              <button onClick={() => setShowSuccessModal(false)}>
                <XCircle className="text-[#5F8555]" size={24} />
              </button>
            </div>

            {/* Campaign Link */}
            <div
              className="bg-[#104109] p-4 flex items-center justify-between text-white rounded-lg cursor-pointer hover:bg-[#0a3a01] transition-colors"
              onClick={handleViewCampaign}
            >
              <span className="font-medium truncate">
                {createdCampaign.shortUrl ||
                  `chainfund.it/${createdCampaign.slug}`}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold">VIEW</span>
                <ExternalLink size={20} />
              </div>
            </div>

            {/* Share Section */}
            <div className="space-y-3">
              <p className="text-lg font-semibold text-[#104109]">
                Share Your Campaign
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleShareCampaign("facebook")}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-[#E5ECDE] text-[#104109] hover:bg-[#104109] hover:text-white transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook size={28} />
                </button>
                <button
                  onClick={() => handleShareCampaign("instagram")}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-[#E5ECDE] text-[#104109] hover:bg-[#104109] hover:text-white transition-colors"
                  title="Share on Instagram"
                >
                  <Instagram size={28} />
                </button>
                <button
                  onClick={() => handleShareCampaign("twitter")}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-[#E5ECDE] text-[#104109] hover:bg-[#104109] hover:text-white transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter size={28} />
                </button>
                <button
                  onClick={() => handleShareCampaign("linkedin")}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-[#E5ECDE] text-[#104109] hover:bg-[#104109] hover:text-white transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={28} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chain Info Modal */}
      {showChainInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <HelpCircle
                  size={28}
                  className="text-[#5F8555] flex-shrink-0"
                />
                <h2 className="text-2xl font-semibold text-[#104109]">
                  About Chained Campaigns
                </h2>
              </div>
              <button
                className="text-[#5F8555] hover:text-[#104109]"
                onClick={() => setShowChainInfoModal(false)}
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-[#5F8555] leading-relaxed">
              Having your campaign chained means you can allow others, who may
              be interested in earning a commission to help promote your
              campaign, potentially increasing donations. The ambassador
              commission rate must be a valid percentage between 0% and 10% of
              campaign proceeds.
            </p>
          </div>
        </div>
      )}

      <ClientToaster />
    </div>
  );
}
