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

type CareerApplicationFormProps = {
  openingId: string;
  openingTitle: string;
};

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function CareerApplicationForm({
  openingId,
  openingTitle,
}: CareerApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cityState: "",
    linkedInUrl: "",
    portfolioUrl: "",
    coverLetter: "",
    additionalInfo: "",
    consentToContact: true,
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateUrl = (value: string) => {
    if (!value.trim()) return true;
    try {
      const url = new URL(value.trim());
      return ["http:", "https:"].includes(url.protocol);
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    if (!formData.coverLetter.trim()) {
      errors.coverLetter = "Tell us why you are a fit for this role.";
    }
    if (!resumeFile) {
      errors.resumeFile = "Please upload your resume or CV.";
    } else if (resumeFile.size > MAX_RESUME_SIZE) {
      errors.resumeFile = "Resume must be 5MB or less.";
    }
    if (!validateUrl(formData.linkedInUrl)) {
      errors.linkedInUrl = "LinkedIn URL must start with http:// or https://.";
    }
    if (!validateUrl(formData.portfolioUrl)) {
      errors.portfolioUrl =
        "Portfolio URL must start with http:// or https://.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) {
      setStatus("error");
      setErrorMessage("Please fix the highlighted fields.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("email", formData.email.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("cityState", formData.cityState.trim());
      payload.append("linkedInUrl", formData.linkedInUrl.trim());
      payload.append("portfolioUrl", formData.portfolioUrl.trim());
      payload.append("coverLetter", formData.coverLetter.trim());
      payload.append("additionalInfo", formData.additionalInfo.trim());
      payload.append(
        "consentToContact",
        formData.consentToContact ? "yes" : "no"
      );
      if (resumeFile) {
        payload.append("resumeFile", resumeFile);
      }

      const response = await fetch(`/api/careers/${openingId}/applications`, {
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
        cityState: "",
        linkedInUrl: "",
        portfolioUrl: "",
        coverLetter: "",
        additionalInfo: "",
        consentToContact: true,
      });
      setResumeFile(null);
      setFieldErrors({});
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              Full Name
            </label>
            <Input
              required
              value={formData.fullName}
              onChange={(event) => handleChange("fullName", event.target.value)}
            />
            {fieldErrors.fullName && (
              <span className="text-xs text-red-600">{fieldErrors.fullName}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              Email Address
            </label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
            {fieldErrors.email && (
              <span className="text-xs text-red-600">{fieldErrors.email}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              Phone Number
            </label>
            <Input
              required
              value={formData.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
            />
            {fieldErrors.phone && (
              <span className="text-xs text-red-600">{fieldErrors.phone}</span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              City / State
            </label>
            <Input
              value={formData.cityState}
              onChange={(event) =>
                handleChange("cityState", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              LinkedIn URL
            </label>
            <Input
              value={formData.linkedInUrl}
              onChange={(event) =>
                handleChange("linkedInUrl", event.target.value)
              }
              placeholder="https://linkedin.com/in/your-name"
            />
            {fieldErrors.linkedInUrl && (
              <span className="text-xs text-red-600">
                {fieldErrors.linkedInUrl}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1C1917]">
              Portfolio URL
            </label>
            <Input
              value={formData.portfolioUrl}
              onChange={(event) =>
                handleChange("portfolioUrl", event.target.value)
              }
              placeholder="https://yourportfolio.com"
            />
            {fieldErrors.portfolioUrl && (
              <span className="text-xs text-red-600">
                {fieldErrors.portfolioUrl}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Why are you a fit for this role?
          </label>
          <Textarea
            required
            value={formData.coverLetter}
            onChange={(event) =>
              handleChange("coverLetter", event.target.value)
            }
            className="min-h-[180px]"
            placeholder="Share your experience, strengths, and why you want this role."
          />
          {fieldErrors.coverLetter && (
            <span className="text-xs text-red-600">
              {fieldErrors.coverLetter}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Additional Information
          </label>
          <Textarea
            value={formData.additionalInfo}
            onChange={(event) =>
              handleChange("additionalInfo", event.target.value)
            }
            className="min-h-[120px]"
            placeholder="Anything else you want the team to know."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Resume / CV
          </label>
          <Input
            required
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setResumeFile(event.target.files?.[0] || null)
            }
          />
          <div className="text-xs text-[#78716c]">
            PDF, DOC, or DOCX up to 5MB.
          </div>
          {fieldErrors.resumeFile && (
            <span className="text-xs text-red-600">{fieldErrors.resumeFile}</span>
          )}
        </div>

        <label className="flex items-start gap-3 rounded-[20px] border border-[#E7E5E4] bg-[#FDFBF7] px-4 py-3">
          <input
            type="checkbox"
            checked={formData.consentToContact}
            onChange={(event) =>
              handleChange("consentToContact", event.target.checked)
            }
            className="mt-1"
          />
          <span className="text-sm leading-6 text-[#57534E]">
            I agree that ChainFundIt can store my application details and
            contact me about this role.
          </span>
        </label>

        {status === "error" && errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "submitting"}
          className="h-auto rounded-full bg-[#104109] px-8 py-4"
        >
          {status === "submitting" ? "Submitting..." : "Submit Application"}
        </Button>
      </form>

      <Dialog
        open={status === "success"}
        onOpenChange={(open) => {
          if (!open) setStatus("idle");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application submitted</DialogTitle>
            <DialogDescription>
              Your application for {openingTitle} has been received. The team
              will review it and reach out if there&apos;s a fit.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
