'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { projectAPI } from '@/lib/api';
import { format } from 'date-fns';
import { ChevronLeft, FileText, MessageSquare, CheckCircle, XCircle, Download, User, MapPin, Calendar, DollarSign, AlertCircle, Send, Image as ImageIcon, FileSpreadsheet, File, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const API_ROOT = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && id) loadProject();
  }, [user, id]);

  const loadProject = async () => {
    try {
      const res = await projectAPI.getById(id as string);
      setProject(res.data);
    } catch (error) {
      console.error('Failed to load project', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to approve this document?')) return;
    try {
      await projectAPI.approveDocument(id as string, docId);
      toast.success('Document approved successfully');
      loadProject();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await projectAPI.updateStatus(id as string, newStatus);
      toast.success('Status updated successfully');
      loadProject();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to approve this application? This will assign the contractor and reject other applications.')) return;
    try {
      await projectAPI.approveApplication(id as string, applicationId);
      toast.success('Application approved successfully');
      loadProject();
    } catch (error) {
      console.error('Failed to approve application', error);
      toast.error('Failed to approve application');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await projectAPI.sendMessage(id as string, { content: newMessage });
      setNewMessage('');
      loadProject();
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error('Failed to send message');
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error('Please provide both title and file');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('type', uploadFile.type);
    formData.append('file', uploadFile);

    try {
      await projectAPI.uploadDocument(id as string, formData);
      toast.success('Document uploaded successfully');
      setUploadTitle('');
      setUploadFile(null);
      setIsUploadOpen(false);
      loadProject();
    } catch (error) {
       console.error('Upload failed', error);
       toast.error('Upload failed');
    }
  };

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('image') || t.includes('jpg') || t.includes('png')) return <ImageIcon size={20} />;
    if (t.includes('sheet') || t.includes('excel') || t.includes('xls')) return <FileSpreadsheet size={20} />;
    if (t.includes('pdf')) return <FileText size={20} />;
    return <File size={20} />;
  };

  if (loading) return <div className="p-8 text-center">Loading project details...</div>;
  if (!project) return <div className="p-8 text-center">Project not found</div>;

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const normalizedPath = path.replace(/\\/g, '/');
    const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    return `${API_ROOT}${finalPath}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/projects" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{project.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>ID: {project.id}</span>
            <span>•</span>
            <span>Created {format(new Date(project.createdAt), 'PPP')}</span>
          </div>
        </div>
        <div className="ml-auto">
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={user?.role === 'CONTRACTOR' || (user?.role === 'ENGINEER' && project.status === 'NEGOTIATING')}
            title={user?.role === 'ENGINEER' && project.status === 'NEGOTIATING' ? "Only Admin can finalize negotiation" : "Change Status"}
            className={`px-3 py-1 rounded-full text-sm font-bold border-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              project.status === 'INITIATED' ? 'bg-green-100 text-green-800' :
              project.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {['INITIATED', 'NEGOTIATING', 'RUNNING', 'COMPLETED', 'CANCELLED'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'overview' 
                    ? 'bg-gray-50 dark:bg-gray-700 text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'documents' 
                    ? 'bg-gray-50 dark:bg-gray-700 text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Documents ({project.documents.length})
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                  activeTab === 'messages' 
                    ? 'bg-gray-50 dark:bg-gray-700 text-primary border-b-2 border-primary' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Messages ({project.messages.length})
              </button>
              {user?.role === 'ADMIN' && project.status === 'INITIATED' && (
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
                    activeTab === 'applications' 
                      ? 'bg-gray-50 dark:bg-gray-700 text-primary border-b-2 border-primary' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Applications ({project.applications?.length || 0})
                </button>
              )}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {project.images && project.images.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {project.images.map((img: string, idx: number) => (
                        <div key={idx} className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                          <img src={getImageUrl(img)} alt={`${project.title} ${idx + 1}`} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      ))}
                    </div>
                  ) : project.image && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                      <img src={getImageUrl(project.image)} alt={project.title} className="object-cover w-full h-full" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{project.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <MapPin className="text-primary mt-1" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                        <p className="font-medium dark:text-white">{project.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <DollarSign className="text-primary mt-1" size={20} />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</p>
                        <p className="font-medium dark:text-white">${project.budget?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {/* Upload Button for Admin/Staff/Engineer */}
                  {['ADMIN', 'STAFF', 'ENGINEER'].includes(user?.role || '') && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Upload size={18} />
                        Upload Document
                      </button>
                    </div>
                  )}

                  {/* Upload Modal */}
                  {isUploadOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold dark:text-white">Upload Document</h3>
                          <button onClick={() => setIsUploadOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <XCircle size={24} />
                          </button>
                        </div>
                        <form onSubmit={handleUploadDocument} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Title</label>
                            <input
                              type="text"
                              value={uploadTitle}
                              onChange={(e) => setUploadTitle(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="e.g. Floor Plan v2"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                            <input
                              type="file"
                              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              type="button"
                              onClick={() => setIsUploadOpen(false)}
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Upload
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {project.documents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No documents uploaded yet.</p>
                  ) : (
                    project.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            {getFileIcon(doc.type)}
                          </div>
                          <div>
                            <a href={`${API_ROOT}${doc.url}`} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {doc.title}
                            </a>
                            <div className="text-xs text-gray-500">
                              Uploaded by {doc.uploadedBy.firstName} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status}
                          </span>
                          {doc.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveDocument(doc.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Approve Document"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'applications' && user?.role === 'ADMIN' && (
                <div className="space-y-4">
                  {!project.applications || project.applications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No applications yet.</p>
                  ) : (
                    project.applications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-medium dark:text-white">{app.contractor.firstName} {app.contractor.lastName}</p>
                            <p className="text-sm text-gray-500">{app.contractor.email}</p>
                            <div className="text-xs text-gray-400 mt-1">
                              Applied on {format(new Date(app.createdAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => handleApproveApplication(app.id)}
                              className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle size={16} /> Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="flex flex-col h-[600px]">
                  <div className="flex-1 overflow-y-auto space-y-4 p-4">
                    {project.messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No messages in this project.</p>
                    ) : (
                      project.messages.map((msg: any) => (
                        <div key={msg.id} className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            msg.sender.role === 'ENGINEER' ? 'bg-blue-100 text-blue-600' :
                            msg.sender.role === 'CONTRACTOR' ? 'bg-purple-100 text-purple-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {msg.sender.firstName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm dark:text-white">{msg.sender.firstName} {msg.sender.lastName}</span>
                              <span className="text-xs text-gray-500">{msg.sender.role}</span>
                              <span className="text-xs text-gray-400">• {format(new Date(msg.createdAt), 'MMM d, HH:mm')}</span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button type="submit" className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stakeholders */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Stakeholders</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Engineer</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-medium dark:text-white">{project.engineer?.firstName} {project.engineer?.lastName}</p>
                    <p className="text-sm text-gray-500">{project.engineer?.email}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Contractor</p>
                {project.contractor ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">{project.contractor.firstName} {project.contractor.lastName}</p>
                      <p className="text-sm text-gray-500">{project.contractor.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 italic">
                    <AlertCircle size={16} />
                    <span>Not assigned yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
