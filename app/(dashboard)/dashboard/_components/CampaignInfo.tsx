"use client";

import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { R2Image } from "@/components/ui/r2-image";
import { EmojiFallbackImage } from "@/components/ui/emoji-fallback-image";

import { formatCurrency } from "@/lib/utils/currency";
import { needsEmojiFallback } from "@/lib/utils/campaign-emojis";
import { capitalizeFirstLetter } from "@/lib/utils/helperFunction";

import ClockIcon from "@/public/icons/ClockIcon";

export type CampaignInfoProps = {
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
};

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
}: CampaignInfoProps) => {
  const router = useRouter();
  const imageExist = !needsEmojiFallback(imageUrl);

  return (
    <div className="w-[360px] h-[30rem] border border-[#F3F4F6] bg-white rounded-[14px] flex flex-col overflow-hidden">
      <div className="relative">
        {imageExist ? (
          <R2Image
            src={imageUrl}
            alt={title}
            width={357}
            height={100}
            className="w-full h-[200px] object-cover"
          />
        ) : (
          <EmojiFallbackImage width={357} height={100} category={reason} />
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


