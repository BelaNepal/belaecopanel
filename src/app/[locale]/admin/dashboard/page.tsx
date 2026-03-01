'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { ShoppingCart, Briefcase, Users, FileText, BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface AdminStats {
  users: { total: number; active: number };
  dealers: { total: number; pending: number; approved: number };
  roles?: { engineers: number; contractors: number };
  projects?: { total: number; active: number };
  orders: { total: number; pending: number };
  quotations: { total: number; pending: number };
  content: { products: number; articles: { total: number; published: number }; faqs: number };
}

interface AnalyticsData {
  statusDistribution: { name: string; value: number }[];
  revenueTrend: { name: string; revenue: number; orders: number }[];
  userGrowth: { name: string; users: number }[];
}

interface RecentActivity {
  recentOrders: any[];
  recentDealerApplications?: any[];
}
const COLORS = ['#ef7e1a', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
        router.push('/admin');
        return;
    }

    const fetchData = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const [statsRes, activityRes, analyticsRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { serviceTag: activeVertical }
          }),
          axios.get(`${API_URL}/dashboard/admin/recent-activity`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { serviceTag: activeVertical }
          }),
          axios.get(`${API_URL}/dashboard/admin/analytics`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { serviceTag: activeVertical }
          })
        ]);
        setAdminStats(statsRes.data);
        setActivity(activityRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [token, user, router, activeVertical]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminStats) return <div>Failed to load statistics</div>;

  const StatCard = ({ icon, label, value, subtext, href, colorClass = "bg-primary/10 text-primary" }: any) => {
    const Content = () => (
      <div className="bg-white dark:bg-gray-800 rounded-none p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-none ${colorClass}`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold dark:text-white">{value}</p>
            {subtext && <p className="text-xs text-gray-500 dark:text-gray-500">{subtext}</p>}
          </div>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block h-full">
          <Content />
        </Link>
      );
    }
    return <Content />;
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold dark:text-white">Dashboard Overview</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            activeVertical === 'ECOPANELS' 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
          }`}>
            {activeVertical === 'ECOPANELS' ? 'Eco Panels' : 'Modular Homes'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ShoppingCart size={24} />}
          label="Total Orders"
          value={adminStats.orders.total}
          subtext={`${adminStats.orders.pending} pending`}
          href="/admin/orders"
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        
        {activeVertical === 'MODULARHOMES' ? (
          <>
            <StatCard
              icon={<Briefcase size={24} />}
              label="Total Projects"
              value={adminStats.projects?.total || 0}
              subtext={`${adminStats.projects?.active || 0} active`}
              href="/admin/projects"
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <StatCard
              icon={<Users size={24} />}
              label="Engineers"
              value={adminStats.roles?.engineers || 0}
              subtext="Registered Engineers"
              href="/admin/dealers?role=ENGINEER"
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
            <StatCard
              icon={<Users size={24} />}
              label="Contractors"
              value={adminStats.roles?.contractors || 0}
              subtext="Registered Contractors"
              href="/admin/dealers?role=CONTRACTOR"
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            />
          </>
        ) : (
          <StatCard
            icon={<Briefcase size={24} />}
            label="Dealers"
            value={adminStats.dealers.total}
            subtext={`${adminStats.dealers.pending} pending approval`}
            href="/admin/dealers"
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
        )}

        <StatCard
          icon={<FileText size={24} />}
          label="Quotations"
          value={adminStats.quotations.total}
          subtext={`${adminStats.quotations.pending} new requests`}
          href="/admin/quotations"
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
        <StatCard
          icon={<Users size={24} />}
          label="Total Users"
          value={adminStats.users.total}
          subtext={`${adminStats.users.active} active users`}
          href="/admin/customers"
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary hover:underline text-sm">View All</Link>
          </div>
          <div className="space-y-4">
            {activity?.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-none">
                <div>
                  <p className="font-semibold dark:text-white">{order.orderNo}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-none ${
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!activity?.recentOrders || activity.recentOrders.length === 0) && (
              <p className="text-center text-gray-500 py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Dealer Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold dark:text-white">New Dealer Applications</h2>
            <Link href="/admin/dealers" className="text-primary hover:underline text-sm">View All</Link>
          </div>
          <div className="space-y-4">
            {activity?.recentDealerApplications?.map((dealer: any) => (
              <div key={dealer.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-none">
                <div>
                  <p className="font-semibold dark:text-white">{dealer.companyName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dealer.user?.firstName} {dealer.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(dealer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href={`/admin/dealers?id=${dealer.id}`}
                    className="px-3 py-1 bg-primary text-white text-sm rounded-none hover:bg-primary/90"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
            {(!activity?.recentDealerApplications || activity.recentDealerApplications.length === 0) && (
              <p className="text-center text-gray-500 py-4">No pending applications</p>
            )}
          </div>
        </div>
      </div>

      {/* Modern Visual Analytics Section */}
      {analytics && (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="text-primary" size={28} />
                <h2 className="text-2xl font-bold dark:text-white">Performance Analytics</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Revenue Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 col-span-1 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-green-500" /> Revenue & Order Trend
                            </h3>
                            <p className="text-xs text-gray-500">Monthly breakdown for last 6 months</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef7e1a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef7e1a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" fontSize={12} stroke="#9CA3AF" />
                                <YAxis yAxisId="left" fontSize={12} stroke="#9CA3AF" tickFormatter={(value) => `Rs.${value/1000}k`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0px', border: '1px solid #e5e7eb' }}
                                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#ef7e1a" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold dark:text-white mb-1 flex items-center gap-2">
                        <PieChartIcon size={18} className="text-blue-500" /> Order Status
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Current distribution of order statuses</p>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0px', border: '1px solid #000' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="square" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Growth Bar Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 col-span-1 lg:col-span-3">
                    <h3 className="text-lg font-bold dark:text-white mb-1 flex items-center gap-2">
                        <Activity size={18} className="text-purple-500" /> Platform Growth
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">New user registrations per month</p>
                    <div className="h-[250px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.userGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" fontSize={12} stroke="#9CA3AF" />
                                <YAxis fontSize={12} stroke="#9CA3AF" />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb' }} />
                                <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                    {analytics.userGrowth.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
