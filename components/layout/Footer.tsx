"use client";
import CompanyIcon from "@/public/icons/CompanyLogo";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { BsTiktok } from "react-icons/bs";

type Props = {};

const Footer = (props: Props) => {
  const router = useRouter();
  return (
    <div className="rounded-t-[48px] bg-[#104109] md:px-20 pt-20 pb-10 flex items-center justify-center">
      <div className="md:max-w-[80rem] w-390px md:px-8 px:4 flex flex-col gap-16">
        <div className="flex gap-12 md:flex-row flex-col">
          <div className="flex flex-col gap-6 md:w-[268px] w-[358px]">
            <div className="flex gap-2 items-center">
              <CompanyIcon color="white" />
              <div className="font-jakarta font-bold text-xl leading-7 text-white">
                ChainFundit
              </div>
            </div>
            <div className="font-jakarta font-normal text-base leading-[26px] text-white">
              Empowering global change through transparent, secure, and rapid
              fundraising technology. Join the movement today.
            </div>
          </div>
          <div className="font-jakarta flex flex-col gap-6 md:w-[268px] w-[358px]">
            <div className="font-bold text-lg leading-7 text-[#ECFDF5]">
              Discover
            </div>
            <div className="flex flex-col gap-4 font-normal text-base leading-6 text-white ">
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/how-it-works");
                }}
              >
                How ChainFundIt works
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/join-the-chain-reaction");
                }}
              >
                Join the Chain Reaction
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/success-stories");
                }}
              >
                Success stories
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/ambassador-agreement");
                }}
              >
                Ambassador Agreement
              </div>
            </div>
          </div>
          <div className="font-jakarta flex flex-col gap-6 w-[268px]">
            <div className="font-bold text-lg leading-7 text-white">
              Resources
            </div>
            <div className="flex flex-col gap-4 font-normal text-base leading-6 text-white">
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/disclaimer");
                }}
              >
                Disclaimer
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/pricing");
                }}
              >
                Pricing
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/fundraising-tips");
                }}
              >
                Fundraising Tips
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/fundraising-ideas");
                }}
              >
                Fundraising Ideas
              </div>
            </div>
          </div>
          <div className="font-jakarta flex flex-col gap-6 w-[268px]">
            <div className="font-bold text-lg leading-7 text-white">
              Contact
            </div>
            <div className="flex flex-col gap-4 font-normal text-base leading-6 text-white">
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/contact-us");
                }}
              >
                Contact Us
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/blog");
                }}
              >
                Blog
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/privacy-policy");
                }}
              >
                Privacy Policy
              </div>
              <div
                className="hover:text-[#59ad4a] cursor-pointer"
                onClick={() => {
                  router.push("/terms-and-conditions");
                }}
              >
                Terms and Conditions
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white flex md:flex-row flex-col md:justify-between  pt-8 items-center">
          <div className="font-jakarta text-white font-normal text-sm leading-5 md:pb-0 pb-4">
            © 2025 ChainFundit. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link
              href="https://x.com/chainfundit?s=11"
              target="_blank"
              className="h-8 w-8 bg-[#104109] flex items-center justify-center rounded-full hover:bg-[#065f46] cursor-pointer"
            >
              <Twitter size={20} color="#A8A29E" />
            </Link>

            <Link
              href="https://www.linkedin.com/company/chainfundit11/"
              target="_blank"
              className="h-8 w-8 bg-[#104109] flex items-center justify-center rounded-full hover:bg-[#065f46] cursor-pointer"
            >
              <Linkedin size={20} color="#A8A29E" />
            </Link>

            <Link
              href="https://www.facebook.com/share/1YrZpf7FbC/?mibextid=wwXIfr"
              target="_blank"
              className="h-8 w-8 bg-[#104109] flex items-center justify-center rounded-full hover:bg-[#065f46] cursor-pointer"
            >
              <Facebook size={20} color="#A8A29E" />
            </Link>

            <Link
              href="https://www.instagram.com/chainfundit"
              target="_blank"
              className="h-8 w-8 bg-[#104109] flex items-center justify-center rounded-full hover:bg-[#065f46] cursor-pointer"
            >
              <Instagram size={20} color="#A8A29E" />
            </Link>

            <Link
              href="https://www.tiktok.com/@chainfundit?_r=1&_t=ZS-91f2JUhl7um"
              target="_blank"
              className="h-8 w-8 bg-[#104109] flex items-center justify-center rounded-full hover:bg-[#065f46] cursor-pointer"
            >
              <BsTiktok size={20} color="#A8A29E" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
