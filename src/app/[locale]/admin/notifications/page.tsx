'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShoppingCart, 
  Briefcase, 
  Info,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { notificationAPI } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getAll({
        page: pagination.page,
        take: pagination.limit,
        unreadOnly: filter === 'unread' ? 'true' : 'false'
      });
      setNotifications(res.data.data);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.pages
      }));
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      await notificationAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
      // Refetch if list becomes empty to maintain pagination flow
      if (notifications.length === 1 && pagination.page > 1) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        fetchNotifications();
      }

    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete ALL notifications? This cannot be undone.')) return;
    try {
      await notificationAPI.deleteAll();
      setNotifications([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 1, page: 1 }));
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={20} className="text-green-500" />;
      case 'WARNING': return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'ERROR': return <XCircle size={20} className="text-red-500" />;
      case 'ORDER': return <ShoppingCart size={20} className="text-blue-500" />;
      case 'DEALER': return <Briefcase size={20} className="text-purple-500" />;
      case 'PROJECT': return <Briefcase size={20} className="text-indigo-500" />;
      default: return <Info size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          All Notifications
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your system alerts and messages
        </p>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Unread Only
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Check size={16} /> Mark all read
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <Trash2 size={16} /> Clear all
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
               // Loading Skeleton
               [...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
               ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <Bell size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      notificationAPI.markAsRead(notification.id).catch(console.error);
                      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                    }
                    if (notification.link) router.push(notification.link);
                  }}
                  className={`group relative flex items-start gap-4 p-5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    !notification.isRead 
                      ? 'bg-white dark:bg-gray-800 border-l-4 border-l-primary border-y-gray-100 border-r-gray-100 dark:border-y-gray-700 dark:border-r-gray-700 shadow-sm' 
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`text-base font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className={`mt-1 text-sm ${!notification.isRead ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                      {notification.message}
                    </p>

                    <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          <Check size={14} /> Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                        className="text-xs font-medium text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
