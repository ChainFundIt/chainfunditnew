'use client'

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Props = {};

const Navbar = (props: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/user/profile');
        setIsLoggedIn(response.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleCreateCampaign = () => {
    window.location.href = "/create-campaign";
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white shadow font-source px-4 py-4 md:px-12 md:py-5">
      <div className="flex justify-between items-center">
        <Link href='/' className="flex gap-1 items-center">
          <Image
            src="/images/logo.svg"
            alt="Chainfundit Logo"
            width={30}
            height={30}
          />
          <p className="font-semibold text-xl text-[#104901]">Chainfundit</p>
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
        <ul className="hidden md:flex justify-between gap-6 font-semibold text-base text-black">
          <li>
            <Link href="/campaigns">Campaigns</Link>
          </li>
          <li>
            <Link href="/virtual-giving-mall">Virtual Giving Mall</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/faq" className="">
              FAQs
            </Link>
          </li>
        </ul>
        <section className="hidden md:flex items-center gap-3">
          {!isLoggedIn && (
            <Link href='/signin' className="font-medium text-base text-black">Sign in</Link>
          )}
          <Button
            className="px-4 py-3 border-2 border-white text-base font-semibold rounded-none"
            onClick={handleCreateCampaign}
          >
            Create Campaign
          </Button>
        </section>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 animate-fade-in">
          <ul className="flex flex-col gap-2 font-semibold text-base text-black">
            <li>
              <Link href="/campaigns" onClick={() => setMenuOpen(false)}>Campaigns</Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            </li>
            <li>
              <Link href="/virtual-giving-mall" onClick={() => setMenuOpen(false)}>Virtual Giving Mall</Link>
            </li>
            <li>
              <Link href="/faq" onClick={() => setMenuOpen(false)}>FAQs</Link>
            </li>
          </ul>
          <div className="flex flex-col gap-2">
            {!isLoggedIn && (
              <Link href='/signin' className="font-medium text-base text-black">Signin</Link>
            )}
            <div className="flex items-center justify-center gap-3">
            </div>
            <Button className="w-full px-4 py-3 border-2 border-white text-base font-semibold rounded-none">Create Campaign</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
