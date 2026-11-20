"use client";

import { StarIcon } from "lucide-react";
import { motion } from "framer-motion";

const moments = [
  {
    title: "Weddings and group gifts",
    body: "No more chasing people for cash. Share the link, they pay in a couple of taps, and the gift is covered without one person left holding the bill.",
    label: "Group gifts",
  },
  {
    title: "Birthdays and class collections",
    body: "Perfect for a birthday, a teacher gift, or a class fund. Easy to share, and you can see who has already paid.",
    label: "Celebrations",
  },
  {
    title: "Reunions and special occasions",
    body: "A clear record of money coming in for reunions, send-offs, trips, and any plan the group is putting together.",
    label: "Get-togethers",
  },
];

const CollectionsMoments = () => {
  return (
    <div className="font-jakarta flex items-center justify-center bg-[#EAF7EE] py-20 px-4">
      <div className="flex flex-col gap-16 md:max-w-[80rem] w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="px-4 py-2 rounded-full bg-[#14532D] flex gap-2 w-fit items-center">
            <StarIcon color="#DCFCE7" size={16} />
            <div className="font-bold text-sm leading-5 text-[#DCFCE7]">
              Made for shared moments
            </div>
          </div>
          <div className="font-bold text-4xl md:text-5xl leading-tight text-[#104109] max-w-3xl">
            Making a payment takes seconds
          </div>
          <p className="font-normal text-base leading-6 text-[#14532D] max-w-2xl">
            Anyone paying in uses a card or PayPal. No account to create and no
            app to download. The money shows up in the collection straight away.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moments.map((moment, index) => (
            <motion.div
              key={moment.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#104109] rounded-[32px] p-8 flex flex-col gap-6 min-h-[320px] border border-[#22C55E]"
            >
              <div className="flex-1">
                <p className="font-medium text-lg leading-[30px] text-[#ECFDF5]">
                  {moment.title}
                </p>
                <p className="text-[#D1FAE5] leading-7 mt-3">{moment.body}</p>
              </div>
              <p className="font-bold text-xs leading-4 text-[#86EFAC] uppercase">
                {moment.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsMoments;
