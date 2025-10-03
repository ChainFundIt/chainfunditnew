import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1440px] mx-auto mt-20 px-4 md:px-10 py-4 md:py-10">
        <h1 className="text-2xl font-bold">Terms and Conditions</h1>
      </div>
      <Footer />
    </div>
  );
};

export default page;
