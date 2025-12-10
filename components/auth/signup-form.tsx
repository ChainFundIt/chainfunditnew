"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OAuthButtons } from "./oauth-buttons";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_email_otp",
          email: email.trim()
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unable to connect to our servers. Please check your internet connection and try again.");
      }

      const data = await res.json();
      
      if (!res.ok) {
        // Handle rate limiting
        if (res.status === 429) {
          throw new Error("Too many requests. Please wait a minute before trying again.");
        }
        
        // Map API errors to user-friendly messages
        let userMessage = data.error;
        if (data.error?.includes("Email is required")) {
          userMessage = "Please enter your email address to continue.";
        } else if (data.error?.includes("Failed to send")) {
          userMessage = "Unable to send verification code to your email. Please check your email address and try again.";
        }
        throw new Error(userMessage || "Unable to send verification code. Please try again.");
      }

      toast.success("Verification code sent! Check your email.");
      
      // Use router.push for better performance instead of window.location
      let otpUrl = `/otp?email=${encodeURIComponent(email.trim())}&mode=signup`;
      if (redirect) otpUrl += `&redirect=${encodeURIComponent(redirect)}`;
      
      // Small delay to ensure toast is shown
      setTimeout(() => {
        window.location.href = otpUrl;
      }, 500);
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.error("Request timed out. Please check your internet connection and try again.");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
        
        // Auto-redirect for existing account errors
        if (err.message && err.message.toLowerCase().includes("already exists")) {
          setTimeout(() => {
            window.location.href = "/signin";
          }, 2000);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, redirect]);

  return (
    <form className={cn("flex flex-col w-full gap-3", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">
            Create your Account
          </h2>
          <p className="text-xs text-gray-600">
            Get started in a few minutes
          </p>
        </div>

        <OAuthButtons mode="signup" />

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
            htmlFor="email"
            className="font-medium text-xs text-gray-700"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="h-10 bg-gray-50 rounded-lg border border-gray-300 text-xs focus:border-blue-500 focus:ring-blue-500 outline-none placeholder:text-gray-400 transition-colors"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <Button
          type="submit"
          className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors w-full"
          disabled={isLoading || !email.trim()}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </div>

      <div className="text-center text-xs text-gray-600">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-700">
          Log in
        </Link>
      </div>
    </form>
  );
}