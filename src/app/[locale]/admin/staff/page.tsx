'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import SendEmailModal from '@/components/admin/SendEmailModal';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Staff {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phoneNumber: string;
}

export default function StaffAdmin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  const roleFilter = searchParams.get('role');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phoneNumber: '',
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

  useEffect(() => {
    if (!mounted) return;
    if (!token || user?.role !== 'ADMIN') {
      router.push('/admin/login');
      return;
    }

    fetchStaff();
  }, [token, user, router, mounted, page, roleFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      
      let endpoint = `${API_URL}/staff`;
      let params: any = { skip, take: limit };

      if (roleFilter === 'ADMIN') {
        endpoint = `${API_URL}/users`;
        params.role = 'ADMIN';
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      // Map backend response to frontend interface
      const mappedStaff = res.data.data.map((s: any) => {
        // If fetching from /users (ADMIN), structure is clean user object
        if (roleFilter === 'ADMIN') {
          return {
            id: s.id, // User ID directly since no Staff record
            email: s.email,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            phone: 'N/A', // Users don't have phone on root usually?
            department: 'Administration',
            position: 'Administrator',
            isActive: s.isActive,
            createdAt: s.createdAt
          };
        }
        
        // Standard /staff response
        return {
          id: s.id,
          email: s.user?.email || '',
          name: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim(),
          phone: s.phoneNumber || '',
          department: s.department,
          position: s.position,
          isActive: s.user?.isActive,
          createdAt: s.createdAt
        };
      });
      
      setStaff(mappedStaff);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`${API_URL}/staff/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        if (!formData.password) {
          alert('Password is required for new staff members');
          return;
        }
        await axios.post(`${API_URL}/staff`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        department: '',
        position: '',
        phoneNumber: '',
      });
      fetchStaff();
    } catch (error: any) {
      console.error('Failed to save staff:', error);
      alert(error.response?.data?.message || 'Failed to save staff member');
    }
  };

  const handleEdit = (staffMember: Staff) => {
    // We need to fetch full details or just use what we have
    // Since we don't have the full user object here, we might need to fetch it or just pre-fill what we can
    // For simplicity, let's assume we can't edit password here easily without a separate flow
    setEditingId(staffMember.id);
    // Note: This is a simplification. Ideally we'd fetch the single staff member to get all fields
    // But for now we'll just open the form. The user will have to re-enter some data if we don't fetch it.
    // Let's try to fill what we have.
    const names = staffMember.name.split(' ');
    setFormData({
      email: staffMember.email,
      password: '', // Don't fill password
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      department: staffMember.department || '',
      position: staffMember.position || '',
      phoneNumber: staffMember.phone || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate (soft delete) this user?')) return;
    
    try {
      if (roleFilter === 'ADMIN') {
        await axios.delete(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`${API_URL}/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete staff:', error);
      alert('Failed to delete staff member');
    }
  };

  const openEmailModal = (staffMember: Staff) => {
    setEmailRecipient({ email: staffMember.email, name: staffMember.name });
    setEmailModalOpen(true);
  };

  if (!mounted) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Check Permissions
  const canManageStaff = user?.role === 'ADMIN' || user?.permissions?.canManageStaff;

  if (!canManageStaff) {
      return <UnauthorizedAccess requiredPermission="canManageStaff" />;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={emailRecipient.email}
        recipientName={emailRecipient.name}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">
          {roleFilter === 'ADMIN' ? 'Administrators' : 'Staff Management'}
        </h1>
        {roleFilter !== 'ADMIN' && (
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                department: '',
                position: '',
                phoneNumber: '',
              });
              setShowForm(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition flex items-center gap-2"
          >
            <Plus size={20} /> Add Staff
          </button>
        )}
      </div>

      {showForm && roleFilter !== 'ADMIN' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  placeholder={editingId ? 'Enter new password to change' : ''}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    <option value="SALES">Sales</option>
                    <option value="SUPPORT">Support</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="MANAGEMENT">Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr
                key={s.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold dark:text-white">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.position}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>{s.email}</div>
                  <div className="text-xs">{s.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {s.department}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-none ${
                      s.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {roleFilter !== 'ADMIN' && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(s.id);
                          setFormData({
                             email: s.email,
                             firstName: s.name.split(' ')[0],
                             lastName: s.name.split(' ').slice(1).join(' '),
                             department: s.department || '',
                             position: s.position || '',
                             phoneNumber: s.phone || '',
                          });
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none transition"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openEmailModal(s)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-none transition"
                    title="Send Email"
                  >
                    <Mail size={18} />
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
