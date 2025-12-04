"use client";

import { CampaignsIcon } from "@/public/icons/CampaignsIcon";

import DashboardIcon from "@/public/icons/DashboardIcon";
import { DonationsIcon } from "@/public/icons/DonationsIcon";
import { PayoutsIcon } from "@/public/icons/PayoutsIcon";
import { SettingsIcon } from "@/public/icons/SettingsIcon";
import SignOut from "@/public/icons/SignOut";
import { Share, PackageOpen, LogOut } from "lucide-react";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { LifeBuoy } from "react-feather";
import { BiDonateHeart } from "react-icons/bi";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { emitter } from "@/hooks/eventBus";

type Props = {};

const links = [
  {
    href: "/dashboard/campaigns",
    icon: <PackageOpen size={40} />,
    label: "Campaigns",
  },
  {
    href: "/donations",
    icon: <BiDonateHeart size={40} />,
    label: "Donations",
  },
  {
    href: "/payouts",
    icon: <Share size={40} />,
    label: "Payouts",
  },
  {
    href: "/settings",
    icon: <LifeBuoy size={40} />,
    label: "Settings",
  },
];
const sideBarButtons = [
  {
    icon: DashboardIcon,
    label: "Dashboard",
    url: "/dashboard",
  },
  { icon: CampaignsIcon, label: "Campaigns", url: "/dashboard/campaigns" },
  { icon: DonationsIcon, label: "Donations", url: "/donations" },
  { icon: PayoutsIcon, label: "Payouts", url: "/payouts" },
  { icon: SettingsIcon, label: "Settings", url: "/settings" },
];

const Sidebar = (props: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    emitter.on("openSideBar", handler);
    return () => emitter.off("openSideBar", handler);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/signin");
      } else {
        toast.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={() => {
            setIsOpen(false);
          }}
          className="fixed inset-0 bg-black/40 md:hidden z-10"
        ></div>
      )}
      <div
        className={`
    z-50 bg-white font-jakarta
    h-screen md:h-[calc(100vh-61px)]
    w-64 px-4 py-7
    flex flex-col items-center gap-12
    border-r border-[#F3F4F6]

    /* Positioning */
    md:sticky md:top-[61px]
    fixed top-0 
      
    /* Mobile slide animation */
    transform transition-transform duration-300
    md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        {/* SideBarButtons */}
        <div className="flex flex-col gap-4 w-full pt-8 ">
          {sideBarButtons.map((data, index) => {
            const isSelected = pathname.startsWith(data.url);
            return (
              <div
                key={index}
                onClick={() => router.push(data.url)}
                className={`
    flex items-center gap-4 cursor-pointer p-4 rounded-[10px]
     ${isSelected ? "bg-[var(--color-darkGreen)]" : "hover:bg-[#f3f4f6]"}
  `}
              >
                <div>
                  <data.icon
                    color={isSelected ? "var(--color-yellow)" : "#9ca3af"}
                    width="1.25rem"
                    height="1.25rem"
                  />
                </div>
                <div
                  style={{
                    color: isSelected ? "white" : "#6B7280",
                    fontSize: "15px",
                    fontWeight: "600",
                    lineHeight: "23px",
                  }}
                >
                  {data.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* SignOut */}
        <div className="flex flex-col gap-2 mt-auto  w-full border-t border-[#f3f4f6] absolute bottom-0 ">
          <div className="flex flex-col h-[130px] rounded-[21px] border border-[#E0F0E0] bg-[#F0F7Ef] mt-6 mx-auto px-5 py-4 gap-2">
            <div className="font-bold text-[11px] leading-[14px] text-[#6B7280] ">
              AVAILABLE BALANCE
            </div>
            <div className="font-extrabold text-[21px] leading-[28px] text-[var(--color-darkGreen)]">
              $12,450.00
            </div>
            <Button
              onClick={() => {
                console.log("clicked");
              }}
              className=" border border-[#1041091A] bg-white text-[var(--color-darkGreen)] rounded-[10px] text-[11px] leading-[14px]"
            >
              Withdraw Funds
            </Button>
          </div>
          <div
            onClick={handleLogout}
            className=" hover:bg-[#f3f4f6]  flex items-center gap-4 cursor-pointer p-4 rounded-[10px]"
          >
            <SignOut />
            <div
              style={{ fontSize: "14px", lineHeight: "21px", color: "#9CA3AF" }}
            >
              Sign Out
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

//  <div className="w-full font-source font-semibold text-[28px] text-[#8E8C95]">
//       <div className="flex flex-col gap-2 p-4">
//         {links.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className={`flex gap-3 items-center p-4 ${
//               pathname === link.href
//                 ? "bg-[#FFFEF8] text-[#104901] shadow-sm"
//                 : ""
//             }`}
//           >
//             <section
//               className={` ${pathname === link.href ? " text-[#5F8555]" : "text-black"}`}
//             >
//               {link.icon}
//             </section>

//             {link.label}
//           </Link>
//         ))}

//         {/* Logout Button */}
//         {/* <button
//           onClick={handleLogout}
//           className="flex gap-3 p-4 text-left text-[#8E8C95] hover:bg-[#FFFEF8] hover:text-[#104901] transition-colors"
//         >
//           <LogOut size={40} className="text-black" />
//           Logout
//         </button> */}
//       </div>
//     </div>
