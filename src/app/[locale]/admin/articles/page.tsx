'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Article {
  id: string;
  slug: string;
  title: string;
  titleNe?: string;
  heading: string;
  headingNe?: string;
  excerpt: string;
  excerptNe?: string;
  body: string;
  bodyNe?: string;
  imageUrl?: string;
  published: boolean;
  createdAt: string;
  category?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  serviceTag?: string;
}

interface FormData {
  title: string;
  titleNe: string;
  heading: string;
  headingNe: string;
  excerpt: string;
  excerptNe: string;
  body: string;
  bodyNe: string;
  imageUrl: string;
  published: boolean;
  category: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
}

const SimpleRichTextEditor = ({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  className?: string;
}) => {
  const [preview, setPreview] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string, wrapper: [string, string]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + wrapper[0] + (selectedText || '') + wrapper[1] + text.substring(end);
    onChange(newText);
    
    // Attempt either focus or maintain state
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, 0);
  };

  return (
    <div className={`border rounded dark:border-gray-700 overflow-hidden flex flex-col ${className || ''}`}>
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-gray-800 p-2 border-b dark:border-gray-700">
        <button type="button" onClick={() => insertTag('b', ['<b>', '</b>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-bold text-xs">B</button>
        <button type="button" onClick={() => insertTag('i', ['<i>', '</i>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic text-xs">I</button>
        <button type="button" onClick={() => insertTag('u', ['<u>', '</u>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded underline text-xs">U</button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button type="button" onClick={() => insertTag('h2', ['<h2>', '</h2>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-bold text-xs">H2</button>
        <button type="button" onClick={() => insertTag('h3', ['<h3>', '</h3>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-bold text-xs">H3</button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button type="button" onClick={() => insertTag('p', ['<p>', '</p>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">P</button>
        <button type="button" onClick={() => insertTag('ul', ['<ul class="list-disc pl-5 space-y-2">\n  <li>', '</li>\n</ul>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">UL</button>
        <button type="button" onClick={() => insertTag('li', ['<li>', '</li>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">LI</button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button type="button" onClick={() => insertTag('a', ['<a href="#" class="text-primary hover:underline">', '</a>'])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs text-blue-500">Link</button>
        <button type="button" onClick={() => insertTag('br', ['<br />', ''])} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-xs">BR</button>
        <div className="flex-1"></div>
        <button 
            type="button" 
            onClick={() => setPreview(!preview)} 
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${preview ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
            {preview ? 'Edit HTML' : 'Preview'}
        </button>
      </div>
      
      {preview ? (
        <div 
            className="p-4 prose dark:prose-invert max-w-none min-h-[300px] h-[300px] overflow-y-auto bg-white dark:bg-gray-900 border-none outline-none"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400 italic">Empty content</p>' }}
        />
      ) : (
        <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-[300px] px-4 py-2 bg-transparent border-none outline-none dark:text-white font-mono text-sm resize-none focus:ring-0"
        />
      )}
      <div className="bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 text-right">
        HTML Editor Mode
      </div>
    </div>
  );
};

export default function ArticlesAdmin() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'en' | 'ne'>('en');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    titleNe: '',
    heading: '',
    headingNe: '',
    excerpt: '',
    excerptNe: '',
    body: '',
    bodyNe: '',
    imageUrl: '',
    published: false,
    category: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/admin/login');
      return;
    }

    fetchArticles();
  }, [token, user, router, mounted, activeVertical]);

  const fetchArticles = async () => {
    try {
      const res = await axios.get(`${API_URL}/articles/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { serviceTag: activeVertical }
      });
      setArticles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedImage);

        try {
          const uploadRes = await axios.post(`${API_URL}/upload`, uploadFormData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            params: { folder: 'articles' }
          });
          imageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          alert('Failed to upload image');
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const payload = {
        ...formData,
        imageUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        serviceTag: activeVertical
      };

      if (editingId) {
        await axios.patch(`${API_URL}/articles/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/articles`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Error saving article');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await axios.delete(`${API_URL}/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('Error deleting article');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setSelectedImage(null);
    setFormData({
      title: article.title,
      titleNe: article.titleNe || '',
      heading: article.heading,
      headingNe: article.headingNe || '',
      excerpt: article.excerpt || '',
      excerptNe: article.excerptNe || '',
      body: article.body,
      bodyNe: article.bodyNe || '',
      imageUrl: article.imageUrl || '',
      published: article.published,
      category: article.category || '',
      tags: article.tags ? article.tags.join(', ') : '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleNe: '',
      heading: '',
      headingNe: '',
      excerpt: '',
      excerptNe: '',
      body: '',
      bodyNe: '',
      imageUrl: '',
      published: false,
      category: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
    });
    setSelectedImage(null);
    setEditingId(null);
    setShowForm(false);
    setActiveTab('en');
  };

  const filteredArticles = articles.filter((a) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return a.published;
    if (filterStatus === 'draft') return !a.published;
    return true;
  });

  if (!mounted || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">Articles (CMS)</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Plus size={20} />
          New Article
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'published', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1 rounded text-sm transition ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">
                {editingId ? 'Edit Article' : 'New Article'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              
              {/* Language Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'en'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  English Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ne')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ne'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Nepali Content
                </button>
              </div>

              {/* English Fields */}
              {activeTab === 'en' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Article Title (English)"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <input
                      type="text"
                      placeholder="Heading (English)"
                      value={formData.heading}
                      onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Excerpt (English)"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                  
                  <SimpleRichTextEditor
                    placeholder="Article Body (English)"
                    value={formData.body}
                    onChange={(val) => setFormData({ ...formData, body: val })}
                  />
                </div>
              )}

              {/* Nepali Fields */}
              {activeTab === 'ne' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Article Title (Nepali)"
                      value={formData.titleNe}
                      onChange={(e) => setFormData({ ...formData, titleNe: e.target.value })}
                      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <input
                      type="text"
                      placeholder="Heading (Nepali)"
                      value={formData.headingNe}
                      onChange={(e) => setFormData({ ...formData, headingNe: e.target.value })}
                      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Excerpt (Nepali)"
                    value={formData.excerptNe}
                    onChange={(e) => setFormData({ ...formData, excerptNe: e.target.value })}
                    className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />

                  <SimpleRichTextEditor
                    placeholder="Article Body (Nepali)"
                    value={formData.bodyNe}
                    onChange={(val) => setFormData({ ...formData, bodyNe: val })}
                  />
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 my-4 pt-4">
                <h3 className="text-sm font-semibold mb-2 dark:text-gray-300">Common Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image</label>
                <div className="flex items-center gap-4">
                  {(selectedImage || formData.imageUrl) && (
                    <div className="w-20 h-20 border border-gray-300 dark:border-gray-600 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {selectedImage ? (
                        <img 
                          src={previewUrl || undefined} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img 
                          src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${API_URL.replace('/api', '')}${formData.imageUrl}`} 
                          alt="Current" 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="article-image-upload"
                  />
                  <label
                    htmlFor="article-image-upload"
                    className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded border border-gray-300 dark:border-gray-600 flex items-center gap-2 transition-colors"
                  >
                    <Upload size={20} />
                    <span>{selectedImage || formData.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="SEO Meta Title"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="SEO Meta Description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="published" className="text-sm dark:text-white">
                  Publish Article (visible to public)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading && <Loader2 className="animate-spin" size={16} />}
                  {editingId ? 'Update' : 'Create'} Article
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Heading</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Excerpt</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Vertical</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => (
              <tr
                key={article.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <td className="px-6 py-4 font-semibold dark:text-white">{article.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {article.heading}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                  {article.excerpt}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {article.serviceTag === 'ECOPANELS' ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Eco Panels</span>
                  ) : article.serviceTag === 'MODULARHOMES' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Modular Homes</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 w-fit ${
                      article.published
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                    }`}
                  >
                    {article.published ? (
                      <>
                        <Eye size={14} />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        Draft
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(article.createdAt).toLocaleString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(article)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(article.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          No articles found. Click &quot;New Article&quot; to get started.
        </div>
      )}
    </div>
  );
}
