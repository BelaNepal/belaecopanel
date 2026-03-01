'use client';

import React, { useState, useEffect } from 'react';
import { mailAPI } from '@/lib/api';
import { useAdminStore } from '@/stores';
import { Mail, Send, FileText, History, Plus, Trash2, Edit, CheckCircle, AlertCircle, X, Search, Users, Clock, Zap, Eye, LayoutTemplate } from 'lucide-react';

const PREDEFINED_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Bela Eco Panels!',
    body: `<h2>Welcome to the Family!</h2><p>We are thrilled to have you with us. Bela Eco Panels is dedicated to providing sustainable building solutions.</p><p>Explore our catalog and let us know if you have any questions.</p>`
  },
  {
    id: 'newsletter_monthly',
    name: 'Monthly Newsletter',
    subject: 'Bela Eco Panels: Monthly Update',
    body: `<h2>Monthly Update</h2><p>Here is what we have been up to this month...</p><ul><li>New Product Launch</li><li>Community Events</li><li>Sustainability Goals</li></ul>`
  },
  {
    id: 'promo',
    name: 'Special Promotion',
    subject: 'Exclusive Offer Inside!',
    body: `<h2>Special Offer for You</h2><p>Get 10% off on your next order of Eco Panels. Use code <strong>ECO10</strong> at checkout.</p>`
  }
];

export default function MailDashboard() {
  const { activeVertical } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'compose' | 'templates' | 'logs' | 'newsletter'>('compose');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Compose State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  
  // Newsletter State
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  
  // Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '', type: 'CUSTOM', trigger: '' });

  // User Selection State
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchLogs();
    fetchUsers();
  }, [activeVertical]);

  const fetchTemplates = async () => {
    try {
      const res = await mailAPI.getTemplates({ serviceTag: activeVertical });
      if (res.data.length === 0) {
        // Use predefined if backend is empty for demo
        setTemplates([]); 
      } else {
        setTemplates(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mailAPI.createTemplate({ ...newTemplate, serviceTag: activeVertical });
      alert('Template created successfully!');
      setShowTemplateModal(false);
      setNewTemplate({ name: '', subject: '', body: '', type: 'CUSTOM', trigger: '' });
      fetchTemplates();
    } catch (error) {
      console.error(error);
      alert('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await mailAPI.getLogs({ serviceTag: activeVertical });
      setLogs(res.data.data);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await mailAPI.getUsers({ serviceTag: activeVertical });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleAddManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;
    
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!recipients.includes(manualEmail)) {
      setRecipients([...recipients, manualEmail]);
      setManualEmail('');
    }
  };

  const handleSend = async (e: React.FormEvent, isNewsletter = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalRecipients: string[] = [];

      if (isNewsletter) {
        finalRecipients = ['GROUP:SUBSCRIBERS'];
      } else {
        finalRecipients = selectedGroup === 'CUSTOM' ? recipients : [`GROUP:${selectedGroup}`];
      }
      
      if (finalRecipients.length === 0) {
        alert('Please select at least one recipient.');
        setLoading(false);
        return;
      }

      await mailAPI.send({ subject, body, recipients: finalRecipients, serviceTag: activeVertical });
      alert(isNewsletter ? 'Newsletter campaign started successfully!' : 'Email sent successfully!');
      
      if (isNewsletter) {
        setShowNewsletterModal(false);
      }
      
      setSubject('');
      setBody('');
      setRecipients([]);
      setSelectedGroup('');
      fetchLogs();
    } catch (error) {
      console.error(error);
      alert('Failed to send email. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipient = (email: string) => {
    setRecipients(prev => 
      prev.includes(email) 
        ? prev.filter(r => r !== email)
        : [...prev, email]
    );
  };

  const removeRecipient = (email: string) => {
    setRecipients(prev => prev.filter(r => r !== email));
  };

  const applyTemplate = (template: any) => {
    setSubject(template.subject);
    setBody(template.body);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <Mail className="text-primary" /> Mail Center
        </h1>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-2 pb-2 flex gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('compose')}
          className={`pb-3 px-4 font-medium transition-all whitespace-nowrap ${
            activeTab === 'compose'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send size={18} /> Compose
          </div>
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`pb-3 px-4 font-medium transition-all whitespace-nowrap ${
            activeTab === 'newsletter'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} /> Newsletter
          </div>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-4 font-medium transition-all whitespace-nowrap ${
            activeTab === 'templates'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={18} /> Templates
          </div>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 font-medium transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <History size={18} /> History
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 p-6 min-h-[500px]">
        
        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">New Message</h2>
              <div className="flex gap-2">
                 {PREDEFINED_TEMPLATES.map(t => (
                   <button 
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition"
                   >
                     {t.name}
                   </button>
                 ))}
              </div>
            </div>
            
            <form onSubmit={(e) => handleSend(e, false)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      if (e.target.value !== 'CUSTOM') setRecipients([]);
                    }}
                    className="w-full p-3 rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Group...</option>
                    <option value="DEALERS">All Dealers</option>
                    <option value="CONTRACTORS">All Contractors</option>
                    <option value="CUSTOMERS">All Customers</option>
                    <option value="STAFF">All Staff</option>
                    <option value="SUBSCRIBERS">Newsletter Subscribers</option>
                    <option value="CUSTOM">Custom Recipients</option>
                  </select>
                </div>
                
                {selectedGroup === 'CUSTOM' && (
                  <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Recipients ({recipients.length} selected)
                    </label>

                    {/* Manual Entry */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="email"
                        placeholder="Enter email address manually..."
                        value={manualEmail}
                        onChange={(e) => setManualEmail(e.target.value)}
                        className="flex-1 p-2 rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddManualEmail(e);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={handleAddManualEmail}
                        className="bg-gray-200 dark:bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                      >
                        Add
                      </button>
                    </div>

                    {/* Selected Tags */}
                    {recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 min-h-[40px]">
                        {recipients.map(email => (
                          <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            {email}
                            <button type="button" onClick={() => removeRecipient(email)} className="hover:text-red-500"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search users from database..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 p-2 rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm"
                      />
                    </div>

                    {/* List */}
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 custom-scrollbar">
                      {filteredUsers.map(user => (
                        <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0">
                          <input
                            type="checkbox"
                            checked={recipients.includes(user.email)}
                            onChange={() => toggleRecipient(user.email)}
                            className="mr-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          <span className={`text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded uppercase ${
                            user.role === 'CONTRACTOR' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20' : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </label>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">No users found matching your search.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full p-3 rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={12}
                  className="w-full p-3 rounded-none border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  placeholder="Type your message here (HTML supported)..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Note: Your message will be automatically wrapped in the official Bela Eco Panels email template with logo and footer.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white px-8 py-3 rounded-none font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : <><Send size={18} /> Send Email</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Newsletter Campaigns</h2>
              <button 
                onClick={() => {
                  setSubject('');
                  setBody('');
                  setShowNewsletterModal(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-none text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> New Campaign
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Bulk Sending Info</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  Newsletters are sent to all subscribed users. Current subscriber count: <strong>{users.length}</strong> (approx).
                  Emails are queued and sent in batches to prevent timeout.
                </p>
              </div>
            </div>

            {/* Newsletter Modal */}
            {showNewsletterModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">Create Newsletter Campaign</h3>
                    <button onClick={() => setShowNewsletterModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={(e) => handleSend(e, true)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Subject</label>
                      <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                        placeholder="e.g., January Product Update"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                        <div className="flex gap-2">
                          {PREDEFINED_TEMPLATES.map(t => (
                            <button 
                              key={t.id}
                              type="button"
                              onClick={() => applyTemplate(t)}
                              className="text-xs text-primary hover:underline"
                            >
                              Load {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea 
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                        rows={10}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded font-mono text-sm"
                        placeholder="HTML content supported..."
                      />
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Target:</strong> All Newsletter Subscribers</p>
                      <p><strong>Template:</strong> Standard Company Layout (Logo + Footer)</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setShowNewsletterModal(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Campaign'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Mock Newsletter List - In real app, fetch from backend if stored separately */}
              {[
                { id: 1, title: 'January 2025 Product Update', status: 'Draft', date: '2025-01-15', recipients: 1250 },
                { id: 2, title: 'Holiday Season Greetings', status: 'Sent', date: '2024-12-25', recipients: 1245 },
              ].map((newsletter) => (
                <div key={newsletter.id} className="border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition flex justify-between items-center">
                  <div>
                    <h3 className="font-bold dark:text-white">{newsletter.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>{newsletter.date}</span>
                      <span>•</span>
                      <span>{newsletter.recipients} Recipients</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                      newsletter.status === 'Sent' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {newsletter.status}
                    </span>
                    <button className="text-gray-400 hover:text-primary"><Edit size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">Email Templates</h2>
              <button 
                onClick={() => setShowTemplateModal(true)}
                className="bg-secondary text-white px-4 py-2 rounded-none text-sm font-bold hover:bg-secondary/90 transition-all flex items-center gap-2"
              >
                <Plus size={16} /> New Template
              </button>
            </div>

            {/* Create Template Modal */}
            {showTemplateModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">Create New Template</h3>
                    <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                  </div>
                  
                  <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name</label>
                      <input 
                        type="text" 
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                        placeholder="e.g., Welcome Email"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                          value={newTemplate.type}
                          onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                        >
                          <option value="CUSTOM">Custom / Manual</option>
                          <option value="AUTOMATED">Automated</option>
                          <option value="SCHEDULED">Scheduled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger (Optional)</label>
                        <input 
                          type="text" 
                          value={newTemplate.trigger}
                          onChange={(e) => setNewTemplate({...newTemplate, trigger: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                          placeholder="e.g., User Registration"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Line</label>
                      <input 
                        type="text" 
                        value={newTemplate.subject}
                        onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                        required
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                        placeholder="Email Subject"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Content (HTML)</label>
                      <textarea 
                        value={newTemplate.body}
                        onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                        required
                        rows={10}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded font-mono text-sm"
                        placeholder="<html>...</html>"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => setShowTemplateModal(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-primary/90 disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Create Template'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Predefined Templates Display */}
              {PREDEFINED_TEMPLATES.map((template) => (
                 <div key={template.id} className="border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-700/30 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-none uppercase">
                      SYSTEM
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => {
                        setActiveTab('compose');
                        applyTemplate(template);
                      }} className="text-gray-500 hover:text-primary transition-colors" title="Use Template"><Send size={16} /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{template.subject}</p>
                </div>
              ))}

              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700/30 relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-xs font-bold px-2 py-1 rounded-none uppercase ${
                      template.type === 'AUTOMATED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                      template.type === 'SCHEDULED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}>
                      {template.type}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-500 hover:text-primary transition-colors"><Edit size={16} /></button>
                      <button className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{template.subject}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    {template.type === 'AUTOMATED' ? <Zap size={14} /> : <Clock size={14} />}
                    Trigger: {template.trigger || 'Manual'}
                  </div>
                </div>
              ))}
              
              {/* Add New Card */}
              <button className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors min-h-[200px]">
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Create New Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-xl font-bold mb-6 dark:text-white">Sent History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Recipient</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Subject</th>
                    <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4">
                        {log.status === 'SENT' ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle size={14} /> Sent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <AlertCircle size={14} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-800 dark:text-gray-200">{log.recipient}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{log.subject}</td>
                      <td className="p-4 text-gray-500 text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No email history found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
