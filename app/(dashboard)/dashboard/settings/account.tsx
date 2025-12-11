import React, { useRef, useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

type Props = {};

const Account = (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    tiktok: "",
    youtube: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile on mount
  useEffect(() => {
    fetch("/api/user/profile", { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const text = await res.text();
        if (!text) {
          throw new Error("Empty response from server");
        }
        return JSON.parse(text);
      })
      .then((data) => {
        if (data.success && data.user) {
          console.log(data.user);
          setForm({
            fullName: data.user.fullName || "",
            bio: data.user.bio || "",
            instagram: data.user.instagram || "",
            facebook: data.user.facebook || "",
            linkedin: data.user.linkedin || "",
            twitter: data.user.twitter || "",
            tiktok: data.user.tiktok || "",
            youtube: data.user.youtube || "",
            avatar: data.user.avatar || "",
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile");
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const deleteImage = () => {
    setForm((f) => ({ ...f, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white flex flex-col p-7 gap-7 font-jakarta">
      {/* User Picture */}
      <div className="flex gap-4 pb-8 border-b border-b-[#f3f4f6]">
        {form.avatar ? (
          <Image
            src={form.avatar}
            alt={"User Picture"}
            width={84}
            height={84}
            className="border-4 rounded-full "
          />
        ) : (
          <div className="w-[84px] h-[84px] bg-gradient-to-br from-[#104109] to-[#59ad4a] border-4 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {(form.fullName?.[0] || "U").toUpperCase()}
          </div>
        )}
        <div className="flex flex-col ">
          <div className="font-bold text-base text-[#111827]">
            Profile Picture
          </div>
          <div className="text-xs text-[#6b7280]">PNG, JPG upto 5MB</div>
          <div className="flex gap-4 mt-2">
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={inputRef}
              onChange={(e) => {
                handleFileChange(e);
              }}
            />
            <Button
              className="bg-white border border-[#e5e7eb] rounded-lg text-[#374151] font-semibold text-xs"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              Upload New
            </Button>
            <Button
              className="border-none rounded-lg text-[#ef4444] font-semibold text-xs bg-white hover:text-[#ef4444]"
              onClick={deleteImage}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="font-bold text-base text-[#374159]">Name</div>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your name"
            className=" md:w-[20rem] w-full rounded-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb] placeholder:text-sm placeholder:text-[#6b7280]"
          />
        </div>
        <div className="flex flex-col gap-2 md:w-[40rem] w-full">
          <div className="font-bold text-base text-[#374159]">Bio</div>
          <textarea
            maxLength={250}
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Share a little about your background and interests."
            className="bg-[#f9fafb] w-full md:w-[40rem] md:h-[10rem] h-[15rem] rounded-lg outline-none border border-[#e5e7eb] p-2 text-sm text-[#6b7280] placeholder:text-sm placeholder:text-[#6b7280]"
          />
          <div className=" text-xs text-[#9ca3af] ml-auto">
            {250 - form.bio.length} Characters Left
          </div>
        </div>
      </div>

      {/* Socials */}
      <div>
        <div className="flex flex-col gap-2">
          <div className="font-bold text-base text-[#374159]">Social Links</div>
          <div className="flex gap-4 flex-col">
            {/* First Social Row */}
            <div className="flex md:w-[60rem] w-full md:justify-between md:flex-row flex-col gap-4">
              {/* Twitter */}
              <div className="flex">
                <input
                  type="text"
                  value={"twitter.com/"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="twitter"
                  value={form.twitter}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
              {/* Instagram */}
              <div className="flex">
                <input
                  type="text"
                  value={"instagram.com/"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="instagram"
                  value={form.instagram}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
            </div>
            {/* Second Social Row */}
            <div className="flex md:w-[60rem] w-full  md:justify-between md:flex-row flex-col gap-4">
              {/* Facebook */}
              <div className="flex">
                <input
                  type="text"
                  value={"facebook.com/"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="facebook"
                  value={form.facebook}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
              {/* Tiktok */}
              <div className="flex">
                <input
                  type="text"
                  value={"tiktok.com/@"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="tiktok"
                  value={form.tiktok}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
            </div>
            {/* Third Social Row */}
            <div className="flex md:w-[60rem] w-full  md:justify-between md:flex-row flex-col gap-4">
              {/* LinkedIn */}
              <div className="flex">
                <input
                  type="text"
                  value={"linkedin.com/"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
              {/* Youtube */}
              <div className="flex">
                <input
                  type="text"
                  value={"youtube.com/@"}
                  disabled={true}
                  className="bg-[#f3f4f6] w-[9rem] rounded-tl-lg rounded-bl-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] "
                />
                <input
                  type="text"
                  name="youtube"
                  value={form.youtube}
                  onChange={handleChange}
                  className=" w-[20rem] rounded-tr-lg rounded-br-lg outline-none border border-[#e5e7eb] p-3 text-sm text-[#6b7280] bg-[#f9fafb]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="flex pt-5 border-t border-t-[#f3f4f6] justify-center">
        <Button
          className=" rounded-xl font-semibold text-sm p-3 flex h-auto"
          onClick={handleSubmit}
        >
          <Save size={18} />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Account;
