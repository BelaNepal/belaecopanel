'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import axios from 'axios';
import { ShoppingCart, FileText, Package } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface DealerStats {
  orders: { total: number; pending: number };
  quotations: { total: number; pending: number };
}

interface RecentActivity {
  recentOrders: any[];
}

export default function DealerDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [dealerStats, setDealerStats] = useState<DealerStats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    if (user.role !== 'DEALER') {
        router.push('/admin');
        return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, activityRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard/dealer/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/dashboard/dealer/recent-activity`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setDealerStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, router]);

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

  if (!dealerStats) return <div>Failed to load statistics</div>;

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
        <h1 className="text-3xl font-bold dark:text-white mb-2">Dealer Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={<ShoppingCart size={24} />}
          label="My Orders"
          value={dealerStats.orders.total}
          subtext={`${dealerStats.orders.pending} pending`}
          href="/admin/orders"
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={<FileText size={24} />}
          label="My Quotations"
          value={dealerStats.quotations.total}
          subtext={`${dealerStats.quotations.pending} pending`}
          href="/admin/quotations"
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
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

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/admin/products"
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="p-3 bg-blue-100 text-blue-600 rounded-none">
                <Package size={24} />
              </div>
              <div>
                <p className="font-semibold dark:text-white">Browse Products</p>
                <p className="text-sm text-gray-500">View available products and prices</p>
              </div>
            </Link>
            <Link 
              href="/admin/quotations"
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <div className="p-3 bg-orange-100 text-orange-600 rounded-none">
                <FileText size={24} />
              </div>
              <div>
                <p className="font-semibold dark:text-white">Request Quotation</p>
                <p className="text-sm text-gray-500">Get a price quote for your project</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
