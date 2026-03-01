'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { Eye, Mail, Phone, Building, MessageSquare, X, Send, ChevronLeft, ChevronRight, RotateCcw, Search, Trash2 } from 'lucide-react';
import SendEmailModal from '@/components/admin/SendEmailModal';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const extractQuoteNo = (message: string) => {
  const match = message.match(/#(QUOTE-\d+)/);
  return match ? match[1] : null;
};

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  leadType: string;
  status: string;
  createdAt: string;
  serviceTag?: string;
}

export default function CustomersAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const { activeVertical, setActiveVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // Initialize with active vertical
  const [filterServiceTag, setFilterServiceTag] = useState<string>(activeVertical || 'ECOPANELS');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState({ email: '', name: '' });

  useEffect(() => {
    setMounted(true);
    // Auto-select vertical from URL params
    const serviceTag = searchParams.get('serviceTag');
    if (serviceTag && (serviceTag === 'ECOPANELS' || serviceTag === 'MODULARHOMES')) {
        if (serviceTag !== activeVertical) {
            setActiveVertical(serviceTag);
        }
    }
  }, [searchParams]);

  useEffect(() => {
    const leadId = searchParams.get('leadId');
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
      }
    }
  }, [searchParams, leads]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm !== debouncedSearch) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Sync filter with global active vertical when it changes
    if (activeVertical) {
        setFilterServiceTag(activeVertical);
    }
  }, [activeVertical]);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/admin/login');
      return;
    }

    fetchLeads();
  }, [token, user, router, mounted, page, filterServiceTag, filterStatus, debouncedSearch]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const params: any = { skip, take: limit };

      // Allow filtering by service tag (vertical) or show all
      if (filterServiceTag !== 'all') {
          params.serviceTag = filterServiceTag;
      }

      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const res = await axios.get(`${API_URL}/leads`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setLeads(res.data.data);
      if (res.data.pagination) {
        setTotal(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/leads/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await axios.delete(`${API_URL}/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeads();
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead: ' + (error as any).response?.data?.message || (error as any).message);
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('leadId');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const openEmailModal = (lead: Lead) => {
    setEmailRecipient({ email: lead.email, name: lead.name });
    setEmailModalOpen(true);
  };

  // We are using server-side filtering, so leads are already filtered
  const filteredLeads = leads;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
      case 'QUALIFIED': return 'bg-green-100 text-green-800';
      case 'UNQUALIFIED': return 'bg-red-100 text-red-800';
      case 'CONVERTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Check Permissions
  const canManageCustomers = user?.role === 'ADMIN' || user?.permissions?.canManageCustomers;

  if (!canManageCustomers) {
      return <UnauthorizedAccess requiredPermission="canManageCustomers" />;
  }

  return (
    <div>
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={emailRecipient.email}
        recipientName={emailRecipient.name}
      />

      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Customers & Enquiries</h1>
        
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, phone..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Service Tag Filter */}
            <select
              value={filterServiceTag}
              onChange={(e) => setFilterServiceTag(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Verticals</option>
              <option value="ECOPANELS">Eco Panels</option>
              <option value="MODULARHOMES">Modular Homes</option>
            </select>

            {/* Filter Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1 overflow-x-auto max-w-full">
              {['all', 'NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200 dark:border-gray-700">
               <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {page} / {Math.max(1, Math.ceil(total / limit))}
               </span>
               <div className="flex gap-1">
                 <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:text-white"
                 >
                    <ChevronLeft size={18} />
                 </button>
                 <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * limit >= total}
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed dark:text-white"
                 >
                    <ChevronRight size={18} />
                 </button>
               </div>
               <button
                  onClick={() => {
                    setFilterStatus('all');
                    setPage(1);
                    setSearchTerm('');
                    fetchLeads();
                  }}
                  className="p-1.5 ml-2 text-gray-500 hover:text-primary transition"
                  title="Refresh"
                >
                  <RotateCcw size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold dark:text-white">{selectedLead.name}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail size={18} />
                  <span>{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone size={18} />
                  <span>{selectedLead.phone}</span>
                </div>
              </div>

              {selectedLead.company && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Building size={18} />
                  <span>{selectedLead.company}</span>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Message
                </h3>
                <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{selectedLead.message}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Actions
                </label>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => openEmailModal(selectedLead)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-none hover:bg-blue-700 transition text-sm"
                  >
                    <Send size={16} /> Reply via Email
                  </button>
                </div>

                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Update Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedLead.id, status)}
                      className={`px-3 py-1 rounded-none text-xs border transition ${
                        selectedLead.status === status
                          ? 'bg-primary text-white border-primary'
                          : 'bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                Received on: {new Date(selectedLead.createdAt).toLocaleString()}
                <br />
                Type: {selectedLead.leadType.replace('_', ' ')}
                <br />
                Vertical: {selectedLead.serviceTag === 'ECOPANELS' ? 'Eco Panels' : selectedLead.serviceTag === 'MODULARHOMES' ? 'Modular Homes' : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Vertical</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4">
                  <button 
                    onClick={() => setSelectedLead(lead)}
                    className="text-left hover:text-primary transition-colors"
                  >
                    <div className="font-semibold dark:text-white">{lead.name}</div>
                    {lead.company && <div className="text-xs text-gray-500">{lead.company}</div>}
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>{lead.email}</div>
                  <div className="text-xs">{lead.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>{lead.leadType.replace('_', ' ')}</div>
                  {lead.leadType === 'QUOTATION_REQUEST' && extractQuoteNo(lead.message) && (
                    <Link
                      href={`/admin/quotations?search=${extractQuoteNo(lead.message)}`}
                      className="text-primary hover:underline text-xs flex items-center gap-1 mt-1 font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      #{extractQuoteNo(lead.message)}
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {lead.serviceTag === 'ECOPANELS' ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Eco Panels</span>
                  ) : lead.serviceTag === 'MODULARHOMES' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Modular Homes</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(lead.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={(e) => handleDelete(lead.id, e)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={() => setSelectedLead(lead)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none transition"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => openEmailModal(lead)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-none transition"
                    title="Reply via Email"
                  >
                    <Send size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

