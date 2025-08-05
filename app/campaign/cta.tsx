import { Button } from "@/components/ui/button";
import { Airplay, ArrowRight, Key, Send } from "lucide-react";
import React from "react";

type Props = {};

const CTA = (props: Props) => {
  return (
    <div className="w-full py-10 flex flex-col md:flex-row justify-between md:items-center">
      <section className="md:w-3/4 w-full space-y-5">
        <h3 className="font-semibold text-4xl text-black">
          Start fundraising in minutes the easy, secure way.
        </h3>
        <div className="flex md:flex-row flex-col justify-between gap-5 text-black">
          <section className="flex gap-3 items-start">
            <Send size={32} />
            <section>
              <p className="font-semibold text-xl">Simple as ABC</p>
              <span className="font-normal text-base">
                Donate the one-click way
              </span>
            </section>
          </section>
          <section className="flex gap-3 items-start">
            <Airplay size={32} />
            <section>
              <p className="font-semibold text-xl">Intuitive</p>
              <span className="font-normal text-base">
                Get AI suggestions to create your fundraising story
              </span>
            </section>
          </section>
          <section className="flex gap-3 items-start">
            <Key size={32} />
            <section>
              <p className="font-semibold text-xl">Secure</p>
              <span className="font-normal text-base">
                Donations secured by our payment processing partners
              </span>
            </section>
          </section>
        </div>
      </section>
      <section className="w-full md:w-1/4">
        <Button className="w-full h-24 flex justify-between items-center font-semibold text-2xl">
          Get Started <ArrowRight />
        </Button>
      </section>
    </div>
  );
};

export default CTA;
