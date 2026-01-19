"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
            Full Name (required)
          </label>
          <Input
            required
            value={formData.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Email Address (required)
          </label>
          <Input
            required
            type="email"
            value={formData.email}
            onChange={(event) => handleChange("email", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Phone Number (required)
          </label>
          <Input
            required
            value={formData.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            State of Residence (required)
          </label>
          <Input
            required
            value={formData.state}
            onChange={(event) => handleChange("state", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Age (required)
          </label>
          <Input
            required
            type="number"
            min="16"
            value={formData.age}
            onChange={(event) => handleChange("age", event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Mass Communication or related field?
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Do you create content on social media?
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          If yes, drop 1-2 handles or links
        </label>
        <Input
          value={formData.handles}
          onChange={(event) => handleChange("handles", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Why are you interested? (3-5 sentences)
        </label>
        <Textarea
          required
          rows={5}
          value={formData.interest}
          onChange={(event) => handleChange("interest", event.target.value)}
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
          If yes, briefly describe
        </label>
        <Textarea
          rows={3}
          value={formData.helpedDescription}
          onChange={(event) =>
            handleChange("helpedDescription", event.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Upload your CV (PDF or DOCX only)
          </label>
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setCvFile(event.target.files?.[0] || null)
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Share a short video (under 2 minutes)
          </label>
          <Input
            type="file"
            accept="video/*"
            onChange={(event) =>
              setVideoFile(event.target.files?.[0] || null)
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Or paste a video link
        </label>
        <Input
          placeholder="https://..."
          value={formData.videoLink}
          onChange={(event) => handleChange("videoLink", event.target.value)}
        />
      </div>

      {status === "success" && (
        <div className="text-sm text-green-700">
          Thanks! Your application has been submitted.
        </div>
      )}

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
