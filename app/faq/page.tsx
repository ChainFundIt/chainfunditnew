"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "@/components/ui/select";
import Footer from "@/components/layout/Footer";

const faqCategories = [
  { id: "general", name: "General", icon: HelpCircle },
  { id: "donations", name: "Donations", icon: Heart },
  { id: "campaigns", name: "Campaigns", icon: Users },
  { id: "account", name: "Account", icon: MessageCircle },
];

const faqDataByCategory = {
  general: [
    {
      id: 1,
      question: "What is ChainFundIt?",
      answer:
        "ChainFundIt is a crowdfunding platform that connects donors with meaningful causes. We make it easy to discover, support, and share campaigns that matter to you.",
    },
    {
      id: 2,
      question: "How does the platform work?",
      answer: (
        <div className="space-y-2">
          <p>
            ChainFundIt encourages participants in crowdfunding campaigns to
            actively share and promote the campaign; as an act of kindness, and
            in exchange for financial reward. By so doing, the power of strength
            in numbers is leveraged to assist in achieving the fundraising
            campaign goal.
          </p>
          <p>
            When a participant opts to chain a fundraising campaign, that
            participant (Chain Ambassadors) will receive a replica fundraising
            page for the fundraising campaign which the Chain Ambassador can
            actively share and promote across his or her social network.{" "}
          </p>
          <p>
            The Chainfundit campaign page incorporates a &quot;Chain&quot;
            feature optionality in addition to the conventional
            &quot;Donate&quot; and &quot;Share&quot; functionality that exists
            on fundraising campaign pages from conventional crowdfunding
            platforms. Chain Ambassadors will receive the specified chain
            commission in any and all successful donations on their Chain
            campaign pages.
          </p>
        </div>
      ),
    },
    {
      id: 3,
      question: "Why is ChainFundIt important?",
      answer: (
        <div className="space-y-2">
          <span>
            Chaining fundraising campaigns helps to achieve three things:
          </span>
          <ul className="list-disc list-inside">
            <li>
              Extended reach for the campaign as more people share and promote
            </li>
            <li>Significantly enhanced probability of fundraising success;</li>
            <li>Quicker fundraising!</li>
          </ul>
        </div>
      ),
    },
    {
      id: 10,
      question: "Who is ChainFundIt for?",
      answer:
        "ChainFundIt is for any and everyone looking to fundraise for medical and life emergencies, business, financial support, funeral expenses, birthday gifts, etc.",
    },
    {
      id: 11,
      question: "What type of crowdfunding platform are we?",
      answer:
        "ChainFundIt is a donation-based platform. we do not offer loan-based and investment-based crowdfunding services.",
    },
    {
      id: 12,
      question: "Why and when do we request KYC information?",
      answer: (
        <div className="space-y-2">
          <p>
            KYC means &quot;Know Your Customer&quot;. This is a standard
            verification process to ensure compliance with local regulations.
            The objective of asking for your KYC information is to prevent the
            platform from being used, by criminal elements for money laundering
            activities.
          </p>
          <p>
            KYC details are used to verify the customers upon withdrawal of
            funds raised and in creating Virtual accounts.
          </p>
        </div>
      ),
    },
  ],
  donations: [
    {
      id: 4,
      question: "How do I make a donation?",
      answer:
        "Simply browse campaigns, select one you want to support, and click the donate button. You can donate using various payment methods including credit cards, bank transfers, and digital wallets.",
    },
    {
      id: 5,
      question: "Are donations secure?",
      answer:
        "Yes, we use industry-standard encryption and work with trusted payment processors to ensure all transactions are secure and your financial information is protected.",
    },
    {
      id: 6,
      question: "Can I get a refund for my donation?",
      answer:
        "Donations on ChainFundIt are generally non-refundable, as they are considered voluntary gifts. However, if there was an error (such as a duplicate charge or donation to the wrong campaign), please contact us at <a href='mailto:campaigns@chainfundit.com'>campaigns@chainfundit.com</a> within 48 hours, and we'll do our best to help.",
    },
  ],
  campaigns: [
    {
      id: 6,
      question: "How do I create a campaign?",
      answer:
        "Click the &quot;Create Campaign&quot; button, fill in your campaign details, upload images, set your funding goal, and submit. Your campaign will go live immediately.",
    },
    {
      id: 7,
      question: "What fees do you charge?",
      answer:
        "We charge a small platform fee to cover payment processing and operational costs. The exact fee structure is transparent and displayed before you create or donate to campaigns.",
    },
  ],
  account: [
    {
      id: 8,
      question: "How do I update my profile?",
      answer:
        "Go to your dashboard, click on &quot;Settings&quot; or &quot;Profile&quot;, and update your information. You can change your display name, profile picture, and contact preferences.",
    },
    {
      id: 9,
      question: "Can I delete my account?",
      answer:
        "Yes, you can delete your account from the settings page. Please note that this action is irreversible and will remove all your campaign and donation history.",
    },
  ],
};

const faqData = Object.entries(faqDataByCategory).flatMap(([category, faqs]) =>
  faqs.map((faq) => ({ ...faq, category }))
);

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = faqData.filter((faq) => {
    const answerText = typeof faq.answer === "string" ? faq.answer : "";
    const matchesSearch =
      faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      answerText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const categories = [{ id: "all", name: "All Categories" }, ...faqCategories];

  return (
    <div className="font-jakarta">
      <Navbar />

      {/* Hero Section */}

      <div className="bg-[#104109] pt-[5rem] pb-[7rem] flex items-center justify-center font-jakarta z-0">
        <div className="px-4 flex flex-col gap-6 items-center md:max-w-[64rem] relative">
          <div className="font-extrabold text-white text-[4rem] leading-[4rem] text-center">
            Frequently Asked Questions
          </div>
          <div className="text-xl text-[#d1fae5] text-center">
            Find answers to common questions about ChainFundIt
          </div>
          <div className="md:flex hidden absolute left-1/2 rounded-full h-[24rem] w-[24rem] bg-[#FACC151A] blur-[100px]"></div>
          <div className="md:flex hidden  absolute right-1/3 -top-[50px] rounded-full h-[24rem] w-[24rem] bg-[#10B98133] blur-[100px]"></div>
        </div>
      </div>

      <div
        className="bg-white relative container mx-auto px-4 py-8"
        style={{ zIndex: "5" }}
      >
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-[#E7EDE6]">
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="flex items-center font-normal text-2xl text-[#5F8555]"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-[#104109] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6 flex gap-1 items-end">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredFAQs.length} Questions Found
          </h2>
          <p className="text-gray-600 text-base">
            {selectedCategory !== "all"
              ? `in ${
                  faqCategories.find((c) => c.id === selectedCategory)?.name
                }`
              : ""}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            const categoryInfo = faqCategories.find(
              (c) => c.id === faq.category
            );
            const Icon = categoryInfo?.icon || HelpCircle;

            return (
              <Card
                key={faq.id}
                className="hover:shadow-sm transition-all duration-200"
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {faq.question}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {categoryInfo?.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <h6 className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </h6>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No questions found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is
              here to help you.
            </p>
          </div>

          <div className="flex md:flex-row flex-col md:justify-between">
            <div className="bg-white w-[26rem] h-[18rem] rounded-3xl py-10 flex flex-col items-center shadow-sm gap-4 px-6">
              <div className="bg-[#ecfdf5] rounded-3xl p-3 w-fit">
                <Mail size={32} color="#059669" />
              </div>

              <div className="text-center font-bold text-xl text-[#111827] ">
                Email Support
              </div>

              <div className="text-center text-sm text-[#6b7280]">
                Get help via email
              </div>

              <div className="text-[#059669] font-bold text-base flex gap-2 items-center cursor-pointer mt-auto">
                campaigns@chainfundit.com
                <ArrowRight size={14} color="#059669" />
              </div>
            </div>

            <div className="bg-white w-[26rem] h-[18rem] rounded-3xl py-10 flex flex-col items-center shadow-sm gap-4 px-6">
              <div className="bg-[#ecfdf5] rounded-3xl p-3 w-fit">
                <Phone size={32} color="#059669" />
              </div>

              <div className="text-center font-bold text-xl text-[#111827] ">
                Phone Support
              </div>

              <div className="text-center text-sm text-[#6b7280]">
                Speak with our team
              </div>

              <div className="text-[#059669] font-bold text-base flex gap-2 items-center cursor-pointer mt-auto">
                +44 20 3838 0360
                <ArrowRight size={14} color="#059669" />
              </div>
            </div>

            <div className="bg-white w-[26rem] h-[18rem] rounded-3xl py-10 flex flex-col items-center shadow-sm gap-4 px-6">
              <div className="bg-[#ecfdf5] rounded-3xl p-3 w-fit">
                <Clock size={32} color="#059669" />
              </div>

              <div className="text-center font-bold text-xl text-[#111827] ">
                Live Chat
              </div>

              <div className="text-center text-sm text-[#6b7280]">
                Chat with us online
              </div>

              <div className="text-[#059669] font-bold text-base flex gap-2 items-center cursor-pointer mt-auto">
                Start Chat
                <ArrowRight size={14} color="#059669" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

//  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center p-6 bg-gray-50 rounded-xl">
//               <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
//                 <Mail className="h-6 w-6 text-green-600" />
//               </div>
//               <h3 className="font-semibold text-lg mb-2">Email Support</h3>
//               <p className="text-gray-600 mb-4">Get help via email</p>
//               <Button
//                 variant="outline"
//                 className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
//               >
//                 campaigns@chainfundit.com
//               </Button>
//             </div>

//             <div className="text-center p-6 bg-gray-50 rounded-xl">
//               <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
//                 <Phone className="h-6 w-6 text-green-600" />
//               </div>
//               <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
//               <p className="text-gray-600 mb-4">Speak with our team</p>
//               <Button
//                 variant="outline"
//                 className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
//               >
//                 +44 20 3838 0360
//               </Button>
//             </div>

//             <div className="text-center p-6 bg-gray-50 rounded-xl">
//               <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
//                 <Clock className="h-6 w-6 text-green-600" />
//               </div>
//               <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
//               <p className="text-gray-600 mb-4">Chat with us online</p>
//               <Button className="bg-green-600 hover:bg-green-700 text-white">
//                 Start Chat
//               </Button>
//             </div>
//           </div>
