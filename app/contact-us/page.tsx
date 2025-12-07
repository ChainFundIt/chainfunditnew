"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  HelpCircle,
  Shield,
  Users,
  FileText,
} from "lucide-react";
import Link from "next/link";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us an email and we'll get back to you within 24 hours",
    contact: "support@chainfundit.com",
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-[#104901] mt-16 text-white py-24 pb-40">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center mb-8 px-5 py-2 border border-green-400 rounded-full text-sm font-semibold text-green-300">
            <MessageSquare className="h-4 w-5 mr-2" />
            GET IN TOUCH
          </div>
          <h1 className="text-6xl font-bold mb-6">We're here to help</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Have questions about starting a campaign or supporting a cause? Our
            dedicated team is ready to assist you on your journey.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-32 relative z-10 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg text-center"
              >
                <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-gray-600 mb-6 text-sm">
                  {method.description}
                </p>
                <Link href={method.link}>
                  <Button
                    variant="ghost"
                    className="text-green-600 hover:text-green-700 font-plusjakarta"
                  >
                    {method.contact}
                    <span className="ml-2">→</span>
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-16">
          {/* Left Sidebar - Office Locations & Hours */}
          <div className="space-y-6">
            {/* Send us a message Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send us a message
              </h2>
              <p className="text-gray-600 text-sm">
                Fill out the form and our team will get back to you
                as soon as possible.
              </p>
            </div>

            {/* Office Locations Box */}
            <div className="bg-[#FCFAF5] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Office Locations
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-plusjakarta text-gray-900 text-sm mb-1">
                    UNITED KINGDOM
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    71-75 Shelton Street, Covent Garden, London. WC2H 9JQ
                  </p>
                </div>

                <div>
                  <p className="font-plusjakarta text-gray-900 text-sm mb-1">
                    UNITED STATES
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    16192 Coastal Highway, Lewes, Delaware. 19958
                  </p>
                </div>
              </div>
            </div>

            {/* Office Hours Box */}
            <div className="bg-[#104901] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5" />
                <h3 className="text-base font-bold">Office Hours</h3>
              </div>
              <p className="text-white/90 text-sm">
                <strong>Monday - Friday</strong>
                <br />
                9:00 AM - 6:00 PM GMT
              </p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div>
            <div className="relative">
              {/* Yellow overlay background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FEF9C3]/40 to-[#FEF9C3]/80 rounded-2xl"></div>

              {/* Form container */}
              <div className="relative bg-white rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-plusjakarta text-gray-900 mb-2"
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
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-plusjakarta text-gray-900 mb-2"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          placeholder="john@example.com"
                        />
                        <Mail className="h-4 w-4 text-green-600 absolute right-3 top-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-plusjakarta text-gray-900 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-gray-600"
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

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-plusjakarta text-gray-900 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                      placeholder="How can we help you?"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#104901] text-white hover:bg-[#0a3a01] font-plusjakarta py-6 rounded-lg flex items-center justify-center gap-2 mt-4"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}