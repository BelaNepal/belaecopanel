'use client';

import React, { useEffect, useState } from 'react';
import { newsletterAPI, campaignAPI } from '@/lib/api';
import { useAdminStore } from '@/stores';
import { Trash2, Mail, Calendar, CheckCircle, XCircle, Plus, Edit, Send } from 'lucide-react';
import { format } from 'date-fns';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  serviceTag?: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  sentAt?: string;
  createdAt: string;
  serviceTag?: string;
}

export default function NewslettersPage() {
  const { activeVertical } = useAdminStore();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  
  // Campaign Form State
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({ name: '', subject: '', content: '' });

  const fetchData = async () => {
    try {
      const [subRes, campRes] = await Promise.all([
        newsletterAPI.getAll({ serviceTag: activeVertical }),
        campaignAPI.getAll({ serviceTag: activeVertical })
      ]);
      setSubscribers(subRes.data);
      setCampaigns(campRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeVertical]);

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;
    try {
      await newsletterAPI.delete(id);
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to delete subscriber');
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, serviceTag: activeVertical };
      if (editingCampaign) {
        const res = await campaignAPI.update(editingCampaign.id, payload);
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? res.data : c));
      } else {
        const res = await campaignAPI.create(payload);
        setCampaigns([res.data, ...campaigns]);
      }
      setShowCampaignForm(false);
      setEditingCampaign(null);
      setFormData({ name: '', subject: '', content: '' });
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content
    });
    setShowCampaignForm(true);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await campaignAPI.delete(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Newsletter Center
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'subscribers' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Subscribers ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-none font-medium transition-colors ${
              activeTab === 'campaigns' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
        </div>
      </div>

      {activeTab === 'subscribers' ? (
        <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Vertical</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Subscribed Date</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No subscribers found yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-gray-800 dark:text-gray-200 font-medium">
                        {sub.email}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          sub.serviceTag === 'ECOPANELS' 
                            ? 'bg-green-100 text-green-800' 
                            : sub.serviceTag === 'MODULARHOMES'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {sub.serviceTag === 'ECOPANELS' ? 'Eco' : sub.serviceTag === 'MODULARHOMES' ? 'Modular' : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sub.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {sub.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {sub.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {format(new Date(sub.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                          title="Remove Subscriber"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingCampaign(null);
                setFormData({ name: '', subject: '', content: '' });
                setShowCampaignForm(!showCampaignForm);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-none hover:bg-secondary/90 transition-colors shadow-md"
            >
              <Plus size={18} />
              {showCampaignForm ? 'Cancel' : 'New Campaign'}
            </button>
          </div>

          {showCampaignForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-none shadow-md border border-gray-200 dark:border-gray-700 mb-8 animate-in slide-in-from-top duration-300">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h2>
              <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. January Newsletter"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. New Eco Panels Available!"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-none dark:bg-gray-700 dark:text-white h-40"
                    placeholder="Write your newsletter content here..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCampaignForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-none shadow-sm"
                  >
                    {editingCampaign ? 'Update Campaign' : 'Save Draft'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white dark:bg-gray-800 p-4 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg dark:text-white">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Subject: {campaign.subject}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      campaign.serviceTag === 'ECOPANELS' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.serviceTag === 'MODULARHOMES'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.serviceTag === 'ECOPANELS' ? 'Eco' : campaign.serviceTag === 'MODULARHOMES' ? 'Modular' : 'N/A'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      campaign.status === 'SENT' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {format(new Date(campaign.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-none">
                No campaigns created yet. Start by creating a new one!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
