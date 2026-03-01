'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare, 
  Upload, 
  Loader2,
  Star
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const LoadingOverlay = ({ message = 'Processing...' }: { message?: string }) => (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-secondary border-b-transparent border-r-transparent rounded-full animate-spin [animation-direction:reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary dark:text-white animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Please Wait</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  </div>
);

const getImageUrl = (url: string | null | undefined) => {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const baseUrl = API_URL.replace('/api', '');
  return `${baseUrl}${url}`;
};

interface Testimonial {
  id: string;
  name: string;
  nameNe?: string;
  company?: string;
  companyNe?: string;
  position?: string;
  positionNe?: string;
  content: string;
  contentNe?: string;
  rating: number;
  imageUrl?: string;
  featured: boolean;
  createdAt: string;
  serviceTag?: string;
}

interface FormData {
  name: string;
  nameNe: string;
  company: string;
  companyNe: string;
  position: string;
  positionNe: string;
  content: string;
  contentNe: string;
  rating: number;
  imageUrl: string;
  featured: boolean;
}

export default function TestimonialsAdmin() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm: FormData = {
    name: '',
    nameNe: '',
    company: '',
    companyNe: '',
    position: '',
    positionNe: '',
    content: '',
    contentNe: '',
    rating: 5,
    imageUrl: '',
    featured: false
  };

  const [formData, setFormData] = useState<FormData>(initialForm);

  useEffect(() => {
    setMounted(true);
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/admin/login');
      return;
    }
    fetchTestimonials();
  }, [token, user, router, activeVertical]);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${API_URL}/testimonials`, {
        params: { serviceTag: activeVertical }
      });
      setTestimonials(response.data);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      setUploading(true);
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        params: { folder: 'testimonials' },
      });
      return response.data.imageUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;

      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const dataToSubmit = {
        ...formData,
        imageUrl,
        rating: Number(formData.rating),
        serviceTag: activeVertical
      };

      if (editingId) {
        await axios.patch(`${API_URL}/testimonials/${editingId}`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Testimonial updated successfully');
      } else {
        await axios.post(`${API_URL}/testimonials`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Testimonial created successfully');
      }

      setShowForm(false);
      setFormData(initialForm);
      setEditingId(null);
      setSelectedImage(null);
      setPreviewUrl(null);
      fetchTestimonials();
    } catch (err) {
      console.error('Error saving testimonial:', err);
      setError('Failed to save testimonial');
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      nameNe: testimonial.nameNe || '',
      company: testimonial.company || '',
      companyNe: testimonial.companyNe || '',
      position: testimonial.position || '',
      positionNe: testimonial.positionNe || '',
      content: testimonial.content,
      contentNe: testimonial.contentNe || '',
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl || '',
      featured: testimonial.featured
    });
    setEditingId(testimonial.id);
    setPreviewUrl(testimonial.imageUrl ? getImageUrl(testimonial.imageUrl) : null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await axios.delete(`${API_URL}/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      setError('Failed to delete testimonial');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {submitting && <LoadingOverlay message={editingId ? "Updating Testimonial..." : "Creating Testimonial..."} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            Testimonials
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer testimonials and reviews
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData(initialForm);
            setPreviewUrl(null);
            setSelectedImage(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingId ? 'Edit Testimonial' : 'New Testimonial'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className={`
                    w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 
                    ${!previewUrl ? 'bg-gray-100 dark:bg-gray-700 flex items-center justify-center' : ''}
                  `}>
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                  >
                    <Upload size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Client Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name (Nepali)
                  </label>
                  <input
                    type="text"
                    value={formData.nameNe}
                    onChange={(e) => setFormData({ ...formData, nameNe: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Client Name (Nepali)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company (Nepali)
                  </label>
                  <input
                    type="text"
                    value={formData.companyNe}
                    onChange={(e) => setFormData({ ...formData, companyNe: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Company Name (Nepali)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Job Title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position (Nepali)
                  </label>
                  <input
                    type="text"
                    value={formData.positionNe}
                    onChange={(e) => setFormData({ ...formData, positionNe: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Job Title (Nepali)"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className={`p-1 transition-colors ${
                          star <= formData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        <Star size={24} fill={star <= formData.rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Testimonial Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="What did the client say?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Testimonial Content (Nepali)
                </label>
                <textarea
                  rows={4}
                  value={formData.contentNe}
                  onChange={(e) => setFormData({ ...formData, contentNe: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  placeholder="What did the client say? (in Nepali)"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Feature this testimonial on homepage
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Testimonial'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))
        ) : testimonials.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No testimonials found</p>
            <p className="text-sm">Add your first client testimonial to get started</p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 relative group"
            >
              {testimonial.featured && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    testimonial.serviceTag === 'ECOPANELS' 
                      ? 'bg-green-100 text-green-800' 
                      : testimonial.serviceTag === 'MODULARHOMES'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {testimonial.serviceTag === 'ECOPANELS' ? 'Eco' : testimonial.serviceTag === 'MODULARHOMES' ? 'Modular' : 'N/A'}
                  </span>
                  <div className="text-yellow-500">
                    <Star size={16} fill="currentColor" />
                  </div>
                </div>
              )}
              {!testimonial.featured && (
                <div className="absolute top-4 right-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    testimonial.serviceTag === 'ECOPANELS' 
                      ? 'bg-green-100 text-green-800' 
                      : testimonial.serviceTag === 'MODULARHOMES'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {testimonial.serviceTag === 'ECOPANELS' ? 'Eco' : testimonial.serviceTag === 'MODULARHOMES' ? 'Modular' : 'N/A'}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {testimonial.imageUrl ? (
                    <img 
                      src={getImageUrl(testimonial.imageUrl)} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1 flex items-center gap-2">
                    {testimonial.name}
                    {testimonial.nameNe && (
                      <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                        NE
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {testimonial.position} {testimonial.company && `at ${testimonial.company}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < (testimonial.rating || 5) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} 
                    fill={i < (testimonial.rating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                &quot;{testimonial.content}&quot;
              </p>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
