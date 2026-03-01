'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import { orderAPI } from '@/lib/api';
import axios from 'axios';
import { ChevronDown, ChevronLeft, ChevronRight, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  itemNotes?: string;
  product?: {
    id: string;
    name: string;
    rateWithVat: number;
    productCode?: string;
  };
}

interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  dealerId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'VERIFIED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress?: string;
  createdAt: string;
  dealer?: {
    id: string;
    companyName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    user?: { email: string };
  };
}

export default function OrdersAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'trash'>('list');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if there is an orderId in the URL and open the modal if so
    // This allows linking directly to a specific order from email/notifications
    // The order must be in the current list for now
    const orderId = searchParams.get('orderId');
    if (orderId && orders.length > 0 && !selectedOrderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrderId(orderId);
      }
    }
  }, [searchParams, orders, selectedOrderId]);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF' && user?.role !== 'DEALER')) {
      router.push('/admin/login');
      return;
    }

    fetchOrders();
  }, [mounted, token, user, activeVertical, page, filterStatus, searchParams, viewMode]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const params: any = { skip, take: limit, serviceTag: activeVertical };
      
      if (viewMode === 'trash') {
        const res = await orderAPI.getTrash(params);
        setOrders(res.data.data);
        setTotal(res.data.pagination.total);
        return;
      }

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      let endpoint = `${API_URL}/orders/admin/all`;
      if (user?.role === 'DEALER') {
        endpoint = `${API_URL}/orders/my-orders`;
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setOrders(res.data.data);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to move this order to trash?')) return;
    try {
      await orderAPI.delete(id);
      fetchOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order');
    }
  };

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to restore this order?')) return;
    try {
      await orderAPI.restore(id);
      fetchOrders();
    } catch (error) {
      console.error('Failed to restore order:', error);
      alert('Failed to restore order');
    }
  };

  const handlePermanentDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to PERMANENTLY delete this order? This cannot be undone.')) return;
    try {
      await orderAPI.permanentDelete(id);
      fetchOrders();
    } catch (error) {
      console.error('Failed to permanently delete order:', error);
      alert('Failed to delete order');
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setSelectedOrderId(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1); // Reset to first page on filter change
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'VERIFIED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'PROCESSING':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    const statusFlow: { [key: string]: string[] } = {
      PENDING: ['VERIFIED', 'CANCELLED'],
      VERIFIED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (!mounted) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Orders</h1>
      </div>
      
      {viewMode === 'list' && (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {['all', 'PENDING', 'VERIFIED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={`px-3 py-1 rounded-none text-sm whitespace-nowrap transition-all duration-300 ${
                filterStatus === status
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </button>
          ))}
      </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Order #{selectedOrder.orderNo}</h2>

            {selectedOrder.dealer && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded">
                <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">Dealer Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium dark:text-white">{selectedOrder.dealer.companyName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="font-medium dark:text-white">{selectedOrder.dealer.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium dark:text-white">{selectedOrder.dealer.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium dark:text-white">{selectedOrder.dealer.phoneNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium dark:text-white">
                      {selectedOrder.dealer.address}, {selectedOrder.dealer.city}, {selectedOrder.dealer.state}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                <p className="font-semibold dark:text-white">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="font-semibold dark:text-white">Rs. {selectedOrder.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`text-xs px-2 py-1 rounded-none inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                <p className="font-semibold dark:text-white">{selectedOrder.dealerId ? 'Dealer' : 'Direct'}</p>
              </div>
            </div>

            {selectedOrder.shippingAddress && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Shipping Address</p>
                <p className="dark:text-white">{selectedOrder.shippingAddress}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Items</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold dark:text-white">Product {item.product?.productCode || item.productId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold dark:text-white">Rs. {item.price}</p>
                    </div>
                    {item.itemNotes && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Note:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">{item.itemNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {user?.role !== 'DEALER' && getNextStatuses(selectedOrder.status).length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Update Status</p>
                <div className="space-y-2">
                  {getNextStatuses(selectedOrder.status).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                      disabled={updatingStatus === selectedOrder.id}
                      className="w-full px-4 py-2 bg-primary text-white rounded-none hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Move to {status}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedOrderId(null);
                // remove query param if present
                const params = new URLSearchParams(searchParams);
                if (params.has('orderId')) {
                    params.delete('orderId');
                    router.replace(`${window.location.pathname}?${params.toString()}`);
                }
              }}
              className="w-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-none hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Order No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Items</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Total Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4 font-semibold dark:text-white">{order.orderNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {order.dealerId ? 'Dealer' : 'Direct'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{order.items.length} items</td>
                  <td className="px-6 py-4 font-semibold dark:text-white">Rs. {order.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-none ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="text-primary hover:text-primary/70 font-semibold flex items-center gap-1"
                          title="View Details"
                        >
                          View
                        </button>
                        
                        {viewMode === 'list' ? (
                             ((user?.role === 'ADMIN') && (
                                <button 
                                    onClick={(e) => handleSoftDelete(order.id, e)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Move to Trash"
                                >
                                    <Trash2 size={18} />
                                </button>
                             ))
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleRestore(order.id, e)}
                                    className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                                    title="Restore"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={(e) => handlePermanentDelete(order.id, e)}
                                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete Permanently"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-none border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-2 text-sm font-semibold dark:text-white">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-none border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
