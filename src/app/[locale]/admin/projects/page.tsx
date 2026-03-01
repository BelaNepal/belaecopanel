'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore, useAdminStore } from '@/stores';
import { projectAPI } from '@/lib/api';
import { Briefcase, Search, Filter, Eye, CheckCircle, Clock, LayoutGrid, List, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API_ROOT = (process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000').replace(/\/$/, '');

export default function AdminProjectsPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { activeVertical } = useAdminStore();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [contractorTab, setContractorTab] = useState<'available' | 'my-projects' | 'applications'>('available');
  const [selectedProjectImages, setSelectedProjectImages] = useState<string[] | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'CONTRACTOR' && user?.role !== 'ENGINEER')) {
      router.push('/admin/login');
      return;
    }
    // Default to board view for Admin
    if (user?.role === 'ADMIN') {
      setViewMode('board');
    }
    fetchProjects();
  }, [token, user, activeVertical]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll({ serviceTag: activeVertical });
      // Ensure local state is updated even if no projects
      setProjects(res.data || []);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await projectAPI.updateStatus(projectId, newStatus);
      fetchProjects();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update status');
    }
  };

  const handleApply = async (projectId: string) => {
    if (!confirm('Are you sure you want to apply for this project?')) return;
    try {
      await projectAPI.applyForProject(projectId);
      toast.success('Application submitted successfully!');
      fetchProjects();
    } catch (error) {
      console.error('Failed to apply for project', error);
      toast.error('Failed to apply for project');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to move this project to trash?')) return;
    try {
      await projectAPI.delete(projectId);
      fetchProjects();
      toast.success('Project moved to trash');
    } catch (error) {
      console.error('Failed to delete project', error);
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.engineer?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.engineer?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Contractor specific filtering
    if (user?.role === 'CONTRACTOR') {
      const isAssigned = project.contractorId === user.id;
      const hasApplied = project.applications && project.applications.length > 0;
      
      if (contractorTab === 'available') {
        // Show initiated projects where not assigned and not applied
        return matchesSearch && project.status === 'INITIATED' && !isAssigned && !hasApplied;
      } else if (contractorTab === 'my-projects') {
        return matchesSearch && isAssigned;
      } else if (contractorTab === 'applications') {
        return matchesSearch && hasApplied;
      }
    }
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INITIATED': return 'bg-green-100 text-green-800';
      case 'NEGOTIATING': return 'bg-yellow-100 text-yellow-800';
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    
    // Normalize slashes and ensure path starts with /
    const normalizedPath = path.replace(/\\/g, '/');
    const finalPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
    
    // DEBUG LOG
    // console.log('Original Path:', path, 'Normalized:', normalizedPath, 'Final URL:', `${API_ROOT}${finalPath}`);
    
    return `${API_ROOT}${finalPath}`;
  };

  const KanbanColumn = ({ status, title }: { status: string, title: string }) => {
    const columnProjects = filteredProjects.filter(p => p.status === status);
    
    return (
      <div className="flex-1 min-w-[320px] bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col h-full shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 -mx-4 px-4 pt-2 rounded-t-xl">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full shadow-sm ${
              status === 'INITIATED' ? 'bg-green-500 ring-2 ring-green-200 dark:ring-green-900' :
              status === 'NEGOTIATING' ? 'bg-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-900' :
              status === 'RUNNING' ? 'bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' :
              status === 'COMPLETED' ? 'bg-purple-500 ring-2 ring-purple-200 dark:ring-purple-900' : 'bg-red-500 ring-2 ring-red-200 dark:ring-red-900'
            }`}></span>
            {title}
          </h3>
          <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-gray-100 dark:border-gray-600">
            {columnProjects.length}
          </span>
        </div>
        <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-[200px]">
          {columnProjects.map(project => {
            const displayImage = (project.images && project.images.length > 0) ? project.images[0] : project.image;
            const imageUrl = getImageUrl(displayImage);

            return (
            <div key={project.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-primary/30 transition-all group relative">
              {/* Image Preview */}
              <div 
                className="relative h-40 mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group-hover:shadow-inner transition-all"
                onClick={() => {
                  setSelectedProjectImages(project.images && project.images.length > 0 ? project.images : (project.image ? [project.image] : []));
                  setCurrentImageIndex(0);
                }}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50 dark:bg-gray-800">
                    <Briefcase size={32} className="opacity-20" />
                  </div>
                )}
                
                {/* Image Count Badge */}
                {(project.images?.length > 1) && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-md border border-white/10 shadow-lg group-hover:opacity-0 transition-opacity">
                    <LayoutGrid size={10} />
                    <span className="font-medium">+{project.images.length - 1}</span>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/90 dark:bg-black/80 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                    <LayoutGrid size={14} />
                    View More
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm dark:text-white line-clamp-1 text-gray-800" title={project.title}>{project.title}</h4>
                <div className="flex gap-1">
                  <Link href={`/admin/projects/${project.id}`} className="text-gray-400 hover:text-primary p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Eye size={16} />
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-4 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-100 dark:border-indigo-800">E</span>
                  <span className="truncate">{project.engineer?.firstName} {project.engineer?.lastName}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  {format(new Date(project.createdAt), 'MMM d, yyyy')}
                </p>
                {project.formattedBudget && (
                  <p className="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded inline-block border border-green-100 dark:border-green-800/30">
                    Rs. {project.formattedBudget}
                  </p>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                {user?.role === 'CONTRACTOR' ? (
                  <div className="flex items-center justify-between w-full">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-semibold border ${getStatusColor(project.status).replace('bg-', 'border-').replace('text-', 'text-')} bg-opacity-10`}>
                      {project.status}
                    </span>
                    {contractorTab === 'available' && (
                      <button
                        onClick={() => handleApply(project.id)}
                        className="text-white font-medium text-xs flex items-center gap-1.5 bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow"
                      >
                        <CheckCircle size={14} /> Apply
                      </button>
                    )}
                    {contractorTab === 'applications' && (
                      <span className="text-yellow-700 font-medium text-xs flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                        <Clock size={14} /> Pending
                      </span>
                    )}
                  </div>
                ) : (
                  <select 
                    className="w-full text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-gray-300 dark:hover:border-gray-500"
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                    disabled={user?.role === 'ENGINEER' && project.status === 'NEGOTIATING'}
                    title={user?.role === 'ENGINEER' && project.status === 'NEGOTIATING' ? "Only Admin can finalize negotiation" : "Change Status"}
                  >
                    <option value="INITIATED">Initiated</option>
                    <option value="NEGOTIATING">Negotiating</option>
                    <option value="RUNNING">Running</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                )}
              </div>
            </div>
          ); })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <Briefcase className="text-primary" /> Projects Management
        </h1>

        {user?.role === 'CONTRACTOR' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setContractorTab('available')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                contractorTab === 'available' 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setContractorTab('applications')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                contractorTab === 'applications' 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setContractorTab('my-projects')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                contractorTab === 'my-projects' 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              My Projects
            </button>
          </div>
        )}

        <div className="flex items-center gap-4">
        {user?.role !== 'CONTRACTOR' && (
          <Link 
            href="/admin/projects/create" 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Briefcase size={18} />
            <span>Create Project</span>
          </Link>
        )}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}
            >
              <List size={20} />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-2 rounded-md transition-all ${viewMode === 'board' ? 'bg-white dark:bg-gray-700 shadow text-primary' : 'text-gray-500'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={20} className="text-gray-500" />
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="INITIATED">Initiated</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="RUNNING">Running</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Engineer</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Contractor</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading projects...</td>
                  </tr>
                ) : filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No projects found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const displayImage = (project.images && project.images.length > 0) ? project.images[0] : project.image;
                    const imageUrl = getImageUrl(displayImage);

                    return (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div 
                          className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer hover:opacity-80 transition-opacity relative"
                          onClick={() => {
                            setSelectedProjectImages(project.images && project.images.length > 0 ? project.images : (project.image ? [project.image] : []));
                            setCurrentImageIndex(0);
                          }}
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Briefcase size={20} />
                            </div>
                          )}
                          {(project.images?.length > 1) && (
                            <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md">
                              +{project.images.length - 1}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                        <div className="text-sm text-gray-500">{project.location}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {project.engineer?.firstName} {project.engineer?.lastName}
                        <div className="text-xs text-gray-400">{project.engineer?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {project.contractor ? (
                          <>
                            {project.contractor.firstName} {project.contractor.lastName}
                            <div className="text-xs text-gray-400">{project.contractor.email}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/admin/projects/${project.id}`}
                            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                          >
                            <Eye size={16} /> View
                          </Link>
                          
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-1 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                          
                          {user?.role === 'CONTRACTOR' && contractorTab === 'available' && (
                                <button
                                  onClick={() => handleApply(project.id)}
                                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                                >
                                  <CheckCircle size={16} /> Apply
                                </button>
                              )}
                              
                              {user?.role === 'CONTRACTOR' && contractorTab === 'applications' && (
                                <span className={`font-medium text-sm flex items-center gap-1 px-2 py-1 rounded ${
                                  project.applications?.[0]?.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-200' :
                                  project.applications?.[0]?.status === 'REJECTED' ? 'bg-red-50 text-red-600 border border-red-200' :
                                  'bg-yellow-50 text-yellow-600 border border-yellow-200'
                                }`}>
                                  {project.applications?.[0]?.status === 'APPROVED' ? <CheckCircle size={16} /> :
                                  project.applications?.[0]?.status === 'REJECTED' ? <X size={16} /> :
                                  <Clock size={16} />}
                                  {project.applications?.[0]?.status || 'Pending'}
                                </span>
                              )}
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
          <KanbanColumn status="INITIATED" title="Initiated" />
          <KanbanColumn status="NEGOTIATING" title="Negotiating" />
          <KanbanColumn status="RUNNING" title="Running" />
          <KanbanColumn status="COMPLETED" title="Completed" />
          <KanbanColumn status="CANCELLED" title="Cancelled" />
        </div>
      )}

      {/* Image Modal */}
      {selectedProjectImages && selectedProjectImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setSelectedProjectImages(null)}>
          <div className="relative max-w-5xl w-full h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProjectImages(null)}
              className="absolute -top-12 right-0 z-50 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={32} />
            </button>
            
            {/* Main Image Slider */}
            <div className="flex-1 relative flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={getImageUrl(selectedProjectImages[currentImageIndex]) || ''} 
                alt={`Project Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation Buttons */}
              {selectedProjectImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === 0 ? selectedProjectImages.length - 1 : prev - 1);
                    }}
                    className="absolute left-4 p-3 bg-black/50 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => prev === selectedProjectImages.length - 1 ? 0 : prev + 1);
                    }}
                    className="absolute right-4 p-3 bg-black/50 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-1 rounded-full text-sm backdrop-blur-sm border border-white/10">
                {currentImageIndex + 1} / {selectedProjectImages.length}
              </div>
            </div>

            {/* Thumbnails */}
            {selectedProjectImages.length > 1 && (
              <div className="mt-4 h-24 flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-2 justify-center">
                {selectedProjectImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`relative min-w-[100px] h-full rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx 
                        ? 'border-primary scale-105 shadow-lg' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img) || ''} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
