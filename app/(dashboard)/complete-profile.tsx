import { ArrowUp } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';

type Props = {
  formRef: React.RefObject<HTMLFormElement>;
  onSuccess?: () => void;
};

const CompleteProfile = ({ formRef, onSuccess }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    fetch("/api/user/profile", { method: "GET" })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) setProfile(data.user);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const fullName = (e.target as any).fullName.value;
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, avatar: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast.success("Profile updated!");
      // Close the modal on successful submission
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update profile");
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prefill logic: use fullName if present, else first part of email
  const defaultName =
    profile?.fullName?.trim()
      ? profile.fullName
      : profile?.email
      ? profile.email.split("@")[0]
      : "";

  return (
    <div className='font-source'>
      <form
        ref={formRef}
        className='flex gap-4 items-center'
        onSubmit={handleProfileSubmit}
      >
        <div className='relative'>
          <input
            type="file"
            id="profile-image-upload"
            name='avatar'
            accept="image/*"
            className="hidden"
            ref={inputRef}
            onChange={handleFileChange}
          />
          <label
            htmlFor="profile-image-upload"
            className="w-[50px] md:w-[100px] h-[50px] md:h-[100px] rounded-full flex items-center justify-center cursor-pointer bg-center bg-cover"
            style={{
              backgroundImage: preview
                ? `url(${preview})`
                : `url('/images/avatar.svg')`,
            }}
            title="Upload profile image"
          >
            {!preview && (
              <span className="sr-only">Upload profile image</span>
            )}
          </label>
          <section className='w-4 md:w-[33px] h-4 md:h-[33px] bg-[#104901] rounded-full flex items-center justify-center text-white absolute left-7 md:left-16 bottom-0 md:bottom-2'>
            <ArrowUp />
          </section>
        </div>
        <div className='flex flex-col gap-2'>
          <label htmlFor="fullName" className='font-normal text-xl text-[#104901]'>Name</label>
          <input
            name="fullName"
            id="fullName"
            type="text"
            placeholder='firstname lastname'
            className='w-[250px] md:w-[400px] px-5 py-2.5 placeholder:font-normal placeholder:text-2xl placeholder:text-[#767676] border border-[#D9D9DC] rounded-lg outline-none'
            required
            defaultValue={defaultName}
          />
        </div>
        {submitError && <p className="text-red-500 ml-4">{submitError}</p>}
      </form>
    </div>
  )
}

export default CompleteProfile