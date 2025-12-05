"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import SessionStatusIndicator from "@/components/dashboard/SessionStatusIndicator";
import { useAuth } from "@/hooks/use-auth";
import DashboardIcon from "@/public/icons/DashboardIcon";

type Props = {};

const Navbar = (props: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleCreateCampaign = () => {
    window.location.href = "/create-campaign";
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
          className="md:hidden flex flex-col gap-1 focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>
        {/* Desktop nav */}
        <ul className="flex gap-8 items-center justify-center">
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

        <section className="flex gap-4 items-center">
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

          <Button
            className="bg-[#064E3B] py-[10px] px-[24px] rounded-full font-jakarta font-bold text-[14px] leading-[20px] hover:bg-gray-100"
            onClick={handleCreateCampaign}
          >
            Start Campaign
          </Button>
        </section>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 animate-fade-in">
          <ul className="flex flex-col gap-2 font-semibold text-base text-black">
            <li>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                My Dashboard
              </Link>
            </li>
            <li>
              <Link href="/campaigns" onClick={() => setMenuOpen(false)}>
                Campaigns
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setMenuOpen(false)}>
                About
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
            <div className="flex items-center justify-center gap-3"></div>
            <Button
              className="w-full px-4 py-3 border-2 border-white text-base font-semibold rounded-none"
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
