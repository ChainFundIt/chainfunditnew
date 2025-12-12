"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OAuthButtons } from "./oauth-buttons";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isPhone, setIsPhone] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
            "Social login failed. Please try again or use email/phone instead.";
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

      const identifier = isPhone ? phone.trim() : email.trim();
      if (!identifier) {
        toast.error(
          isPhone
            ? "Please enter your phone number"
            : "Please enter your email address"
        );
        return;
      }

      setIsLoading(true);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isPhone
              ? { action: "request_phone_otp", phone: identifier }
              : { action: "request_email_otp", email: identifier }
          ),
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
          // Handle rate limiting
          if (res.status === 429) {
            throw new Error(
              "Too many requests. Please wait a minute before trying again."
            );
          }

          let userMessage = data.error;
          if (data.error?.includes("No account found")) {
            userMessage = isPhone
              ? "No account found with this phone number. Please sign up first or try a different number."
              : "No account found with this email. Please sign up first or check your email address.";
          } else if (
            data.error?.includes("WhatsApp OTP service not configured")
          ) {
            userMessage =
              "Phone verification is temporarily unavailable. Please use email instead or contact support.";
          } else if (data.error?.includes("Failed to send")) {
            userMessage = isPhone
              ? "Unable to send verification code to your phone. Please check the number and try again."
              : "Unable to send verification code to your email. Please check your email address and try again.";
          } else if (
            data.error?.includes("Email is required") ||
            data.error?.includes("Phone number is required")
          ) {
            userMessage = isPhone
              ? "Please enter your phone number to continue."
              : "Please enter your email address to continue.";
          }
          throw new Error(
            userMessage || "Unable to send verification code. Please try again."
          );
        }

        // Handle success with method information
        if (data.method === "sms" && data.fallback) {
          toast.success(
            "Verification code sent via SMS! (WhatsApp unavailable)"
          );
        } else if (data.method === "whatsapp") {
          toast.success("Verification code sent! Check your WhatsApp.");
        } else {
          toast.success(
            "Verification code sent! Check your " +
              (isPhone ? "WhatsApp" : "email") +
              "."
          );
        }

        // Store identifier and type for /otp page
        if (isPhone) {
          localStorage.setItem("otp_login_type", "phone");
          localStorage.setItem("otp_login_identifier", identifier);
        } else {
          localStorage.setItem("otp_login_type", "email");
          localStorage.setItem("otp_login_identifier", identifier);
        }

        // Pass redirect param to OTP page
        let otpUrl = "/otp?mode=signin";
        if (redirect) otpUrl += `&redirect=${encodeURIComponent(redirect)}`;

        // Small delay to ensure toast is shown
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
    [isPhone, email, phone, redirect]
  );

  return (
    <form
      className={cn("flex flex-col w-full gap-3", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">
            Log in to your Account.
          </h2>
          <p className="text-xs text-gray-600">
            Welcome back! Select method to log in:
          </p>
        </div>

        <OAuthButtons mode="signin" />

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500 font-medium">or continue with email</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor={isPhone ? "phone" : "email"}
            className="font-medium text-xs text-gray-700"
          >
            {isPhone ? "Phone Number" : "Email Address"}
          </Label>

          {isPhone ? (
            <Input
              id="phone"
              type="tel"
              placeholder="+234 801 234 5678"
              className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              autoComplete="tel"
            />
          ) : (
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-[#109104] focus:ring-[#109104] shadow-none outline-none placeholder:text-gray-400 transition-colors"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          )}
        </div>

        <Button
          type="submit"
          className="h-10 bg-[#104109] hover:bg-white text-white font-semibold text-sm rounded-lg transition-colors w-full"
          disabled={isLoading || !(isPhone ? phone.trim() : email.trim())}
        >
          {isLoading ? "Sending..." : "Log in"}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-600">
        Don't have an account?{" "}
        <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign up
        </Link>
      </div>
    </form>
  );
}