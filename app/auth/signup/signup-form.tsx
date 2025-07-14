import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Smartphone } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { BsApple } from "react-icons/bs";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isPhone, setIsPhone] = useState(false);

  return (
    <form
      className={cn("flex flex-col gap-6 w-full pt-5", className)}
      {...props}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <section className="flex justify-between items-center">
            <Label
              htmlFor={isPhone ? "phone" : "email"}
              className="font-normal text-xl text-[#104901]"
            >
              {isPhone ? "Phone Number" : "Email"}
            </Label>
            <section className="flex gap-3 items-center cursor-pointer select-none" onClick={() => setIsPhone((prev) => !prev)}>
              <Smartphone />
              <p className="font-normal text-xl text-[#104901]">
                {isPhone ? "Use Email" : "Use Phone Number"}
              </p>
            </section>
          </section>
          <Input
            id={isPhone ? "phone" : "email"}
            type={isPhone ? "tel" : "email"}
            placeholder={isPhone ? "+44 0123 456 7890" : "tolulope.smith@gmail.com"}
            className="h-16 bg-white rounded-lg border border-[#D9D9DC] outline-[#104901] placeholder:text-[#767676]"
            required
            pattern={isPhone ? "[+]?\d{1,3}[\s-]?\d{1,14}(?:x.+)?" : undefined}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-16 flex justify-between font-semibold text-2xl"
        >
          Continue with Email
          <ArrowRight />
        </Button>
        <div className="flex gap-3 items-center w-full">
          <div className="w-1/3 border-b border-[#C0BFC4]"></div>
          <span className="relative z-10 px-2 text-black">
            Or continue with
          </span>
          <div className="w-1/3 border-b border-[#C0BFC4]"></div>
        </div>
        <div className="flex gap-5">
          <Button className="w-[236px] h-16 bg-[#D9D9DC] border-[#8E8C95] text-[#474553] font-medium text-2xl">
            <FaGoogle color="#474553" size={32} /> Google
          </Button>
          <Button className="w-[236px] h-16 bg-[#8E8C95] border-[#2C2C2C] font-semibold text-2xl text-[#F5F5F6]">
            <BsApple size={24} /> Apple
          </Button>
        </div>
      </div>
      <p className="text-center text-sm font-normal text-[#104901]">
        By continuing with Google, Apple, Email or Phone number, you agree to
        Chainfundit <span className="font-bold">Terms of Service</span> as well
        as the <span className="font-bold">Privacy Policy</span>.
      </p>
    </form>
  );
}
