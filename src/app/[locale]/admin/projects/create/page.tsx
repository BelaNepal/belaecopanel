'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectAPI } from '@/lib/api';
import { useAuthStore, useAdminStore } from '@/stores';
import axios from 'axios';
import { ArrowLeft, Upload, X, Image as ImageIcon, Info } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminCreateProjectPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    engineerId: '',
    contractorId: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'ENGINEER')) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [token, user]);

  const fetchUsers = async () => {
    try {
      // Fetch Engineers
      const engRes = await axios.get(`${API_URL}/dealers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'ENGINEER', take: 100 }
      });
      setEngineers(engRes.data.data);

      // Fetch Contractors
      const contRes = await axios.get(`${API_URL}/dealers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: 'CONTRACTOR', take: 100 }
      });
      setContractors(contRes.data.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('budget', formData.budget);
      
      if (formData.engineerId) {
        data.append('engineerId', formData.engineerId);
      }
      if (formData.contractorId) {
        data.append('contractorId', formData.contractorId);
      }
      
      if (selectedImage) {
        data.append('image', selectedImage);
      }

      await projectAPI.create(data);
      
      const successMsg = `New project created successfully at ${format(new Date(), 'PPpp')}`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);

      // Short delay to show message before redirect
      setTimeout(() => {
        router.push('/admin/projects');
      }, 2000);
    } catch (error) {
      console.error('Failed to create project', error);
      toast.error('Failed to create project');
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/projects" className="flex items-center text-gray-600 hover:text-primary transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Projects
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Create New Project (Admin)</h1>
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3 animate-fade-in-down">
          <Info className="flex-shrink-0" />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Modern Eco Villa"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the project requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input
              type="text"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget</label>
            <input
              type="number"
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.budget}
              onChange={e => setFormData({...formData, budget: e.target.value})}
              placeholder="0.00"
            />
          </div>

          {user?.role === 'ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Engineer</label>
            <select
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.engineerId}
              onChange={e => setFormData({...formData, engineerId: e.target.value})}
            >
              <option value="">Select Engineer (Optional)</option>
              {engineers.map((eng: any) => (
                <option key={eng.user.id} value={eng.user.id}>
                  {eng.user.firstName} {eng.user.lastName} ({eng.companyName})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">If left blank, you will be assigned as the engineer.</p>
          </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign Contractor</label>
            <select
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={formData.contractorId}
              onChange={e => setFormData({...formData, contractorId: e.target.value})}
            >
              <option value="">Select Contractor (Optional)</option>
              {contractors.map((cont: any) => (
                <option key={cont.user.id} value={cont.user.id}>
                  {cont.user.firstName} {cont.user.lastName} ({cont.companyName})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Image</label>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors bg-gray-50 dark:bg-gray-700/50">
              <input
                type="file"
                id="image"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="image" className="cursor-pointer flex flex-col items-center justify-center">
                <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  SVG, PNG, JPG or GIF (max. 10MB)
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mt-4 relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
