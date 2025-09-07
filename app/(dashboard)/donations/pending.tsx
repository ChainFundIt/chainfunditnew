import React, { useState } from 'react';
import { useDonations } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";

type Props = {};

const PendingDonations = (props: Props) => {
  const { donations, loading, error, refreshDonations } = useDonations('pending');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDonations();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 2xl:container 2xl:mx-auto">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 2xl:container 2xl:mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading donations: {error}
        </div>
      </div>
    );
  }

  const pendingDonations = donations.filter(donation => !donation.isSuccessful && donation.paymentStatus === 'pending');

  if (pendingDonations.length === 0) {
    return (
      <div className="flex flex-col gap-4 2xl:container 2xl:mx-auto">
        <div className="text-center py-8">
          <h3 className="font-semibold text-3xl text-[#104901] mb-4">
            No pending donations
          </h3>
          <p className="font-normal text-xl text-[#104901]">
            All your donations have been processed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 2xl:container 2xl:mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-3xl text-[#104901] mb-2">
              {pendingDonations.length} pending donation{pendingDonations.length !== 1 ? 's' : ''}
            </h3>
            <p className="font-normal text-xl text-[#104901]">
              These donations are waiting for payment completion.
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Pending Donations List */}
      <div className="space-y-4">
        {pendingDonations.map((donation) => (
          <div key={donation.id} className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {donation.isAnonymous ? 'A' : 'D'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#104901]">
                      {donation.isAnonymous ? 'Anonymous Donation' : 'Your Donation'}
                    </h4>
                    <p className="text-sm text-gray-600">{donation.campaignTitle}</p>
                  </div>
                </div>
                {donation.message && (
                  <p className="text-gray-700 text-sm mb-2">"{donation.message}"</p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(donation.createdAt).toLocaleDateString()} • {donation.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-[#104901]">
                  {formatCurrency(donation.amount, donation.currency)}
                </p>
                <p className="text-xs text-yellow-600">⏳ Pending</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingDonations;