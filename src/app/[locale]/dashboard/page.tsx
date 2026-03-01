'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/stores';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authAPI, orderAPI } from '@/lib/api';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await authAPI.getMe();
        const userData = res.data;
        setUser(userData);
        
        // Fetch data based on role
        try {
          if (userData.role !== 'ENGINEER') {
            const ordersRes = await orderAPI.getMyOrders();
            setOrders(ordersRes.data.data);
          }
        } catch (dataErr) {
          console.error('Failed to fetch dashboard data', dataErr);
        }
        
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load user information');
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, router, setUser]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white dark:bg-[var(--color-dark)] flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white dark:bg-[var(--color-dark)] py-12">
          <div className="container-custom max-w-2xl">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-none">
              {error}
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-none hover:bg-opacity-90 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white dark:bg-[var(--color-dark)] py-12">
        <div className="container-custom max-w-4xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary dark:text-white">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Logout
            </button>
          </div>

          {/* User Information Card */}
          <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-none border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-primary dark:text-white">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">First Name</p>
                <p className="text-xl font-semibold dark:text-white">{user?.firstName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Last Name</p>
                <p className="text-xl font-semibold dark:text-white">{user?.lastName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Email</p>
                <p className="text-xl font-semibold dark:text-white">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">Role</p>
                <p className="text-xl font-semibold dark:text-white">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-none text-sm">
                    {user?.role || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Role-Based Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user?.role === 'ADMIN' && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-6 rounded-none border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">Manage Users</h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">View and manage all system users</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Go to Users
                  </button>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 p-6 rounded-none border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-100">Manage Products</h3>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">Create and edit products</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-none hover:bg-purple-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Go to Products
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-6 rounded-none border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-bold mb-2 text-green-900 dark:text-green-100">Manage Orders</h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">View and manage all orders</p>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-none hover:bg-green-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Go to Orders
                  </button>
                </div>
              </>
            )}

            {user?.role === 'ENGINEER' && (
              <div className="col-span-1 md:col-span-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-8 rounded-none border border-blue-200 dark:border-blue-800 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">Engineer Workspace</h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-6 max-w-2xl mx-auto">
                    Access your project management dashboard to view assigned projects, track progress, and manage documentation.
                  </p>
                  <Link 
                    href="/admin"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-none hover:bg-blue-700 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Briefcase size={20} />
                    Go to Engineer Dashboard
                  </Link>
                </div>
              </div>
            )}

            {user?.role === 'DEALER' && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-6 rounded-none border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">My Orders</h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">View your orders and track shipments</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    View Orders
                  </button>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 p-6 rounded-none border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-100">Quotations</h3>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">Request and manage quotations</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-none hover:bg-purple-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    View Quotations
                  </button>
                </div>
              </>
            )}

            {user?.role === 'CONTRACTOR' && (
              <div className="col-span-1 md:col-span-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/40 p-8 rounded-none border border-indigo-200 dark:border-indigo-800 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">Contractor Hub</h3>
                  <p className="text-indigo-700 dark:text-indigo-300 mb-6 max-w-2xl mx-auto">
                    Manage your assigned projects, view applications, and track progress.
                  </p>
                  <Link 
                    href="/admin/projects"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-none hover:bg-indigo-700 font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <Briefcase size={20} />
                    Go to Projects
                  </Link>
                </div>
              </div>
            )}

            {user?.role === 'CUSTOMER' && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-6 rounded-none border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-blue-100">My Orders</h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">View your order history</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    View Orders
                  </button>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 p-6 rounded-none border border-purple-200 dark:border-purple-800">
                  <h3 className="text-lg font-bold mb-2 text-purple-900 dark:text-purple-100">Request Quotation</h3>
                  <p className="text-purple-700 dark:text-purple-300 mb-4">Get custom quotations</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-none hover:bg-purple-700 font-semibold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    Request Quote
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order History */}
          {orders.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-primary dark:text-white">Order History</h2>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Order No</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                        <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4 font-medium text-primary dark:text-blue-400">{order.orderNo}</td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                            Rs. {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {order.items.length} items
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
