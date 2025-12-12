"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaDiscord } from "react-icons/fa";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface OAuthButtonsProps {
  mode?: "signin" | "signup";
  className?: string;
}

export function OAuthButtons({
  mode = "signin",
  className = "",
}: OAuthButtonsProps) {
  const handleOAuthSignIn = async (provider: "google" | "discord") => {
    try {
      if (provider === "google") {
        await authClient.signIn.social({ provider: "google" });
        return;
      }
      
      // Redirect to BetterAuth OAuth endpoint
      const url = `/api/auth/betterauth?provider=${provider}`;
      window.location.href = url;
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      toast.error(`Unable to sign in with ${provider}. Please try again or use email/phone instead.`);
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="flex gap-2 w-full">
        <Button
          className="flex-1 h-10 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 rounded-lg"
          type="button"
          onClick={() => handleOAuthSignIn("google")}
        >
          <FaGoogle size={16} /> Google
        </Button>

        <Button
          className="flex-1 h-10 bg-white border-2 border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 rounded-lg"
          type="button"
          onClick={() => handleOAuthSignIn("discord")}
        >
          <FaDiscord size={16} /> Discord
        </Button>
      </div>
    </div>
  );
}