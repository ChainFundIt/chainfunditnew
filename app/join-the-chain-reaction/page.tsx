"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function JoinTheChainReactionPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />
      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Join the Chain Reaction
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Join the Chain Reaction to help us make a difference in the world.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 flex justify-between items-start">
        <section className="md:w-1/2 w-full space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#104901]">
            Sign up to our Newsletter
          </h3>
          <p className="text-lg md:text-xl text-gray-600">
            Recommended for charities, individuals looking to fundraise and
            businesses interested in supporting causes via match funding.
          </p>
          <Button size="lg">Sign up</Button>
        </section>
        <section className="md:w-1/2 w-full">
          <Image
            src="/images/join-1.jpg"
            alt="Join the Chain Reaction"
            width={1000}
            height={1000}
            className="w-full h-full object-cover shadow-sm"
          />
        </section>
      </div>
      <div className="container mx-auto px-4 py-16 flex gap-10 justify-between items-start">
        <section className="md:w-1/2 w-full">
          <Image
            src="/images/join-2.jpg"
            alt="Join the Chain Reaction"
            width={500}
            height={500}
            className="w-full h-full object-cover shadow-sm"
          />
        </section>
        <section className="md:w-1/2 w-full space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#104901]">
            Join the Chain Ambassador Network
          </h3>
          <p className="text-lg md:text-xl text-gray-600">
            Join our army of Chain Ambassadors ready and waiting to receive
            first hand information on campaigns they can chain.
          </p>
          <Button size="lg" onClick={() => router.push("/signup")}>
            Join Now!
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
}
