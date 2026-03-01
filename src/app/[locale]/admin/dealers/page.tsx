'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { Check, X, AlertCircle, ChevronLeft, ChevronRight, Edit2, Mail, Send, Ban, Plus, Trash2 } from 'lucide-react';
import SendEmailModal from '@/components/admin/SendEmailModal';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Dealer {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  role?: string;
  serviceTag?: string;
  userId?: string;
}

export default function DealersAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>(searchParams.get('role') || 'all');
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [editFormData, setEditFormData] = useState({
    companyName: '',
    contactPerson: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    password: '',
  });

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phoneNumber: '',
    role: 'ENGINEER'
  });

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState({ email: '', name: '' });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check Permissions based on role view
  const canManageView = () => {
     if (user?.role === 'ADMIN') return true;
     
     const roleParam = searchParams.get('role');
     if (!roleParam) return user?.permissions?.canManageDealers; // Default to Dealers
     
     if (roleParam === 'ENGINEER') return user?.permissions?.canManageEngineers;
     if (roleParam === 'CONTRACTOR') return user?.permissions?.canManageContractors;
     if (roleParam === 'DEALER') return user?.permissions?.canManageDealers;
     
     return user?.permissions?.canManageDealers; // Fallback
  };

  const hasAccess = canManageView();

  // Update filterRole from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setFilterRole(roleParam);
    } else {
      setFilterRole('all');
    }
  }, [searchParams]);

  useEffect(() => {
    const dealerId = searchParams.get('dealerId');
    if (dealerId && dealers.length > 0) {
      const dealer = dealers.find(d => d.id === dealerId);
      if (dealer) {
        setSelectedDealerId(dealerId);
      }
    }
  }, [searchParams, dealers]);

  useEffect(() => {
    if (!mounted) return;
    if (!token || user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    fetchDealers();
  }, [token, user, router, mounted, page, filterStatus, activeVertical, filterRole]);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const params: any = { skip, take: limit };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      params.serviceTag = activeVertical;

      if (activeVertical === 'ECOPANELS') {
        params.role = 'DEALER';
      } else {
        // Modular Homes
        if (filterRole !== 'all') {
          params.role = filterRole;
        } else {
          // If 'all', we might want both, but backend might expect one.
          // If backend supports array or no role filter (returns all for serviceTag), that's fine.
          // But my backend implementation checks `if (role) where.user = { role: role }`.
          // So if I don't send role, it returns all dealers with that serviceTag.
          // Since I added `serviceTag` to Dealer model, filtering by serviceTag should be enough 
          // to get Engineers/Contractors if they are created with that serviceTag.
          // However, I should probably ensure I don't get regular customers if they have serviceTag (though customers don't have Dealer record).
        }
      }

      const res = await axios.get(`${API_URL}/dealers`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      // Map backend response to frontend interface
      const mappedDealers = res.data.data.map((d: any) => ({
        userId: d.user?.id || d.userId, // Capture User ID for soft delete
        id: d.id,
        companyName: d.companyName,
        email: d.user?.email || 'N/A',
        phone: d.phoneNumber || 'N/A',
        address: d.address,
        city: d.city,
        status: d.status,
        createdAt: d.createdAt,
        role: d.user?.role,
        serviceTag: d.serviceTag
      }));
      
      setDealers(mappedDealers);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/dealers`, {
        ...addFormData,
        serviceTag: activeVertical,
        role: activeVertical === 'ECOPANELS' ? 'DEALER' : addFormData.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setAddFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        companyName: '',
        phoneNumber: '',
        role: 'ENGINEER'
      });
      fetchDealers();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleEditClick = async (dealer: Dealer) => {
    try {
      const res = await axios.get(`${API_URL}/dealers/${dealer.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullDealer = res.data;
      
      setEditFormData({
        companyName: fullDealer.companyName,
        contactPerson: fullDealer.contactPerson || '',
        phoneNumber: fullDealer.phoneNumber,
        address: fullDealer.address,
        city: fullDealer.city,
        state: fullDealer.state || '',
        postalCode: fullDealer.postalCode || '',
        password: '',
      });
      setEditingDealer(dealer);
    } catch (error) {
      console.error('Failed to fetch dealer details:', error);
      alert('Failed to load dealer details');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDealer) return;

    try {
      await axios.patch(`${API_URL}/dealers/${editingDealer.id}/profile`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setEditingDealer(null);
      fetchDealers();
      alert('Dealer updated successfully');
    } catch (error: any) {
      console.error('Failed to update dealer:', error);
      alert(error.response?.data?.message || 'Failed to update dealer');
    }
  };

  const handleApprove = async (dealerId: string) => {
    try {
      await axios.patch(
        `${API_URL}/dealers/${dealerId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDealers();
      setSelectedDealerId(null);
    } catch (error) {
      console.error('Failed to approve dealer:', error);
      alert('Error approving dealer');
    }
  };

  const handleReject = async (dealerId: string) => {
    try {
      await axios.patch(
        `${API_URL}/dealers/${dealerId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDealers();
      setSelectedDealerId(null);
    } catch (error) {
      console.error('Failed to reject dealer:', error);
      alert('Error rejecting dealer');
    }
  };

  const handleSuspend = async (dealerId: string) => {
    if (!confirm('Are you sure you want to suspend this dealer?')) return;
    try {
      await axios.patch(
        `${API_URL}/dealers/${dealerId}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDealers();
      setSelectedDealerId(null);
    } catch (error) {
      console.error('Failed to suspend dealer:', error);
      alert('Error suspending dealer');
    }
  };

  const handleDelete = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
       alert('Cannot delete: No linked user found');
       return;
    }
    if (!confirm('Are you sure you want to delete this user? They will be moved to Trash.')) return;
    
    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDealers();
      setSelectedDealerId(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Error deleting user');
    }
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1); // Reset to first page on filter change
  };

  const openEmailModal = (dealer: Dealer) => {
    setEmailRecipient({ email: dealer.email, name: dealer.companyName });
    setEmailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'SUSPENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!mounted || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!hasAccess) {
      const required = searchParams.get('role') === 'ENGINEER' ? 'canManageEngineers' : 
                       searchParams.get('role') === 'CONTRACTOR' ? 'canManageContractors' : 
                       'canManageDealers';
      return <UnauthorizedAccess requiredPermission={required} />;
  }

  const selectedDealer = dealers.find((d) => d.id === selectedDealerId);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={emailRecipient.email}
        recipientName={emailRecipient.name}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">
            {activeVertical === 'ECOPANELS' 
              ? 'Dealers' 
              : filterRole === 'CONTRACTOR' 
                ? 'Contractors' 
                : filterRole === 'ENGINEER' 
                  ? 'Engineers' 
                  : 'Engineers & Contractors'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your {activeVertical === 'ECOPANELS' 
              ? 'dealers' 
              : filterRole === 'CONTRACTOR' 
                ? 'contractors' 
                : filterRole === 'ENGINEER' 
                  ? 'engineers' 
                  : 'engineers and contractors'} for {activeVertical === 'ECOPANELS' ? 'Eco Panels' : 'Modular Homes'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-none hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={18} />
          {activeVertical === 'ECOPANELS' 
            ? 'Add Dealer' 
            : filterRole === 'CONTRACTOR' 
              ? 'Add Contractor' 
              : filterRole === 'ENGINEER' 
                ? 'Add Engineer' 
                : 'Add User'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {['all', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((status) => (
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

        {activeVertical === 'MODULARHOMES' && (
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {['all', 'ENGINEER', 'CONTRACTOR'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setFilterRole(role);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-none text-sm whitespace-nowrap transition-all duration-300 ${
                  filterRole === role
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {role === 'all' ? 'All Roles' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
              </button>
            ))}
          </div>
        )}
      </div>

            {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-md w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {activeVertical === 'ECOPANELS' 
                  ? 'Add Dealer' 
                  : filterRole === 'CONTRACTOR' 
                    ? 'Add Contractor' 
                    : filterRole === 'ENGINEER' 
                      ? 'Add Engineer' 
                      : 'Add User'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              {activeVertical === 'MODULARHOMES' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={addFormData.role}
                    onChange={(e) => setAddFormData({ ...addFormData, role: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ENGINEER">Engineer</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={addFormData.firstName}
                    onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={addFormData.lastName}
                    onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={addFormData.companyName}
                  onChange={(e) => setAddFormData({ ...addFormData, companyName: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={addFormData.phoneNumber}
                  onChange={(e) => setAddFormData({ ...addFormData, phoneNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dealer Detail Modal */}
      {selectedDealer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold dark:text-white mb-4">{selectedDealer.companyName}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Person</p>
                <p className="font-semibold dark:text-white">{selectedDealer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-semibold dark:text-white">{selectedDealer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`text-xs px-2 py-1 rounded-none inline-block mt-1 ${getStatusColor(selectedDealer.status)}`}>
                  {selectedDealer.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Applied On</p>
                <p className="font-semibold dark:text-white">
                  {new Date(selectedDealer.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedDealer.role && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <p className="font-semibold dark:text-white">{selectedDealer.role}</p>
                </div>
              )}
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Address</p>
              <p className="dark:text-white">{selectedDealer.address}</p>
              {selectedDealer.city && <p className="dark:text-white">{selectedDealer.city}</p>}
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={() => openEmailModal(selectedDealer)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-none hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
              >
                <Send size={18} /> Send Email
              </button>
            </div>

            {selectedDealer.status === 'PENDING' && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleApprove(selectedDealer.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-none hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Check size={18} /> Approve
                </button>
                <button
                  onClick={() => handleReject(selectedDealer.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            )}

            {selectedDealer.status === 'APPROVED' && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleSuspend(selectedDealer.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Ban size={18} /> Suspend Dealer
                </button>
              </div>
            )}

            {selectedDealer.status === 'SUSPENDED' && (
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => handleApprove(selectedDealer.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-none hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Check size={18} /> Reactivate Dealer
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedDealerId(null)}
              className="w-full bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-none hover:bg-gray-400 dark:hover:bg-gray-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Dealer Modal */}
      {editingDealer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Edit Dealer</h2>
              <button onClick={() => setEditingDealer(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editFormData.contactPerson}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={editFormData.postalCode}
                    onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingDealer(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dealers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Service Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Location</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold dark:text-white">{dealer.companyName}</div>
                  <div className="text-xs text-gray-500">ID: {dealer.id.slice(0, 8)}</div>
                  {dealer.role && dealer.role !== 'DEALER' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded mt-1 inline-block">
                      {dealer.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>{dealer.email}</div>
                  <div className="text-xs">{dealer.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">                  {dealer.serviceTag === 'ECOPANELS' ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Eco Panels</span>
                  ) : dealer.serviceTag === 'MODULARHOMES' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Modular Homes</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">                  {dealer.city || 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(dealer.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-none ${getStatusColor(dealer.status)}`}>
                    {dealer.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => setSelectedDealerId(dealer.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none transition"
                    title="View Details"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    onClick={() => handleEditClick(dealer)}
                    className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-none transition"
                    title="Edit Dealer"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => openEmailModal(dealer)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-none transition"
                    title="Send Email"
                  >
                    <Mail size={18} />
                  </button>
                  <button
                    onClick={(e) => dealer.userId && handleDelete(dealer.userId, e)}
                    disabled={!dealer.userId}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none transition disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete User"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
