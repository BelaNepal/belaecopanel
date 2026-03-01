'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { quotationAPI } from '@/lib/api';
import { ChevronDown, ChevronLeft, ChevronRight, Trash2, RotateCcw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface QuotationItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  itemNotes?: string;
  product?: {
    id: string;
    name: string;
    rateWithVat: number;
    productCode?: string;
  };
}

interface Quotation {
  id: string;
  quoteNo: string;
  customerId: string;
  items: QuotationItem[];
  totalAmount: number;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  description?: string;
  notes?: string;
  createdAt: string;
  expiresAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dealer?: {
    id: string;
    companyName: string;
  };
}

export default function QuotationsAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'trash'>('list');
  const [updatingAmount, setUpdatingAmount] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState<number>(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF' && user?.role !== 'DEALER')) {
      router.push('/admin/login');
      return;
    }

    fetchQuotations();
  }, [mounted, token, user, activeVertical, page, filterStatus, searchParams, viewMode]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const params: any = { skip, take: limit, serviceTag: activeVertical };
      
      if (viewMode === 'trash') {
        const res = await quotationAPI.getTrash(params);
        setQuotations(res.data.data);
        setTotal(res.data.pagination.total);
        return;
      }
      
      const search = searchParams.get('search');
      if (search) {
        params.search = search;
      }
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const endpoint = user?.role === 'DEALER' 
        ? `${API_URL}/quotations/my-quotations`
        : `${API_URL}/quotations/admin/all`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setQuotations(res.data.data);
      setTotal(res.data.pagination.total);

      // Auto-open if specific search match found
      if (search && res.data.data.length === 1 && res.data.data[0].quoteNo === search) {
        setSelectedQuotationId(res.data.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to move this quotation to trash?')) return;
    try {
      await quotationAPI.delete(id);
      fetchQuotations();
    } catch (error) {
      console.error('Failed to delete quotation:', error);
      alert('Failed to delete quotation');
    }
  };

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to restore this quotation?')) return;
    try {
      await quotationAPI.restore(id);
      fetchQuotations();
    } catch (error) {
      console.error('Failed to restore quotation:', error);
      alert('Failed to restore quotation');
    }
  };

  const handlePermanentDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to PERMANENTLY delete this quotation? This cannot be undone.')) return;
    try {
      await quotationAPI.permanentDelete(id);
      fetchQuotations();
    } catch (error) {
      console.error('Failed to permanently delete quotation:', error);
      alert('Failed to delete quotation');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (quotationId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${API_URL}/quotations/${quotationId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuotations();
      setSelectedQuotationId(null);
    } catch (error) {
      console.error('Failed to update quotation status:', error);
      alert('Error updating quotation status');
    }
  };

  const handleAmountUpdate = async (quotationId: string) => {
    if (newAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setUpdatingAmount(quotationId);
      await axios.patch(
        `${API_URL}/quotations/${quotationId}/status`,
        { totalAmount: newAmount, status: 'QUOTED' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuotations();
      setUpdatingAmount(null);
    } catch (error) {
       console.error('Failed to update amount', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'QUOTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  if (!mounted) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const selectedQuotation = quotations.find((q) => q.id === selectedQuotationId);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold dark:text-white">Quotations</h1>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                    onClick={() => { setViewMode('list'); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'list' 
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    List
                </button>
                <button
                    onClick={() => { setViewMode('trash'); setPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                        viewMode === 'trash' 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                >
                    <Trash2 size={14} />
                    Trash
                </button>
            </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((status) => (
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
      </div>

      {/* Quotation Detail Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Quotation #{selectedQuotation.quoteNo}</h2>

            {selectedQuotation.user && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Requested By:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedQuotation.user.firstName} {selectedQuotation.user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedQuotation.user.email}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-semibold dark:text-white">
                  {new Date(selectedQuotation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="font-semibold dark:text-white">Rs. {selectedQuotation.totalAmount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`text-xs px-2 py-1 rounded-none inline-block mt-1 ${getStatusColor(selectedQuotation.status)}`}>
                  {selectedQuotation.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires</p>
                <p className="font-semibold dark:text-white">
                  {selectedQuotation.expiresAt ? new Date(selectedQuotation.expiresAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {selectedQuotation.description && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="dark:text-white">{selectedQuotation.description}</p>
              </div>
            )}

            {selectedQuotation.notes && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-none">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Additional Notes</p>
                <p className="dark:text-white italic">{selectedQuotation.notes}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Items</p>
              <div className="space-y-2">
                {selectedQuotation.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold dark:text-white">Product {item.product?.productCode || item.productId}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold dark:text-white">Rs. {item.unitPrice}</p>
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

            {selectedQuotation.status === 'PENDING' && user?.role !== 'DEALER' && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Update Amount & Quote</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newAmount || ''}
                    onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                    placeholder="Enter total amount"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={() => handleAmountUpdate(selectedQuotation.id)}
                    disabled={updatingAmount === selectedQuotation.id}
                    className="px-4 py-2 bg-primary text-white rounded-none hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Send Quote
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {selectedQuotation.status === 'QUOTED' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedQuotation.id, 'ACCEPTED')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-none hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Mark Accepted
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedQuotation.id, 'REJECTED')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Mark Rejected
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setSelectedQuotationId(null)}
              className="w-full mt-4 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-none hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quotations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Quote No</th>
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
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  Loading quotations...
                </td>
              </tr>
            ) : quotations.length > 0 ? (
              quotations.map((quotation) => (
                <tr
                  key={quotation.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                >
                  <td className="px-6 py-4 font-semibold dark:text-white">{quotation.quoteNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{quotation.items.length} items</td>
                  <td className="px-6 py-4 font-semibold dark:text-white">Rs. {quotation.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-none ${getStatusColor(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(quotation.createdAt).toLocaleString('en-US', { 
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
                          onClick={() => setSelectedQuotationId(quotation.id)}
                          className="text-primary hover:text-primary/70 font-semibold flex items-center gap-1"
                          title="View Details"
                        >
                          View
                        </button>
                    
                        {viewMode === 'list' ? (
                             ((user?.role === 'ADMIN') && (
                                <button 
                                    onClick={(e) => handleSoftDelete(quotation.id, e)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Move to Trash"
                                >
                                    <Trash2 size={18} />
                                </button>
                             ))
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => handleRestore(quotation.id, e)}
                                    className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 transition-colors"
                                    title="Restore"
                                >
                                    <RotateCcw size={18} />
                                </button>
                                <button
                                    onClick={(e) => handlePermanentDelete(quotation.id, e)}
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
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No quotations found.
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
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} quotations
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
