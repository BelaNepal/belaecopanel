'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FAQ {
  id: string;
  question: string;
  questionNe?: string;
  answer: string;
  answerNe?: string;
  category?: string;
  createdAt: string;
  serviceTag?: string;
}

interface FormData {
  question: string;
  questionNe: string;
  answer: string;
  answerNe: string;
  category: string;
}

export default function FAQsAdmin() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'en' | 'ne'>('en');
  const [formData, setFormData] = useState<FormData>({
    question: '',
    questionNe: '',
    answer: '',
    answerNe: '',
    category: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/admin/login');
      return;
    }

    fetchFAQs();
  }, [token, user, router, mounted, activeVertical]);

  const fetchFAQs = async () => {
    try {
      const res = await axios.get(`${API_URL}/faqs/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { serviceTag: activeVertical }
      });
      setFAQs(res.data);
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, serviceTag: activeVertical };
      if (editingId) {
        await axios.patch(`${API_URL}/faqs/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/faqs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchFAQs();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('Error saving FAQ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await axios.delete(`${API_URL}/faqs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFAQs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      alert('Error deleting FAQ');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      questionNe: faq.questionNe || '',
      answer: faq.answer,
      answerNe: faq.answerNe || '',
      category: faq.category || '',
    });
    setShowForm(true);
    setExpandedId(null);
    setActiveTab('en');
  };

  const resetForm = () => {
    setFormData({
      question: '',
      questionNe: '',
      answer: '',
      answerNe: '',
      category: '',
    });
    setEditingId(null);
    setShowForm(false);
    setActiveTab('en');
  };

  if (!mounted || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Frequently Asked Questions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus size={20} />
          Add FAQ
        </button>
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-none"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'en'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ne')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ne'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Nepali
                </button>
              </div>

              <input
                type="text"
                placeholder="Category (e.g., Installation, Pricing...)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-none dark:bg-gray-700 dark:text-white"
              />

              {activeTab === 'en' ? (
                <>
                  <input
                    type="text"
                    placeholder="Question (English)"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-none dark:bg-gray-700 dark:text-white"
                  />
                  <textarea
                    placeholder="Answer (English)"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-none dark:bg-gray-700 dark:text-white"
                    rows={6}
                  />
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Question (Nepali)"
                    value={formData.questionNe}
                    onChange={(e) => setFormData({ ...formData, questionNe: e.target.value })}
                    className="w-full px-4 py-2 border rounded-none dark:bg-gray-700 dark:text-white"
                  />
                  <textarea
                    placeholder="Answer (Nepali)"
                    value={formData.answerNe}
                    onChange={(e) => setFormData({ ...formData, answerNe: e.target.value })}
                    className="w-full px-4 py-2 border rounded-none dark:bg-gray-700 dark:text-white"
                    rows={6}
                  />
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-none hover:bg-primary/90 transition"
                >
                  {editingId ? 'Update' : 'Create'} FAQ
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-none hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQs Accordion */}
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold dark:text-white">{faq.question}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    faq.serviceTag === 'ECOPANELS' 
                      ? 'bg-green-100 text-green-800' 
                      : faq.serviceTag === 'MODULARHOMES'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {faq.serviceTag === 'ECOPANELS' ? 'Eco' : faq.serviceTag === 'MODULARHOMES' ? 'Modular' : 'N/A'}
                  </span>
                </div>
                {faq.category && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{faq.category}</p>
                )}
              </div>
              <div className="text-gray-400 ml-2 flex-shrink-0">
                {expandedId === faq.id ? '▼' : '▶'}
              </div>
            </button>

            {expandedId === faq.id && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <p className="dark:text-white mb-4 whitespace-pre-wrap">{faq.answer}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-none hover:bg-blue-700 transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-none hover:bg-red-700 transition"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {faqs.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No FAQs yet. Click &quot;Add FAQ&quot; to get started.
        </div>
      )}
    </div>
  );
}
