"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/ui/user-avatar";
import { useUserProfile } from "@/hooks/use-user-profile";
import SessionStatusIndicator from "./SessionStatusIndicator";
import { NotificationAlert } from "./NotificationAlert";
import SearchIcon from "@/public/icons/SearchIcon";
import { campaignComments } from "@/lib/schema";
import { useIsMobile } from "@/hooks/useIsMobile";
import { emitter } from "@/hooks/eventBus";

type Props = {};

const SearchBar = (props: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { profile } = useUserProfile();

  const isMobile = useIsMobile();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
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
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userName = profile?.fullName || "Your Account";
  const userEmail = profile?.email || "user@chainfundit.com";
  const userRole = profile?.role || "User";
  const avatarSrc = profile?.avatar || "/images/user.png";
  const avatarInitial =
    profile?.fullName?.charAt(0)?.toUpperCase() ||
    userEmail?.charAt(0)?.toUpperCase() ||
    "U";

  const userDetail = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 transition hover:bg-[#F8F8F8] focus:outline-none"
          >
            <UserAvatar size={28} />
            {!isMobile && (
              <>
                <div className="flex flex-col text-left gap-[2px] justify-centerEes">
                  <span className="text-[12px] leading-[12px] font-bold text-[#111827]">
                    {userName}
                  </span>
                  <span className="text-[10px] leading-[10px] text-[#6B7280]">
                    {userRole}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-[#6B7280]" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl border border-[#E8E8E8] p-3"
        >
          <DropdownMenuLabel className="flex items-center gap-3 p-0">
            <Avatar className="h-9 w-9 border border-[#E8E8E8]">
              <AvatarImage src={avatarSrc} alt={userName} />
              <AvatarFallback className="text-sm font-semibold text-[#104901]">
                {avatarInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#104901]">
                {userName}
              </span>
              <span className="text-xs text-[#6B7280]">{userEmail}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem asChild>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 text-sm text-[#1F2937] cursor-pointer"
            >
              <Settings className="h-4 w-4 text-[#6B7280]" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2" />
          <DropdownMenuItem
            onSelect={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <>
      <div className="border-b border-[#F3F4F6] flex px-8 py-2  font-jakarta font-bold text-[16px] leading-[14px] text-[#6B7280] items-center md:justify-end justify-between">
        {isMobile && (
          <div
            className="p-[14px]"
            onClick={() => {
              emitter.emit("openSideBar");
            }}
          >
            <Menu />
          </div>
        )}

        <div className="flex md:gap-5 gap-2 items-center">
          <NotificationAlert />
          {!isMobile && (
            <div className="w-px h-7 border border-[#E5E7EB]"></div>
          )}
          {userDetail()}
        </div>
      </div>
    </>
  );
};

export default SearchBar;
