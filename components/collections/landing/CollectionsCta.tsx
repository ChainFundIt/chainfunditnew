"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { R2Image } from "@/components/ui/r2-image";

const CollectionsCta = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoadingUsers(true);
        const response = await fetch("/api/public/impact-metrics");
        if (response.ok) {
          const data = await response.json();
          setTotalUsers(data.totalUsers || 0);
        }
      } catch {
        setTotalUsers(null);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUserCount();
  }, []);

  const formatUserCount = (count: number | null): string => {
    if (count === null || count === 0) return "Join";
    if (count < 1000) return `${count}+`;
    if (count < 10000) {
      const thousands = (count / 1000).toFixed(1);
      return `${thousands.replace(/\.0$/, "")}k+`;
    }
    return `${Math.floor(count / 1000)}k+`;
  };

  return (
    <motion.div
      className="font-jakarta flex items-center justify-center bg-[#FFCF55] py-24 px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col gap-16 md:max-w-[56rem] w-full">
        <motion.div
          className="font-extrabold text-5xl md:text-6xl leading-tight text-center text-[#1C1917]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Everyone chips in. Nobody gets left with the bill.
        </motion.div>

        <motion.div
          className="font-medium text-xl leading-7 text-center text-[#292524]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          From weddings and birthdays to group gifts, reunions and special
          occasions, make it easy for everyone to chip in without chasing bank
          transfers or keeping track of who has paid.
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row gap-4 items-center justify-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Button
            asChild
            className="bg-[#104109] px-8 py-4 rounded-full h-auto font-bold text-lg leading-7 border-none w-full md:w-fit"
          >
            <Link href="/collections/create">Start a collection</Link>
          </Button>
        </motion.div>

        <motion.div
          className="bg-[#FFFFFF4D] rounded-full px-6 py-3 flex items-center gap-4 justify-center w-fit mx-auto"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <div className="flex -space-x-2">
            <R2Image
              src="/images/peopleInvolved_0.png"
              alt="People chipping in"
              height={40}
              width={40}
              className="w-10 h-10 rounded-full border-2 border-white z-10"
            />
            <R2Image
              src="/images/peopleInvolved_1.png"
              alt="People chipping in"
              height={40}
              width={40}
              className="w-10 h-10 rounded-full border-2 border-white z-20"
            />
            <R2Image
              src="/images/peopleInvolved_2.png"
              alt="People chipping in"
              height={40}
              width={40}
              className="w-10 h-10 rounded-full border-2 border-white z-30"
            />
            <R2Image
              src="/images/peopleInvolved_3.png"
              alt="People chipping in"
              height={40}
              width={40}
              className="w-10 h-10 rounded-full border-2 border-white z-40"
            />
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center z-0">
              <span className="font-bold text-xs leading-4">
                {loadingUsers ? "..." : formatUserCount(totalUsers)}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="font-bold text-xs leading-4">PEOPLE CHIPPING IN</p>
            <p className="font-medium text-xs leading-4">
              Sharing the cost together
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CollectionsCta;
