'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import axios from 'axios';
import { Briefcase, TrendingUp, CheckCircle, FileText, Home, Users } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface EngineerStats {
  projects: { total: number; active: number; completed: number };
  documents: { pending: number };
}

export default function EngineerDashboard() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [engineerStats, setEngineerStats] = useState<EngineerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }

    if (user.role !== 'ENGINEER') {
        router.push('/admin'); // Redirect back to main dispatcher if role mismatch
        return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await axios.get(`${API_URL}/dashboard/engineer/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEngineerStats(statsRes.data);
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

  if (!engineerStats) return <div>Failed to load statistics</div>;

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
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName} {user?.lastName}!</h1>
        <p className="text-indigo-100">Manage your engineering projects and documents.</p>
      </div>,

      {/* Stats Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-indigo-600" />
          Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={<Briefcase size={24} />}
            label="Total Projects"
            value={engineerStats.projects.total}
            href="/admin/projects"
            colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Active Projects"
            value={engineerStats.projects.active}
            href="/admin/projects?status=RUNNING"
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            label="Completed"
            value={engineerStats.projects.completed}
            href="/admin/projects?status=COMPLETED"
            colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard
            icon={<FileText size={24} />}
            label="Pending Docs"
            value={engineerStats.documents.pending}
            href="/admin/projects"
            colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <Briefcase size={20} className="text-indigo-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Home size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">Go to Website</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visit the main website.</p>
          </Link>
          <Link href="/admin/projects/create" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">Create Project</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Initiate a new modular home project.</p>
          </Link>
          <Link href="/admin/projects" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">Manage Projects</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View and update ongoing projects.</p>
          </Link>
          <Link href="/admin/profile" className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="font-semibold text-lg mb-1 dark:text-white">Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Update your engineer profile.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
