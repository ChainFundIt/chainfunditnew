import React, { useRef, useState } from "react";
import { ArrowUp, UserCheck } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedinIn, FaTiktok, FaTwitter, FaYoutube } from "react-icons/fa";
import { Button } from "@/components/ui/button";

type Props = {};

const Account = (props: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="">
      <h4 className="font-semibold text-3xl text-[#104901]">Your profile</h4>
      <p className="font-normal text-xl text-[#104901]">
        Choose how you are displayed on the frontend of the website.
      </p>

      <form action="" className="mt-8">
        <div className="flex gap-10">
          <section className="flex flex-col">
            <label
              htmlFor=""
              className="font-normal text-xl text-[#104901] mb-2"
            >
              Name
            </label>
            <input
              type="text"
              placeholder="Tolulope Smith"
              className="w-[385px] py-[10px] mb-3 px-5 rounded-lg border border-[#D9D9DC] outline-none placeholder:font-medium placeholder:text-2xl placeholder:text-[#1E1E1E]"
            />
            <label
              htmlFor=""
              className="font-normal text-xl text-[#104901] mb-2"
            >
              Bio
            </label>
            <input
              type="text"
              placeholder="Share a little about your background and interests"
              className="w-[385px] py-[10px] mb-3 px-5 rounded-lg border border-[#D9D9DC] outline-none placeholder:font-medium placeholder:text-sm placeholder:text-[#ADADAD]"
            />
          </section>
          <div className="relative">
            <p className="font-medium text-xl text-black">Profile picture</p>
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
              className="w-[50px] md:w-[100px] h-[50px] md:h-[100px] rounded-full flex items-center justify-center cursor-pointer bg-center bg-cover border-2 border-white"
              style={{
                backgroundImage: preview
                  ? `url(${preview})`
                  : `url('/images/user-profile.png')`,
              }}
              title="Upload profile image"
            >
              {!preview && (
                <span className="sr-only">Upload profile image</span>
              )}
            </label>
            <section className="w-4 md:w-[33px] h-4 md:h-[33px] bg-[#104901] rounded-full flex items-center justify-center text-white absolute left-7 md:left-16 bottom-0 md:bottom-16">
              <ArrowUp />
            </section>
          </div>
        </div>
        <p className="font-normal text-xl text-[#104901] mt-3">Social links</p>
        <div className="flex gap-5">
          <ul className="flex flex-col gap-2">
            <li className="flex gap-3 items-center">
              <FaInstagram size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">instagram.com/</span>
                <input type="text" placeholder="username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
            <li className="flex gap-3 items-center">
              <FaFacebook size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">facebook.com/</span>
                <input type="text" placeholder="username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
            <li className="flex gap-3 items-center">
              <FaLinkedinIn size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">linkedin.com/</span>
                <input type="text" placeholder="in/username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
          </ul>
          <ul className="flex flex-col gap-2">
            <li className="flex gap-3 items-center">
              <FaTwitter size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">x.com/</span>
                <input type="text" placeholder="username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
            <li className="flex gap-3 items-center">
              <FaTiktok size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">tiktok.com/@</span>
                <input type="text" placeholder="username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
            <li className="flex gap-3 items-center">
              <FaYoutube size={36} />
              <section className="bg-[#D9D9D9] w-fit flex gap-2 items-center pl-5 pr-1 py-1 rounded-lg">
                <span className="font-medium text-xl text-[#2C2C2C]">youtube.com/@</span>
                <input type="text" placeholder="in/username" className="w-[145px] rounded-[6px] px-3 py-2 outline-none placeholder:font-medium placeholder:text-xl placeholder:text-[#ADADAD]" />
              </section>
            </li>
          </ul>
        </div>
        <Button className="w-[240px] my-7 font-semibold text-2xl flex justify-between h-14">Save changes <UserCheck /></Button>
      </form>
    </div>
  );
};

export default Account;
