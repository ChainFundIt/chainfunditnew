"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CompleteProfile from "../complete-profile";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/currency";
import { ArrowRight, TrendingUp } from "lucide-react";
import { R2Image } from "@/components/ui/r2-image";
import { Loader } from "@/components/ui/Loader";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import Card from "./_components/Card/page";
import CreditCardIcon from "@/public/icons/CreditCardIcon";
import HeartBeat from "@/public/icons/HeartBeat";
import GiftIcon from "@/public/icons/GiftIcon";
import PeopleIcon from "@/public/icons/PeopleIcon";
import { CampaignsIcon } from "@/public/icons/CampaignsIcon";
import ClockIcon from "@/public/icons/ClockIcon";
import { capitalizeFirstLetter } from "@/lib/utils/helperFunction";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalDonations: number;
  totalDonors: number;
  primaryCurrency: string;
  recentDonations: Array<{
    id: string;
    amount: number;
    currency: string;
    message: string;
    donorName: string;
    donorAvatar: string | null;
    campaignTitle: string;
    createdAt: string;
  }>;
}

interface Campaign {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  status: string;
  isActive: boolean;
  coverImageUrl: string;
  progressPercentage: number;
  donationCount: number;
  createdAt: string;
  description: string;
  fundraisingFor?: string;
  reason?: string; // Campaign category for emoji fallback
}

export const CampaignInfo = ({
  imageUrl,
  title,
  currentAmount,
  goalAmount,
  currency,
  progressDivision,
  id,
  reason,
  fundRaisingFor,
  description,
  status,
  showEdit = false,
}: {
  imageUrl: string;
  title: string;
  currentAmount: number;
  goalAmount: number;
  currency: string;
  progressDivision: number;
  id: string;
  reason: string;
  fundRaisingFor: string;
  description: string;
  status: string;
  showEdit?: boolean;
}) => {
  const router = useRouter();
  const imageExist = !needsEmojiFallback(imageUrl);
  return (
    <div className="w-[360px] h-[30rem] border border-[#F3F4F6] bg-white rounded-[14px] flex flex-col overflow-hidden">
      <div className="relative">
        {imageExist ? (
          <R2Image src={imageUrl} alt={title} width={357} height={168} />
        ) : (
          <EmojiFallbackImage width={357} height={168} category={reason} />
        )}

        <div className="flex items-center justify-center w-[90px] h-[21px] bg-white rounded-full font-bold text-[10px] leading-[14px] text-[#104109] absolute top-[10px] left-[10px]">
          {fundRaisingFor}
        </div>

        <div className="flex gap-1 w-fit h-[21px] px-2 bg-[#00000099] rounded-full items-center justify-center absolute right-[10px] top-[10px]">
          <ClockIcon />
          <div className="text-[11px] font-bold leading-[14px] text-white">
            {capitalizeFirstLetter(status)}
          </div>
        </div>
      </div>

      <div className="p-[18px] flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2">
          <div className="font-bold text-[16px] leading-[22px] text-[#111827] truncate">
            {title}
          </div>
          <div className="text-[#6B7280] text-[12px] font-normal leading-[18px] line-clamp-3 text-ellipsis">
            {description}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <div className="text-[#104109] font-bold text-[12px] leading-[18px]">
                {formatCurrency(currentAmount, currency)}
                <span className="text-[#6b7280] font-normal text-[12px] leading-[18px]">
                  {" "}
                  raised
                </span>
              </div>
              <div className="text-[#6b7280] font-medium text-[12px] leading-[18px]">
                of {formatCurrency(goalAmount, currency)}
              </div>
            </div>

            <div className="h-[8px] w-full bg-[#f3f4f6] rounded-full relative">
              <div
                className="h-[8px] bg-[#104109] rounded-full absolute"
                style={{ width: `${progressDivision}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {showEdit && (
              <Button
                onClick={() => {
                  router.push(`/dashboard/campaigns/edit/${id}`);
                }}
                className="border border-[#104109] rounded-[11px] bg-white flex items-center justify-center gap-2 font-semibold leading-[18px] text-[12px] text-[#104109] hover:text-white hover:bg-[#104109]"
              >
                Edit
              </Button>
            )}
            <Button
              onClick={() => {
                router.push(`/campaign/${id}`);
              }}
              className="border  rounded-[11px] flex items-center justify-center gap-2"
            >
              <div className="font-semibold leading-[18px] text-[12px] ">
                View Details
              </div>
              <TrendingUp className="text-[#104109]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const formRef = useRef<HTMLFormElement>(
    null
  ) as React.RefObject<HTMLFormElement>;

  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    async function checkProfile() {
      try {
        const res = await fetch("/api/user/profile", { method: "GET" });
        const data = await res.json();
        if (
          data.success &&
          data.user &&
          !data.user.hasCompletedProfile &&
          !data.user.hasSeenWelcomeModal
        ) {
          setShowWelcome(true);
        }
      } catch {
        // fallback: show modal if error
        setShowWelcome(true);
      } finally {
        setProfileChecked(true);
      }
    }
    checkProfile();
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!profileChecked) return;

      try {
        setLoading(true);

        // Load dashboard stats
        const statsRes = await fetch("/api/dashboard/stats");

        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        } else {
          console.error("Stats API error:", statsData.error);
        }

        // Load user campaigns
        const campaignsRes = await fetch("/api/dashboard/campaigns");
        const campaignsData = await campaignsRes.json();
        if (campaignsData.success) {
          setCampaigns(campaignsData.campaigns);
        } else {
          console.error("Campaigns API error:", campaignsData.error);
        }
        console.log(campaignsData.campaigns);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [profileChecked]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    setShowCompleteProfile(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSeenWelcomeModal: true }),
      });
    } catch {}
  };

  const calculateTimeDifference = (date: Date) => {
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // difference in seconds

    const seconds = Math.floor(diff);
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const months = Math.floor(diff / 2592000); // 30 days approx
    const years = Math.floor(diff / 31536000); // 365 days

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  };

  const DonorInfo = (
    name: string,
    title: string,
    imageUrl: string,
    amount: string,
    time: any
  ) => {
    const date = new Date(time);
    return (
      <div className="flex gap-[14px] items-center">
        <div className="relative border-2 border-white">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              width={35}
              height={35}
              className="rounded-full"
            />
          ) : (
            <div className="w-[35px] h-[35px] flex items-center justify-center rounded-full border border-[var(--color-darkGreen)">
              <span className="text-[var(--color-darkGreen)] font-bold text-lg">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute right-[-2px] bottom-[-4px] p-[1px] bg-white rounded-full">
            <CampaignsIcon
              color="var(--color-darkGreen)"
              width="10px"
              height="10px"
            />
          </div>
        </div>

        {/* Donor Info */}
        <div className="flex flex-col w-[175px]">
          <div className="truncate text-[12px] font-bold leading-[17.5px]">
            {name}
          </div>

          <div className="truncate text-[10.5px] leading-[14px] font-normal text-[#6B7280]">
            {title}
          </div>
        </div>

        {/* Amount + Time */}
        <div className="flex flex-col text-right">
          <div className="truncate text-[12px] font-bold leading-[17.5px] text-[var(--color-darkGreen)]">
            +{amount}
          </div>

          <div className="truncate text-[10.5px] leading-[14px] font-normal text-[#6B7280]">
            {calculateTimeDifference(date)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Welcome Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className='w-[80%] max-w-md md:max-w-xl bg-[url("/images/heart.jpg")] bg-cover h-[400px] md:h-[600px] px-4 md:px-10 bg-no-repeat rounded-none outline-none font-source'>
          <DialogHeader>
            <div className="h-[3px] w-full bg-[#2C2C2C] rounded-none overflow-hidden mb-4">
              <div
                className="h-full bg-white animate-grow"
                style={{
                  animation: "grow 3s linear forwards",
                }}
              ></div>
            </div>
            <DialogTitle className="flex gap-2 justify-center items-center">
              <Image
                src="/images/logo-white.png"
                alt=""
                width={24}
                height={24}
                className="md:w-8 md:h-8"
              />
              <p className="font-semibold text-2xl md:text-4xl text-white text-center">
                Welcome to Chainfundit
              </p>
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex items-end">
            <Button
              className="w-full h-14 md:h-[72px] font-sans font-semibold text-lg md:text-2xl flex justify-between items-center rounded-3xl"
              onClick={handleCloseWelcome}
            >
              Complete your profile
              <ArrowRight size={20} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Profile Modal */}
      <Dialog open={showCompleteProfile} onOpenChange={setShowCompleteProfile}>
        <DialogContent className="bg-[#F5F5F5] max-w-md md:max-w-xl rounded-none font-source">
          <DialogHeader>
            <DialogTitle className="font-source font-semibold text-left text-2xl md:text-4xl text-[#104901]">
              Complete Your Profile
            </DialogTitle>
            <p className="font-normal text-base md:text-xl text-[#104901] text-left text-wrap">
              Enter your name and choose an avatar so your friends can recognise
              you.
            </p>
          </DialogHeader>
          <div className="py-4 md:py-5">
            <CompleteProfile
              formRef={formRef}
              onSuccess={() => setShowCompleteProfile(false)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                formRef.current?.requestSubmit();
              }}
              className="w-full h-14 md:h-[72px] flex justify-between items-center font-semibold text-lg md:text-2xl rounded-3xl"
            >
              Here we go! <ArrowRight size={20} className="md:w-6 md:h-6" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="bg-[#F0F7Ef] p-6 font-jakarta md:min-h-[calc(100vh-122px)] ">
        <div className="flex flex-col gap-7">
          {/* Dashboard Heading */}
          <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-5">
            <div className="flex flex-col">
              <div className="text-[var(--color-darkGreen)] text-[26px] font-extrabold leading-[31.5px]">
                Dashboard
              </div>
              <div className="text-[#6B7280] text-[14px] font-medium leading-[21px]">
                Welcome back! Here's what's happening with your campaigns.
              </div>
            </div>

            <Button
              onClick={() => {
                router.push("/dashboard/campaigns/create-campaign");
              }}
              className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                       items-center justify-center py-3 h-auto md:w-fit w-full"
            >
              <div> Start a Campaign</div>

              <ArrowRight height={18} width={18} />
            </Button>
          </div>
          <div className="flex md:flex-row flex-col gap-6 flex-wrap">
            <div className="flex flex-col gap-6 md:mr-16">
              {/* Cards */}
              <div className="flex gap-5 md:flex-row flex-col">
                <Card
                  containerStyle={isMobile ? { width: "100%" } : {}}
                  bgColor="#104109"
                  value={stats?.totalCampaigns || 0}
                  text="TOTAL CAMPAIGNS"
                  Icon={CreditCardIcon}
                />
                <Card
                  containerStyle={isMobile ? { width: "100%" } : {}}
                  bgColor="var(--color-lightGreen)"
                  value={stats?.activeCampaigns || 0}
                  text="ACTIVE CAMPAIGNS"
                  Icon={HeartBeat}
                />
                <Card
                  containerStyle={isMobile ? { width: "100%" } : {}}
                  bgColor="#104109"
                  value={stats?.totalDonors || 0}
                  text="TOTAL DONORS"
                  Icon={PeopleIcon}
                />
                <Card
                  containerStyle={isMobile ? { width: "100%" } : {}}
                  bgColor="var(--color-lightGreen)"
                  value={formatCurrency(
                    stats?.totalDonations || 0,
                    stats?.primaryCurrency || "GBP"
                  )}
                  text="TOTAL DONATION"
                  Icon={GiftIcon}
                />
              </div>

              {/* ACTIVE CAMPAIGNS  */}
              <div className="flex items-center justify-between">
                {/* Your Active Campaigns*/}
                <div className="flex flex-col gap-5 w-full">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <div className="text-[#111827] text-[18px] font-bold leading-[25px]">
                        Your Active Campaigns
                      </div>
                    </div>

                    <div
                      className="flex gap-1 items-center cursor-pointer"
                      onClick={() => {
                        router.push("/dashboard/campaigns");
                      }}
                    >
                      <div className="text-[13px] font-bold leading-[17px] text-[#104109]">
                        View All Campaigns
                      </div>
                      <ArrowRight height={18} width={18} />
                    </div>
                  </div>

                  <div className="flex gap-6 md:flex-row flex-col items-center md:w-fit w-full">
                    {loading && (
                      <div className="md:w-[720px] w-full h-[400px] flex items-center justify-center gap-4">
                        <Loader color="#104109" />
                        <div
                          style={{
                            fontSize: "28px",
                            lineHeight: "20px",
                            fontWeight: "700",
                            color: "#104109",
                          }}
                        >
                          Loading Campaigns ...
                        </div>
                      </div>
                    )}
                    {!loading &&
                      campaigns.slice(0, 2).map((data) => {
                        return (
                          <div key={data.id}>
                            <CampaignInfo
                              imageUrl={data.coverImageUrl}
                              title={data.title}
                              currentAmount={data.currentAmount}
                              goalAmount={data.goalAmount}
                              currency={data.currency}
                              progressDivision={data.progressPercentage}
                              reason={data.reason || "Uncategorized"}
                              id={data.slug}
                              description={data.description}
                              status={data.status}
                              fundRaisingFor={data.fundraisingFor || "Charity"}
                            />
                          </div>
                        );
                      })}

                    {/* ===== Dotted Campaign Card ===== */}
                    <div
                      className="w-[360px] h-[400px] border-dashed border-2 border-[#e5e7eb] rounded-[14px] flex flex-col bg-transparent items-center justify-center cursor-pointer"
                      onClick={() => {
                        router.push("/dashboard/campaigns/create-campaign");
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-4 w-[200px]">
                        <div className="bg-[#f0fdf4] rounded-full flex items-center justify-center w-[56px] h-[56px] shadow-[0_1px_2px_0_#00000080]">
                          <HeartBeat
                            width="32px"
                            height="32px"
                            color="#104109"
                          />
                        </div>

                        <div className="font-bold text-[16px] leading-[25px] text-[#111827]">
                          Start New Campaign
                        </div>

                        <div className="text-[#6b7280] font-normal leading-[18px] text-[12px] text-center">
                          Launch a new fundraiser and start making an impact
                          today
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center pb-8 ">
              {/* Recent Donations */}
              <div className="w-[354px] h-[424px] flex flex-col gap-5 border border-[#F3F4F6] bg-white p-[28px] rounded-[21px] ">
                <div className="text-[18px] leading-[24px] font-bold text-[#111827]">
                  Recent Donations
                </div>

                {stats &&
                  (stats.recentDonations.length > 0 ? (
                    stats.recentDonations
                      .slice(0, 5)
                      .map((data) =>
                        DonorInfo(
                          data.donorName,
                          data.campaignTitle,
                          data.donorAvatar || "",
                          formatCurrency(data.amount, data.currency),
                          data.createdAt
                        )
                      )
                  ) : (
                    <div className="flex items-center text-[#111827] h-full justify-center text-[24px] font-bold leading-[14px]">
                      No Donations Yet
                    </div>
                  ))}

                <Button
                  className="bg-white border border-[#E5E7EB] rounded-[10.5px] font-bold text-[12px] leading-[18px] text-[#4b5563] mt-auto "
                  onClick={() => {
                    router.push("/dashboard/donations");
                  }}
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
