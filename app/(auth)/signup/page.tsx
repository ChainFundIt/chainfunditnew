"use client";

import { SignupForm } from "@/components/auth/signup-form";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="h-[calc(100vh-190px)] flex flex-col items-center justify-between px-3">
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="flex flex-col gap-2 items-center justify-center">
          <Image
            src="/images/logo.svg"
            alt="Chainfundit Logo"
            width={64}
            height={62}
            className="md:w-[82px] md:h-[80px]"
          />

          <h2 className="font-semibold text-2xl md:text-4xl text-[#104901] text-center">
            Create life-changing <br /> experiences on Chainfundit
          </h2>
          <p className="font-normal text-base md:text-xl text-[#104901]">
            Please sign up below.
          </p>
        </div>
        <div className="w-full max-w-sm md:max-w-lg">
          <SignupForm />
        </div>
      </div>
      
    </div>
  );
}
