"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Handle error parameters from URL (e.g., OAuth failures)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      let errorMessage = "";
      switch (errorParam) {
        case "oauth_failed":
          errorMessage =
            "Social login failed. Please try again or use email instead.";
          break;
        case "invalid_callback":
          errorMessage = "Login session expired. Please try signing in again.";
          break;
        default:
          errorMessage = "Something went wrong. Please try again.";
      }
      toast.error(errorMessage);
    }
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const identifier = email.trim();
      if (!identifier) {
        toast.error("Please enter your email address");
        return;
      }

      setIsLoading(true);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "request_email_otp", email: identifier }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            "Unable to connect to our servers. Please check your internet connection and try again."
          );
        }

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(
              "Too many requests. Please wait a minute before trying again."
            );
          }

          let userMessage = data.error;
          if (data.error?.includes("No account found")) {
            userMessage =
              "No account found with this email. Please sign up first or check your email address.";
          } else if (data.error?.includes("Failed to send")) {
            userMessage =
              "Unable to send verification code to your email. Please check your email address and try again.";
          } else if (data.error?.includes("Email is required")) {
            userMessage = "Please enter your email address to continue.";
          }
          throw new Error(
            userMessage || "Unable to send verification code. Please try again."
          );
        }

        toast.success("Verification code sent! Check your email.");

        localStorage.setItem("otp_login_type", "email");
        localStorage.setItem("otp_login_identifier", identifier);

        let otpUrl = "/otp?mode=signin";
        if (redirect) otpUrl += `&redirect=${encodeURIComponent(redirect)}`;

        setTimeout(() => {
          window.location.href = otpUrl;
        }, 500);
      } catch (err: any) {
        if (err.name === "AbortError") {
          toast.error(
            "Request timed out. Please check your internet connection and try again."
          );
        } else {
          toast.error(err.message || "Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [email, redirect]
  );

  return (
    <form
      className={cn("flex flex-col w-full gap-3", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col gap-3 md:text-left text-center">
        <div>
          <h2 className="font-jakarta text-lg font-bold tracking-tight text-[#104109] mb-0.5">
            Log in to your Account.
          </h2>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="email"
            className="font-jakarta font-medium text-[14px] leading-[20px] text-[#57534E]"
          >
            Email Address
          </Label>

          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-11 bg-[#F7F6F5] rounded-lg border border-[#E7E5E4] font-jakarta text-[14px] leading-[20px] md:text-[14px] text-[#1C1917] focus:border-[#104109] focus:ring-[#104109] shadow-none outline-none placeholder:text-[#A8A29E] transition-colors"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          className="h-11 bg-[#064E3B] hover:bg-[#05382C] text-white hover:text-white font-jakarta font-bold text-[14px] leading-[20px] rounded-full transition-colors w-full"
        >
          {isLoading ? "Sending..." : "Log in"}
        </Button>
      </div>

      <div className="text-center font-jakarta text-[14px] leading-[20px] text-[#57534E]">
        Don't have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#104109] hover:text-[#064E3B]">
          Sign up
        </Link>
      </div>
    </form>
  );
}
