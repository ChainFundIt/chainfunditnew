"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
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
    description: "Speak directly with our support team",
    contact: "+44 (0) 20 1234 5678",
    link: "tel:+442012345678",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Chat",
    description: "Chat with us in real-time (available 9 AM - 6 PM GMT)",
    contact: "WhatsApp",
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
    // Handle form submission
    console.log("Form submitted:", formData);
    // You can add API call here
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <MessageSquare className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            We're here to help! Get in touch with our team for support,
            questions, or feedback.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Contact Methods */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the best way to reach us. We're here to help!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center"
                >
                  <CardContent className="p-6">
                    <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {method.description}
                    </p>
                    <Link href={method.link}>
                      <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        {method.contact}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <div>
            <Card>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="campaign">Campaign Help</option>
                      <option value="account">Account Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 text-white"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Company Info & Quick Links */}
          <div className="space-y-6">
            {/* Office Information */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Office Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">🇬🇧 United Kingdom</p>
                      <p className="text-gray-600">
                        ChainFundIt Limited, <br /> 71-75, Shelton Street,
                        Covent Garden, <br /> London. WC2H 9JQ <br /> United
                        Kingdom.
                        <br />
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">🇺🇸 United States of America</p>
                      <p className="text-gray-600">
                        ChainFundit Limited, <br /> 16192 Coastal Highway,
                        Lewes, Delaware. <br /> 19958 <br /> County of Sussex.{" "}
                        <br /> United States of America.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <Link
                        href="mailto:support@chainfundit.com"
                        className="text-green-600 hover:underline"
                      >
                        support@chainfundit.com
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM GMT
                        <br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Support Links */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Quick Support
                </h2>
                <div className="space-y-4">
                  {supportTopics.map((topic, index) => {
                    const Icon = topic.icon;
                    return (
                      <Link
                        key={index}
                        href={topic.link}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {topic.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {topic.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Response Time Info */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Clock className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Response Times
                </h3>
                <p className="text-gray-700 mb-4">
                  We aim to respond to all inquiries within 24 hours during
                  business days. For urgent matters, please call our support
                  line or send us a text on WhatsApp.
                </p>
                <p className="text-gray-700">
                  <strong>Emergency Support:</strong> For critical issues
                  affecting active campaigns, we provide priority support.
                  Contact us immediately if you need urgent assistance on WhatsApp.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
