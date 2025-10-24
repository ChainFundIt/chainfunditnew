'use client';

import { useState, useEffect } from 'react';
import { Heart, DollarSign, TrendingUp, Users, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface CharityDonation {
  id: string;
  charityId: string;
  amount: string;
  currency: string;
  donorName: string;
  donorEmail: string;
  paymentStatus: string;
  paymentMethod: string;
  payoutStatus: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
  charity?: {
    name: string;
    slug: string;
  };
}

export default function CharityDonationsAdmin() {
  const [donations, setDonations] = useState<CharityDonation[]>([]);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharity, setSelectedCharity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchCharities();
    fetchDonations();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await fetch('/api/charities?limit=100');
      const data = await response.json();
      setCharities(data.charities || []);
    } catch (error) {
      console.error('Error fetching charities:', error);
    }
  };

  const fetchDonations = async () => {
    setLoading(true);
    try {
      // Fetch donations from all charities
      const allDonations: CharityDonation[] = [];
      
      const charitiesResponse = await fetch('/api/charities?limit=100');
      const charitiesData = await charitiesResponse.json();
      
      for (const charity of charitiesData.charities || []) {
        const response = await fetch(`/api/charities/${charity.id}/donate`);
        const data = await response.json();
        
        const donationsWithCharity = (data.donations || []).map((d: any) => ({
          ...d,
          charity: {
            name: charity.name,
            slug: charity.slug,
          },
        }));
        
        allDonations.push(...donationsWithCharity);
      }

      // Sort by most recent
      allDonations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setDonations(allDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(d => {
    if (selectedCharity !== 'all' && d.charityId !== selectedCharity) return false;
    if (selectedStatus !== 'all' && d.paymentStatus !== selectedStatus) return false;
    return true;
  });

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(num);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const stats = {
    total: filteredDonations.length,
    totalAmount: filteredDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
    completed: filteredDonations.filter(d => d.paymentStatus === 'completed').length,
    pending: filteredDonations.filter(d => d.paymentStatus === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Charity Donations</h1>
          <p className="text-gray-600">View and manage all charity donations</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">All donations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount.toString(), 'USD')}
              </div>
              <p className="text-xs text-gray-500 mt-1">Combined value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Users className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select value={selectedCharity} onValueChange={setSelectedCharity}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by charity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Charities</SelectItem>
              {charities.map((charity) => (
                <SelectItem key={charity.id} value={charity.id}>
                  {charity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchDonations} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Donations Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading donations...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No donations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">
                            {donation.charity?.name || 'Unknown Charity'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.paymentMethod}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.isAnonymous ? 'Hidden' : donation.donorEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(donation.amount, donation.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {donation.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(donation.paymentStatus)}
                        <div className="text-xs text-gray-500 mt-1">
                          Payout: {donation.payoutStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                        >
                          <Link href={`/virtual-giving-mall/${donation.charity?.slug}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Charity
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Navigation to Payouts Page */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Looking for Payouts?</h3>
          <p className="text-blue-800 text-sm mb-4">
            This page shows individual donations. To see batch donations into payouts for charities, visit the Payouts page.
          </p>
          <Button asChild>
            <Link href="/admin/charity-payouts">
              Go to Charity Payouts →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

