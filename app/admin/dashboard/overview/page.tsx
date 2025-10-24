'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Download,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useGeolocationCurrency } from '@/hooks/use-geolocation-currency';

interface DashboardStats {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
  totalRevenue: number;
  pendingPayouts: number;
  activeChainers: number;
  recentActivity: ActivityItem[];
  topCampaigns: CampaignMetric[];
  topChainers: ChainerMetric[];
  revenueTrend: RevenueData[];
}

interface ActivityItem {
  id: string;
  type: 'donation' | 'campaign' | 'chainer' | 'payout';
  description: string;
  timestamp: string;
  amount?: number;
  status: 'success' | 'pending' | 'failed';
}

interface CampaignMetric {
  id: string;
  title: string;
  raised: number;
  goal: number;
  percentage: number;
  status: 'active' | 'completed' | 'paused';
}

interface ChainerMetric {
  id: string;
  name: string;
  referrals: number;
  raised: number;
  commission: number;
  conversionRate: number;
}

interface RevenueData {
  date: string;
  amount: number;
  donations: number;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const router = useRouter();
  const { locationInfo } = useGeolocationCurrency();
  const currency = locationInfo?.currency?.code;
  const country = locationInfo?.country;

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard/stats?range=${timeRange}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Button handlers
  const handleExportReport = async () => {
    try {
      toast.info('Generating report...');
      
      // Generate CSV report with dashboard data
      const csvData = generateCSVReport();
      downloadCSV(csvData, 'admin-dashboard-report.csv');
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // Generate CSV report data
  const generateCSVReport = () => {
    if (!stats) return [];
    
    const timestamp = new Date().toISOString();
    
    // Main metrics section
    const mainMetrics = [
      ['=== ADMIN DASHBOARD REPORT ===', '', '', timestamp],
      ['', '', '', ''],
      ['MAIN METRICS', '', '', ''],
      ['Total Users', stats.totalUsers.toString(), '+12%', timestamp],
      ['Active Campaigns', stats.totalCampaigns.toString(), '+8%', timestamp],
      ['Total Donations', stats.totalDonations.toString(), '+15%', timestamp],
      ['Total Revenue', `$${stats.totalRevenue.toLocaleString()}`, '+18%', timestamp],
      ['Pending Payouts', stats.pendingPayouts.toString(), '', timestamp],
      ['Active Chainers', stats.activeChainers.toString(), '', timestamp],
      ['', '', '', ''],
    ];

    // Top campaigns section
    const topCampaignsData = [
      ['TOP PERFORMING CAMPAIGNS', '', '', ''],
      ['Campaign Title', 'Raised Amount', 'Goal', 'Status'],
      ...stats.topCampaigns.map(campaign => [
        campaign.title,
        `$${campaign.raised.toLocaleString()}`,
        `$${campaign.goal.toLocaleString()}`,
        campaign.status
      ]),
      ['', '', '', ''],
    ];

    // Recent activity section
    const recentActivityData = [
      ['RECENT ACTIVITY', '', '', ''],
      ['Activity Type', 'Description', 'Time', 'Status'],
      ...stats.recentActivity.slice(0, 10).map(activity => [
        activity.type,
        activity.description,
        new Date(activity.timestamp).toLocaleString(),
        activity.status
      ]),
    ];

    return [...mainMetrics, ...topCampaignsData, ...recentActivityData];
  };

  // Download CSV file
  const downloadCSV = (data: string[][], filename: string) => {
    const csvContent = data.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSettings = () => {
    router.push('/admin/settings');
  };

  const handleDownloadReport = () => {
    handleExportReport();
  };

  // Generate PDF report (opens print dialog)
  const handleExportPDF = () => {
    try {
      toast.info('Preparing PDF report...');
      
      // Create a new window with the report content
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        const reportHTML = generatePDFReport();
        reportWindow.document.write(reportHTML);
        reportWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          reportWindow.print();
        }, 500);
      }
      
      toast.success('PDF report ready for download!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  // Generate HTML content for PDF
  const generatePDFReport = () => {
    if (!stats) return '<html><body><h1>No data available</h1></body></html>';
    
    const timestamp = new Date().toLocaleString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Admin Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 5px; }
          .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
          .metric { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .metric h3 { margin: 0 0 5px 0; color: #6366f1; }
          .metric p { margin: 0; font-size: 24px; font-weight: bold; }
          .campaigns table, .activity table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .campaigns th, .campaigns td, .activity th, .activity td { 
            border: 1px solid #ddd; padding: 8px; text-align: left; 
          }
          .campaigns th, .activity th { background-color: #f2f2f2; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Admin Dashboard Report</h1>
          <p>Generated on ${timestamp}</p>
        </div>
        
        <div class="section">
          <h2>Key Metrics</h2>
          <div class="metrics">
            <div class="metric">
              <h3>Total Users</h3>
              <p>${stats.totalUsers.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h3>Active Campaigns</h3>
              <p>${stats.totalCampaigns.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h3>Total Donations</h3>
              <p>${stats.totalDonations.toLocaleString()}</p>
            </div>
            <div class="metric">
              <h3>Total Revenue</h3>
              <p>$${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div class="section campaigns">
          <h2>Top Performing Campaigns</h2>
          <table>
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Raised Amount</th>
                <th>Goal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${stats.topCampaigns.map(campaign => `
                <tr>
                  <td>${campaign.title}</td>
                  <td>$${campaign.raised.toLocaleString()}</td>
                  <td>$${campaign.goal.toLocaleString()}</td>
                  <td>${campaign.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section activity">
          <h2>Recent Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Activity Type</th>
                <th>Description</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${stats.recentActivity.slice(0, 10).map(activity => `
                <tr>
                  <td>${activity.type}</td>
                  <td>${activity.description}</td>
                  <td>${new Date(activity.timestamp).toLocaleString()}</td>
                  <td>${activity.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;
  };

  const handleReviewCampaign = (campaignId: string) => {
    router.push(`/admin/dashboard/campaigns?id=${campaignId}`);
  };

  const handleReviewUser = (userId: string) => {
    router.push(`/admin/dashboard/users?id=${userId}`);
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const currencyToUse = currencyCode || currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyToUse,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">There was an error loading the dashboard data.</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Platform overview and management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button size="sm" className="bg-purple-600 text-white hover:text-purple-600" onClick={handleSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                <ArrowUp className="h-3 w-3 inline mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                <ArrowUp className="h-3 w-3 inline mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-gray-500 mt-1">
                <ArrowUp className="h-3 w-3 inline mr-1" />
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chainers</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeChainers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                <ArrowUp className="h-3 w-3 inline mr-1" />
                +22% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Performance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Top performing campaigns this month</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex-1">
                          <Progress value={campaign.percentage} className="h-2" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(campaign.raised)} / {formatCurrency(campaign.goal)}
                        </span>
                      </div>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Last 30 days vs Previous</CardDescription>
                </div>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Donations</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{stats.totalDonations}</span>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Campaigns Created</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">12</span>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payouts Processed</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">8</span>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chainer Signups</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">45</span>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Pending Payouts</p>
                      <p className="text-sm text-gray-600">{stats.pendingPayouts} payouts awaiting approval</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push('/admin/dashboard/payouts')}>Review</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Campaign Reviews</p>
                      <p className="text-sm text-gray-600">3 campaigns pending review</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push('/admin/dashboard/campaigns')}>Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Processing</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Service</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-gray-600">45ms avg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
