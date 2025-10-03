import React from "react";
import Navbar from "@/components/dashboard/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-[1440px] min-h-screen mx-auto bg-whitesmoke">
      <Navbar />
      <div className="w-full px-4 md:px-14 py-4 md:py-10 bg-whitesmoke bg-[url('/images/logo-bg.svg')] bg-[length:60%] md:bg-[length:30%] bg-no-repeat bg-left-bottom">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default layout;
