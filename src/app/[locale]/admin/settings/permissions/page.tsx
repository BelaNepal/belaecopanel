
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import axios from 'axios';
import { Users, Search, Save, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Record<string, boolean> | null;
}

const PERMISSION_GROUPS = [
  {
    category: 'Core & Dashboard',
    permissions: [
      { key: 'canViewDashboard', label: 'Access Dashboard' },
      { key: 'canViewReports', label: 'View Analytics & Reports' },
    ]
  },
  {
    category: 'User Management',
    permissions: [
      { key: 'canManageUsers', label: 'Manage All Users (Master Override)' },
      { key: 'canManageStaff', label: 'Manage Staff & Admins' },
      { key: 'canManageDealers', label: 'Manage Dealers' },
      { key: 'canManageEngineers', label: 'Manage Engineers' },
      { key: 'canManageContractors', label: 'Manage Contractors' },
      { key: 'canManageCustomers', label: 'Manage Customers' },
    ]
  },
  {
    category: 'Product Catalog',
    permissions: [
      { key: 'canViewProducts', label: 'View Products' },
      { key: 'canManageProducts', label: 'Create/Edit Products' },
      { key: 'canManageInventory', label: 'Manage Inventory' },
    ]
  },
  {
    category: 'Sales & Orders',
    permissions: [
      { key: 'canViewOrders', label: 'View Orders' },
      { key: 'canManageOrders', label: 'Process Orders' },
      { key: 'canViewQuotations', label: 'View Quotations' },
      { key: 'canManageQuotations', label: 'Process Quotations' },
    ]
  },
  {
    category: 'Project Management',
    permissions: [
      { key: 'canViewProjects', label: 'View Projects' },
      { key: 'canManageProjects', label: 'Manage Projects' },
      { key: 'canReviewDocuments', label: 'Review Project Documents' },
    ]
  },
  {
    category: 'Content & Marketing',
    permissions: [
      { key: 'canManageArticles', label: 'Manage Articles/Blog' },
      { key: 'canManageTestimonials', label: 'Manage Testimonials' },
      { key: 'canManageFAQs', label: 'Manage FAQs' },
      { key: 'canManagePopups', label: 'Manage Popups' },
      { key: 'canManageNewsletters', label: 'Manage Newsletters' },
    ]
  },
  {
    category: 'Communication',
    permissions: [
      { key: 'canAccessMail', label: 'Access Mail Center' },
      { key: 'canSendEmails', label: 'Send System Emails' },
    ]
  },
  {
    category: 'System',
    permissions: [
      { key: 'canManageSystem', label: 'System Settings & Logs' },
      { key: 'canViewLogs', label: 'View Audit Logs' },
    ]
  }
];

const PRESET_ROLES: Record<string, string[]> = {
  'Administrator': ['ALL'],
  'Content Manager': [
    'canViewDashboard',
    'canManageArticles', 'canManageTestimonials', 'canManageFAQs', 
    'canManagePopups', 'canManageNewsletters', 'canAccessMail'
  ],
  'Sales Manager': [
    'canViewDashboard', 
    'canViewOrders', 'canManageOrders', 
    'canViewQuotations', 'canManageQuotations',
    'canViewProducts', 
    'canSendEmails', 'canAccessMail'
  ],
  'Inventory Manager': [
    'canViewDashboard', 
    'canViewProducts', 'canManageProducts', 'canManageInventory'
  ],
  'Support Staff': [
    'canViewDashboard', 
    'canViewOrders', 'canViewQuotations', 
    'canAccessMail'
  ],
  'Viewer (Read Only)': [
    'canViewDashboard', 'canViewReports', 
    'canViewProducts', 'canViewOrders', 'canViewQuotations', 'canViewProjects'
  ]
};

export default function PermissionsPage() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    const userPerms = user.permissions || {};
    const initialState: Record<string, boolean> = {};
    
    // Initialize all known permissions to false unless user has them true
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(perm => {
        initialState[perm.key] = !!userPerms[perm.key];
      });
    });
    
    setEditedPermissions(initialState);
  };

  const handlePermissionChange = (key: string) => {
    setEditedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const applyPreset = (presetName: string) => {
    const keys = PRESET_ROLES[presetName];
    if (!keys) return;

    const newPerms: Record<string, boolean> = {};
    
    // First set all to false
    PERMISSION_GROUPS.forEach(group => {
      group.permissions.forEach(p => {
        newPerms[p.key] = false;
      });
    });

    if (keys[0] === 'ALL') {
       PERMISSION_GROUPS.forEach(group => {
            group.permissions.forEach(p => {
                newPerms[p.key] = true;
            });
       });
    } else {
        keys.forEach((k: string) => {
            newPerms[k] = true;
        });
    }
    
    setEditedPermissions(newPerms);
    toast.info(`Applied ${presetName} preset`);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;

    try {
      await axios.put(
        `${API_URL}/users/${selectedUser.id}/permissions`,
        { permissions: editedPermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Permissions updated successfully');
      fetchUsers(); // Refresh list
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Permissions
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No users found</div>
            ) : (
              users.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                  <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {user.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          {selectedUser ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Permissions
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                  </p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

              {/* Preset Roles */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(PRESET_ROLES).map(role => (
                    <button
                        key={role}
                        onClick={() => applyPreset(role)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        {role}
                    </button>
                    ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 max-h-[70vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.category} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b dark:border-gray-600 pb-2">
                         {group.category}
                      </h3>
                      <div className="space-y-3">
                        {group.permissions.map((perm) => (
                           <label key={perm.key} className="flex items-start gap-3 p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer group">
                              <div className="relative flex items-center mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={editedPermissions[perm.key] || false}
                                    onChange={() => handlePermissionChange(perm.key)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </div>
                               <div className="flex-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white block">
                                  {perm.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {perm.key}
                                </span>
                              </div>
                           </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a user to manage permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
