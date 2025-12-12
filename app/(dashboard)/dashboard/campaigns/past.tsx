import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Campaign } from "./types";
import { getCampaignStatus } from "@/lib/utils/campaign-status";
import EmptyCampaign from "./emptyCampaign";
import { useRouter } from "next/navigation";
import { CampaignInfo } from "../page";

type Props = {
  campaigns: Campaign[];
};

const PastCampaigns = ({ campaigns }: Props) => {
  const isEmpty = campaigns.length === 0;
  const router = useRouter();

  if (isEmpty) {
    return (
      <EmptyCampaign
        title="No Past Campaigns"
        subtitle="Want to start your own fundraiser? Click the button below."
      >
        <Button
          onClick={() => {
            router.push("/dashboard/campaigns/create-campaign");
          }}
          className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                             items-center justify-center py-3 h-auto md:w-fit w-full"
        >
          <div> Start a Campaign</div>

          <PlusIcon height={18} width={18} />
        </Button>
      </EmptyCampaign>
    );
  }

  const convertCampaignStatus = (status: any) => {
    if (status === "expired") {
      return "Expired";
    } else if (status === "goal_reached") {
      return "Goal Reached";
    } else if (status === "closed") {
      return "Closed";
    }
    return "Past";
  };

  return (
    <div className="flex flex-col gap-8">
      <div className=" flex md:justify-start justify-center">
        <div className="flex md:flex-row flex-col flex-wrap w-fit justify-center  gap-4">
          {campaigns.map((data, index) => {
            return (
              <div key={index}>
                <CampaignInfo
                  imageUrl={data.coverImageUrl}
                  title={data.title}
                  currentAmount={data.currentAmount}
                  goalAmount={data.goalAmount}
                  currency={data.currency}
                  progressDivision={Math.min(
                    100,
                    Math.round((data.currentAmount / data.goalAmount) * 100)
                  )}
                  reason={data.reason || "Uncategorized"}
                  id={data.slug}
                  description={data.description}
                  status={convertCampaignStatus(getCampaignStatus(data).status)}
                  fundRaisingFor={data.fundraisingFor || "Charity"}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Link href="/dashboard/campaigns/create-campaign">
          <Button
            onClick={() => {
              router.push("/dashboard/campaigns/create-campaign");
            }}
            className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                        items-center justify-center py-3 h-auto md:w-fit w-full"
          >
            <div> Start a Campaign</div>

            <Plus height={18} width={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PastCampaigns;
