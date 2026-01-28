"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Availability = "part-time" | "full-time";
type StartTimeline = "immediately" | "within-2-weeks" | "later";

const countWords = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

export default function PartnershipsApplicationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    cityState: "",
    availability: "",
    startTimeline: "",
    motivation: "",
    targetsComfort: "",
    explainChainfundit: "",
    respondToCharity: "",
    dmToCharity: "",
    messageToFamily: "",
    convincedBefore: "",
    handleRejection: "",
    hoursPerWeek: "",
    hasInternet: "",
    meaningOfDoingGood: "",
    additionalInfo: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const motivationWordCount = countWords(formData.motivation);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    if (!formData.cityState.trim()) errors.cityState = "City & State required.";
    if (!formData.availability) errors.availability = "Select availability.";
    if (!formData.startTimeline) errors.startTimeline = "Select start time.";

    if (motivationWordCount < 200 || motivationWordCount > 300) {
      errors.motivation = "Please write between 200 and 300 words.";
    }

    if (!formData.targetsComfort) {
      errors.targetsComfort = "Please select Yes or No.";
    }
    if (!formData.explainChainfundit.trim()) {
      errors.explainChainfundit = "This field is required.";
    }
    if (!formData.respondToCharity.trim()) {
      errors.respondToCharity = "This field is required.";
    }
    if (!formData.dmToCharity.trim()) {
      errors.dmToCharity = "This field is required.";
    }
    if (!formData.messageToFamily.trim()) {
      errors.messageToFamily = "This field is required.";
    }
    if (!formData.convincedBefore.trim()) {
      errors.convincedBefore = "This field is required.";
    }
    if (!formData.handleRejection.trim()) {
      errors.handleRejection = "This field is required.";
    }
    if (!formData.hoursPerWeek.trim()) {
      errors.hoursPerWeek = "Hours per week is required.";
    }
    if (!formData.hasInternet) {
      errors.hasInternet = "Please select Yes or No.";
    }
    if (!formData.meaningOfDoingGood.trim()) {
      errors.meaningOfDoingGood = "This field is required.";
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
      const response = await fetch("/api/partnerships/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          cityState: formData.cityState.trim(),
          availability: formData.availability as Availability,
          startTimeline: formData.startTimeline as StartTimeline,
          motivation: formData.motivation.trim(),
          targetsComfort: formData.targetsComfort === "yes",
          explainChainfundit: formData.explainChainfundit.trim(),
          respondToCharity: formData.respondToCharity.trim(),
          dmToCharity: formData.dmToCharity.trim(),
          messageToFamily: formData.messageToFamily.trim(),
          convincedBefore: formData.convincedBefore.trim(),
          handleRejection: formData.handleRejection.trim(),
          hoursPerWeek: Number(formData.hoursPerWeek),
          hasInternet: formData.hasInternet === "yes",
          meaningOfDoingGood: formData.meaningOfDoingGood.trim(),
          additionalInfo: formData.additionalInfo.trim(),
        }),
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
        availability: "",
        startTimeline: "",
        motivation: "",
        targetsComfort: "",
        explainChainfundit: "",
        respondToCharity: "",
        dmToCharity: "",
        messageToFamily: "",
        convincedBefore: "",
        handleRejection: "",
        hoursPerWeek: "",
        hasInternet: "",
        meaningOfDoingGood: "",
        additionalInfo: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            Phone Number (WhatsApp-enabled)
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
            City & State (Nigeria)
          </label>
          <Input
            required
            value={formData.cityState}
            onChange={(event) => handleChange("cityState", event.target.value)}
          />
          {fieldErrors.cityState && (
            <span className="text-xs text-red-600">{fieldErrors.cityState}</span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Availability
          </label>
          <Select
            value={formData.availability}
            onValueChange={(value) => handleChange("availability", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.availability && (
            <span className="text-xs text-red-600">
              {fieldErrors.availability}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            When can you start?
          </label>
          <Select
            value={formData.startTimeline}
            onValueChange={(value) => handleChange("startTimeline", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select start timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediately">Immediately</SelectItem>
              <SelectItem value="within-2-weeks">Within 2 weeks</SelectItem>
              <SelectItem value="later">Later</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.startTimeline && (
            <span className="text-xs text-red-600">
              {fieldErrors.startTimeline}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Why do you want to work with ChainFundIt?
          <span className="text-xs text-[#78716c]">
            {" "}
            Minimum 200 words, maximum 300 words
          </span>
        </label>
        <Textarea
          required
          rows={6}
          value={formData.motivation}
          onChange={(event) => handleChange("motivation", event.target.value)}
        />
        <div className="flex items-center justify-between text-xs">
          <span
            className={
              motivationWordCount < 200 || motivationWordCount > 300
                ? "text-red-600"
                : "text-[#78716c]"
            }
          >
            {motivationWordCount} / 300 words
          </span>
          {fieldErrors.motivation && (
            <span className="text-red-600">{fieldErrors.motivation}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          This role involves sales, follow-ups, and targets. How do you feel
          about being measured by monthly onboarding goals?
        </label>
        <Select
          value={formData.targetsComfort}
          onValueChange={(value) => handleChange("targetsComfort", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Yes or No" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
        {fieldErrors.targetsComfort && (
          <span className="text-xs text-red-600">
            {fieldErrors.targetsComfort}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Someone is raising money online by posting their bank account number
          everywhere. How would you explain (politely) why using ChainFundIt
          could help them more?
        </label>
        <Textarea
          required
          rows={4}
          value={formData.explainChainfundit}
          onChange={(event) => handleChange("explainChainfundit", event.target.value)}
        />
        {fieldErrors.explainChainfundit && (
          <span className="text-xs text-red-600">
            {fieldErrors.explainChainfundit}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          A charity says: “We’ve always done it this way. Why should we change?”
          How would you respond?
        </label>
        <Textarea
          required
          rows={4}
          value={formData.respondToCharity}
          onChange={(event) => handleChange("respondToCharity", event.target.value)}
        />
        {fieldErrors.respondToCharity && (
          <span className="text-xs text-red-600">
            {fieldErrors.respondToCharity}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Write a short DM you would send to a charity to introduce ChainFundIt.
        </label>
        <Textarea
          required
          rows={3}
          value={formData.dmToCharity}
          onChange={(event) => handleChange("dmToCharity", event.target.value)}
        />
        {fieldErrors.dmToCharity && (
          <span className="text-xs text-red-600">{fieldErrors.dmToCharity}</span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Write a short message you would send to someone raising money for a
          sick relative online.
        </label>
        <Textarea
          required
          rows={3}
          value={formData.messageToFamily}
          onChange={(event) => handleChange("messageToFamily", event.target.value)}
        />
        {fieldErrors.messageToFamily && (
          <span className="text-xs text-red-600">
            {fieldErrors.messageToFamily}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Have you ever convinced someone to try something new? What did you do?
        </label>
        <Textarea
          required
          rows={4}
          value={formData.convincedBefore}
          onChange={(event) => handleChange("convincedBefore", event.target.value)}
        />
        {fieldErrors.convincedBefore && (
          <span className="text-xs text-red-600">
            {fieldErrors.convincedBefore}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          How do you handle rejection or being ignored after reaching out to someone?
        </label>
        <Textarea
          required
          rows={4}
          value={formData.handleRejection}
          onChange={(event) => handleChange("handleRejection", event.target.value)}
        />
        {fieldErrors.handleRejection && (
          <span className="text-xs text-red-600">
            {fieldErrors.handleRejection}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            How many hours per week can you commit?
          </label>
          <Input
            required
            type="number"
            min="1"
            value={formData.hoursPerWeek}
            onChange={(event) => handleChange("hoursPerWeek", event.target.value)}
          />
          {fieldErrors.hoursPerWeek && (
            <span className="text-xs text-red-600">
              {fieldErrors.hoursPerWeek}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1C1917]">
            Do you have reliable access to internet and a smartphone/laptop?
          </label>
          <Select
            value={formData.hasInternet}
            onValueChange={(value) => handleChange("hasInternet", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Yes or No" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
          {fieldErrors.hasInternet && (
            <span className="text-xs text-red-600">{fieldErrors.hasInternet}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          What does “doing good” mean to you personally?
        </label>
        <Textarea
          required
          rows={3}
          value={formData.meaningOfDoingGood}
          onChange={(event) => handleChange("meaningOfDoingGood", event.target.value)}
        />
        {fieldErrors.meaningOfDoingGood && (
          <span className="text-xs text-red-600">
            {fieldErrors.meaningOfDoingGood}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-[#1C1917]">
          Anything else you'd like us to know? (Optional)
        </label>
        <Textarea
          rows={3}
          value={formData.additionalInfo}
          onChange={(event) => handleChange("additionalInfo", event.target.value)}
        />
      </div>

      <Dialog
        open={status === "success"}
        onOpenChange={(isOpen) => {
          if (!isOpen) setStatus("idle");
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Application submitted</DialogTitle>
            <DialogDescription className="text-sm text-[#78716c]">
              Thanks for applying. Our team reviews applications on a rolling
              basis and will reach out with next steps.
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

      {status === "error" && errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

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
