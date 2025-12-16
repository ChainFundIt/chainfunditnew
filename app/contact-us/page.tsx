"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Shield,
  Users,
  FileText,
  Lightbulb,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us an email and we'll get back to you within 24 hours",
    contact: "campaigns@chainfundit.com",
    link: "mailto:support@chainfundit.com",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our support team for urgent matters",
    contact: "+44 (0) 20 1234 5678",
    link: "tel:+442012345678",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Chat",
    description: "Chat with us in real-time (available 9 AM - 6 PM GMT)",
    contact: "Start Chat",
    link: "https://wa.me/+238090986009?text=I have a question about the platform",
  },
];

const supportTopics = [
  {
    icon: HelpCircle,
    title: "General Support",
    description: "Questions about using our platform",
    link: "/faq",
  },
  {
    icon: Shield,
    title: "Account Issues",
    description: "Help with your account or security",
    link: "/contact-us",
  },
  {
    icon: Users,
    title: "Campaign Help",
    description: "Support for your fundraising campaign",
    link: "/fundraising-tips",
  },
  {
    icon: FileText,
    title: "Legal & Policies",
    description: "Questions about terms, privacy, or policies",
    link: "/terms-and-conditions",
  },
];

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className=" bg-white font-jakarta  flex flex-col ">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#104109] pt-[5rem] pb-[7rem] flex items-center justify-center font-jakarta z-0">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[56rem] relative">
          <div className="flex gap-2 px-4 py-[6px] border border-[#047857] rounded-full w-fit ">
            <MessageCircle color="#6ee7b7" size={14} />
            <div className="text-[#6ee7b7] font-bold text-xs ">
              GET IN TOUCH
            </div>
          </div>
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            We're here to help
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Have questions about starting a campaign or supporting a cause? Our
            dedicated team is ready to assist you on your journey
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="md:flex hidden  absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>

      {/* Contact Methods Container */}
      <div
        className="flex flex-col gap-8 items-center px-4 mt-[-60px]  mb-8"
        style={{ zIndex: "5" }}
      >
        {/* Cards Row */}
        <div className="flex md:flex-row flex-col max-w-[80rem] gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div
                key={index}
                className="bg-white w-[26rem] h-[18rem] rounded-3xl py-10 flex flex-col items-center shadow-sm gap-4 px-6"
              >
                <div className="bg-[#ecfdf5] rounded-3xl p-3 w-fit">
                  <Icon size={32} color="#059669" />
                </div>

                <div className="text-center font-bold text-xl text-[#111827] ">
                  {method.title}
                </div>

                <div className="text-center text-sm text-[#6b7280]">
                  {method.description}
                </div>

                <div className="text-[#059669] font-bold text-base flex gap-2 items-center cursor-pointer mt-auto">
                  {method.contact}
                  <ArrowRight size={14} color="#059669" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Section */}
        <div className="md:max-w-[80rem] w-full md:flex-row flex-col flex gap-12 rounded-3xl bg-[#fcfaf5] relative py-8  justify-center items-center">
          {/* Yellow Blur Overlay - Top Right */}
          <div
            className="absolute top-0 right-0 w-[25rem] h-[25rem] bg-[radial-gradient(circle,#FFCF55_0%,transparent_70%)] 
         blur-[64px] 
         opacity-50 rounded-[48px] z-0 md:flex hidden"
          ></div>

          {/* Left Sidebar - Office Locations & Hours */}
          <div className="flex flex-col gap-8 md:w-[24rem] ">
            {/* Send us a message Header */}
            <div className="flex flex-col gap-4 md:text-left text-center">
              <div className="font-bold text-3xl text-[#1a1a1a] ">
                Send us a message
              </div>
              <p className="text-base text-[#666666] ">
                Fill out the form and our team will get back to you as soon as
                possible.
              </p>
            </div>

            {/* Office Locations Box */}
            <div className="bg-[#FCFAF5] flex flex-col p-6 gap-4 rounded-3xl border border-[#e5e7eb]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/officelocation.png"
                  alt="Office Location"
                  width={20}
                  height={20}
                />
                <div className="font-bold text-base text-[#1a1a1a]">
                  Office Locations
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <p className="font-bold text-xs text-[#1a1a1a] mb-1">
                    UNITED KINGDOM
                  </p>
                  <p className="text-sm text-[#666666]">
                    71-75 Shelton Street, Covent Garden, London. WC2H 9JQ
                  </p>
                </div>

                <div>
                  <p className="font-bold text-xs text-[#1a1a1a] mb-1">
                    UNITED STATES
                  </p>
                  <p className="text-sm text-[#666666]">
                    16192 Coastal Highway, Lewes, Delaware. 19958
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours Box */}
            <div className="flex flex-col gap-2 rounded-3xl bg-[#104109] shadow-sm p-6 md:items-start items-center">
              <div className="flex items-center gap-2 ">
                <Image
                  src="/images/timeicon.png"
                  alt="Time"
                  width={20}
                  height={20}
                />
                <div className="font-bold text-base text-white">
                  Office Hours
                </div>
              </div>
              <p className="text-sm text-[#d1fae5] md:text-left text-center">
                <strong>Monday - Friday</strong>
                <br />
                9:00 AM - 6:00 PM GMT
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="z-10 bg-white md:w-[47rem] w-full rounded-3xl border border-[#f3f4f6] shadow-sm p-5">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 md:w-[44rem] w-full  "
            >
              {/* Name and Email Row */}
              <div className="flex md:flex-row flex-col gap-6 md:w-[43rem]">
                {/* Name Field */}
                <div className="flex flex-col gap-2 md:w-[21rem] w-full ">
                  <label
                    htmlFor="name"
                    className="md:w-[21rem] w-full font-bold text-sm text-[#1a1a1a]"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="md:w-[21rem] w-full  px-4 py-3 rounded-xl border border-[#e5e7eb] text-base bg-[#f9fafb]"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email Field */}
                <div className="flex flex-col gap-2 md:w-[21rem] w-full ">
                  <label
                    htmlFor="email"
                    className="md:w-[21rem] w-full  font-bold text-sm text-[#1a1a1a]"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="md:w-[21rem] w-full  px-4 py-3 rounded-xl border border-[#e5e7eb] text-base bg-[#f9fafb]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Subject Field */}
              <div className="flex flex-col gap-2 md:w-[50rem] w-full ">
                <label
                  htmlFor="subject"
                  className="md:w-[43rem] w-full  font-bold text-sm text-[#1a1a1a]"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="md:w-[43rem] w-full text-[#666666] py-3 px-4 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] text-base"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="campaign">Campaign Help</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message Field */}
              <div className="md:w-[43rem] w-full  gap-2 pb-[6px] flex flex-col">
                <label
                  htmlFor="message"
                  className="md:w-[43rem] w-full  font-bold text-sm text-[#1a1a1a]"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="md:w-[43rem] w-full h-48 px-4 py-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] text-base resize-none overflow-y-auto"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className=" rounded-xl h-auto py-3">
                <Image
                  src="/images/sendmessageicon.png"
                  alt="Send"
                  width={20}
                  height={20}
                />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
