import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Smartphone } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { BsApple } from "react-icons/bs";

// Helper for OTP input
function OtpInput({ value, onChange, length = 6, ...props }: { value: string; onChange: (val: string) => void; length?: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, idx) => (
        <Input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl border border-[#D9D9DC] rounded"
          value={value[idx] || ""}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 1) {
              const newValue = value.substring(0, idx) + val + value.substring(idx + 1);
              onChange(newValue.padEnd(length, ""));
            }
          }}
          {...props}
        />
      ))}
    </div>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [step, setStep] = useState<"email" | "email-otp" | "phone" | "phone-otp">("email");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Timer for resend code
  React.useEffect(() => {
    if ((step === "email-otp" || step === "phone-otp") && otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer, step]);

  // Handlers for each step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // TODO: Call Better Auth API to send email OTP
    // await fetch('/api/auth/[...betterauth]', { ... })
    setStep("email-otp");
    setOtpTimer(60);
    setIsLoading(false);
  };

  const handleEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // TODO: Call Better Auth API to verify email OTP
    // If success:
    setStep("phone");
    setIsLoading(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // TODO: Call Better Auth API to send phone OTP
    setStep("phone-otp");
    setOtpTimer(60);
    setIsLoading(false);
  };

  const handlePhoneOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // TODO: Call Better Auth API to verify phone OTP
    // If success: redirect or show success
    setIsLoading(false);
  };

  // UI for each step
  return (
    <form className={cn("flex flex-col gap-6 w-full pt-5", className)} {...props}>
      {step === "email" && (
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email" className="font-normal text-xl text-[#104901]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tolulope.smith@gmail.com"
              className="h-16 bg-white rounded-lg border border-[#D9D9DC] outline-[#104901] placeholder:text-[#767676]"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-16 flex justify-between font-semibold text-2xl" disabled={isLoading} onClick={handleEmailSubmit}>
            Continue with Email
            <ArrowRight />
          </Button>
          <div className="flex gap-3 items-center w-full">
            <div className="w-1/3 border-b border-[#C0BFC4]"></div>
            <span className="relative z-10 px-2 text-black">Or continue with</span>
            <div className="w-1/3 border-b border-[#C0BFC4]"></div>
          </div>
          <div className="flex gap-5">
            <Button className="w-[236px] h-16 bg-[#D9D9DC] border-[#8E8C95] text-[#474553] font-medium text-2xl" type="button">
              <FaGoogle color="#474553" size={32} /> Google
            </Button>
            <Button className="w-[236px] h-16 bg-[#8E8C95] border-[#2C2C2C] font-semibold text-2xl text-[#F5F5F6]" type="button">
              <BsApple size={24} /> Apple
            </Button>
          </div>
        </div>
      )}
      {step === "email-otp" && (
        <div className="grid gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-normal text-2xl text-[#104901]">Enter Code</h2>
            <p className="text-base">Please enter the 6 digit code we sent to:<br /><span className="font-semibold text-[#104901]">{email}</span></p>
            <OtpInput value={emailOtp} onChange={setEmailOtp} length={6} />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" className="px-4" onClick={() => setEmailOtp('')}>Paste code</Button>
              <span className="text-sm text-gray-500">Resend code in {otpTimer}s</span>
            </div>
          </div>
          <Button type="submit" className="w-full h-16 font-semibold text-2xl" disabled={isLoading || emailOtp.length !== 6} onClick={handleEmailOtpSubmit}>Continue <ArrowRight /></Button>
        </div>
      )}
      {step === "phone" && (
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="phone" className="font-normal text-xl text-[#104901]">Link Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+44 0123 456 7890"
              className="h-16 bg-white rounded-lg border border-[#D9D9DC] outline-[#104901] placeholder:text-[#767676]"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-16 flex justify-between font-semibold text-2xl" disabled={isLoading} onClick={handlePhoneSubmit}>
            Continue <ArrowRight />
          </Button>
          <Button type="button" variant="ghost" className="w-full h-16 font-semibold text-2xl" onClick={() => setStep("phone-otp")}>Skip</Button>
        </div>
      )}
      {step === "phone-otp" && (
        <div className="grid gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="font-normal text-2xl text-[#104901]">Enter Code</h2>
            <p className="text-base">Please enter the 6 digit code we sent to:<br /><span className="font-semibold text-[#104901]">{phone || "+44 0123 456 7890"}</span></p>
            <OtpInput value={phoneOtp} onChange={setPhoneOtp} length={6} />
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" className="px-4" onClick={() => setPhoneOtp('')}>Paste code</Button>
              <span className="text-sm text-gray-500">Resend code in {otpTimer}s</span>
            </div>
          </div>
          <Button type="submit" className="w-full h-16 font-semibold text-2xl" disabled={isLoading || phoneOtp.length !== 6} onClick={handlePhoneOtpSubmit}>Continue <ArrowRight /></Button>
        </div>
      )}
      <p className="text-center text-sm font-normal text-[#104901] mt-4">
        By continuing with Google, Apple, Email or Phone number, you agree to
        Chainfundit <span className="font-bold">Terms of Service</span> as well
        as the <span className="font-bold">Privacy Policy</span>.
      </p>
      {error && <p className="text-center text-red-500">{error}</p>}
    </form>
  );
}
