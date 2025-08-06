"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CardDetailsDrawer from "@/components/homepage/CardDetailsDrawer";

interface CampaignCard {
  id: string;
  title: string;
  description: string;
  raised: string;
  image: string;
  extra: string;
  date: string;
  timeLeft: string;
  avatar: string;
  creator: string;
  createdFor: string;
  percentage: string;
  total: string;
  donors: number;
}

interface CardsProps {
  campaignId: string;
}

const Cards: React.FC<CardsProps> = ({ campaignId }) => {
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRelatedCampaigns();
  }, [campaignId]);

  const fetchRelatedCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/campaigns?limit=10&exclude=' + campaignId);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch campaigns');
      }
      
      // Transform the data to match the card format
      const transformedCampaigns = data.data.map((campaign: any) => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        raised: `${campaign.currency}${campaign.currentAmount.toLocaleString()} raised`,
        image: campaign.coverImageUrl || "/images/card-img1.png",
        extra: `Goal: ${campaign.currency}${campaign.goalAmount.toLocaleString()}. ${campaign.stats.progressPercentage}% funded.`,
        date: new Date(campaign.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        timeLeft: calculateTimeLeft(campaign.duration, campaign.createdAt),
        avatar: campaign.creatorAvatar || "/images/avatar-7.png",
        creator: campaign.creatorName,
        createdFor: campaign.fundraisingFor,
        percentage: `${campaign.stats.progressPercentage}%`,
        total: `${campaign.currency}${campaign.goalAmount.toLocaleString()} total`,
        donors: campaign.stats.uniqueDonors,
      }));
      
      setCampaigns(transformedCampaigns);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(errorMessage);
      console.error('Error fetching campaigns:', err);
      
      // Fallback to mock data
      setCampaigns([
        {
          id: "1",
          title: "91 Days of Kindness Challenge",
          description:
            "Nigeria is a nation built on resilience, unity, and a love for community. This campaign aims to spread kindness across the country, one act at a time. Join us in making a difference!",
          raised: "₦1,201,000 raised",
          image: "/images/card-img1.png",
          extra: "Goal: ₦2,000,000. Over 500 acts of kindness completed so far!",
          date: "March 24, 2025",
          timeLeft: "5 days left",
          avatar: "/images/avatar-7.png",
          creator: "Adebola Ajani",
          createdFor: "Ajegunle Children's Charity",
          percentage: "40%",
          total: "₦3,000,000 total",
          donors: 64,
        },
        {
          id: "2",
          title: "Let's Help Get Jeffrey off the Streets",
          description:
            "Jeffrey has been a recognisable face in Brunswick village. This campaign is dedicated to helping him find a home and a new start. Your support can change a life.",
          raised: "$121,500 raised",
          image: "/images/card-img2.png",
          extra: "Goal: $150,000. Housing secured, now raising for job training.",
          date: "April 28, 2025",
          timeLeft: "12 days left",
          avatar: "/images/avatar-7.png",
          creator: "Adebola Ajani",
          createdFor: "Ajegunle Children's Charity",
          percentage: "93%",
          total: "₦3,000,000 total",
          donors: 64,
        },
        {
          id: "3",
          title: "Support Kamala's Tuition at West End Primary",
          description:
            "Kamala, our first daughter, won a part-scholarship to attend West End Primary. Help us cover the remaining tuition and give her the education she deserves!",
          raised: "£2,000 raised",
          image: "/images/card-img3.png",
          extra: "Goal: £5,000. 40% funded. Every bit helps Kamala stay in school!",
          date: "June 4, 2025",
          timeLeft: "7 days left",
          avatar: "/images/avatar-7.png",
          creator: "Adebola Ajani",
          createdFor: "Ajegunle Children's Charity",
          percentage: "13%",
          total: "₦3,000,000 total",
          donors: 64,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (duration: string, createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const durationDays = parseInt(duration) || 30;
    const endDate = new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const timeLeft = endDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return "Campaign ended";
    }
    
    const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
    return `${daysLeft} days left`;
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  const handlePreviousCard = () => {
    if (openCard !== null && openCard > 0) {
      setOpenCard(openCard - 1);
    }
  };

  const handleNextCard = () => {
    if (openCard !== null && openCard < campaigns.length - 1) {
      setOpenCard(openCard + 1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto p-5 md:p-12">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg text-gray-600">Loading related campaigns...</div>
        </div>
      </div>
    );
  }

  if (error && campaigns.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto p-5 md:p-12">
        <div className="flex items-center justify-center h-32">
          <div className="text-lg text-red-600">Error loading campaigns: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto p-5 md:p-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-semibold text-[#104901]">
          Other campaigns you might like
        </h2>
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={scrollLeft}
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              onClick={scrollRight}
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0"
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
      >
        {campaigns.map((campaign, index) => (
          <div
            key={campaign.id}
            className="min-w-[300px] bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setOpenCard(index)}
          >
            <div className="relative h-48">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded text-sm font-medium">
                {campaign.percentage}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[#104901] mb-2 line-clamp-2">
                {campaign.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {campaign.description}
              </p>
              <div className="space-y-2">
                <p className="font-medium text-lg text-[#104901]">
                  {campaign.raised}
                </p>
                <p className="text-sm text-gray-500">{campaign.extra}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{campaign.date}</span>
                  <span>{campaign.timeLeft}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Image
                    src={campaign.avatar}
                    alt={campaign.creator}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-sm text-gray-600">
                    by {campaign.creator}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CardDetailsDrawer
        open={openCard !== null}
        onOpenChange={(open) => setOpenCard(open ? openCard : null)}
        card={openCard !== null ? campaigns[openCard] : null}
        currentIndex={openCard || 0}
        totalCards={campaigns.length}
        onPrevious={handlePreviousCard}
        onNext={handleNextCard}
      />
    </div>
  );
};

export default Cards;
