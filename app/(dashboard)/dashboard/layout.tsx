"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import ClientToaster from "@/components/ui/client-toaster";
import SessionTimeoutProvider from "@/components/providers/SessionTimeoutProvider";
import { TokenRefreshProvider } from "@/hooks/use-token-refresh";
import SearchBar from "@/components/dashboard/SearchBar";

type Props = {};

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TokenRefreshProvider>
      <SessionTimeoutProvider
        config={{ timeoutMinutes: 120, warningMinutes: 15 }}
      >
        <div className="flex flex-col">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <div className="flex flex-col w-full">
              <SearchBar />
              <div>{children}</div>
            </div>
          </div>
        </div>

        <ClientToaster />
      </SessionTimeoutProvider>
    </TokenRefreshProvider>
  );
};

export default layout;
