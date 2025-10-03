"use client";

import { Share, PiggyBank } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { LifeBuoy } from "react-feather";
import { BiDonateHeart } from "react-icons/bi";

type Props = {};

const links = [
  {
    href: "/dashboard/campaigns",
    icon: <PiggyBank size={24} />,
    label: "Campaigns",
  },
  {
    href: "/donations",
    icon: <BiDonateHeart size={24} />,
    label: "Donations",
  },
  {
    href: "/payouts",
    icon: <Share size={24} />,
    label: "Payouts",
  },
  {
    href: "/settings",
    icon: <LifeBuoy size={24} />,
    label: "Settings",
  },
];

const MobileSidebar = (props: Props) => {
  const pathname = usePathname();

  return (
    <div className="md:hidden w-full bg-white border-b border-[#C0BFC4] sticky top-0 z-40">
      <div className="flex px-4 py-2 gap-1 overflow-x-auto scrollbar-hide">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 p-2 min-w-[80px] rounded-lg transition-colors ${
              pathname === link.href
                ? "bg-[#FFFEF8] text-[#104901] shadow-sm"
                : "text-[#8E8C95] hover:bg-gray-50"
            }`}
          >
            <section
              className={`${pathname === link.href ? "text-[#5F8555]" : "text-black"}`}
            >
              {link.icon}
            </section>
            <span className="text-xs font-medium text-center">{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileSidebar;
