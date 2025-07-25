"use client";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus } from "lucide-react";

export default function CreateCampaignPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // const router = useRouter();

  // // Replace this with your actual authentication logic
  // const isAuthenticated = false; // e.g., get from context or cookies

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.replace("/signup");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) {
  //   return null; // Or a loading spinner
  // }

  return (
    <div className="w-full flex md:flex-row flex-col gap-5 md:gap-10 font-source">
      {/* Your create campaign form goes here */}
      <div className="w-full md:w-2/5">
        <div className="relative ">
          <input
            type="file"
            id="profile-image-upload"
            accept="image/*"
            className="hidden"
            ref={inputRef}
            // onChange={handleFileChange}
          />
          <label
            htmlFor="profile-image-upload"
            className="w-[200px] md:w-[360px] h-[200px] md:h-[360px]  flex items-center justify-center cursor-pointer bg-center bg-cover"
            style={{
              backgroundImage: preview
                ? `url(${preview})`
                : `url('/images/image.png')`,
            }}
            title="Upload profile image"
          >
            {!preview && <span className="sr-only">Upload profile image</span>}
          </label>
          <section className="w-8 md:w-[56px] h-8 md:h-[56px] bg-[#104901] flex items-center justify-center text-white absolute right-[118px] md:right-[70px] bottom-6 md:bottom-11">
            <Plus className="md:text-4xl text-lg" size={36} />
          </section>
        </div>
        <p className="font-medium textsm md:text-xl text-[#104901]">
          Upload your main campaign image
        </p>
      </div>
    </div>
  );
}
