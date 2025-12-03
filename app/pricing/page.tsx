"use client";

import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Gift } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const currency = [
  {
    name: "NGN",
    symbol: "₦",
  },
  {
    name: "USD",
    symbol: "$",
  },
  {
    name: "EUR",
    symbol: "€",
  },
  {
    name: "GBP",
    symbol: "£",
  },
];

const platformFees = [
  {
    country: "nigeria",
    fee: {
      individual: "5%",
      charity: "2%",
    },
  },
  {
    country: "united kingdom",
    fee: {
      individual: "2.1%",
      charity: "0%",
    },
  },
  {
    country: "united states of america",
    fee: {
      individual: "2.1%",
      charity: "0%",
    },
  },
  {
    country: "central europe",
    fee: {
      individual: "2.1%",
      charity: "0%",
    },
  },
];

const transactionFees = [
  {
    country: "ng",
    fee: "1.5% + ₦100",
  },
  {
    country: "uk",
    fee: "2.9% + £0.25",
  },
  {
    country: "us",
    fee: "2.9% + £0.30",
  },
  {
    country: "ceu",
    fee: "2.9% + £0.30",
  },
];

export default function PricingPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>("nigeria");
  const [selectedUserType, setSelectedUserType] =
    useState<string>("individual");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [selectedDonors, setSelectedDonors] = useState<string>("");

  // Map country to currency and transaction fee key
  const countryMap: Record<string, { currencyIndex: number; feeKey: string }> =
    {
      nigeria: { currencyIndex: 0, feeKey: "ng" },
      uk: { currencyIndex: 3, feeKey: "uk" },
      usa: { currencyIndex: 1, feeKey: "us" },
      ceu: { currencyIndex: 2, feeKey: "ceu" },
    };

  // Get current currency
  const currentCurrency = useMemo(() => {
    const mapping = countryMap[selectedCountry];
    return currency[mapping?.currencyIndex || 0];
  }, [selectedCountry]);

  // Get amount options based on country
  const amountOptions = useMemo(() => {
    const amounts: Record<string, { value: string; label: string }[]> = {
      nigeria: [
        { value: "50000", label: "₦50,000" },
        { value: "150000", label: "₦150,000" },
        { value: "500000", label: "₦500,000" },
      ],
      uk: [
        { value: "500", label: "£500" },
        { value: "1500", label: "£1,500" },
        { value: "5000", label: "£5,000" },
      ],
      usa: [
        { value: "500", label: "$500" },
        { value: "1500", label: "$1,500" },
        { value: "5000", label: "$5,000" },
      ],
      ceu: [
        { value: "500", label: "€500" },
        { value: "1500", label: "€1,500" },
        { value: "5000", label: "€5,000" },
      ],
    };
    return amounts[selectedCountry] || amounts.nigeria;
  }, [selectedCountry]);

  // Reset selected amount when country changes
  useEffect(() => {
    setSelectedAmount("");
  }, [selectedCountry]);

  // Map selectedCountry to platformFees country name
  const platformFeeCountryMap: Record<string, string> = {
    nigeria: "nigeria",
    uk: "united kingdom",
    usa: "united states of america",
    ceu: "central europe",
  };

  // Get platform fee
  const platformFee = useMemo(() => {
    const platformFeeCountryName = platformFeeCountryMap[selectedCountry];
    const countryData = platformFees.find(
      (p) => p.country === platformFeeCountryName
    );
    if (!countryData) return "0%";
    return (
      countryData.fee[selectedUserType as "individual" | "charity"] || "0%"
    );
  }, [selectedCountry, selectedUserType]);

  // Get transaction fee string
  const transactionFeeString = useMemo(() => {
    const mapping = countryMap[selectedCountry];
    const feeData = transactionFees.find((t) => t.country === mapping?.feeKey);
    return feeData?.fee || "2.9% + £0.25";
  }, [selectedCountry]);

  // Parse transaction fee
  const parseTransactionFee = (feeString: string) => {
    const match = feeString.match(/([\d.]+)%\s*\+\s*([₦$€£])([\d.]+)/);
    if (match) {
      return {
        percentage: parseFloat(match[1]),
        fixedAmount: parseFloat(match[3]),
        symbol: match[2],
      };
    }
    return { percentage: 2.9, fixedAmount: 0.25, symbol: "£" };
  };

  // Calculate fees and payout
  const calculations = useMemo(() => {
    if (!selectedAmount || !selectedDonors) {
      return {
        totalAmount: 0,
        platformFeeAmount: 0,
        transactionFeeAmount: 0,
        netPayout: 0,
      };
    }

    const totalAmount = parseFloat(selectedAmount.replace(/,/g, ""));
    const numDonors = parseInt(selectedDonors);
    const platformFeePercent = parseFloat(platformFee.replace("%", ""));

    // Calculate platform fee
    const platformFeeAmount = (totalAmount * platformFeePercent) / 100;

    // Calculate transaction fees
    const feeDetails = parseTransactionFee(transactionFeeString);
    const transactionFeePerDonation =
      (totalAmount / numDonors) * (feeDetails.percentage / 100) +
      feeDetails.fixedAmount;
    const transactionFeeAmount = transactionFeePerDonation * numDonors;

    // Calculate net payout
    const netPayout = totalAmount - platformFeeAmount - transactionFeeAmount;

    return {
      totalAmount,
      platformFeeAmount,
      transactionFeeAmount,
      netPayout,
    };
  }, [selectedAmount, selectedDonors, platformFee, transactionFeeString]);

  // Format number with currency
  const formatCurrency = (amount: number) => {
    return `${currentCurrency.symbol}${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />

      <div className="relative bg-gradient-to-r from-green-600 to-[#104901] mt-16 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Pricing</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
            Understand the fees and charges that go into making your fundraising
            initiatives a success.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-14">
        {/* Country Specific Fees */}
        <div className="flex gap-5 items-center justify-center">
          <h3 className="md:text-5xl text-3xl font-bold text-[#104901] mb-4">
            ChainFundIt Pricing in
          </h3>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a country" />
              <SelectContent>
                <SelectItem value="nigeria">Nigeria</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="usa">United States of America</SelectItem>
                <SelectItem value="ceu">Central Europe</SelectItem>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>

        {/* person */}
        <div className="bg-[#f5f5f5] px-5 py-14 flex gap-5 items-center justify-center">
          <h3 className="md:text-5xl text-3xl font-bold text-[#104901] mb-4">
            Are you fundraising as a
          </h3>
          <Select value={selectedUserType} onValueChange={setSelectedUserType}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Individual/Organisation" />
              <SelectContent>
                <SelectItem value="individual">
                  Individual/Organisation
                </SelectItem>
                <SelectItem value="charity">Charity/Non-Profit</SelectItem>
              </SelectContent>
            </SelectTrigger>
          </Select>
        </div>

        <section className="space-y-4">
          <p className="text-lg text-[#104901]">
            A little transaction fee is automatically deducted per donation,
            depending on the country of origin of the fundraiser — by our
            payment processing partners, and a minimal platform fee by us!{" "}
          </p>
          <p className="text-lg text-[#104901]">
            * Charities enjoy more levity in fees automatically deducted per
            donation, as we do not charge them platform fees! Everything else
            goes directly to the Charity, because that&apos;s what matters most.
            Here&apos;s how that works 👇🏾.
          </p>
        </section>

        <div className="flex gap-5 justify-between items-center">
          <section className="w-1/3 space-y-5 border-r-2 border-[#104901] pr-5">
            <span className="text-xl font-semibold text-[#104901]">
              Zero Fees!
            </span>
            <section>
              <h2 className="text-6xl font-extrabold text-[#104901]">
                {currentCurrency.symbol}0.00
              </h2>
              <p className="text-lg text-[#104901] font-light">
                TO CREATE A CAMPAIGN!
              </p>
            </section>
          </section>
          <section className="w-1/3 space-y-5 border-r-2 border-[#104901] pr-5">
            <span className="text-xl font-semibold text-[#104901]">
              Platform fees; Up to
            </span>
            <section>
              <h2 className="text-6xl font-extrabold text-[#104901]">
                {platformFee}
              </h2>
              <p className="text-lg text-[#104901] font-light uppercase">
                of donations received!
              </p>
            </section>
          </section>
          <section className="w-1/3 space-y-5">
            <span className="text-xl font-semibold text-[#104901]">
              One transaction fee!
            </span>
            <section>
              <h2 className="text-4xl font-extrabold text-[#104901]">
                {transactionFeeString}
              </h2>
              <p className="text-lg text-[#104901] font-light">
                fees charged by payment processors
              </p>
            </section>
          </section>
        </div>

        {/* maths */}
        <div className="bg-[#f5f5f5] px-5 py-14 flex gap-5 justify-between">
          <div className="w-1/2 border-r-2 border-[#104901] pr-5 space-y-5">
            <h3 className="text-5xl font-bold text-[#104901]">
              Do the math with us
            </h3>
            <div className="text-lg text-[#104901] flex items-center">
              Your campaign raised{" "}
              <Select value={selectedAmount} onValueChange={setSelectedAmount}>
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Select one" />
                  <SelectContent>
                    {amountOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectTrigger>
              </Select>{" "}
              in donations, from{" "}
              <Select value={selectedDonors} onValueChange={setSelectedDonors}>
                <SelectTrigger className="w-fit">
                  <SelectValue placeholder="Select one" />
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>{" "}
              donors.
            </div>
          </div>
          <div className="w-1/2 space-y-5">
            {selectedAmount && selectedDonors ? (
              <>
                <p className="text-3xl text-[#104901]">
                  {selectedUserType === "charity" ? (
                    <>
                      {formatCurrency(calculations.netPayout)} will be paid out
                      to the charity of your choice.
                    </>
                  ) : (
                    <>
                      You will receive {formatCurrency(calculations.netPayout)}{" "}
                      in your bank account.
                    </>
                  )}
                </p>
                <p className="text-lg text-[#104901]">
                  Transaction fee:{" "}
                  {formatCurrency(calculations.transactionFeeAmount)}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-[#104901]">
                  {formatCurrency(0)} will be paid out to the charity of your
                  choice.
                </p>
                <p className="text-lg text-[#104901]">
                  Transaction fee: {currentCurrency.symbol}0.00
                </p>
              </>
            )}
          </div>
        </div>

        {/* explanation */}
        <div className="space-y-5">
          <div className="flex gap-5 justify-between items-start">
            <h3 className="text-4xl font-bold text-[#104901] w-1/2">
              What is a transaction fee?
            </h3>
            <section className="w-1/2 space-y-5">
              <p className="text-lg text-[#104901]">
                Safe and secure fundraising is our top priority. That’s why we
                partner with industry-leading payment processors like Stripe and
                Paystack to accept and deliver your donations. The transaction
                fee is automatically deducted from each donation. It covers the
                costs of debit charges, to safely deliver your donations, and
                helps us offer more ways to donate—through Bank transfers, Card
                debits, Stripe, and Paystack.
              </p>
              <section className="flex gap-4 items-center">
                <Image
                  src="/images/ssl.webp"
                  alt="SSL Badge"
                  width={300}
                  height={300}
                />
              </section>
            </section>
          </div>
          <div className="flex gap-5 justify-between items-start">
            <h3 className="text-4xl font-bold text-[#104901] w-1/2">
              What’s our platform fee?
            </h3>
            <section className="w-1/2 space-y-5">
              <p className="text-lg text-[#104901]">
                The platform fee deducted on ChainFundIt; which may rise to 5%
                of donations received, covers the necessary infrastructure put
                in place to ensure your campaigns reach a wider audience
                guaranteeing more eyes and in turn more donations to your
                fundraising efforts.
              </p>
            </section>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-[#104901] rounded-2xl p-12 text-center text-white">
          <Gift className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Fundraising?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of fundraisers who trust ChainFundIt to help them
            reach their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-campaign">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                <Heart className="h-5 w-5 mr-2" />
                Create Your Campaign
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
