"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import SessionStatusIndicator from "@/components/dashboard/SessionStatusIndicator";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import DashboardIcon from "@/public/icons/DashboardIcon";
import { HamburgerIcon, Menu, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {};

const Navbar = (props: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const handleCreateCampaign = () => {
    window.location.href = "/dashboard/campaigns/create-campaign";
  };

  return (
    <nav className="sticky top-0 px-20 py-3 border-b border-[#E7E5E4]  bg-[white] z-10">
      <div className="px-8 flex justify-between">
        <Link href="/" className="flex gap-2 items-center">
          <Image
            src="/images/logo.svg"
            alt="Chainfundit Logo"
            width={36}
            height={36}
          />
          <div className="font-bold text-[20px] leading-[28px] text-[#064e3b] font-jakarta">
            ChainFundit
          </div>
        </Link>
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex p-1 items-center "
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>
        {/* Desktop nav */}
        <ul className="gap-8 items-center justify-center md:flex hidden">
          <li className="font-jakarta font-medium text-[14px]  leading-[20px] text-[#57534E] hover:text-[#065f46]">
            <Link href="/campaigns">Campaigns</Link>
          </li>
          <li className="font-jakarta font-medium text-[14px] leading-[20px] text-[#57534E] hover:text-[#065f46]">
            <Link href="/virtual-giving-mall">Virtual Giving Mall</Link>
          </li>
          <li className="font-jakarta font-medium text-[14px] leading-[20px] text-[#57534E] hover:text-[#065f46]">
            <Link href="/about">About Us</Link>
          </li>
          <li className="font-jakarta font-medium text-[14px] leading-[20px] text-[#57534E] hover:text-[#065f46]">
            <Link href="/faq" className="">
              FAQs
            </Link>
          </li>
        </ul>

        <section className="md:flex hidden gap-4 items-center">
          <SessionStatusIndicator />
          {!user && !loading && (
            <Link
              href="/signin"
              className="flex gap-2 px-4 py-2 font-jakarta font-medium items-center  text-[14px] leading-[20px] justify-center rounded-full text-[#57534E] hover:bg-gray-100 "
            >
              Sign in
            </Link>
          )}

          {user && !loading && (
            <Link
              href="/dashboard"
              className="flex gap-2 px-4 py-2 font-jakarta font-medium items-center text-[14px] leading-[20px] justify-center rounded-full text-[#57534E] hover:bg-gray-100 "
            >
              <DashboardIcon color="#57534E" width="16" height="16" />
              Dashboard
            </Link>
          )}

          {user && isAdmin && (
            <Button variant="ghost" size="sm" className="font-jakarta font-medium text-[14px] leading-[20px] text-[#57534E] hover:text-[#065f46]" onClick={() => router.push("/admin")}>
              <Shield className="h-5 w-5" />
              Admin Dashboard
            </Button>
          )}

          <Button
            className="bg-[#064E3B] py-[10px] px-[24px] rounded-full font-jakarta font-bold text-[14px] leading-[20px] hover:bg-gray-100"
            onClick={handleCreateCampaign}
          >
            Start a Campaign
          </Button>
        </section>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden p-5 flex flex-col gap-3 
               animate-fadeIn ease-in-out duration-300 
               font-jakarta text-center"
        >
          <ul className="flex flex-col gap-3 font-semibold text-base text-black ">
            <li>
              <Link href="/campaigns" onClick={() => setMenuOpen(false)}>
                Campaigns
              </Link>
            </li>

            <li>
              <Link href="/about" onClick={() => setMenuOpen(false)}>
                About Us
              </Link>
            </li>

            <li>
              <Link
                href="/virtual-giving-mall"
                onClick={() => setMenuOpen(false)}
              >
                Virtual Giving Mall
              </Link>
            </li>

            <li>
              <Link href="/faq" onClick={() => setMenuOpen(false)}>
                FAQs
              </Link>
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <SessionStatusIndicator />

            {!user && !loading && (
              <Link href="/signin" className="font-medium text-base text-black">
                Sign In
              </Link>
            )}

            {user && !loading && (
              <Link
                href="/dashboard"
                className="font-medium text-base text-black flex gap-2 items-center justify-center"
              >
                <DashboardIcon color="#57534E" width="16" height="16" />
                Dashboard
              </Link>
            )}

            <Button
              className="bg-[#064E3B] py-[10px] px-[24px] rounded-full font-jakarta font-bold text-[14px] leading-[20px] hover:bg-gray-100"
              onClick={handleCreateCampaign}
            >
              Start a Campaign
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
