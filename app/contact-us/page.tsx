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
import Image from "next/image";
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
    <div className="min-h-screen bg-white font-plusjakarta overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <div 
        className="relative bg-[#104901] text-white overflow-hidden w-full flex justify-center"
        style={{
          height: "400px",
          paddingBottom: "96px",
          boxSizing: "border-box"
        }}
      >
        {/* Right Corner Blur Overlay */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.2
          }}
        ></div>

        {/* Left Corner Blur Overlay */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, #59AD4A 0%, transparent 70%)",
            filter: "blur(64px)",
            opacity: 0.1
          }}
        ></div>

        {/* Center Content Container */}
        <div 
          className="relative mx-auto flex flex-col items-center justify-center font-plusjakarta"
          style={{
            width: "896px",
            maxWidth: "896px",
            height: "198.2px",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "80.8px",
            gap: "24px"
          }}
        >
          {/* Get In Touch Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 font-plusjakarta"
            style={{
              border: "1px solid #047857",
              borderRadius: "24px"
            }}
          >
            <Image 
              src="/images/getintouch.png"
              alt="Get in touch"
              width={16}
              height={16}
            />
            <span 
              className="font-plusjakarta"
              style={{
                fontWeight: 700,
                fontSize: "12px",
                lineHeight: "16px",
                textTransform: "uppercase",
                color: "#59AD4A"
              }}
            >
              GET IN TOUCH
            </span>
          </div>

          {/* Main Heading */}
          <div 
            className="flex items-center justify-center font-plusjakarta"
            style={{
              width: "864px",
              height: "60px"
            }}
          >
            <h1 
              className="font-plusjakarta text-center"
              style={{
                fontWeight: 800,
                fontSize: "60px",
                lineHeight: "60px",
                color: "#FFFFFF"
              }}
            >
              We're here to help
            </h1>
          </div>

          {/* Subheading */}
          <div 
            className="flex items-center justify-center font-plusjakarta"
            style={{
              width: "672px",
              maxWidth: "672px",
              height: "59px"
            }}
          >
            <p 
              className="font-plusjakarta text-center"
              style={{
                fontWeight: 400,
                fontSize: "18px",
                color: "#D1FAE5CC",
                lineHeight: "1.5"
              }}
            >
              Have questions about starting a campaign or supporting a cause? Our dedicated team is ready to assist you on your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods Container */}
      <div 
        className="flex flex-col font-plusjakarta"
        style={{
          width: "100%",
          maxWidth: "1280px",
          height: "989.2000122070312px",
          gap: "64px",
          marginTop: "-80px",
          position: "relative",
          zIndex: 10,
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "20px",
          paddingRight: "20px"
        }}
      >
        {/* Cards Row */}
        <div 
          className="flex font-plusjakarta justify-center"
          style={{
            width: "100%",
            maxWidth: "1280px",
            height: "282px",
            gap: "24px"
          }}
        >
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div 
                key={index}
                className="bg-white font-plusjakarta contact-method-container"
                style={{
                  width: "410.6px",
                  height: "282px",
                  borderRadius: "24px",
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexGrow: 1,
                  minWidth: "200px"
                }}
              >
                <div 
                  className="flex items-center justify-center mb-4 font-plusjakarta"
                  style={{
                    backgroundColor: "#ECFDF5",
                    width: "70px",
                    height: "64px",
                    borderRadius: "16px"
                  }}
                >
                  <Image 
                    src={`/images/${index === 0 ? 'emailicon.png' : index === 1 ? 'phonesupport.png' : 'whatsappicon.png'}`}
                    alt={method.title}
                    width={35}
                    height={32}
                  />
                </div>

                <div className="text-center font-plusjakarta title-container">
                  <h3 
                    className="font-plusjakarta"
                    style={{
                      fontWeight: 700,
                      fontSize: "20px",
                      lineHeight: "28px",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {method.title}
                  </h3>
                </div>

                <div 
                  className="text-center font-plusjakarta"
                  style={{
                    width: "346.9700012207031px",
                    height: "46px",
                    paddingRight: "5.98px",
                    paddingLeft: "5.99px"
                  }}
                >
                  <p 
                    className="font-plusjakarta text-center"
                    style={{
                      width: "335px",
                      height: "46px",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "22.75px",
                      color: "#666666"
                    }}
                  >
                    {method.description}
                  </p>
                </div>

                <Link href={method.link} className="mt-auto pt-4">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-green-700 bg-[#47a341] font-plusjakarta"
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
        <div 
          className="relative font-plusjakarta mx-auto"
          style={{
            width: "100%",
            maxWidth: "1280px",
            height: "643.2px",
            gap: "48px",
            borderRadius: "48px",
            padding: "48px",
            backgroundColor: "#FFFFFF",
            boxSizing: "border-box"
          }}
        >
          {/* Yellow Blur Overlay - Top Right */}
          <div
            className="absolute top-0 right-0 pointer-events-none"
            style={{
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle, #FFCF55 0%, transparent 70%)",
              filter: "blur(64px)",
              opacity: 0.5,
              borderRadius: "48px"
            }}
          ></div>

          <div className="relative flex gap-12 font-plusjakarta" style={{ gap: "48px" }}>
            {/* Left Sidebar - Office Locations & Hours */}
            <div 
              className="font-plusjakarta"
              style={{
                width: "377px",
                height: "547px",
                display: "flex",
                flexDirection: "column",
                gap: "32px"
              }}
            >
              {/* Send us a message Header */}
              <div 
                className="font-plusjakarta"
                style={{
                  width: "377px",
                  height: "104px",
                  gap: "15.4px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <h2 
                  className="font-plusjakarta"
                  style={{
                    width: "377px",
                    height: "36px",
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 700,
                    fontSize: "30px",
                    lineHeight: "36px",
                    color: "#1a1a1a"
                  }}
                >
                  Send us a message
                </h2>
                <p 
                  className="font-plusjakarta"
                  style={{
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "26px",
                    color: "#666666"
                  }}
                >
                  Fill out the form and our team will get back to you as soon as possible.
                </p>
              </div>

              {/* Office Locations Box */}
              <div 
                className="bg-[#FCFAF5] font-plusjakarta"
                style={{
                  width: "377px",
                  height: "233px",
                  gap: "16px",
                  borderRadius: "24px",
                  border: "1px solid #E5E7EB",
                  padding: "23.8px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div 
                  className="flex items-center font-plusjakarta"
                  style={{
                    width: "328px",
                    height: "24px",
                    gap: "8px"
                  }}
                >
                  <Image 
                    src="/images/officelocation.png"
                    alt="Office Location"
                    width={20}
                    height={20}
                  />
                  <h3 
                    className="font-plusjakarta"
                    style={{
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#1a1a1a"
                    }}
                  >
                    Office Locations
                  </h3>
                </div>

                <div 
                  className="font-plusjakarta"
                  style={{
                    width: "328px",
                    height: "144px",
                    gap: "24px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div className="font-plusjakarta">
                    <p 
                      className="font-plusjakarta mb-1"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textTransform: "uppercase",
                        color: "#1a1a1a"
                      }}
                    >
                      UNITED KINGDOM
                    </p>
                    <p 
                      className="font-plusjakarta"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#666666"
                      }}
                    >
                      71-75 Shelton Street, Covent Garden, London. WC2H 9JQ
                    </p>
                  </div>

                  <div className="font-plusjakarta">
                    <p 
                      className="font-plusjakarta mb-1"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "12px",
                        lineHeight: "16px",
                        textTransform: "uppercase",
                        color: "#1a1a1a"
                      }}
                    >
                      UNITED STATES
                    </p>
                    <p 
                      className="font-plusjakarta"
                      style={{
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#666666"
                      }}
                    >
                      16192 Coastal Highway, Lewes, Delaware. 19958
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours Box */}
              <div 
                className="font-plusjakarta"
                style={{
                  width: "377px",
                  height: "120px",
                  gap: "8px",
                  borderRadius: "24px",
                  padding: "24px",
                  backgroundColor: "#104901",
                  boxShadow: "0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div className="flex items-center gap-2 font-plusjakarta">
                  <Image 
                    src="/images/timeicon.png"
                    alt="Time"
                    width={20}
                    height={20}
                  />
                  <h3 
                    className="font-plusjakarta"
                    style={{
                      width: "99px",
                      height: "24px",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#FFFFFF"
                    }}
                  >
                    Office Hours
                  </h3>
                </div>
                <p 
                  className="font-plusjakarta"
                  style={{
                    width: "329px",
                    height: "40px",
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "#D1FAE5"
                  }}
                >
                  <strong>Monday - Friday</strong>
                  <br />
                  9:00 AM - 6:00 PM GMT
                </p>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div 
              className="font-plusjakarta bg-white"
              style={{
                width: "758px",
                height: "547px",
                borderRadius: "24px",
                border: "1px solid #F3F4F6",
                padding: "31.8px",
                boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)"
              }}
            >
              <form 
                onSubmit={handleSubmit} 
                className="font-plusjakarta"
                style={{
                  width: "692px",
                  height: "481px",
                  gap: "24px",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Name and Email Row */}
                <div 
                  className="font-plusjakarta"
                  style={{
                    width: "692px",
                    height: "76px",
                    gap: "23.99px",
                    display: "flex"
                  }}
                >
                  {/* Name Field */}
                  <div 
                    className="font-plusjakarta"
                    style={{
                      width: "334px",
                      height: "76px",
                      gap: "8px",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <label
                      htmlFor="name"
                      className="font-plusjakarta"
                      style={{
                        width: "334px",
                        height: "20px",
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#1a1a1a"
                      }}
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
                      className="font-plusjakarta"
                      style={{
                        width: "334px",
                        height: "48px",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        fontFamily: "Plus Jakarta Sans",
                        fontSize: "16px",
                        lineHeight: "24px"
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email Field */}
                  <div 
                    className="font-plusjakarta"
                    style={{
                      width: "334px",
                      height: "76px",
                      gap: "8px",
                      display: "flex",
                      flexDirection: "column"
                    }}
                  >
                    <label
                      htmlFor="email"
                      className="font-plusjakarta"
                      style={{
                        width: "334px",
                        height: "20px",
                        fontFamily: "Plus Jakarta Sans",
                        fontWeight: 700,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#1a1a1a"
                      }}
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
                      className="font-plusjakarta"
                      style={{
                        width: "334px",
                        height: "48px",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        fontFamily: "Plus Jakarta Sans",
                        fontSize: "16px",
                        lineHeight: "24px"
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Subject Field */}
                <div 
                  className="font-plusjakarta"
                  style={{
                    width: "692px",
                    height: "76px",
                    gap: "8px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <label
                    htmlFor="subject"
                    className="font-plusjakarta"
                    style={{
                      width: "692px",
                      height: "20px",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#1a1a1a"
                    }}
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="font-plusjakarta"
                    style={{
                      width: "692px",
                      height: "48px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#F9FAFB",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#666666"
                    }}
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
                <div 
                  className="font-plusjakarta"
                  style={{
                    width: "692px",
                    height: "201px",
                    paddingBottom: "5.6px",
                    gap: "8px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <label
                    htmlFor="message"
                    className="font-plusjakarta"
                    style={{
                      width: "692px",
                      height: "20px",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "#1a1a1a"
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="font-plusjakarta"
                    style={{
                      width: "692px",
                      height: "168px",
                      padding: "12px 16px 132px 16px",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      backgroundColor: "#F9FAFB",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      resize: "none",
                      overflow: "auto"
                    }}
                    placeholder="How can we help you?"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="font-plusjakarta flex items-center justify-center"
                  style={{
                    width: "692px",
                    height: "56px",
                    padding: "16px 0",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor: "#104901",
                    color: "#FFFFFF",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0px 4px 6px -4px rgba(6, 78, 59, 0.1), 0px 10px 15px -3px rgba(6, 78, 59, 0.1)"
                  }}
                >
                  <Image 
                    src="/images/sendmessageicon.png"
                    alt="Send"
                    width={20}
                    height={20}
                  />
                  <span
                    className="font-plusjakarta"
                    style={{
                      width: "114px",
                      height: "24px",
                      fontFamily: "Plus Jakarta Sans",
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "24px",
                      textAlign: "center"
                    }}
                  >
                    Send Message
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}