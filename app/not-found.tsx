"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50 px-6">
      <DotLottieReact
        src="https://lottie.host/150eb528-1aad-47fa-938c-2cb6f665c6e7/UIJAlrFpRX.lottie"
        loop
        autoplay
      />
      <Button
        onClick={() => router.back()}
        variant="outline"
      >
        Go Back
      </Button>
    </div>
  );}
