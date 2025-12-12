import { Button } from "@/components/ui/button";
import { Plus, PlusIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Campaign, transformCampaign } from "./types";
import EmptyCampaign from "./emptyCampaign";
import { useRouter } from "next/navigation";
import { CampaignInfo } from "../page";

type Props = {
  campaigns: Campaign[];
};

const LiveCampaigns = ({ campaigns }: Props) => {
  const isEmpty = campaigns.length === 0;
  const transformedCampaigns = campaigns.map(transformCampaign);
  const router = useRouter();

  if (isEmpty) {
    return (
      <EmptyCampaign
        title="No Live Campaigns"
        subtitle="Start your fundraising journey by creating your first campaign and making a difference in your community."
      >
        <Button
          onClick={() => {
            router.push("/dashboard/campaigns/create-campaign");
          }}
          className="bg-[var(--color-darkGreen)] text-[14px] leading-[21px] font-bold rounded-[10.5px] flex
                            items-center justify-center py-3 h-auto md:w-fit w-full"
        >
          <div> Create Campaign</div>

          <PlusIcon height={18} width={18} />
        </Button>
      </EmptyCampaign>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className=" flex md:justify-start justify-center">
        <div className="flex md:flex-row flex-col flex-wrap w-fit justify-center  gap-4">
          {transformedCampaigns.map((data, index) => {
            return (
              <div key={index}>
                <CampaignInfo
                  imageUrl={data.image}
                  title={data.title}
                  currentAmount={data.amountRaised}
                  goalAmount={data.goal}
                  currency={data.currency}
                  progressDivision={Math.min(
                    100,
                    Math.round((data.amountRaised / data.goal) * 100)
                  )}
                  reason={data.reason || "Uncategorized"}
                  id={data.slug}
                  description={data.description}
                  status={data.status}
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
            <div> Create Campaign</div>

            <Plus height={18} width={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LiveCampaigns;
