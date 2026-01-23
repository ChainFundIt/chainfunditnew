"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AmbassadorApplicationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    state: "",
    age: "",
    massComms: "Yes",
    createsContent: "Yes",
    handles: "",
    interest: "",
    helpedBefore: "No",
    helpedDescription: "",
    videoLink: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("state", formData.state);
      payload.append("age", formData.age);
      payload.append("massComms", formData.massComms);
      payload.append("createsContent", formData.createsContent);
      payload.append("handles", formData.handles);
      payload.append("interest", formData.interest);
      payload.append("helpedBefore", formData.helpedBefore);
      payload.append("helpedDescription", formData.helpedDescription);
      payload.append("videoLink", formData.videoLink);
      if (cvFile) payload.append("cvFile", cvFile);
      if (videoFile) payload.append("videoFile", videoFile);

      const response = await fetch("/api/ambassadors/applications", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit application");
      }

      setStatus("success");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        state: "",
        age: "",
        massComms: "Yes",
        createsContent: "Yes",
        handles: "",
        interest: "",
        helpedBefore: "No",
        helpedDescription: "",
        videoLink: "",
      });
      setCvFile(null);
      setVideoFile(null);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  return (
    <form
      id="application-form"
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Full Name
          </label>
          <Input
            required
            value={formData.fullName}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
            onChange={(event) => handleChange("fullName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Email Address
          </label>
          <Input
            required
            type="email"
            value={formData.email}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
            onChange={(event) => handleChange("email", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Phone Number
          </label>
          <Input
            required
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            State of Residence
          </label>
          <Input
            required
            value={formData.state}
            onChange={(event) => handleChange("state", event.target.value)}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Age
          </label>
          <Input
            required
            type="number"
            min="16"
            value={formData.age}
            onChange={(event) => handleChange("age", event.target.value)}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Are you a student or graduate of Mass Communication or a related field?
          </label>
          <div className="flex gap-4 text-sm text-[#78716c]">
            {["Yes", "No"].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="massComms"
                  value={value}
                  checked={formData.massComms === value}
                  onChange={(event) =>
                    handleChange("massComms", event.target.value)
                  }
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Do you create content on social media (TikTok, Instagram, YouTube, etc.)?
        </label>
        <div className="flex gap-4 text-sm text-[#78716c]">
          {["Yes", "No"].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="createsContent"
                value={value}
                checked={formData.createsContent === value}
                onChange={(event) =>
                  handleChange("createsContent", event.target.value)
                }
              />
              {value}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          If yes, drop 1-2 handles or links to your content
        </label>
        <Input
          value={formData.handles}
          onChange={(event) => handleChange("handles", event.target.value)}
          className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Why are you interested?
          <span className="text-xs text-[#78716c]">{" "}
            Think of this as your informal cover letter — let your passion and voice shine! 
            This should be a minimum of 200 words, and a maximum word count of 300
          </span>
        </label>
        <Textarea
          required
          rows={5}
          value={formData.interest}
          onChange={(event) => handleChange("interest", event.target.value)}
          className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Have you helped someone tell their story or fundraise before?
        </label>
        <div className="flex gap-4 text-sm text-[#78716c]">
          {["Yes", "No"].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="helpedBefore"
                value={value}
                checked={formData.helpedBefore === value}
                onChange={(event) =>
                  handleChange("helpedBefore", event.target.value)
                }
              />
              {value}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          If yes, briefly describe what you helped with and the impact it had.
          <span className="text-xs text-[#78716c]">{" "}This should be a minimum of 200 words, and a maximum word count of 300</span>
        </label>
        <Textarea
          rows={3}
          value={formData.helpedDescription}
          onChange={(event) =>
            handleChange("helpedDescription", event.target.value)
          }
          className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Upload your CV (.pdf, .doc, .docx only)
            <span className="text-xs text-[#78716c]">{" "}(max size 5MB)</span>
          </label>
          <Input
            type="file"
            required
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setCvFile(event.target.files?.[0] || null)
            }
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Share a short video introducing yourself and why you’d make a great ambassador
          </label>
          <Input
            type="file"
            accept="video/*"
            onChange={(event) =>
              setVideoFile(event.target.files?.[0] || null)
            }
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
          <span className="text-xs text-[#78716c]">{" "}(under 2 minutes, max size 300MB)</span>

        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Or paste a link to your video
          </label>
          <Input
            type="url"
            required
            placeholder="https://..."
            value={formData.videoLink}
            onChange={(event) => handleChange("videoLink", event.target.value)}
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
          />
        </div>
      </div>


      <Dialog
        open={status === "success"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setStatus("idle");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thank you for applying!</DialogTitle>
            <DialogDescription className="text-sm text-[#78716c]">
              We&apos;ve received your ambassador application. Our team reviews
              applications on a rolling basis and will reach out if we need more
              information.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              type="button"
              className="bg-[#104109] px-6 py-2 rounded-full h-auto"
              onClick={() => setStatus("idle")}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {status === "error" && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      <div className="text-sm text-[#78716c]">
        Applications are reviewed on a rolling basis. Early applications are
        encouraged.
      </div>

      <Button
        type="submit"
        className="bg-[#104109] px-8 py-4 rounded-full h-auto"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
}
