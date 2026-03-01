'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import { popupAPI } from '@/lib/api';
import { 
  Plus, Edit2, Trash2, X, Megaphone, 
  Calendar, Link as LinkIcon, Monitor, 
  Eye, EyeOff, Layout
} from 'lucide-react';
import Image from 'next/image';

interface Popup {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
  pagePath: string;
  displayMode: 'ALWAYS' | 'ONCE_SESSION' | 'ONCE_EVER';
  type: 'MODAL' | 'SLIDE_IN';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  serviceTag: string;
}

interface FormData {
  title: string;
  content: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  pagePath: string;
  displayMode: string;
  type: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

const DISPLAY_MODES = [
  { value: 'ALWAYS', label: 'Always' },
  { value: 'ONCE_SESSION', label: 'Once per Session' },
  { value: 'ONCE_EVER', label: 'Once Ever' },
];

const POPUP_TYPES = [
  { value: 'MODAL', label: 'Center Modal Overlay' },
  { value: 'SLIDE_IN', label: 'Bottom-Left Slide In' },
];

export default function PopupsAdmin() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    pagePath: '/',
    displayMode: 'ONCE_SESSION',
    type: 'MODAL',
    isActive: true,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      // router.push('/admin/login');
    }
    fetchPopups();
  }, [token, user, mounted, activeVertical]);

  const fetchPopups = async () => {
    try {
      setLoading(true);
      const res = await popupAPI.getAll({ serviceTag: activeVertical });
      setPopups(res.data);
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        serviceTag: activeVertical,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        imageUrl: formData.imageUrl || null,
        linkUrl: formData.linkUrl || null,
        linkText: formData.linkText || null,
        content: formData.content || null,
      };

      if (editingId) {
        await popupAPI.update(editingId, payload);
      } else {
        await popupAPI.create(payload);
      }
      
      resetForm();
      fetchPopups();
    } catch (error) {
      console.error('Failed to save popup:', error);
      alert('Error saving popup');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      linkText: '',
      pagePath: '/',
      displayMode: 'ONCE_SESSION',
      type: 'MODAL',
      isActive: true,
      startDate: '',
      endDate: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (popup: Popup) => {
    setFormData({
      title: popup.title,
      content: popup.content || '',
      imageUrl: popup.imageUrl || '',
      linkUrl: popup.linkUrl || '',
      linkText: popup.linkText || '',
      pagePath: popup.pagePath,
      displayMode: popup.displayMode,
      type: popup.type || 'MODAL',
      isActive: popup.isActive,
      startDate: popup.startDate ? new Date(popup.startDate).toISOString().slice(0, 16) : '',
      endDate: popup.endDate ? new Date(popup.endDate).toISOString().slice(0, 16) : '',
    });
    setEditingId(popup.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await popupAPI.delete(id);
      fetchPopups();
    } catch (error) {
      console.error(error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-500" />
            Popups & Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage popups for {activeVertical === 'ECOPANELS' ? 'Eco Panels' : 'Modular Homes'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Popup
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">
                {editingId ? 'Edit Popup' : 'New Popup'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Spring Sale"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
                  <textarea
                    rows={3}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Message displayed in the popup body"
                  />
                </div>
                
                 <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Layout Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-blue-50/50 dark:bg-blue-900/10"
                  >
                    {POPUP_TYPES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Display Mode</label>
                  <select
                    value={formData.displayMode}
                    onChange={(e) => setFormData({ ...formData, displayMode: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {DISPLAY_MODES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Image URL</label>
                   {/* Optional: Add browse button here */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="https://... (Only used for Modals)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Page Path</label>
                  <input
                    type="text"
                    value={formData.pagePath}
                    onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="/ or /products"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Link URL</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="/contact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Link Text</label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Learn More"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition -translate-y-[1px] ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <span className="text-sm dark:text-gray-300">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingId ? 'Update Popup' : 'Create Popup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
              <tr>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Path</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Mode</th>
                <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Dates</th>
                <th className="p-4 text-sm font-medium text-right text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {popups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No popups found. Create one to get started.
                  </td>
                </tr>
              ) : (
                popups.map((popup) => (
                  <tr key={popup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-4">
                      {popup.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium dark:text-white">{popup.title}</div>
                      {popup.linkText && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <LinkIcon size={12} /> {popup.linkText}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm dark:text-gray-300">
                       <div className="flex items-center gap-1.5">
                         <Layout size={14} className="text-gray-400" />
                         {popup.type === 'MODAL' ? 'Modal' : 'Slide-In'}
                       </div>
                    </td>
                    <td className="p-4 dark:text-gray-300 font-mono text-xs w-fit">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {popup.pagePath}
                      </span>
                    </td>
                    <td className="p-4 text-sm dark:text-gray-300">
                      {DISPLAY_MODES.find(m => m.value === popup.displayMode)?.label || popup.displayMode}
                    </td>
                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col gap-1 text-xs">
                         {popup.startDate ? <span>Start: {new Date(popup.startDate).toLocaleDateString()}</span> : null}
                         {popup.endDate ? <span>End: {new Date(popup.endDate).toLocaleDateString()}</span> : null}
                         {!popup.startDate && !popup.endDate && <span className="opacity-50">No schedule</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(popup)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(popup.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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