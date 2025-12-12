import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import { Suspense } from "react";

export default function LoginPage() {
  return (
     <div className="w-full flex flex-col md:items-start items-center gap-4 px-4">
      {/* Logo */}
      <div className="mb-2">
        <Image
          src="/images/logo.svg"
          alt="Chainfundit Logo"
          width={40}
          height={40}
          className="md:w-10 md:h-10"
        />
      </div>

      {/* Main Heading */}
      <div className="mb-4 md:text-left text-center">
        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 mb-2">
          Create life-changing-<br></br>experiences on Chainfundit.
        </h1>
      </div>

      {/* Form Section */}
      <Suspense fallback={<div className="w-full text-center py-4 text-gray-500 text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}