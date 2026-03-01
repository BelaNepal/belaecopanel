'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore, useAdminStore } from '@/stores';
import { projectAPI, productAPI, articleAPI } from '@/lib/api';
import { Trash2, RefreshCw, AlertTriangle, Search, Filter, FileText, Package, Briefcase, Users, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function TrashPage() {
  const { user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'products' | 'articles' | 'users' | 'leads'>('projects');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrashItems();
  }, [activeTab]);

  const fetchTrashItems = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'projects') {
        res = await projectAPI.getTrash();
      } else if (activeTab === 'products') {
        res = await productAPI.getTrash();
      } else if (activeTab === 'articles') {
        res = await articleAPI.getTrash();
      } else if (activeTab === 'users') {
        const token = localStorage.getItem('token');
        res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
             params: { 
               active: 'false',
               serviceTag: activeVertical 
             },
             headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeTab === 'leads') {
        const token = localStorage.getItem('token');
        res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads`, {
             params: { 
               deleted: 'true',
               serviceTag: activeVertical 
             },
             headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Handle the response structure properly
      const data = res?.data?.data || res?.data || [];
      setItems(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('Failed to fetch trash items', error);
      setItems([]); // reset on error
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      if (activeTab === 'projects') await projectAPI.restore(id);
      else if (activeTab === 'products') await productAPI.restore(id);
      else if (activeTab === 'articles') await articleAPI.restore(id);
      else if (activeTab === 'users') {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/restore/${id}`, {}, {
           headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeTab === 'leads') {
        const token = localStorage.getItem('token');
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/${id}/restore`, {}, {
           headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchTrashItems();
    } catch (error) {
      console.error('Failed to restore item', error);
      alert('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to PERMANENTLY delete this item? This action cannot be undone.')) return;
    try {
      if (activeTab === 'projects') await projectAPI.permanentDelete(id);
      else if (activeTab === 'products') await productAPI.permanentDelete(id);
      else if (activeTab === 'articles') await articleAPI.permanentDelete(id);
      else if (activeTab === 'users') {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/permanent/${id}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
      } else if (activeTab === 'leads') {
        const token = localStorage.getItem('token');
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/leads/${id}/permanent`, {
           headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchTrashItems();
    } catch (error) {
      console.error('Failed to delete item', error);
      alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const searchFields = [
      item.title,
      item.name,
      item.firstName,
      item.lastName,
      item.email,
      item.id
    ];
    
    // Check if any field matches the search query
    const matchesSearch = searchFields.some(field => 
      field && typeof field === 'string' && field.toLowerCase().includes(searchLower)
    );

    // Filter by Vertical (Service Tag)
    // Most items should have serviceTag. If not, we might display them or hide them.
    // For users returned by active=false, they might not have serviceTag populated correctly or it might be null.
    // We will show them regardless for now unless strict filtering is requested.
    // Ideally user items have 'serviceTag' from the backend join if we want strict filtering.
    // Let's assume for users we show all inactive for admins to manage.
    
    const matchesVertical = !item.serviceTag || item.serviceTag === activeVertical;
    
    return matchesSearch && matchesVertical;
  });

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-primary text-white shadow-md'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Trash2 className="text-red-500" size={32} /> System Trash
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage deleted items across the system. Restore or permanently delete them.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <TabButton id="projects" label="Projects" icon={Briefcase} />
        <TabButton id="products" label="Products" icon={Package} />
        <TabButton id="articles" label="Articles" icon={FileText} />
        <TabButton id="users" label="Users" icon={Users} />
        <TabButton id="leads" label="Enquiries" icon={Mail} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={`Search deleted ${activeTab}...`}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Item Details</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deleted Date</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading trash items...</td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Trash2 size={48} className="text-gray-300" />
                      <p>No deleted items found in {activeTab}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.title || item.name || (item.firstName && `${item.firstName} ${item.lastName}`) || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">ID: {item.id}</div>
                      {activeTab === 'users' && item.email && (
                         <div className="text-sm text-gray-500 mt-1">{item.email}</div>
                      )}
                      {activeTab === 'leads' && item.email && (
                         <div className="text-sm text-gray-500 mt-1">{item.email} - {item.phone}</div>
                      )}
                      {item.description && activeTab !== 'users' && activeTab !== 'leads' && (
                        <div className="text-sm text-gray-500 truncate max-w-md mt-1">
                          {item.description.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {(item.deletedAt || item.updatedAt) ? format(new Date(item.deletedAt || item.updatedAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRestore(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                          title="Restore Item"
                        >
                          <RefreshCw size={16} /> Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                          title="Delete Permanently"
                        >
                          <AlertTriangle size={16} /> Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
