"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Bitcoin,
  CheckCircle,
  Users,
  LinkIcon,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react";
import CTA from "./cta";
import ChainModal from "./chain-modal";
import DonateModal from "./donate-modal";
import ShareModal from "./share-modal";
import { useAuth } from "@/hooks/use-auth";

interface CampaignData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  reason: string;
  fundraisingFor: string;
  duration: string;
  videoUrl?: string;
  coverImageUrl?: string;
  galleryImages: string[];
  documents: string[];
  goalAmount: number;
  currency: string;
  minimumDonation: number;
  chainerCommissionRate: number;
  currentAmount: number;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  stats: {
    totalDonations: number;
    totalAmount: number;
    uniqueDonors: number;
    progressPercentage: number;
  };
}

interface MainProps {
  campaignId: string;
  initialCampaignData: CampaignData | null;
}

const Main: React.FC<MainProps> = ({ campaignId, initialCampaignData }) => {
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<CampaignData | null>(initialCampaignData || null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("why-support");
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(!initialCampaignData);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaign data if not provided initially
  useEffect(() => {
    if (!initialCampaignData && campaignId) {
      const fetchCampaign = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`/api/campaigns/${campaignId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch campaign');
          }
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch campaign');
          }
          setCampaign(result.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch campaign');
          console.error('Error fetching campaign:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCampaign();
    }
  }, [campaignId, initialCampaignData]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading campaign...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This campaign could not be loaded.'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Use campaign data for images
  const images = campaign.galleryImages.length > 0 
    ? [campaign.coverImageUrl, ...campaign.galleryImages].filter(Boolean) as string[]
    : ["/images/story-1.png", "/images/thumbnail1.png", "/images/thumbnail2.png", "/images/thumbnail3.png", "/images/thumbnail4.png", "/images/thumbnail5.png"];

  // Mock data for now - these would come from API calls
  const donors = [
    {
      image: "/images/donor1.png",
      name: "Angela Bassett",
      amount: `${campaign.currency}125,000`,
    },
    {
      image: "/images/donor2.png",
      name: "Alexander Iwobi",
      amount: `${campaign.currency}120,000`,
    },
    {
      image: "/images/donor3.png",
      name: "Chichi Onwuegbo",
      amount: `${campaign.currency}100,000`,
    },
    {
      image: "/images/donor4.png",
      name: "Kareem Kapoor",
      amount: `${campaign.currency}100,000`,
    },
    {
      image: "/images/donor5.png",
      name: "Sergio Texeira",
      amount: `${campaign.currency}80,000`,
    },
    {
      image: "/images/donor6.png",
      name: "Ruslev Mikhailsky",
      amount: `${campaign.currency}50,000`,
    },
  ];

  const chainers = [
    {
      image: "/images/donor1.png",
      name: "Angela Bassett",
      numberOfDonations: 20,
      amount: `${campaign.currency}125,000`,
    },
    {
      image: "/images/donor6.png",
      name: "Ruslev Mikhailsky",
      numberOfDonations: 12,
      amount: `${campaign.currency}250,000`,
    },
    {
      image: "/images/donor2.png",
      name: "Alexander Iwobi",
      numberOfDonations: 6,
      amount: `${campaign.currency}150,000`,
    },
  ];

  const comments = [
    {
      id: 1,
      image: "/images/donor1.png",
      name: "Angela Bassett",
      dontation: `${campaign.currency}20,000`,
      time: "32 minutes ago",
      comment:
        "This is such a cool cause! Hope you and your kids get the best flat available in Knightsbridge.",
      creator: {
        name: campaign.creatorName,
        comment: "Thank you so much Angie!",
        time: "22 minutes ago",
      },
    },
  ];

  const handleLike = async () => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement like/unlike API call
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = () => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      return;
    }
    setDonateModalOpen(true);
  };

  const handleChain = () => {
    if (!user) {
      // TODO: Show login modal or redirect to login
      return;
    }
    setChainModalOpen(true);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: campaign.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-[1440px] bg-[url('/images/logo-bg.svg')] bg-[length:60%] md:bg-[length:30%] md:h-full bg-no-repeat bg-right-bottom mx-auto mt-16 md:mt-28 h-full p-5 md:p-12 font-source">
      <div className="flex md:flex-row md:gap-5 flex-col">
        {/* Left Side */}
        <div className="w-full md:w-3/5">
          <div className="flex flex-col gap-2">
            <h1 className="md:text-4xl text-2xl font-semibold text-black">
              {campaign.title}
            </h1>
            <p className="font-normal text-base md:text-2xl text-black">
              {campaign.subtitle}
            </p>
          </div>
          {/* Main Image */}
          <div className="w-full flex mb-4 mt-10">
            <div className="relative w-[866px] overflow-hidden">
              <Image
                src={images[selectedImage]}
                alt={`Gallery image ${selectedImage + 1}`}
                style={{ objectFit: "cover" }}
                width={866}
                height={560}
                priority
              />
            </div>
          </div>
          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={img}
                onClick={() => setSelectedImage(idx)}
                className={`relative md:w-[131px] w-[60px] md:h-[84px] h-[60px] border-2 ${
                  selectedImage === idx
                    ? "border-[#104901]"
                    : "border-transparent"
                } overflow-hidden focus:outline-none`}
                aria-label={`Show image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>

          <p className="font-medium text-2xl text-[#757575] md:my-1 my-3">
            Organised by{" "}
            <span className="font-semibold text-[#104901]">{campaign.creatorName}</span>{" "}
            for the{" "}
            <span className="font-semibold text-[#104901]">{campaign.fundraisingFor}</span>
          </p>
          <div className="flex md:flex-row flex-col gap-2 justify-between md:items-center pb-5 border-b border-[#ADADAD]">
            <section className="flex gap-2 items-center">
              <p className="font-medium text-sm md:text-xl text-[#757575]">
                Category:
              </p>
              <span className="font-medium text-sm md:text-xl text-[#104901]">
                {campaign.reason}
              </span>
            </section>

            <section className="flex gap-2 items-center">
              <Button
                className="font-medium text-lg text-[#2C2C2C] rounded-lg border-2 border-[#E7C9A5]"
                style={{
                  background:
                    "linear-gradient(180deg, #FFFAD2 0%, #FFAF69 100%)",
                }}
              >
                <CheckCircle /> Verified
              </Button>
              <Button
                className="font-medium text-lg text-[#2C2C2C] rounded-lg border-2 border-[#A5C7E7]"
                style={{
                  background:
                    "linear-gradient(180deg, #D2F3FF 0%, #45BFFD 100%)",
                }}
              >
                <Bitcoin />
                Accepts Crypto
              </Button>
            </section>
          </div>

          <section className="flex justify-between items-center mt-5">
            <p className="text-xl md:text-3xl font-medium my-1 text-black">
              {formatCurrency(campaign.currentAmount)} raised
            </p>
            <p className="font-medium text-lg md:text-2xl text-[#757575]">
              {campaign.stats.progressPercentage}% of {formatCurrency(campaign.goalAmount)} goal
            </p>
          </section>
          {/* Progress bar */}
          <div className="w-full bg-[#D9D9D9] h-2 my-1">
            <div
              className="bg-[#104901] h-full transition-all duration-500"
              style={{
                width: `${campaign.stats.progressPercentage}%`,
              }}
            ></div>
          </div>
          <section className="flex justify-between items-center">
            <p className="text-lg text-[#868686] flex gap-1 items-center">
              <Users size={20} />
              {campaign.stats.uniqueDonors} donors
            </p>
            <p className="text-lg text-[#868686] flex gap-1 items-center">
              <LinkIcon size={20} /> {chainers.length} chains
            </p>
          </section>

          {/* Tabbed Interface */}
          <div className="p-6 my-5">
            {/* Tabs */}
            <div className="flex w-fit">
              <button
                onClick={() => setActiveTab("why-support")}
                className={`md:px-5 px-2 py-3 border-x border-t border-[#C0BFC4] rounded-t-lg font-semibold text-lg md:text-3xl ${
                  activeTab === "why-support"
                    ? "bg-[#E7EDE6] text-[#104901]"
                    : "text-[#868686]"
                }`}
              >
                Why support my campaign
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`md:px-5 px-2 py-3 border-r border-t border-[#C0BFC4] rounded-tr-lg font-semibold text-lg md:text-3xl relative ${
                  activeTab === "updates"
                    ? "bg-[#E7EDE6] text-[#104901]"
                    : "text-[#868686]"
                }`}
              >
                Updates
                <span className="absolute -top-1 -right-1 bg-[#E8F5E8] text-[#104901] text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white">
                  1
                </span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "why-support" && (
              <div className="bg-[#F2F1E9] border-x border-b border-[#C0BFC4] font-normal text-sm md:text-xl text-[#104901] p-3 md:p-6 space-y-4">
                <p className="">
                  {campaign.description}
                </p>

                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="">»</span>
                    <span>
                      {campaign.reason}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {activeTab === "updates" && (
              <div className="bg-[#F2F1E9] border-x border-b border-[#C0BFC4] font-normal text-sm md:text-xl text-[#104901] p-3 md:p-6 space-y-4">
                <div className="space-y-4">
                  <div className="border-l-4 border-[#104901] pl-4">
                    <h3 className="font-semibold text-lg">Campaign Update</h3>
                    <p className="text-sm text-gray-600">2 days ago</p>
                    <p>Thank you to everyone who has supported this campaign so far! We're making great progress towards our goal.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-2/5 space-y-6">
          {/* CTA Section */}
          <div className="bg-[#F2F1E9] p-6 rounded-lg">
            <h2 className="font-semibold text-2xl text-[#104901] mb-4">
              Support this campaign
            </h2>
            <div className="space-y-4">
              <Button
                onClick={handleDonate}
                className="w-full bg-[#104901] text-white hover:bg-[#0a3a0a] h-12 text-lg"
              >
                Donate Now
              </Button>
              <Button
                onClick={handleChain}
                variant="outline"
                className="w-full border-[#104901] text-[#104901] hover:bg-[#104901] hover:text-white h-12 text-lg"
              >
                Chain this campaign
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-[#104901] text-[#104901] hover:bg-[#104901] hover:text-white h-12 text-lg"
              >
                Share campaign
              </Button>
              <Button
                onClick={handleLike}
                disabled={loading}
                variant="outline"
                className={`w-full border-[#104901] text-[#104901] hover:bg-[#104901] hover:text-white h-12 text-lg ${
                  isLiked ? 'bg-[#104901] text-white' : ''
                }`}
              >
                <Heart size={20} className="mr-2" />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
            </div>
          </div>

          {/* Recent Donors */}
          <div className="space-y-3">
            <h3 className="font-semibold text-3xl text-[#104901]">
              Recent donors
            </h3>
            <ul className="space-y-3">
              {donors.slice(0, 3).map((donor, index) => (
                <li key={index} className="flex gap-3 items-center">
                  <Image src={donor.image} alt="" width={40} height={40} />
                  <section>
                    <p className="font-normal text-xl text-[#5F8555]">
                      {donor.name}
                    </p>
                    <p className="font-medium text-xl text-black">
                      {donor.amount} •{" "}
                      <span className="font-normal text-lg text-[#5F8555]">
                        Recent donation
                      </span>{" "}
                    </p>
                  </section>
                </li>
              ))}
            </ul>
            <section className="flex justify-center">
              <Button
                className="bg-white h-12 font-semibold text-[#104901] text-lg px-4 py-1.5 border-2 border-[#104901] rounded-none"
                variant="ghost"
              >
                See all donors
              </Button>
            </section>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-3xl text-[#104901]">
              Top Comments
            </h3>
            {comments.map((comment) => (
              <div className="" key={comment.id}>
                <section className="bg-[#F2F1E9] w-full p-5 space-y-3 rounded-t-xl">
                  <section className="flex gap-3 items-start">
                    <Image src={comment.image} alt="" width={40} height={40} />
                    <section className="space-y-2">
                      <p className="font-semibold text-lg text-[#104901]">
                        {comment.name}{" "}
                        <span className="font-normal">made a donation of </span>{" "}
                        {comment.dontation}
                      </p>
                      <p className="font-name text-base text-[#104901]">
                        {comment.time}
                      </p>
                      <p className="font-normal text-2xl text-[#104901]">
                        {comment.comment}
                      </p>
                      <div className="flex justify-between gap-5 items-center">
                        <section className="flex gap-2 items-center font-normal text-base text-[#104901]">
                          <Heart color="black" size={20} /> Like
                        </section>
                        <section className="flex gap-2 items-center font-normal text-base text-[#104901]">
                          <MessageSquare color="black" size={20} /> Comment
                        </section>
                        <section className="flex gap-2 items-center font-normal text-base text-[#104901]">
                          <Send color="black" size={20} /> Share
                        </section>
                      </div>
                    </section>
                  </section>
                </section>
                <section className="bg-[#D9D9D9] w-full p-5 shadow-lg rounded-b-xl">
                  {comment.creator && (
                    <div className="">
                      <section className="flex gap-2 items-center font-semibold text-base text-[#104901]">
                        <Heart color="black" size={20} />{" "}
                        <p>
                          Mojisola <span className="font-normal">and</span> 12
                          others
                        </p>
                      </section>
                      <p className="font-semibold text-lg text-[#104901] flex gap-2 items-center">
                        {comment.creator.name}
                        <span className="font-normal text-[#104901]">
                          {comment.creator.comment}
                        </span>
                      </p>
                      <p className="text-xs text-[#104901]">
                        {comment.creator.time}
                      </p>
                    </div>
                  )}
                </section>
              </div>
            ))}
            <section className="flex justify-center">
              <Button className="bg-transparent h-12 text-[#104901] border-2 border-[#104901]">
                See all coments
              </Button>
            </section>
          </div>
        </div>
      </div>
      <CTA />
      <ChainModal 
        open={chainModalOpen} 
        onOpenChange={setChainModalOpen} 
        campaign={campaign}
      />
      <DonateModal 
        open={donateModalOpen} 
        onOpenChange={setDonateModalOpen} 
        campaign={campaign}
      />
      <ShareModal 
        open={shareModalOpen} 
        onOpenChange={setShareModalOpen} 
        campaign={campaign}
      />
    </div>
  );
};

export default Main;
