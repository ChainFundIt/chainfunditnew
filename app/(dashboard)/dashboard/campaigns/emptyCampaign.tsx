import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const EmptyCampaign = ({
  title,
  subtitle,
  children,
  Icon,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  Icon?: any;
}) => {
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-center font-jakarta h-[50vh] ">
      <div className="flex flex-col items-center text-center  gap-6 w-[600px]">
        {Icon && <Icon className="h-16 w-16 text-[#C0BFC4]" />}
        <div
          style={{
            fontSize: "32px",
            color: "#104109",
            fontWeight: "700",
            lineHeight: "40px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#104109",
            lineHeight: "20px",
          }}
        >
          {subtitle}
        </div>
        {children}
      </div>
    </div>
  );
};

export default EmptyCampaign;
